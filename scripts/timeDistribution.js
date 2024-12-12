function createTimeDistribution(accidentsData, level, regionCode, containerId) {

    // Clear existing chart
    d3.select(containerId).html("");

    // Fixed dimensions for the visualization
    const fixedWidth = 350;
    const fixedHeight = 350;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const width = fixedWidth - margin.left - margin.right;
    const height = fixedHeight - margin.top - margin.bottom;
    
    // Calculate radii based on fixed size
    const innerRadius = Math.min(width, height) * 0.005;
    const outerRadius = Math.min(width, height) * 0.4;

    // Add title
    const container = d3.select(containerId);
    container.append("div")
        .attr("class", "clock-title")
        .text(() => {
            switch(level.toLowerCase()) {
                case 'country':
                    return 'Nationwide';
                case 'state':
                    return `State - ${regionCode}`;
                case 'county':
                    const [stateCode, countyName] = regionCode.split(':');
                    return `County - ${countyName}, ${stateCode}`;
                default:
                    return '';
            }
        });

    const svg = container
        .append("svg")
        .attr("viewBox", `0 0 ${fixedWidth} ${fixedHeight}`)
        .append("g")
        .attr("transform", `translate(${fixedWidth/2},${fixedHeight/2})`);

    // Filter data based on geographical level
    let filteredData = accidentsData;
    let displayTitle;

    switch(level.toLowerCase()) {
        case 'country':
            // No filtering needed for country level - use all data
            displayTitle = 'United States';
            break;
        case 'state':
            filteredData = accidentsData.filter(d => 
                d.State.toUpperCase() === regionCode.toUpperCase()
            );
            displayTitle = regionCode;
            break;
        case 'county':
            // Assuming regionCode is in format "STATE:COUNTY"
            const [stateCode, countyName] = regionCode.split(':');
            filteredData = accidentsData.filter(d => 
                d.State.toUpperCase() === stateCode.toUpperCase() && 
                d.County.toUpperCase() === countyName.toUpperCase()
            );
            displayTitle = `${countyName}, ${stateCode}`;
            break;
        default:
            console.error('Invalid geographical level specified');
            return;
    }

    // Process time data
    const timeData = Array.from({length: 24}, (_, hour) => {
        const hourAccidents = filteredData.filter(d => {
            const accidentHour = new Date(d.Start_Time).getHours();
            return accidentHour === hour;
        });
    
        const total = hourAccidents.length;
        const severityCounts = hourAccidents.reduce((acc, d) => {
            acc[d.Severity] = (acc[d.Severity] || 0) + 1;
            return acc;
        }, {});
    
        // Create array for all severities 1-4
        const severityPercentages = [1, 2, 3, 4].map(severity => {
            const count = severityCounts[severity] || 0;
            const percentage = (count / total * 100).toFixed(1);
            return {
                severity,
                percentage,
                count
            };
        });
    
        return {
            hour,
            total,
            severityPercentages
        };
    });

    // Create scales
    const angle = d3.scaleLinear()
        .domain([0, 24])
        .range([0, 2 * Math.PI]);

    const radius = d3.scaleLinear()
        .domain([0, d3.max(timeData, d => d.total)])
        .range([innerRadius, outerRadius]);

    // Add clock face background
    const clockFace = svg.append("g").attr("class", "clock-face");

    // Add outer circle
    clockFace.append("circle")
        .attr("r", outerRadius + 10)
        .attr("fill", "transparent")
        .attr("stroke", "#dee2e6")
        .attr("stroke-width", 2);

    // Add hour marks
    const hours = Array.from({length: 24}, (_, i) => i);
    
    // Add hour circles
    clockFace.selectAll(".hour-mark")
        .data(hours)
        .enter()
        .append("circle")
        .attr("class", "hour-mark")
        .attr("cx", d => (outerRadius - 25) * Math.sin(angle(d)))
        .attr("cy", d => -(outerRadius - 25) * Math.cos(angle(d)))
        .attr("r", 3)
        .attr("fill", "#495057");

    // Add hour labels
    clockFace.selectAll(".hour-label")
        .data(hours)
        .enter()
        .append("text")
        .attr("class", "hour-label")
        .attr("x", d => (outerRadius + 30) * Math.sin(angle(d)))
        .attr("y", d => -(outerRadius + 30) * Math.cos(angle(d)))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("font-weight", "500")
        .style("fill", "#495057")
        .text(d => d === 0 ? "12 AM" : 
              d === 12 ? "12 PM" : 
              d > 12 ? `${d-12} PM` : `${d} AM`);

    // Add the bars with gradient
    const gradient = svg.append("defs")
        .append("radialGradient")
        .attr("id", "bar-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("cx", "0")
        .attr("cy", "0")
        .attr("r", outerRadius);

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fd7e14");

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e67700");

    // Create arc generator
    const arc = d3.arc()
        .innerRadius(d => innerRadius)
        .outerRadius(d => radius(d.total))
        .startAngle(d => angle(d.hour))
        .endAngle(d => angle(d.hour + 1))
        .padAngle(0.02)
        .padRadius(innerRadius);

    // Add the bars
    const bars = svg.selectAll(".accident-bar")
        .data(timeData)
        .enter()
        .append("path")
        .attr("class", "accident-bar")
        .attr("d", arc)
        .style("fill", "url(#bar-gradient)")
        .style("stroke", "#fff")
        .style("stroke-width", "1px")
        .style("opacity", 0.8);

    // Add hover effects
    bars.on("mouseover", function(event, d) {
        d3.select(this)
            .style("opacity", 1)
            .style("filter", "brightness(1.1)");
    
        const severityColors = {
            1: "#2ecc71", // green
            2: "#f1c40f", // yellow
            3: "#e67e22", // orange
            4: "#e74c3c"  // red
        };
    
        const severityHTML = d.severityPercentages
            .map(s => `<div style="color: ${severityColors[s.severity]}; font-weight: bold;">
                Severity ${s.severity}: ${s.percentage}%
            </div>`)
            .join("");
    
        tooltip.style("visibility", "visible")
            .html(`
                <div style="text-align: center;">
                    <strong>${d.hour === 0 ? "12 AM" : 
                             d.hour === 12 ? "12 PM" : 
                             d.hour > 12 ? `${d.hour-12} PM` : `${d.hour} AM`}</strong>
                    ${severityHTML}
                </div>
            `);
    })
    .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .style("opacity", 0.8)
            .style("filter", "none");
        tooltip.style("visibility", "hidden");
    });

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
}

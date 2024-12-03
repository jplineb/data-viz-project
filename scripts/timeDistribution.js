function createTimeDistribution(accidentsData, stateAbbr, title=null) {

    d3.select("#time-distribution-container").html("");

    const margin = { top: 75, right: 75, bottom: 75, left: 75 };
    const width = 434 - margin.left - margin.right;
    const height = 434 - margin.top - margin.bottom;
    const innerRadius = 10;
    const outerRadius = Math.min(width, height) / 2;

    const svg = d3.select("#time-distribution-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);

    // Filter data for the selected state
    // const stateAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());

    // Process time data
    const timeData = Array.from({length: 24}, (_, hour) => {
        const count = accidentsData.filter(d => {
            const accidentHour = new Date(d.Start_Time).getHours();
            return accidentHour === hour;
        }).length;
        
        return {
            hour,
            total: count
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
        .style("font-size", "14px")
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

        // Dynamically update tooltip using auto-generated text html
        tooltip.style("visibility", "visible")
            .html(`
                <div style="text-align: center;">
                    <strong>${d.hour === 0 ? "12 AM" : 
                             d.hour === 12 ? "12 PM" : 
                             d.hour > 12 ? `${d.hour-12} PM` : `${d.hour} AM`}</strong>
                    <br>
                    <span style="font-size: 1.2em;">${d3.format(",")(d.total)}</span>
                    <br>
                    accidents
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

    // Add center circle with total accidents
    // const totalAccidents = d3.sum(timeData, d => d.total);
    
    // svg.append("circle")
    //     .attr("r", innerRadius - 10)
    //     .attr("fill", "#fff")
    //     .attr("stroke", "#dee2e6")
    //     .attr("stroke-width", 2);

    // svg.append("text")
    //     .attr("text-anchor", "middle")
    //     .attr("dominant-baseline", "middle")
    //     .style("font-size", "28px")
    //     .style("font-weight", "bold")
    //     .style("fill", "#495057")
    //     .text(d3.format(",")(totalAccidents));

    // svg.append("text")
    //     .attr("text-anchor", "middle")
    //     .attr("dominant-baseline", "middle")
    //     .attr("y", 25)
    //     .style("font-size", "14px")
    //     .style("fill", "#6c757d")
    //     .text("Total Accidents");

    // Add title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${outerRadius + 60}, 0) rotate(90)`)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#212529")
        .text(`24-Hour Accident Distribution - ${title || stateAbbr}`);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
}

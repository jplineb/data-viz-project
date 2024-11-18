// Function to parse query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function createTimeDistribution(accidentsData, stateAbbr) {

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    const innerRadius = 100;
    const outerRadius = Math.min(width, height) / 2;

    const svg = d3.select("#time-distribution-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);

    // Filter data for the selected state
    const stateAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());

    // Process time data
    const timeData = Array.from({length: 24}, (_, hour) => {
        return {
            hour,
            total: stateAccidents.filter(d => new Date(d.Start_Time).getHours() === hour).length
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
    const totalAccidents = d3.sum(timeData, d => d.total);
    
    svg.append("circle")
        .attr("r", innerRadius - 10)
        .attr("fill", "#fff")
        .attr("stroke", "#dee2e6")
        .attr("stroke-width", 2);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "28px")
        .style("font-weight", "bold")
        .style("fill", "#495057")
        .text(d3.format(",")(totalAccidents));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("y", 25)
        .style("font-size", "14px")
        .style("fill", "#6c757d")
        .text("Total Accidents");

    // Add title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, ${-height/2 - 20})`)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#212529")
        .text("24-Hour Accident Distribution");

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
}

function createWeatherBubbleChart(accidentsData, stateAbbr) {
    const margin = { top: 30, right: 120, bottom: 50, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#weather-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter and process data
    const stateAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());
    
    // Aggregate data by weather condition
    const weatherData = Array.from(d3.rollup(
        stateAccidents,
        v => ({
            count: v.length,
            avgSeverity: d3.mean(v, d => +d.Severity)
        }),
        d => d.Weather_Condition
    )).map(([weather, stats]) => ({
        weather,
        count: stats.count,
        avgSeverity: stats.avgSeverity
    }));

    // Sort and take top 10 weather conditions
    const top10Weather = weatherData
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    // Weather to emoji mapping
    // I know this is kind of plain, but it's just for fun
    const weatherEmojis = {
        'Clear': '☀️',
        'Fair': '🌤️',
        'Cloudy': '☁️',
        'Overcast': '🌥️',
        'Scattered Clouds': '🌤️',
        'Partly Cloudy': '⛅',
        'Mostly Cloudy': '🌥️',
        'Rain': '🌧️',
        'Light Rain': '🌦️',
        'Heavy Rain': '⛈️',
        'Snow': '🌨️',
        'Light Snow': '🌨️',
        'Heavy Snow': '❄️',
        'Fog': '🌫️',
        'Mist': '🌫️',
        'Haze': '😶‍🌫️',
        'Thunder': '⛈️',
        'Thunderstorm': '🌩️',
        'Windy': '💨',
        'Default': '🤔'
    };

    // Function to get emoji based on weather condition
    function getWeatherEmoji(weather) {
        // Check for partial matches in weather condition
        const weatherLower = weather.toLowerCase();
        for (const [key, emoji] of Object.entries(weatherEmojis)) {
            if (weatherLower.includes(key.toLowerCase())) {
                return emoji;
            }
        }
        return weatherEmojis.Default;
    }

    // Scales
    const x = d3.scaleLinear()
        .domain([1, 4])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10Weather, d => d.count)])
        .nice()
        .range([height, 0]);

    const radius = d3.scaleSqrt()
        .domain([0, d3.max(top10Weather, d => d.count)])
        .range([5, 25]);

    const color = d3.scaleSequential()
        .domain([1, 4])
        .interpolator(d3.interpolateReds);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(4))
        .style("font-size", "12px");

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(",")).ticks(5))
        .style("font-size", "12px");

    // Add grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // Add bubbles
    const emojis = svg.selectAll(".weather-emoji")
        .data(top10Weather)
        .enter()
        .append("text")
        .attr("class", "weather-emoji")
        .attr("x", d => x(d.avgSeverity))
        .attr("y", d => y(d.count))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-family", "Arial")
        .style("font-size", d => `${radius(d.count) * 2}px`)
        .text(d => getWeatherEmoji(d.weather))
        .style("cursor", "pointer");

    // Add hover effects
    emojis.on("mouseover", function(event, d) {
        d3.select(this)
            .style("filter", "brightness(1.2)");

        tooltip.style("visibility", "visible")
            .html(`Weather: ${d.weather}<br>
                   Accidents: ${d3.format(",")(d.count)}<br>
                   Avg Severity: ${d.avgSeverity.toFixed(2)}`);
    })
    .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .style("filter", "brightness(1)");
        tooltip.style("visibility", "hidden");
    });

    // Add legend for top weather conditions
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 10}, 0)`);

    legend.selectAll(".legend-item")
        .data(top10Weather)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
            g.append("text")
                .attr("x", 0)
                .attr("y", 10)
                .style("font-size", "14px")
                .text(d => getWeatherEmoji(d.weather));
            
            g.append("text")
                .attr("x", 25)
                .attr("y", 10)
                .style("font-size", "12px")
                .text(d => d.weather || "Unknown");
        });

    // Add labels
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Average Severity");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height/2)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Number of Accidents");

    // Add title
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Weather Conditions Impact on Accidents");

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");
}

function createStateBarChart(accidentsData, stateAbbr) {
    d3.select("#bar-chart-container").html("");

    const margin = { top: 30, right: 20, bottom: 70, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter accidents for the selected state
    const stateAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());

    // Aggregate accidents by county
    const countyData = Array.from(d3.rollup(
        stateAccidents,
        v => v.length,
        d => d.County
    ), ([county, count]) => ({County: county, Accidents: count}));

    // Sort by accident count and get top 10
    const top10Counties = countyData
        .sort((a, b) => b.Accidents - a.Accidents)
        .slice(0, 10);

    // Set up scales
    const x = d3.scaleBand()
        .domain(top10Counties.map(d => d.County))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10Counties, d => d.Accidents) * 1.1])
        .nice()
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")).tickSize(-width))
        .style("font-size", "12px");

    // Add bars
    svg.selectAll(".bar")
        .data(top10Counties)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.County))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.Accidents))
        .attr("height", d => height - y(d.Accidents))
        .attr("fill", "#8B0000");

    // Add value labels
    svg.selectAll(".label")
        .data(top10Counties)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.County) + x.bandwidth() / 2)
        .attr("y", d => y(d.Accidents) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d3.format(",")(d.Accidents));

    // Add axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Counties");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Accidents");
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Top 10 Counties by Number of Accidents");
}

function createStateLineChart(accidentsData, stateAbbr) {
    // Clear any existing chart
    d3.select("#line-chart-container").html("");

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter accidents for the selected state
    const stateAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());

    // Severity levels
    const severityLevels = Array.from(new Set(stateAccidents.map(d => d.Severity)))
        .sort((a, b) => a - b); // Sort numerically
    const severityColorScale = d3.scaleOrdinal()
        .domain(severityLevels)
        .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26']); // color scale


    console.log(stateAccidents);
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Process the data to get monthly counts by severity
    const monthlyData = monthOrder.map(month => {
        const monthAccidents = stateAccidents.filter(d => d.Month === month);
        const severityCounts = {};
        
        // Initialize all severity levels with 0
        severityLevels.forEach(severity => {
            severityCounts[severity] = 0;
        });
        
        // Count accidents for each severity
        monthAccidents.forEach(accident => {
            severityCounts[accident.Severity] = (severityCounts[accident.Severity] || 0) + 1;
        });

        return {
            month: month,
            ...severityCounts
        };
    });

    // Convert to array of objects and sort by month
    monthlyData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    // Create stack data
    const stack = d3.stack()
        .keys(severityLevels)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(monthlyData);

    // Set up scales
    const x = d3.scalePoint()
        .domain(monthOrder)
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, 50])
        .nice()
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")))
        .style("font-size", "12px");

    // Add stacked areas
    const area = d3.area()
        .x(d => x(d.data.month))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    svg.selectAll(".severity-area")
        .data(stackedData)
        .join("path")
        .attr("class", "severity-area")
        .attr("d", area)
        .attr("fill", d => severityColorScale(d.key))
        .attr("opacity", 0.7);

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 100}, 10)`);

    legend.selectAll(".legend-item")
        .data(severityLevels)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
            g.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d => severityColorScale(d))
                .attr("opacity", 0.7);

            g.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .text(d => `Severity ${d}`)
                .style("font-size", "12px");
        });

    // Calculate total accidents per month for the line chart
    const monthlyTotals = monthlyData.map(d => ({
        month: d.month,
        total: severityLevels.reduce((sum, severity) => sum + (d[severity] || 0), 0)
    }));

    // Add the line for total accidents
    const line = d3.line()
        .x(d => x(d.month))
        .y(d => y(d.total));

    svg.append("path")
        .datum(monthlyTotals)
        .attr("fill", "none")
        .attr("stroke", "#FF4500")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add dots for total accidents
    svg.selectAll(".dot")
        .data(monthlyTotals)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.month))
        .attr("cy", d => y(d.total))
        .attr("r", 4)
        .attr("fill", "#FF4500");

    // Add value labels for total accidents
    svg.selectAll(".label")
        .data(monthlyTotals)
        .enter()
        .append("text")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.total) - 10)
        .attr("text-anchor", "middle")
        .text(d => d3.format(",")(d.total))
        .style("font-size", "10px");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Monthly Accident Severity Distribution");

    // Add axis labels (with removed tick lines)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Month");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Accident Count");
}

// reate the county-level choropleth map
function createCountyChoroplethMap() {
    const stateAbbr = getQueryParam('state');
    if (!stateAbbr) {
        alert("No state specified.");
        return;
    }

    // Define the path to the state's counties GeoJSON directory
    const countiesGeoJsonDir = `Data/states/${stateAbbr}/`;
    const stateGeoJsonDir = `Data/states/${stateAbbr}.geo.json`;

    stateData = d3.json(stateGeoJsonDir);

    // Load accidents data
    d3.csv("Data/US_Accidents_small_processed.csv").then(accidentsData => {
        // Filter accidents for the selected state
        const filteredAccidents = accidentsData.filter(d => d.State.toUpperCase() === stateAbbr.toUpperCase());

        // Aggregate accidents by County
        const accidentsByCounty = d3.rollups(
            filteredAccidents,
            v => v.length,
            d => d.County
        );

        // Convert to a Map for easy lookup
        const accidentsCountMap = new Map(accidentsByCounty);

        // Load all county GeoJSON files for the selected state
        const countyFiles = accidentsByCounty.map(([countyName, count]) => `${countiesGeoJsonDir}${countyName}.geo.json`);
        const geoJsonPromises = countyFiles.map(file => d3.json(file));

        // Promise for smooth loading
        Promise.all(geoJsonPromises).then(countyDataArray => {
            // Merge all counties into a single GeoJSON FeatureCollection
            const mergedCounties = {
                type: "FeatureCollection",
                features: countyDataArray.flatMap(data => data.features)
            };

            // Set up SVG dimensions
            const width = 1000;
            const height = 800;

            const svg = d3.select("#map-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");

            // Define projection and path
            const projection = d3.geoMercator()
                .fitSize([width, height], mergedCounties);
            const path = d3.geoPath().projection(projection);

            // Define color scale
            const maxAccidents = d3.max(accidentsByCounty, d => d[1]);
            const colorScale = d3.scaleSequential()
                .domain([0, maxAccidents])
                .interpolator(d3.interpolateReds);
            
            // Draw state map
            stateData = d3.json(stateGeoJsonDir).then(data => {
                svg.append("path")
                    .datum(data)
                    .attr("d", path)
                    .attr("fill", "rgba(240, 240, 245, 0)")
                    .attr("stroke", "#333")
                    .attr("stroke-width", 1)
                    .attr("pointer-events", "none");
            });
            
            // Tooltip
            const tooltip = d3.select("body").append("div").attr("class", "tooltip");

            // Draw counties
            svg.selectAll("path.county")
                .data(mergedCounties.features)
                .enter()
                .append("path")
                .attr("class", d => d.properties.name)
                .attr("d", path)
                .attr("fill", d => {
                    const countyName = d.properties.name; // Adjust based on GeoJSON's county name property
                    const count = accidentsCountMap.get(countyName) || 0;
                    return count > 0 ? colorScale(count) : "#f0f0f5";
                })
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5)
                .on("click", function(event) {
                    const countyName = d3.select(this).attr("class");
                    console.log(countyName);
                    if(countyName) {
                        window.location.href = `county_level.html?state=${stateAbbr}&county=${countyName}`;
                    }
                })
                .on("mouseover", function(event, d) {
                    console.log("Mouse over county:", d.properties.name);
                    const countyName = d.properties.name; // Adjust based on GeoJSON's county name property
                    const count = accidentsCountMap.get(countyName) || 0;

                    d3.select(this)
                        .attr("stroke-width", 1.5)
                        .attr("stroke", "#FF7043");

                    tooltip.html(`County: ${countyName.toUpperCase()}<br>Accidents: ${count}`)
                        .style("visibility", "visible");
                    d3.select(this).style("stroke-width", "1px").style("stroke", "#FF7043");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY + 5) + "px")
                        .style("left", (event.pageX + 5) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                    d3.select(this).style("stroke-width", "0.5px").style("stroke", "#666");
                });
        
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", 20)
                    .attr("text-anchor", "Top")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    .text(`Traffic Accidents in ${stateAbbr}`);
                    
            // Add Legend
            const legendWidth = 50;
            const legendHeight = 200;

            const legendSvg = d3.select("#map-container").append("svg")
                .attr("id", "legend")
                .attr("width", legendWidth + 50)  // add padding
                .attr("height", legendHeight + 50)
                .style("position", "absolute")
                .style("right", "10px")
                .style("bottom", "10px");

            const legendScale = d3.scaleLinear()
                .domain([0, maxAccidents])
                .range([legendHeight, 0]);

            const legendAxis = d3.axisRight(legendScale)
                .ticks(6)
                .tickFormat(d3.format(".0f"));

            // Create gradient for the legend
            const defs = legendSvg.append("defs");

            const linearGradient = defs.append("linearGradient")
                .attr("id", "linear-gradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");

            linearGradient.selectAll("stop")
                .data([
                    {offset: "0%", color: colorScale(0)},
                    {offset: "25%", color: colorScale(5)},
                    {offset: "50%", color: colorScale(10)},
                    {offset: "75%", color: colorScale(15)},
                    {offset: "100%", color: colorScale(20)} 
                ])
                .enter().append("stop")
                .attr("offset", d => d.offset)
                .attr("stop-color", d => d.color);

            // Append the rectangle and fill with gradient
            legendSvg.append("rect")
                .attr("x", 0)
                .attr("y", 10)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#linear-gradient)");

            // Append the axis
            legendSvg.append("g")
                .attr("class", "legend-axis")
                .attr("transform", `translate(${legendWidth}, 10)`)
                .call(legendAxis);
            
            // Add title to the legend
            legendSvg.append("text")
                .attr("x", legendWidth - 50)
                .attr("y", legendHeight + 40)
                .attr("text-anchor", "start")
                .style("font-size", "10px")
                .text("Number of Accidents");

        
            createStateLineChart(accidentsData, stateAbbr);
            createStateBarChart(accidentsData, stateAbbr);
            createWeatherBubbleChart(accidentsData, stateAbbr);
            createTimeDistribution(accidentsData, stateAbbr);
        });
    });
}

    createCountyChoroplethMap();

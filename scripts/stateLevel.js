// Function to parse query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function createStateBarChart(accidentsData, stateAbbr) {
    d3.select("#bar-chart-container").html("");

    const margin = { top: 10, right: 20, bottom: 70, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

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

    console.log(stateAccidents);
    // Process the data to get monthly counts
    const monthlyData = d3.rollups(
        stateAccidents,
        v => v.length,
        d => d.Month
    );

    // Convert to array of objects and sort by month
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const processedData = monthlyData
        .map(([month, count]) => ({ Month_Name: month, Accident_Count: count }))
        .sort((a, b) => monthOrder.indexOf(a.Month_Name) - monthOrder.indexOf(b.Month_Name));

    // Set up scales
    const x = d3.scalePoint()
        .domain(monthOrder)
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.Accident_Count)])
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

    // Add the line
    const line = d3.line()
        .x(d => x(d.Month_Name))
        .y(d => y(d.Accident_Count));

    svg.append("path")
        .datum(processedData)
        .attr("fill", "none")
        .attr("stroke", "#FF4500")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add dots
    svg.selectAll(".dot")
        .data(processedData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Month_Name))
        .attr("cy", d => y(d.Accident_Count))
        .attr("r", 4)
        .attr("fill", "#FF4500");

    // Add value labels
    svg.selectAll(".label")
        .data(processedData)
        .enter()
        .append("text")
        .attr("x", d => x(d.Month_Name))
        .attr("y", d => y(d.Accident_Count) - 10)
        .attr("text-anchor", "middle")
        .text(d => d3.format(",")(d.Accident_Count))
        .style("font-size", "10px");

    // Add axis labels
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
            const width = 800;
            const height = 600;

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
        

            // Add Legend
            const legendWidth = 20;
            const legendHeight = 200;

            const legendSvg = d3.select("#map-container").append("svg")
                .attr("id", "legend")
                .attr("width", legendWidth + 40)
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
                    {offset: "0%", color: d3.interpolateReds(0)},
                    {offset: "100%", color: d3.interpolateReds(1)}
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

        
            createStateLineChart(accidentsData, stateAbbr);
            createStateBarChart(accidentsData, stateAbbr);
        });
    });
}

    createCountyChoroplethMap();

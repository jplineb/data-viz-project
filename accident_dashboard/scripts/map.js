function drawMap(countyData, geoData, selectedState = null) {
    const width = document.getElementById("map").offsetWidth;
    const height = document.getElementById("map").offsetHeight;

    const svg = d3
        .select("#map")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // Logarithmic scale for map colors
    const colorScale = d3
        .scaleSequential(d3.interpolateYlOrRd)
        .domain([
            Math.log(1), // Avoid log(0), use log(1) as the lower bound
            Math.log(85035), // Maximum accident count
        ]);

    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "#fff")
            .style("padding", "6px 10px")
            .style("border-radius", "6px")
            .style("box-shadow", "0px 2px 4px rgba(0, 0, 0, 0.2)")
            .style("font-size", "12px")
            .style("font-weight", "normal")
            .style("color", "#333")
            .style("z-index", "10")
            .style("border", "1px solid #ddd");
    }

    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
            const county = countyData.find(
                (c) => c.County === d.properties.County && c.State === d.properties.State
            );
            return county ? colorScale(Math.log(+county.Accident_Count)) : "#f5f5f5"; // Default to gray if no data
        })
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            const county = countyData.find(
                (c) => c.County === d.properties.County && c.State === d.properties.State
            );

            tooltip
                .style("visibility", "visible")
                .html(
                    `<strong>${d.properties.County}, ${d.properties.State}</strong><br>Count: ${
                        county ? +county.Accident_Count : 0
                    }`
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 40}px`);

            d3.select(event.currentTarget)
                .attr("stroke", "black")
                .attr("stroke-width", 1.5);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 40}px`);
        })
        .on("mouseout", (event) => {
            tooltip.style("visibility", "hidden");
            d3.select(event.currentTarget)
                .attr("stroke", "#aaa")
                .attr("stroke-width", 0.5);
        });

    if (selectedState) {
        svg.selectAll(".state-border")
            .data(
                geoData.features.filter((d) => d.properties.State === selectedState)
            )
            .join("path")
            .attr("d", path)
            .attr("class", "state-border")
            .attr("fill", "none")
            .attr("stroke", "#333333")
            .attr("stroke-width", 1);
    }

    // Legend Position Control
    const legendPosition = {
        x: width - 200, // Adjust horizontal position
        y: height / 3, // Adjust vertical position
    };

    const legendWidth = 10;
    const legendHeight = 200;

    const legendGroup = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "color-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");

    // Define gradient stops based on log scale
    const stops = [
        { value: 1, offset: "0%" },
        { value: 20000, offset: "33%" },
        { value: 40000, offset: "66%" },
        { value: 85035, offset: "100%" },
    ];

    stops.forEach((stop) => {
        linearGradient.append("stop")
            .attr("offset", stop.offset)
            .attr("stop-color", colorScale(Math.log(stop.value)));
    });

    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#color-gradient)");

    const legendScale = d3.scaleLinear() // Linear scale for legend
        .domain([0, 85035]) // Start at 0, max value at the top
        .range([legendHeight, 0]); // Top-to-bottom scale

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5) // Adjust number of ticks
        .tickFormat(d3.format(".0f")); // Format as integers

    legendGroup.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);

    legendGroup.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Accident Count");
}

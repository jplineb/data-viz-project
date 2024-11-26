function drawMap(countyData, geoData, selectedState = null) {
    const width = document.getElementById("map").offsetWidth; // Dynamically adapt to container width
    const height = document.getElementById("map").offsetHeight; // Dynamically adapt to container height

    const svg = d3
        .select("#map")
        .html("") // Clear previous map on redraw
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // Logarithmic scale for color, ensuring good differentiation for both low and high values (color scale stays unchanged)
    const colorScale = d3
        .scaleSequential(d3.interpolateYlOrRd) // Use a continuous color scale (Yellow-Red)
        .domain([
            Math.log(1), // Avoid log(0), use log(1) as the lower bound (log(1) = 0)
            Math.log(d3.max(countyData, (d) => +d.Accident_Count)) // Log of the maximum value
        ]);

    // Create an absolutely positioned tooltip div
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
            .style("border", "1px solid #ddd"); // Add a border for clean separation
    }

    // Draw county shapes (the map)
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
                .style("left", `${event.pageX + 10}px`) // Dynamic position
                .style("top", `${event.pageY - 40}px`); // Adjust above the pointer

            d3.select(event.currentTarget)
                .attr("stroke", "black")
                .attr("stroke-width", 1.5);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", `${event.pageX + 10}px`) // Follow the pointer
                .style("top", `${event.pageY - 40}px`);
        })
        .on("mouseout", (event) => {
            tooltip.style("visibility", "hidden");
            d3.select(event.currentTarget)
                .attr("stroke", "#aaa")
                .attr("stroke-width", 0.5);
        });

    // Highlight state border if a state is selected
    if (selectedState) {
        svg.selectAll(".state-border")
            .data(
                geoData.features.filter((d) => d.properties.State === selectedState)
            )
            .join("path")
            .attr("d", path)
            .attr("class", "state-border")
            .attr("fill", "none")
            .attr("stroke", "#333333") // Border color for selected state
            .attr("stroke-width", 1);
    }

    // Legend code has been removed as per request.
}

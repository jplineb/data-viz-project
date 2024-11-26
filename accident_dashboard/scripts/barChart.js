function drawBarChart(stateData, onBarClick) {
    const width = document.getElementById("barChart").offsetWidth; // Dynamically adapt to container
    const height = document.getElementById("barChart").offsetHeight; // Dynamically adapt to container
    const margin = { top: 20, right: 20, bottom: 50, left: 100 }; // Adjust margins for horizontal layout

    const svg = d3
        .select("#barChart")
        .html("") // Clear previous bar chart on redraw
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Sort the data in descending order based on Accident_Count
    stateData.sort((a, b) => d3.descending(+a.Accident_Count, +b.Accident_Count));

    // Scales
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(stateData, (d) => +d.Accident_Count)])
        .nice()
        .range([margin.left, width - margin.right]); // Horizontal range

    const yScale = d3
        .scaleBand()
        .domain(stateData.map((d) => d.State)) // The sorted states
        .range([margin.top, height - margin.bottom]) // Vertical range
        .padding(0.1);

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`) // Move to the bottom
        .call(d3.axisBottom(xScale).ticks(6)) // Add ticks dynamically
        .call((g) => g.select(".domain").remove()); // Remove domain line for cleaner look

    // Add X-axis line
    svg.append("line")
        .attr("x1", margin.left)
        .attr("y1", height - margin.bottom)
        .attr("x2", width - margin.right)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#000")
        .attr("stroke-width", 1);

    // Y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`) // Move to the left
        .call(d3.axisLeft(yScale).tickSizeOuter(0)); // Remove outer ticks

    // Hover label container
    const hoverLabel = svg
        .append("g")
        .style("visibility", "hidden");

    hoverLabel
        .append("text")
        .attr("id", "hover-state")
        .attr("x", width - margin.right - 10) // Position on bottom right
        .attr("y", height - margin.bottom - 30) // Just above the x-axis line
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .style("font-weight", "bold");

    hoverLabel
        .append("text")
        .attr("id", "hover-count")
        .attr("x", width - margin.right - 10) // Position on bottom right
        .attr("y", height - margin.bottom - 10) // Adjust position slightly below the state
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .style("font-weight", "bold");

    // Bars
    svg.selectAll(".bar")
        .data(stateData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", margin.left) // All bars start at the left margin
        .attr("y", (d) => yScale(d.State)) // Y position based on state
        .attr("width", (d) => {
            const barWidth = xScale(+d.Accident_Count) - margin.left;
            return barWidth > 2 ? barWidth : 2; // Minimum bar width of 2px for visibility
        })
        .attr("height", yScale.bandwidth()) // Bar height based on band scale
        .attr("fill", "brown")
        .on("mouseover", function (event, d) {
            // Show the hover label with state and count
            hoverLabel.style("visibility", "visible");
            d3.select("#hover-state").text(`State: ${d.State}`);
            d3.select("#hover-count").text(`Count: ${d.Accident_Count}`);

            // Highlight the hovered bar with a gold border
            d3.select(this)
                .attr("stroke", "#FFD700")
                .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
            // Hide the hover label
            hoverLabel.style("visibility", "hidden");

            // Remove the highlight from the bar
            d3.select(this).attr("stroke", null);
        })
        .on("click", (event, d) => onBarClick(d.State)); // Call click interaction
}

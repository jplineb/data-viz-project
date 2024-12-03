function drawBarChart(stateData, onBarClick) {
    const container = d3.select("#barChart");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    const margin = { top: 20, right: 20, bottom: 50, left: 80 };

    const svg = d3
        .select("#barChart")
        .html("") // Clear previous bar chart on redraw
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // State abbreviation to full name mapping
    const stateNames = {
        AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
        CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
        HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
        KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
        MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
        MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
        NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
        ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
        RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
        TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
        WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
    };

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

    // Add X-axis Label
    svg.append("text")
        .attr("id", "x-axis-label")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left) // Center horizontally
        .attr("y", height - margin.bottom + 40) // Below the x-axis
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .text("Accident Count");

    // Add Y-axis Label
    svg.append("text")
        .attr("id", "y-axis-label")
        .attr("x", -height / 2) // Centered vertically
        .attr("y", margin.left - 35) // To the left of the y-axis
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .attr("transform", "rotate(-90)") // Rotate for y-axis orientation
        .text("States");

    // Static Label for State and Count (Initially Hidden)
    const labelGroup = svg
        .append("g")
        .attr("id", "hover-label")
        .style("visibility", "hidden");

    // Define manual position for the hover label
    const labelX = width - 300; // Adjust this for horizontal position
    const labelY = height - margin.bottom - 350; // Adjust this for vertical position

    labelGroup
        .append("text")
        .attr("id", "hover-state")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "start")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .style("font-weight", "bold");

    labelGroup
        .append("text")
        .attr("id", "hover-count")
        .attr("x", labelX)
        .attr("y", labelY + 20) // Slightly below the state label
        .attr("text-anchor", "start")
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
            // Show the hover label
            labelGroup.style("visibility", "visible");

            // Update the static label with the full state name and count
            d3.select("#hover-state").text(`State: ${stateNames[d.State]}`);
            d3.select("#hover-count").text(`Count: ${d.Accident_Count}`);

            // Highlight the hovered bar with a gold border
            d3.select(this)
                .attr("stroke", "#FFD700")
                .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
            // Hide the hover label
            labelGroup.style("visibility", "hidden");

            // Remove the highlight from the bar
            d3.select(this).attr("stroke", null);
        })
        .on("click", (event, d) => onBarClick(d.State)); // Call click interaction
}

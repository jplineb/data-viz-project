function drawBarChart(stateData, populationData, onBarClick) {
    let isPerCapitaView = false;
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
    stateData.forEach(d => {
        const statePopulation = populationData.find(p => p.State === d.State)?.Population;
        d.AccidentsPerCapita = statePopulation ? 
            (+d.Accident_Count / +statePopulation) * 100000 : 0; // per 100,000 residents
    });

    // Sort the data in descending order based on Accident_Count
    stateData.sort((a, b) => d3.descending(+a.Accident_Count, +b.Accident_Count));

    // Scales
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(stateData, (d) => +d.Accident_Count)])
        .nice()
        .range([margin.left, width - margin.right]); // Horizontal range
    
    const xScalePerCapita = d3
        .scaleLinear()
        .domain([0, d3.max(stateData, (d) => d.AccidentsPerCapita)])
        .nice()
        .range([margin.left, width - margin.right]);

    const yScale = d3
        .scaleBand()
        .domain(stateData.map((d) => d.State)) // The sorted states
        .range([margin.top, height - margin.bottom]) // Vertical range
        .padding(0.1);

    // Toggle visibility of per capita bars
    function togglePerCapitaBars() {
        isPerCapitaView = !isPerCapitaView;
        
        // Resort the data based on the current view
        stateData.sort((a, b) => 
            isPerCapitaView ? 
            d3.descending(a.AccidentsPerCapita, b.AccidentsPerCapita) : 
            d3.descending(+a.Accident_Count, +b.Accident_Count)
        );
        
        // Update the y-scale domain with the new order
        yScale.domain(stateData.map(d => d.State));
        
        // Update the y-axis with transition
        svg.selectAll(".y-axis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(yScale).tickSizeOuter(0));

        // Update x-axis with transition
        svg.selectAll(".x-axis")
            .transition()
            .duration(750)
            .call(d3.axisBottom(isPerCapitaView ? xScalePerCapita : xScale).ticks(6))
            .call(g => g.select(".domain").remove());
        
        // Update the positions and widths of both types of bars
        svg.selectAll(".bar")
            .transition()
            .duration(750)
            .attr("y", d => yScale(d.State))
            .attr("width", d => {
                const scale = isPerCapitaView ? xScalePerCapita : xScale;
                const value = isPerCapitaView ? d.AccidentsPerCapita : +d.Accident_Count;
                const barWidth = scale(value) - margin.left;
                return barWidth > 2 ? barWidth : 2;
            })
            .style("display", isPerCapitaView ? "none" : "block");
            
        svg.selectAll(".bar-capita")
            .transition()
            .duration(750)
            .attr("y", d => yScale(d.State))
            .style("display", isPerCapitaView ? "block" : "none");

        // Update x-axis label
        svg.select("#x-axis-label")
            .text(isPerCapitaView ? "Accidents per 100,000 Residents" : "Accident Count");
    }

    // X-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .call(g => g.select(".domain").remove());

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
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

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
            d3.select("#hover-state").text(`State: ${stateNames[d.State]}`);
            d3.select("#hover-count")
                .text(`Total Count: ${d.Accident_Count}`)
                .append("tspan")
                .attr("x", labelX)
                .attr("dy", "1.2em")
                .text(`Per 100k Residents: ${Math.round(d.AccidentsPerCapita)}`);
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
    
    svg.selectAll(".bar-capita")
        .data(stateData)
        .join("rect")
        .attr("class", "bar-capita")
        .attr("x", margin.left)
        .attr("y", d => yScale(d.State))
        .attr("width", d => {
            const barWidth = xScalePerCapita(d.AccidentsPerCapita) - margin.left;
            return barWidth > 2 ? barWidth : 2;
        })
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue")
        .attr("opacity", 0.7)
        .style("display", "none")
        .on("mouseover", function (event, d) {
            labelGroup.style("visibility", "visible");
            d3.select("#hover-state").text(`State: ${stateNames[d.State]}`);
            d3.select("#hover-count")
                .text(`Total Count: ${d.Accident_Count}`)
                .append("tspan")
                .attr("x", labelX)
                .attr("dy", "1.2em")
                .text(`Per 100k Residents: ${Math.round(d.AccidentsPerCapita)}`);
            d3.select(this)
                .attr("stroke", "#FFD700")
                .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
            labelGroup.style("visibility", "hidden");
            d3.select(this).attr("stroke", null);
        })
        .on("click", (event, d) => onBarClick(d.State));

    return togglePerCapitaBars;
}

function createLineChart(year = 'All Years') {
    d3.select("#line-chart-container").html("");

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const fileName = year === 'All Years' ? 'monthly_accidents_total.csv' : `monthly_accidents_${year}.csv`;

    d3.csv(`Data/${fileName}`).then(data => {
        data.forEach(d => d.Accident_Count = +d.Accident_Count);
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        data.sort((a, b) => monthOrder.indexOf(a.Month_Name) - monthOrder.indexOf(b.Month_Name));

        const x = d3.scalePoint().domain(monthOrder).range([0, width]).padding(0.5);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Accident_Count)]).nice().range([height, 0]);

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

        const line = d3.line()
            .x(d => x(d.Month_Name))
            .y(d => y(d.Accident_Count));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#FF4500")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Month_Name))
            .attr("cy", d => y(d.Accident_Count))
            .attr("r", 4)
            .attr("fill", "#FF4500");

        svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => x(d.Month_Name))
            .attr("y", d => y(d.Accident_Count) - 10)
            .attr("text-anchor", "middle")
            .text(d => d3.format(",")(d.Accident_Count))
            .style("font-size", "10px");

        // X-axis Label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .text("Month");

        // Y-axis Label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .text("Accident Count");
    });
}

document.getElementById('year').addEventListener('change', function() {
    const selectedYear = this.value;
    createLineChart(selectedYear === 'All Years' ? 'all' : selectedYear);
});

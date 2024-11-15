function createBarChart(year = 'total') {
    d3.select("#bar-chart-container").html("");

    const margin = { top: 10, right: 20, bottom: 50, left: 60 };
    const width = 530 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const fileName = year === 'total' ? 'top_10_states_total.csv' : `top_10_states_${year}.csv`;

    d3.csv(`Data/${fileName}`).then(data => {
        data.forEach(d => {
            d.Accidents = +d[year === 'total' ? 'Total_Accidents' : year];
        });

        const x = d3.scaleBand()
            .domain(data.map(d => d.State))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Accidents) * 1.1])
            .nice()
            .range([height, 0]);

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

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.State))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.Accidents))
            .attr("height", d => height - y(d.Accidents))
            .attr("fill", "#8B0000");

        svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.State) + x.bandwidth() / 2)
            .attr("y", d => y(d.Accidents) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d => d3.format(",")(d.Accidents));

        // X-axis Label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .text("States");

        // Y-axis Label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .text("Accidents");
    });
}

document.getElementById('year').addEventListener('change', function() {
    const selectedYear = this.value;
    createBarChart(selectedYear === 'All Years' ? 'total' : selectedYear);
});

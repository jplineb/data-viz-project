function createHeatmap() {
    const yearSelector = document.getElementById("year");
    let selectedYear = "all";

    function updateHeatmap() {
        const stateData = {};

        d3.csv("Data/clean3.csv").then(function(data) {
            data.forEach(d => {
                const stateAbbr = d.State.toLowerCase();
                const count = selectedYear === "all" ? +d.Total_Accidents : +d[selectedYear];
                stateData[stateAbbr] = count;
            });

            const colorScale = d3.scaleSequential()
                .domain([1, d3.max(Object.values(stateData))])
                .interpolator(d3.interpolateOranges);

            const zeroColor = "#f0f0f5";

            d3.xml("image/Blank_US_Map_(states_only).svg").then(function(xml) {
                document.getElementById("map-container").innerHTML = "";
                document.getElementById("map-container").appendChild(xml.documentElement);
                const svg = d3.select("#map-container svg")
                    .attr("width", "100%")
                    .attr("height", "auto")
                    .attr("viewBox", "0 0 1000 600")
                    .style("max-width", "100%");

                svg.selectAll("path")
                    .style("fill", function() {
                        const stateAbbr = d3.select(this).attr("class");
                        const count = stateData[stateAbbr];
                        return count ? colorScale(count) : zeroColor;
                    })
                    .style("stroke", "#666")
                    .style("stroke-width", "0.5px")
                    // Redirect to state level page
                    .on("click", function(event) {
                        const stateAbbr = d3.select(this).attr("class");
                        if(stateAbbr) {
                            window.location.href = `state_level.html?state=${stateAbbr.toUpperCase()}`;
                        }
                    });

                const tooltip = d3.select("body").append("div").attr("class", "tooltip");

                svg.selectAll("path")
                    .on("mouseover", function(event) {
                        const stateAbbr = d3.select(this).attr("class");
                        const count = stateData[stateAbbr] || 0;
                        tooltip.html(`State: ${stateAbbr.toUpperCase()}<br>Accidents: ${count}`)
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

                const legendHeight = 200;
                const legendWidth = 20;

                d3.select("#legend").remove();

                const legendSvg = d3.select("#map-container").append("svg")
                    .attr("id", "legend")
                    .attr("width", legendWidth + 40)
                    .attr("height", legendHeight + 50)
                    .style("position", "absolute")
                    .style("right", "10px")
                    .style("bottom", "10px"); /* Move legend closer to the bottom */

                const legendScale = d3.scaleLinear()
                    .domain([0, colorScale.domain()[1]])
                    .range([legendHeight, 0]);

                const legendAxis = d3.axisRight(legendScale)
                    .ticks(6)
                    .tickFormat(d => d === 0 ? "0" : d3.format(",")(d));

                legendSvg.append("g")
                    .attr("class", "legend-axis")
                    .attr("transform", `translate(${legendWidth}, 15)`)
                    .call(legendAxis);

                const legend = legendSvg.append("g")
                    .attr("transform", `translate(0, 15)`);

                for (let i = 0; i <= legendHeight; i++) {
                    legend.append("rect")
                        .attr("x", 0)
                        .attr("y", i)
                        .attr("width", legendWidth)
                        .attr("height", 1)
                        .style("fill", i === legendHeight ? zeroColor : colorScale(legendScale.invert(i)));
                }
            });
        });
    }

    yearSelector.addEventListener("change", function() {
        selectedYear = this.value === "All Years" ? "all" : this.value;
        updateHeatmap();
    });

    updateHeatmap();
}

createHeatmap();
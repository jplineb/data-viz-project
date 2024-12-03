export function createTooltip() {
    return d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");
}

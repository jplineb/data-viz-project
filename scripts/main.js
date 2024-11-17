// Function to display all charts on page load
function loadAllCharts(year = "All Years") {
    createHeatmap(year);
    createBarChart(year === 'All Years' ? 'total' : year);
    createLineChart(year);
}

// Event listener for year selection dropdown
document.getElementById('year').addEventListener('change', function() {
    const selectedYear = this.value;
    loadAllCharts(selectedYear);
});

// Initialize the visualizations on page load
loadAllCharts();

// Load all required data files
Promise.all([
    d3.csv("Data/state_accident_counts.csv"),
    d3.csv("Data/county_accident_counts.csv"),
    d3.csv("Data/US_Accidents_small_processed.csv"),
    d3.json("Data/counties.geojson")
]).then(([stateData, countyData, accidentData, geoData]) => {
    // Draw the bar chart with click interaction
    drawBarChart(stateData, (selectedState) => {
        drawMap(countyData, geoData, selectedState, accidentData);
    });

    // Initial map render with all data
    drawMap(countyData, geoData, null, accidentData);
    
    // Initial time distribution with nationwide data
    createTimeDistribution(accidentData, null, "Nationwide");
});
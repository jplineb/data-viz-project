// Load all required data files
Promise.all([
    d3.csv("Data/state_accident_counts.csv"),
    d3.csv("Data/county_accident_counts.csv"),
    d3.csv("Data/US_Accidents_small_processed.csv"),
    d3.csv("Data/state_population_data.csv"),
    d3.json("Data/counties.geojson")
]).then(([stateData, countyData, accidentData, populationData, geoData]) => {
    // Draw the bar chart with click interaction
    const toggleFunction = drawBarChart(stateData, populationData, (selectedState) => {
        drawMap(countyData, geoData, selectedState, accidentData);
    });

    // Set up the button click event
    document.getElementById('togglePerCapita').onclick = toggleFunction;
    // Initial map render with all data
    drawMap(countyData, geoData, null, accidentData);
    
    // Initial time distribution with nationwide data
    createTimeDistribution(accidentData, null, "Nationwide");
});
d3.csv("Data/state_accident_counts.csv").then((stateData) => {
    d3.csv("Data/county_accident_counts.csv").then((countyData) => {
        d3.json("Data/counties.geojson").then((geoData) => {
            // Draw the bar chart with click interaction
            drawBarChart(stateData, (selectedState) => {
                drawMap(countyData, geoData, selectedState); // Retain all colors and highlight state border
            });

            // Initial map render with all data
            drawMap(countyData, geoData);
        });
    });
});

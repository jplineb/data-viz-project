Promise.all([
    d3.csv("Data/state_accident_counts.csv"),
    d3.csv("Data/county_accident_counts.csv"),
    d3.csv("Data/US_Accidents_small_processed.csv"),
    d3.csv("Data/state_population_data.csv"),
    d3.json("Data/counties.geojson")
]).then(([stateData, countyData, accidentData, populationData, geoData]) => {
    // Draw the bar chart with click interaction
    const toggleFunction = drawBarChart(stateData, populationData, (selectedState) => {
        drawMap(countyData, geoData, selectedState, accidentData, (selectedCounty) => {
            // Update county-level time distribution when a county is clicked
            if (selectedCounty) {
                createTimeDistribution(
                    accidentData,
                    'county',
                    `${selectedState}:${selectedCounty}`,
                    '#time-distribution-county'
                );
            } else {
                // Clear county visualization if no county is selected
                d3.select("#time-distribution-county")
                    .html("")
                    .append("div")
                    .attr("class", "placeholder-text")
                    .style("text-align", "center")
                    .style("padding-top", "40%")
                    .text("Select a county to view its time distribution");
            }
        });
        
        // Update state-level time distribution
        if (selectedState) {
            createTimeDistribution(
                accidentData,
                'state',
                selectedState,
                '#time-distribution-state'
            );
        } else {
            // Clear state visualization if no state is selected
            d3.select("#time-distribution-state")
                .html("")
                .append("div")
                .attr("class", "placeholder-text")
                .style("text-align", "center")
                .style("padding-top", "40%")
                .text("Select a state to view its time distribution");
        }
    });

    // Set up the button click event
    document.getElementById('togglePerCapita').onclick = toggleFunction;
    
    // Initial map render with all data
    drawMap(countyData, geoData, null, accidentData);
    
    // Create the nationwide time distribution (never updates)
    createTimeDistribution(
        accidentData,
        'country',
        null,
        '#time-distribution-nationwide'
    );

    // Initial state time distribution (empty with message)
    d3.select("#time-distribution-state")
        .append("div")
        .attr("class", "placeholder-text")
        .style("text-align", "center")
        .style("padding-top", "40%")
        .text("Select a state to view its time distribution");

    // Initial county time distribution (empty with message)
    d3.select("#time-distribution-county")
        .append("div")
        .attr("class", "placeholder-text")
        .style("text-align", "center")
        .style("padding-top", "40%")
        .text("Select a county to view its time distribution");
});
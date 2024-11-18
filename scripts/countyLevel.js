function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const countyName = getQueryParam("county");
const stateAbbr = getQueryParam("state");
console.log(countyName);
console.log(stateAbbr);

// Load both data sources using Promise.all
Promise.all([
    d3.json(`./Data/states/${stateAbbr}/${countyName}.geo.json`),
    d3.csv('./Data/US_Accidents_small_processed.csv')
]).then(([geoData, accidentData]) => {
    // Filter accidents for this county
    const countyAccidents = accidentData.filter(d => d.County === countyName);
    
    // Create the map
    const map = L.map('map').setView([38.5, -98], 4); // Default view, will adjust
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add county boundary
    const countyLayer = L.geoJSON(geoData).addTo(map);
    
    // Fit map to county bounds
    map.fitBounds(countyLayer.getBounds());
    
    // Add accident points
    countyAccidents.forEach(accident => {
        L.circleMarker([accident.Start_Lat, accident.Start_Lng], {
            radius: 5,
            fillColor: '#ff4444',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindPopup(`
            <strong>Severity:</strong> ${accident.Severity}<br>
            <strong>Start Time:</strong> ${accident.Start_Time}<br>
            <strong>Description:</strong> ${accident.Description}
        `)
        .addTo(map);
    });
});
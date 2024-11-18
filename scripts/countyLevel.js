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
    // Along with cool popup information
    countyAccidents.forEach(accident => {
        L.circleMarker([accident.Start_Lat, accident.Start_Lng], {
            radius: 5,
            fillColor: '#ff4444',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        })
        // Make the popup info with auto-generated html
        .bindPopup(`
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333; border-bottom: 2px solid #ff4444;">Accident Details</h3>
                
                <div style="margin-bottom: 10px;">
                    <strong style="color: #ff4444;">📍 Location</strong><br>
                    ${accident.Street}<br>
                    ${accident.City}, ${accident.State} ${accident.Zipcode}
                </div>

                <div style="margin-bottom: 10px;">
                    <strong style="color: #ff4444;">⏰ Time & Duration</strong><br>
                    Start: ${new Date(accident.Start_Time).toLocaleString()}<br>
                    End: ${new Date(accident.End_Time).toLocaleString()}<br>
                    Period: ${accident.Sunrise_Sunset}
                </div>

                <div style="margin-bottom: 10px;">
                    <strong style="color: #ff4444;">🌤️ Weather Conditions</strong><br>
                    Temperature: ${accident['Temperature(F)']}°F<br>
                    Weather: ${accident.Weather_Condition}<br>
                    Visibility: ${accident['Visibility(mi)']} mi<br>
                    Wind: ${accident.Wind_Speed} mph ${accident.Wind_Direction}
                </div>

                <div style="margin-bottom: 10px;">
                    <strong style="color: #ff4444;">⚠️ Severity & Features</strong><br>
                    Severity Level: ${accident.Severity}<br>
                    Distance: ${accident['Distance(mi)']} mi<br>
                    ${accident.Junction === 'True' ? '• Junction<br>' : ''}
                    ${accident.Traffic_Signal === 'True' ? '• Traffic Signal<br>' : ''}
                    ${accident.Crossing === 'True' ? '• Crossing<br>' : ''}
                </div>

                <div style="margin-top: 10px; font-style: italic; font-size: 0.9em;">
                    ${accident.Description}
                </div>
            </div>
        `)
        .addTo(map);
    });
});
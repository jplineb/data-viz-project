// Set up container
const width = 960;
const height = 600;
const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Set up map projection
const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

const path = d3.geoPath()
  .projection(projection);

// Load both the US map data and accident data
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("dataset/US_Accidents_March23_sampled_500k.csv")
  ]).then(([us, accidents]) => {
    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "state")
      .style("fill", "#ddd")
      .style("stroke", "#fff");
  
    // Add accident points
    svg.selectAll("circle")
      .data(accidents)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.Start_Lng, d.Start_Lat])[0])
      .attr("cy", d => projection([d.Start_Lng, d.Start_Lat])[1])
      .attr("r", 2)
      .style("fill", "red")
      .style("opacity", 0.5);
  }).catch(error => {
    console.error("Error loading the data:", error);
  });

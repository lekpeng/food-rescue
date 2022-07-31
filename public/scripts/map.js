const map = L.map("map");

function onLocationFound(e) {
  var radius = e.accuracy / 2;
  var location = e.latlng;
  console.log("location", location);
  L.marker(location).addTo(map);
  L.circle(location, radius).addTo(map);
  document.querySelector(".location-input").value = location;
}

function onLocationError(e) {
  alert(e.message);
}
// Get the tile layer from OpenStreetMaps
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: "© OpenStreetMap",
}).addTo(map);

function getLocationLeaflet() {
  map.on("locationfound", onLocationFound);
  map.on("locationerror", onLocationError);
  map.locate({ setView: true, maxZoom: 16 });
}

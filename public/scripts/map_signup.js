const map = L.map("map");
const apiKey = document.querySelector("#api-key").innerText;

function onLocationFound(e) {
  var location = e.latlng;
  console.log("location", location);
  const geocodeService = L.esri.Geocoding.geocodeService({
    apikey: apiKey, // replace with your api key - https://developers.arcgis.com
  });
  geocodeService
    .reverse()
    .latlng(location)
    .run(function (error, result) {
      if (error) {
        console.log("map pop up error");
        return;
      }
      console.log("NO ERRRO");

      L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
    });
  // L.marker(location).addTo(map);
  // L.circle(location, radius).addTo(map);
  document.querySelector(".location-input").value = location;
}

function onLocationError(e) {
  alert(e.message);
}

function getLocationLeaflet() {
  // Get the tile layer from OpenStreetMaps
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  map.on("locationfound", onLocationFound);
  map.on("locationerror", onLocationError);
  map.locate({ setView: true, maxZoom: 16 });
}

const rawLocation = document.querySelector("#poster-user-location").innerText;
const showLocation = (rawlatlng) => {
  console.log("RUNNING SHOW LOCATION");
  console.log("raw location", rawLocation);
  const [lat, lng] = rawlatlng.split(",").map((string) => Number(string));
  console.log("lat", lat);
  console.log("lng", lng);
  map = new L.Map("map");
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 20,
  }).addTo(map);

  // map view before we get the location
  map.setView(new L.LatLng(lat, lng), 12);
  L.marker([lat, lng]).addTo(map);
};

showLocation(rawLocation);

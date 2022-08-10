const rawLocation = document.querySelector("#poster-user-location").innerText;
const apiKey = document.querySelector("#api-key").innerText;

const showLocation = (rawlatlng) => {
  const [lat, lng] = rawlatlng.split(",").map((string) => Number(string));
  const map = new L.Map("map").setView(new L.LatLng(lat, lng), 12);

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 20,
  }).addTo(map);

  // L.marker([lat, lng]).addTo(map);

  const geocodeService = L.esri.Geocoding.geocodeService({
    apikey: apiKey, // replace with your api key - https://developers.arcgis.com
  });

  geocodeService
    .reverse()
    .latlng([lat, lng])
    .run(function (error, result) {
      if (error) {
        console.log("map pop up error");
        return;
      }
      console.log("NO ERRRO");

      L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
    });
};

showLocation(rawLocation);

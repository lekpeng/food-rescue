const rawLocation = document.querySelector("#poster-user-location").innerText;
const apiKey = document.querySelector("#api-key").innerText;

const showLocation = async (rawlatlng) => {
  console.log("SHOW LOCATION");
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

  const geoCodes = await geocodeService
    .reverse()
    .latlng([lat, lng])
    .run(function (error, result) {
      if (error) {
        console.log("map pop up error");
        return;
      }
      console.log("NO ERROR");

      L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
      const leafletPopup = document.querySelector(".leaflet-popup-content");
      const address = leafletPopup.innerText;

      leafletPopup.innerHTML = `<a href='https://www.google.com/maps/dir/?api=1&destination=${rawLocation}' target='_blank' rel='noopener noreferrer'>${address}</a>`;
    });
};

showLocation(rawLocation);

const mapDiv = document.getElementById("map");

const coordinates = JSON.parse(mapDiv.dataset.coordinates);
const place = mapDiv.dataset.place;

console.log(coordinates);
console.log(place);

const map = L.map("map").setView(
    [coordinates[1], coordinates[0]],
    13
);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.marker([coordinates[1], coordinates[0]])
    .addTo(map)
    .bindPopup(`<b>${place}</b>`)
    .openPopup();
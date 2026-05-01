mapboxgl.accessToken =
  "pk.eyJ1Ijoic25lczE5eHgiLCJhIjoiY21vbjc3d3E5MGlpZzJvcHZ2MjdocTNubSJ9.6cJROC_E9p0ZnZWgLtg8xg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [1.2974, 52.6309],
  zoom: 7,
  pitch: 0,
  bearing: 0,
  interactive: true,
  minZoom: 6,
  maxZoom: 16,
});

window.map = map;

function setupEnvironment() {
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();

  map.setFog({
    range: [-1, 2],
    color: bgColor,
    "horizon-blend": 0.3,
  });
}

map.on("load", setupEnvironment);
map.on("style.load", setupEnvironment);

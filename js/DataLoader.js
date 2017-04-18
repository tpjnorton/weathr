// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
const Config = require('electron-config');
const config = new Config();
weatherData = {};
var weather3D = null;
var coords = { lat: "", lon: "" };
document.querySelector("#retryButton").addEventListener("click", retry);
document.querySelector("#error").innerHTML = "Weather data could not be loaded." + "<br>" +
  "Please check your internet connection and try again.";

var units = "metric"
var isMetric = true;

reloadSettings();

function reloadSettings() {
  if (config.has('units')) {
  units = config.get('units');
  if (units === "metric")
    isMetric = true;
  else
    isMetric = false;
  }
}

const {remote} = require('electron')
const {Menu, MenuItem} = remote

function setUnits(e) {
  isMetric = e.isMetric;

  if (isMetric)
    config.set('units', 'metric');
  else
    config.set('units', 'imperial');

  reloadSettings();
  retry();
}

const menu = new Menu()
unitsMetric = new MenuItem({isMetric: true, label: 'Metric', type: 'radio', checked: isMetric, click: setUnits})
unitsImperial = new MenuItem({isMetric: false, label: 'Imperial', type: 'radio', checked: !isMetric, click: setUnits})
menu.append(new MenuItem({label: 'Settings', enabled: false}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'Units', submenu: [unitsMetric, unitsImperial]}))
menu.append(new MenuItem({label: 'Refresh', role: 'reload'}))

document.querySelector("#hamburgerMenu").addEventListener('click', (e) => {
  e.preventDefault()
  // e.toElement.classList.toggle("open");
  menu.popup(remote.getCurrentWindow(), true);
}, false)

function retry() {
  document.querySelector("#retryButton").style.display = "none";
  document.querySelector("#error").style.display = "none";
  document.querySelector("#location").innerHTML = "Loading...";
  navigator.geolocation.getCurrentPosition(loadWeatherData, error);
  document.querySelector("#load").setAttribute("class", "");
}

function loadWeatherData(position) {
  coords.lat = position.coords.latitude;
  coords.lon = position.coords.longitude;
  let weatherReqUrl = tempUrl + "?" + "lat=" + coords.lat + "&lon=" + coords.lon + "&" + "APPID=" + weatherApiKey + "&units=" + units;
  fetch(weatherReqUrl)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(weatherData) {
      if (!weather3D) {
        weather3D = new Weather3D(weatherData, isMetric);
        weather3D.init();
      }
      else {
        weather3D.weather = weatherData;
        weather3D.metricUnits = isMetric;
        weather3D.updateWeather();
      }
    }, error)
}

function error() {
  document.querySelector("#location").innerHTML = "Oh No!";
  document.querySelector("#error").style.display = "block";
  document.querySelector("#retryButton").style.display = "inline-block";
  document.querySelector("#load").setAttribute("class", "loaded");
}

window.addEventListener("load", retry);
window.setInterval(retry, 1800000);

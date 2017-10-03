// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const forecastUrl = "http://api.openweathermap.org/data/2.5/forecast"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
const mapsApiKey = "AIzaSyA9u9lyhhSKoxU0OMVhonpe40U_FE4eg60"
const Config = require('electron-config');
const config = new Config();
const {
  remote
} = require('electron');
const {
  Menu,
  MenuItem
} = remote;

var weatherData = {};
var forecastData = {};
var weather3D = null;
var coords = {
  lat: "",
  lon: ""
};

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

function setUnits(e) {
  isMetric = e.isMetric;

  if (isMetric)
    config.set('units', 'metric');
  else
    config.set('units', 'imperial');

  if (weather3D) {
    weather3D.metricUnits = isMetric;
    console.log(weatherData);
    updateUI(weatherData);
  }
  reloadSettings();
}

// config.delete("location");
const menu = new Menu()
unitsMetric = new MenuItem({
  isMetric: true,
  label: 'Metric',
  type: 'radio',
  checked: isMetric,
  click: setUnits
})
unitsImperial = new MenuItem({
  isMetric: false,
  label: 'Imperial',
  type: 'radio',
  checked: !isMetric,
  click: setUnits
})
menu.append(new MenuItem({
  label: 'Settings',
  enabled: false
}))
menu.append(new MenuItem({
  type: 'separator'
}))
menu.append(new MenuItem({
  label: 'Change Location',
  click: changeLocation
}))
menu.append(new MenuItem({
  label: 'Units',
  submenu: [unitsMetric, unitsImperial]
}))
menu.append(new MenuItem({
  label: 'Refresh',
  role: 'reload'
}))

document.querySelector("#hamburgerMenu").addEventListener('click', (e) => {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow(), {
    async: true
  });
}, false)

function retry(showLoadingScreen) {
  document.querySelector(".weatherData").style.display = "block";
  document.querySelector(".locationArea").style.display = "none";
  document.querySelector("#retryButton").style.display = "none";
  document.querySelector("#error").style.display = "none";
  loadWeatherData();
  if (showLoadingScreen)
    document.querySelector("#load").setAttribute("class", "");
}

function activatePlacesSearch() {
  var input = document.querySelector("#locationForm");
  var autoComplete = new google.maps.places.Autocomplete(input);
}

function changeLocation() {
  config.delete("location");
  enterLocationIfNeeded();
}

function enterLocationIfNeeded() {
  if (config.has('location'))
    retry(true);
  else {
    if (!weather3D) {
      weather3D = new Weather3D(defaultWeatherData, isMetric);
      weather3D.init();
    }
    document.querySelector(".weatherData").style.display = "none";
    document.querySelector(".locationArea").style.display = "block";
    document.querySelector("#load").setAttribute("class", "loaded");
    document.querySelector("#locationAcceptButton").onclick = function() { fetchLocation(); };
    document.querySelector('#locationForm').onkeypress = function(e) {
      var event = e || window.event;
      var charCode = event.which || event.keyCode;
      if ( charCode == '13' ) {
        fetchLocation();
      }
    }
    document.querySelector("#locationForm").focus();
    activatePlacesSearch();
  }
}

function loadWeatherData() {
  pos = config.get("location");
  let currentWeatherUrl = tempUrl + "?" + "lat=" + pos.lat + "&lon=" + pos.lng + "&" + "APPID=" + weatherApiKey + "&units=metric";
  fetch(currentWeatherUrl)
    .then((resp) => resp.json()) // Transform the data into json
    .then(updateWeatherScene, error)

  let forecastDataUrl = forecastUrl + "?" + "lat=" + pos.lat + "&lon=" + pos.lng + "&" + "APPID=" + weatherApiKey + "&units=metric";
  fetch(forecastDataUrl)
    .then((resp) => resp.json()) // Transform the data into json
    .then(testForecastData, error)
}

function updateWeatherScene(weatherResp) {
  weatherData = weatherResp;
  config.set("weatherData", weatherResp);
  weatherData.sys.country = WeatherManager.getCountryName(weatherData.sys.country);
  if (!weather3D) {
    weather3D = new Weather3D(weatherResp, isMetric);
    weather3D.init();
  }
  else {
    weather3D.weather = weatherResp;
    weather3D.metricUnits = isMetric;
    weather3D.updateWeather();
  }
}

function testForecastData(data) {
  forecastData = data;
  manager = new WeatherManager(forecastData);
  manager.setup();
  console.log(manager.dayWiseUnits());
}

function retreiveCoords(data) {
  if (data.status != "OK") {
    error();
    return;
  }
  coords = data.results[0].geometry.location;
  console.log(data);
  config.set("location", coords);
  retry(false);
}

function fetchLocation() {
  geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
  address = document.querySelector("#locationForm").value;
  address = address.replace(" ", "+");
  geocodeUrl = geocodeBaseUrl + address + "&key=" + mapsApiKey;
  fetch(geocodeUrl)
  .then((resp) => resp.json()) // Transform the data into json
  .then(retreiveCoords)
}

function error() {
  var dat = document.querySelector(".detailedData");
  if (dat) {
    dat.innerHTML = "";
  }
  document.querySelector(".locationArea").style.display = "none";
  document.querySelector("#country").style.display = "none";
  document.querySelector("#temp").innerHTML = "";
  document.querySelector("#location").innerHTML = "Oh No!";
  document.querySelector("#error").style.display = "block";
  document.querySelector("#retryButton").style.display = "inline-block";
  document.querySelector("#load").setAttribute("class", "loaded");
  document.querySelector("#world").innerHTML = "";
  document.querySelector(".weatherData").style.color = "fff";
  weather3D = null;
}

document.querySelector("#retryButton").addEventListener("click", retry);
window.addEventListener("load", enterLocationIfNeeded);
window.setInterval(enterLocationIfNeeded, 1800000);

defaultWeatherData = {
  "coord": {
    "lon": 6.63,
    "lat": 46.52
  },
  "weather": [
    {
      "id": 801,
      "main": "Clouds",
      "description": "few clouds",
      "icon": "02d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 20.01,
    "pressure": 1022,
    "humidity": 53,
    "temp_min": 16,
    "temp_max": 22
  },
  "visibility": 10000,
  "wind": {
    "speed": 2.1,
    "deg": 90
  },
  "clouds": {
    "all": 20
  },
  "dt": Date.now(),
  "sys": {
    "type": 1,
    "id": 6002,
    "message": 0.0065,
    "country": "CH",
    "sunrise": Date.now() / 1000 - 21600,
    "sunset": Date.now() / 1000 + 21600
  },
  "id": 6458866,
  "name": "District de Lausanne",
  "cod": 200
};

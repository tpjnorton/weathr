// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
weatherData = {};
var weather3D = null;
var coords = { lat: "", lon: "" };
document.querySelector("#retryButton").addEventListener("click", retry);
document.querySelector("#error").innerHTML = "Weather data could not be loaded." + "<br>" +
  "Please check your internet connection and try again.";

function retry() {
  document.querySelector("#retryButton").style.display = "none";
  document.querySelector("#error").style.display = "none";
  document.querySelector("#location").innerHTML = "Loading...";
  navigator.geolocation.getCurrentPosition(loadWeatherData, error);
}

function loadWeatherData(position) {
  coords.lat = position.coords.latitude;
  coords.lon = position.coords.longitude;
  let weatherReqUrl = tempUrl + "?" + "lat=" + coords.lat + "&lon=" + coords.lon + "&" + "APPID=" + weatherApiKey + "&units=metric";
  fetch(weatherReqUrl)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(weatherData) {
      if (!weather3D) {
        weather3D = new Weather3D(weatherData);
        weather3D.init();
      }
      else {
        weather3D.weather = weatherData;
        weather3D.updateWeather();
      }
    }, error)
}

function error() {
  document.querySelector("#location").innerHTML = "Oh No!";
  document.querySelector("#error").style.display = "block";
  document.querySelector("#retryButton").style.display = "inline-block";
}

window.addEventListener("load", retry);
window.setInterval(retry, 1800000);

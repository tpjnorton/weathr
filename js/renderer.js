// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const isOnline = require('is-online');
var loc,weather;
const locUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key=";
const cityUrl = "https://maps.googleapis.com/maps/api/geocode/json"
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
const geolocationApiKey = "AIzaSyCqSSjwgqpY4EMwtLgvlFF4tf0KH5yMx2M"
// const geocodingApiKey = "AIzaSyAkoWK8DQYxvG98WIEqKs06yl4b2Cqf-SU"

function getCityFromGeocodeResponse(resp) {
  return "hello"
}

function getLocalityFromGeocodeResponse() {
  return "bruh"
}

function getCountryFromGeocodeResponse() {
  return "hej"
}

isOnline(1000).then(online => {
    var locDOM = document.getElementById("location");
    var tempDOM = document.getElementById("temp");
    var coords = {lat: "", lon: ""};
    if (online) {
        navigator.geolocation.getCurrentPosition(function(position) {
            coords.lat = position.coords.latitude;
            coords.lon = position.coords.longitude;
            let weatherReqUrl = tempUrl + "?" + "lat=" + coords.lat + "&lon=" + coords.lon + "&" + "APPID=" + weatherApiKey + "&units=metric";
            fetch(weatherReqUrl)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                weather = data;
                tempDOM.innerHTML = parseInt(weather.main.temp) + "&#176;";
                locDOM.innerHTML = weather.name + ", " + weather.sys.country;
            })
        });
    }
    else {
        locDOM.innerHTML = "No Internet Connection :("
    }
});


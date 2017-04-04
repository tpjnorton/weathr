// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const isOnline = require('is-online');
const macaddress = require('macaddress')
var loc,weather;
const locUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key=";
const cityUrl = "https://maps.googleapis.com/maps/api/geocode/json"
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
const geolocationApiKey = "AIzaSyCqSSjwgqpY4EMwtLgvlFF4tf0KH5yMx2M"
const geocodingApiKey = "AIzaSyAkoWK8DQYxvG98WIEqKs06yl4b2Cqf-SU"

var locFetchBody = {
    method: 'POST',
    body: {
        "considerIp": "false",
        "wifiAccessPoints": [
            {
                "macAddress": macaddress.one()
            }
        ]
    }
}

function getCityFromGeocodeResponse(resp) {
  return "hello"
}

function getLocalityFromGeocodeResponse() {
  return "bruh"
}

function getCountryFromGeocodeResponse() {
  return "hej"
}

isOnline().then(online => {
    var locDOM = document.getElementById("location");
    var tempDOM = document.getElementById("temp");
    if (online) {
        fetch(locUrl + geolocationApiKey, locFetchBody)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            loc = data;
            let weatherReqUrl = tempUrl + "?" + "lat=" + loc.location.lat + "&lon=" + loc.location.lng + "&" + "APPID=" + weatherApiKey + "&units=metric";
            fetch(weatherReqUrl)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                weather = data;
                tempDOM.innerHTML = parseInt(weather.main.temp) + "&#176;";
            })
            let cityReqUrl = cityUrl + "?latlng=" + loc.location.lat + "," + loc.location.lng + "&key=" + geocodingApiKey;
            fetch(cityReqUrl)
            .then((resp) => resp.json())
            .then(function(data) {
                console.log(data);
                mapData = data;
                locDOM.innerHTML = getCityFromGeocodeResponse(data) + ", " + getLocalityFromGeocodeResponse(data) + ", " + getCountryFromGeocodeResponse(data)
            })
        })
    }
    else {
        locDOM.innerHTML = "No Internet Connection :("
    }
});


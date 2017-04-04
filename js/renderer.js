// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const isOnline = require('is-online');
var loc,weather;
const locUrl = "http://ip-api.com/json";
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";
const geolocationApiKey = "AIzaSyCqSSjwgqpY4EMwtLgvlFF4tf0KH5yMx2M"
const geocodingApiKey = "AIzaSyAkoWK8DQYxvG98WIEqKs06yl4b2Cqf-SU"

isOnline().then(online => {
    var locDOM = document.getElementById("location");
    var tempDOM = document.getElementById("temp");
    if (online) {
        fetch(locUrl)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            loc = data;
            let weatherReqUrl = tempUrl + "?" + "q=" + loc.city + "," + loc.countryCode + "&" + "APPID=" + weatherApiKey + "&units=metric";
            fetch(weatherReqUrl)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                weather = data;
                locDOM.innerHTML = loc.city + ", " + loc.country;
                tempDOM.innerHTML = parseInt(weather.main.temp ) + "&#176;";
            })
         })
    }

    else {
        locDOM.innerHTML = "No Internet Connection :("
    }
});


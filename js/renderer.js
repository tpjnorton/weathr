// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const isOnline = require('is-online');
const tempUrl = "http://api.openweathermap.org/data/2.5/weather"
const weatherApiKey = "d878ff95dda20eadb8502ada8fd89ecd";

var locDOM = document.getElementById("location");
var tempDOM = document.getElementById("temp");
var coords = {lat: "", lon: ""};
navigator.geolocation.getCurrentPosition(
    function(position) {
    coords.lat = position.coords.latitude;
    coords.lon = position.coords.longitude;
    let weatherReqUrl = tempUrl + "?" + "lat=" + coords.lat + "&lon=" + coords.lon + "&" + "APPID=" + weatherApiKey + "&units=metric";
    fetch(weatherReqUrl)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
        weather = data;
        console.log(weather);
        tempDOM.innerHTML = parseInt(weather.main.temp) + "&#176;";
        locDOM.innerHTML = weather.name + ", " + weather.sys.country;
    })
},  function(){
    locDOM.innerHTML = "No Internet Connection :("
});



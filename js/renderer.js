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
        var dataContainer = document.createElement("div");
        dataContainer.setAttribute("class", "detailedData");        
        var hr = document.createElement("hr");
        locDOM.parentElement.appendChild(dataContainer);
        dataContainer.appendChild(hr);

        var descriptors = document.createElement("div");
        descriptors.setAttribute("class", "descriptors");

        var descs = [];

        for (var i = 0; i < 6; i++) {
          descs[i] = document.createElement("p");
        }

        descs[0].innerHTML = "Weather";
        descs[1].innerHTML = "Cloud&nbsp;Coverage";
        descs[2].innerHTML = "Wind";
        descs[3].innerHTML = "Humidity";
        descs[4].innerHTML = "Sunrise";
        descs[5].innerHTML = "Sunset";

        for (var i = 0; i < 6; i++) {
          descriptors.appendChild(descs[i]);
        }
        
        var values = document.createElement("div");
        values.setAttribute("class", "values");

        var vals = [];

        for (var i = 0; i < 6; i++) {
          vals[i] = document.createElement("p");
        }

        var sunriseTime = new Date(weather.sys.sunrise * 1000);
        var sunsetTime = new Date(weather.sys.sunset * 1000);

        vals[0].innerHTML = weather.weather[0].main;
        vals[1].innerHTML = weather.clouds.all+"%";
        vals[2].innerHTML = weather.wind.speed+"km/h";
        vals[3].innerHTML = weather.main.humidity+"%";
        vals[4].innerHTML = formattedTime(sunriseTime);
        vals[5].innerHTML = formattedTime(sunsetTime);

        if (weather.wind.angle) {
            vals[2].innerHTML += ",&nbsp;" + weather.wind.angle + "&#176;"
        }

        for (var i = 0; i < 6; i++) {
          values.appendChild(vals[i]);
        }

        dataContainer.appendChild(descriptors);
        dataContainer.appendChild(values);


    })
},  function(){
    var gameHolder = document.getElementById("gameHolder");
    locDOM.innerHTML = "No Internet Connection :("
});


function formattedTime(time) {
  var hours = time.getHours();
  var minutes = time.getMinutes();
  if (hours < 10)
    hours = "0" + hours;
  if (minutes < 10)
    minutes = "0" + minutes;

  return hours + ":" + minutes;
}


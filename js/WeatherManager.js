let suncalc = require('suncalc')

WeatherDataUnit = function(rawUnit) {
  // "web developer" function overloading
  if (rawUnit !== undefined) {
    this.time = rawUnit.dt;
    this.description = rawUnit.weather[0].main;
    this.clouds = rawUnit.clouds.all;
    this.windSpeed = rawUnit.wind.speed;
    this.humidity = rawUnit.main.humidity;
    this.temp = rawUnit.main.temp;
    var d = new Date(this.time * 1000);
    this.realDay = d.getDay();

    this.coords = rawUnit.coords;
  }
}

WeatherDataUnit.combinedFromTwo = function(first, second) {
  Utils.assert(first.day == second.day, "Tried to combine data from two different days");

  // create empty object
  var result = new WeatherDataUnit();
  
  // fill with combined data first
  result.time = (first.time + second.time) / 2;
  result.clouds = (first.clouds + second.clouds) / 2;
  result.windSpeed = (first.windSpeed + second.windSpeed) / 2;
  result.humidity = (first.humidity + second.humidity) / 2;
  result.temp = (first.temp + second.temp) / 2;

  // variables that don't need combining
  result.description = first.description;
  result.day = first.day;
  result.realDay = first.realDay;
  result.coords = first.coords;

  return result;
}

WeatherManager = function(completeData) {
  this.fullList = completeData.list;
  this.city = completeData.city.name;
  this.country = WeatherManager.getCountryName(completeData.city.country);
  this.numberOfEntries = completeData.cnt;
  this.rawUnits = [];
  this.dayWiseRawUnits = [];
  this.compressedDayWiseData = [];
  for (var i = 0; i < 5; ++i) {
    this.dayWiseRawUnits.push([]);
    this.compressedDayWiseData.push([]);
  }

  for (var i = 0; i < this.fullList.length; ++i) {
    this.fullList[i].coords = completeData.coords;
  }
}

WeatherManager.prototype.setup = function(currentWeather) {
  this.buildRawUnits();
  this.buildDayWiseData();
  this.consolibdateDayWiseData();
  this.calculateSunTimes();
  this.addCurrentWeather(currentWeather);
}

WeatherManager.prototype.buildRawUnits = function() {
  allUnits = [];
  days = [];
  var now = Date.now();
  for (var i = 0; i < this.numberOfEntries; ++i) {
    var currentUnit = new WeatherDataUnit(this.fullList[i]);
    // trim off any info longer than today and 4 more days in the future
    allUnits.push(currentUnit);
    days.push(currentUnit.realDay);
  }
  days = Utils.reOrderAndCenterNumbers(days, days[0], 7);

  for (var i = 0; i < this.numberOfEntries; ++i) {
    if (days[i] >= 5)
      break;

    allUnits[i].day = days[i];
    if (allUnits[i].time > now / 1000)
      this.rawUnits.push(allUnits[i]);
  }
}

WeatherManager.prototype.addCurrentWeather = function(currentWeather) {
  firstDay = this.compressedDayWiseData[0];
  currentWeatherAsUnit = new WeatherDataUnit(currentWeather);
  currentWeatherAsUnit.sunrise = currentWeather.sys.sunrise;
  currentWeatherAsUnit.sunset = currentWeather.sys.sunset;
  currentWeatherAsUnit.name = currentWeather.name;
  currentWeatherAsUnit.country = currentWeather.sys.country;
  currentWeatherAsUnit.coords = {};
  currentWeatherAsUnit.coords.lat = currentWeather.coord.lat;
  currentWeatherAsUnit.coords.lng = currentWeather.coord.lon;
  currentWeatherAsUnit.day = 0;
  this.compressedDayWiseData[0] = Utils.prepend(currentWeatherAsUnit, firstDay);
}

WeatherManager.prototype.buildDayWiseData = function() {
  for (var i = 0; i < this.rawUnits.length; ++i) {
    this.dayWiseRawUnits[this.rawUnits[i].day].push(this.rawUnits[i]);
  }
}

WeatherManager.prototype.consolibdateDayWiseData = function() {
  for (var i = 0; i < this.dayWiseRawUnits.length; ++i) {
    var currentDay = this.dayWiseRawUnits[i];
    var singleDayEntryCount = currentDay.length;
    if (i != 0) {
      Utils.assert(singleDayEntryCount == 8, "Expected 8 entries for any day other than the first day");
      for (var j = 0; j < singleDayEntryCount; j += 2)
        this.compressedDayWiseData[i].push(WeatherDataUnit.combinedFromTwo(currentDay[j], currentDay[j + 1]));
    }
    else {
      if (singleDayEntryCount % 2 != 0) {
        this.compressedDayWiseData[i].push(currentDay[0]);
        for (var k = 1; k < singleDayEntryCount; k += 2)
          this.compressedDayWiseData[0].push(WeatherDataUnit.combinedFromTwo(currentDay[k], currentDay[k + 1]));
      }
      else {
        for (var l = 0; l < singleDayEntryCount; l += 2)
          this.compressedDayWiseData[0].push(WeatherDataUnit.combinedFromTwo(currentDay[l], currentDay[l + 1]));
      }
    }
  }
}

WeatherManager.prototype.dayWiseUnits = function() {
  return this.compressedDayWiseData;
}

WeatherManager.prototype.calculateSunTimes = function() {
  for (var i = 0; i < this.compressedDayWiseData.length; i++) {
    var length = this.compressedDayWiseData[i].length;
    var currentDay = this.compressedDayWiseData[i]
    for (var j = 0; j < currentDay.length; j++) {
      let times = suncalc.getTimes(new Date(currentDay[j].time * 1000), currentDay[j].coords.lat, currentDay[j].coords.lng);
      currentDay[j].sunrise = Math.round(times.sunrise.getTime() / 1000);
      currentDay[j].sunset = Math.round(times.sunset.getTime() / 1000);
    }
  }
}

WeatherManager.isoCountries={AF:"Afghanistan",AX:"Aland Islands",AL:"Albania",DZ:"Algeria",AS:"American Samoa",AD:"Andorra",AO:"Angola",AI:"Anguilla",AQ:"Antarctica",AG:"Antigua And Barbuda",AR:"Argentina",AM:"Armenia",AW:"Aruba",AU:"Australia",AT:"Austria",AZ:"Azerbaijan",BS:"Bahamas",BH:"Bahrain",BD:"Bangladesh",BB:"Barbados",BY:"Belarus",BE:"Belgium",BZ:"Belize",BJ:"Benin",BM:"Bermuda",BT:"Bhutan",BO:"Bolivia",BA:"Bosnia And Herzegovina",BW:"Botswana",BV:"Bouvet Island",BR:"Brazil",IO:"British Indian Ocean Territory",BN:"Brunei Darussalam",BG:"Bulgaria",BF:"Burkina Faso",BI:"Burundi",KH:"Cambodia",CM:"Cameroon",CA:"Canada",CV:"Cape Verde",KY:"Cayman Islands",CF:"Central African Republic",TD:"Chad",CL:"Chile",CN:"China",CX:"Christmas Island",CC:"Cocos (Keeling) Islands",CO:"Colombia",KM:"Comoros",CG:"Congo",CD:"Congo, Democratic Republic",CK:"Cook Islands",CR:"Costa Rica",CI:"Cote D'Ivoire",HR:"Croatia",CU:"Cuba",CY:"Cyprus",CZ:"Czech Republic",DK:"Denmark",DJ:"Djibouti",DM:"Dominica",DO:"Dominican Republic",EC:"Ecuador",EG:"Egypt",SV:"El Salvador",GQ:"Equatorial Guinea",ER:"Eritrea",EE:"Estonia",ET:"Ethiopia",FK:"Falkland Islands (Malvinas)",FO:"Faroe Islands",FJ:"Fiji",FI:"Finland",FR:"France",GF:"French Guiana",PF:"French Polynesia",TF:"French Southern Territories",GA:"Gabon",GM:"Gambia",GE:"Georgia",DE:"Germany",GH:"Ghana",GI:"Gibraltar",GR:"Greece",GL:"Greenland",GD:"Grenada",GP:"Guadeloupe",GU:"Guam",GT:"Guatemala",GG:"Guernsey",GN:"Guinea",GW:"Guinea-Bissau",GY:"Guyana",HT:"Haiti",HM:"Heard Island & Mcdonald Islands",VA:"Holy See (Vatican City State)",HN:"Honduras",HK:"Hong Kong",HU:"Hungary",IS:"Iceland",IN:"India",ID:"Indonesia",IR:"Iran, Islamic Republic Of",IQ:"Iraq",IE:"Ireland",IM:"Isle Of Man",IL:"Israel",IT:"Italy",JM:"Jamaica",JP:"Japan",JE:"Jersey",JO:"Jordan",KZ:"Kazakhstan",KE:"Kenya",KI:"Kiribati",KR:"Korea",KW:"Kuwait",KG:"Kyrgyzstan",LA:"Lao People's Democratic Republic",LV:"Latvia",LB:"Lebanon",LS:"Lesotho",LR:"Liberia",LY:"Libyan Arab Jamahiriya",LI:"Liechtenstein",LT:"Lithuania",LU:"Luxembourg",MO:"Macao",MK:"Macedonia",MG:"Madagascar",MW:"Malawi",MY:"Malaysia",MV:"Maldives",ML:"Mali",MT:"Malta",MH:"Marshall Islands",MQ:"Martinique",MR:"Mauritania",MU:"Mauritius",YT:"Mayotte",MX:"Mexico",FM:"Micronesia, Federated States Of",MD:"Moldova",MC:"Monaco",MN:"Mongolia",ME:"Montenegro",MS:"Montserrat",MA:"Morocco",MZ:"Mozambique",MM:"Myanmar",NA:"Namibia",NR:"Nauru",NP:"Nepal",NL:"Netherlands",AN:"Netherlands Antilles",NC:"New Caledonia",NZ:"New Zealand",NI:"Nicaragua",NE:"Niger",NG:"Nigeria",NU:"Niue",NF:"Norfolk Island",MP:"Northern Mariana Islands",NO:"Norway",OM:"Oman",PK:"Pakistan",PW:"Palau",PS:"Palestinian Territory, Occupied",PA:"Panama",PG:"Papua New Guinea",PY:"Paraguay",PE:"Peru",PH:"Philippines",PN:"Pitcairn",PL:"Poland",PT:"Portugal",PR:"Puerto Rico",QA:"Qatar",RE:"Reunion",RO:"Romania",RU:"Russian Federation",RW:"Rwanda",BL:"Saint Barthelemy",SH:"Saint Helena",KN:"Saint Kitts And Nevis",LC:"Saint Lucia",MF:"Saint Martin",PM:"Saint Pierre And Miquelon",VC:"Saint Vincent And Grenadines",WS:"Samoa",SM:"San Marino",ST:"Sao Tome And Principe",SA:"Saudi Arabia",SN:"Senegal",RS:"Serbia",SC:"Seychelles",SL:"Sierra Leone",SG:"Singapore",SK:"Slovakia",SI:"Slovenia",SB:"Solomon Islands",SO:"Somalia",ZA:"South Africa",GS:"South Georgia And Sandwich Isl.",ES:"Spain",LK:"Sri Lanka",SD:"Sudan",SR:"Suriname",SJ:"Svalbard And Jan Mayen",SZ:"Swaziland",SE:"Sweden",CH:"Switzerland",SY:"Syrian Arab Republic",TW:"Taiwan",TJ:"Tajikistan",TZ:"Tanzania",TH:"Thailand",TL:"Timor-Leste",TG:"Togo",TK:"Tokelau",TO:"Tonga",TT:"Trinidad And Tobago",TN:"Tunisia",TR:"Turkey",TM:"Turkmenistan",TC:"Turks And Caicos Islands",TV:"Tuvalu",UG:"Uganda",UA:"Ukraine",AE:"United Arab Emirates",GB:"United Kingdom",US:"United States",UM:"United States Outlying Islands",UY:"Uruguay",UZ:"Uzbekistan",VU:"Vanuatu",VE:"Venezuela",VN:"Viet Nam",VG:"Virgin Islands, British",VI:"Virgin Islands, U.S.",WF:"Wallis And Futuna",EH:"Western Sahara",YE:"Yemen",ZM:"Zambia",ZW:"Zimbabwe"};

WeatherManager.getCountryName = function(countryCode) {
  if (this.isoCountries.hasOwnProperty(countryCode))
    return this.isoCountries[countryCode];
  else
    return countryCode;
}

//COLORS

var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  brownDark: 0x23190f,
  pink: 0xF5986E,
  yellow: 0xf4ce93,
  blue: 0x68c3c0,
  green: 0x67b255,
  greenDesaturated: 0x66915b,
  grey: 0xaaaaaa,
  greyDark: 0x777757,
  dawnDusk: 0x351304,
  morningEvening: 0xd1a287,
  nightTime: 0x010321
};

EffectController = function(){
  this.turbidity = 10;
  this.rayleigh = 2;
  this.mieCoefficient = 0.005;
  this.mieDirectionalG = 0.261;
  this.luminance = 1;
  this.timeOfDay = 0.26;
  this.sun = false;
};

var that;
var deltaTime = 0.01;

var params = {
  speed: 0.00002,
  defaultCamHeight: 100,

  earthRadius: 800,
  earthLength: 800,
  earthRotationSpeed: 0.006,

  displacementMinAmp: 4,
  displacementMaxAmp: 10,
  displacementMinSpeed: 0.001,
  displacementMaxSpeed: 0.003,

  cloudDisplacementMinAmp: 1,
  cloudDisplacementMaxAmp: 4,
  cloudDisplacementMinSpeed: 0.001,
  cloudDisplacementMaxSpeed: 0.003,
};

Weather3D = function(weather, metricUnits) {
  this.lightCloudMeshes = [];
  this.params = params;
  this.newTime = new Date().getTime();
  this.oldTime = new Date().getTime();
  this.effectController = new EffectController();
  this.weather = weather;
  that = this;
  this.stormEventsPossible = false;
  this.stormEvents = [];
  this.metricUnits = metricUnits;
}

Weather3D.prototype.handleWindowResize = function() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  that.renderer.setSize(WIDTH, HEIGHT);
  that.camera.aspect = WIDTH / HEIGHT;
  that.camera.updateProjectionMatrix();
}

Weather3D.prototype.createSceneObjects = function() {
  this.createSceneBasics();
  this.createSun();
  this.createMoon();
  this.createLights();
  this.createStars();
  this.createHeavyClouds();
  this.createLightClouds(80);
  this.createRain(this.weather);
  this.createSnow(this.weather);
  this.createEarth();
  this.createStormEvents();
  createUI(this.weather);
  this.createSky();

  this.earth.moveSurface(100000000);

}

Weather3D.prototype.createSceneBasics = function() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  this.scene = new THREE.Scene();
  this.aspectRatio = WIDTH / HEIGHT;
  this.fieldOfView = 50;
  this.nearPlane = .1;
  this.farPlane = 10000;
  this.camera = new THREE.PerspectiveCamera(
    this.fieldOfView,
    this.aspectRatio,
    this.nearPlane,
    this.farPlane
  );

  this.scene.fog = new THREE.Fog(0xdddddd, 100, 2000);
  this.camera.position.x = 0;
  this.camera.position.z = 200;
  this.camera.position.y = params.defaultCamHeight * 1.3;

  this.renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  this.renderer.setSize(WIDTH, HEIGHT);
  this.renderer.toneMapping = THREE.Uncharted2ToneMapping;

  this.container = document.getElementById('world');
  this.container.appendChild(this.renderer.domElement);

  window.addEventListener('resize', this.handleWindowResize, false);
}

Weather3D.prototype.createLights = function() {

  this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8)

  this.ambientLight = new THREE.AmbientLight(0x1f1b4e, .1);

  this.sunLight = new THREE.DirectionalLight(0xffffff, .9);
  this.sunLight.position.set(150, 350, 350);
  this.sunLight.castShadow = false;

  this.moonLight = new THREE.DirectionalLight(0xaaaaff, .6);
  this.moonLight.position.set(0, 0, 350);
  this.moonLight.castShadow = false;

  // var ch = new THREE.CameraHelper(this.camera);
  // this.scene.add(ch);
  this.scene.add(this.hemisphereLight);
  this.scene.add(this.sunLight);
  this.scene.add(this.ambientLight);
  this.scene.add(this.moonLight);
}

Weather3D.prototype.createStars = function() {
  this.stars = new Stars();
  this.scene.add(this.stars.mesh);
}

Weather3D.prototype.createRain = function() {
  this.rain = new Rain(this.weather);
  this.scene.add(this.rain.rainPointCloud);
}

Weather3D.prototype.createSnow = function() {
  this.snow = new Snow(this.weather);
  this.scene.add(this.snow.snowPointCloud);
}

Weather3D.prototype.createSun = function() {
  this.sun = new Sun();
  this.scene.add(this.sun.mesh)
}

Weather3D.prototype.createMoon = function() {
  this.moon = new Moon();
  this.scene.add(this.moon.mesh);
}

Weather3D.prototype.createEarth = function() {
  this.earth = new Earth();
  this.earth.mesh.position.y = -params.earthRadius;
  this.scene.add(this.earth.mesh);
}

Weather3D.prototype.createHeavyClouds = function() {
  this.heavyClouds = new HeavyClouds();
  this.heavyClouds.mesh.position.y = this.params.defaultCamHeight * 3.4;
  this.heavyClouds.mesh.position.z = this.camera.position.z;
  this.scene.add(this.heavyClouds.mesh);
}

Weather3D.prototype.createLightClouds = function(cloudCoverage) {
  let cloudNum = cloudCoverage / 100 * 70;
  this.lightClouds = new LightClouds(cloudNum, this.lightCloudMeshes);
  for (var i = 0; i < this.lightClouds.cloudNum; i++) {
    this.scene.add(this.lightClouds.clouds[i].mesh);
  }
}

Weather3D.prototype.updateLightColors = function() {
  var newColor;
  var dayTime = this.effectController.timeOfDay;
  var starOpacity;
  if (dayTime < 0.74 && dayTime >= 0.26) {
    this.sunLight.color = new THREE.Color(0xffffff);
    this.ambientLight.color = new THREE.Color(0x9fabce);
    this.hemisphereLight.color = new THREE.Color(0xaaaaaa);
    this.stars.updateOpacity(0);
    this.setTextColor(false, this.weather.description == "Rain");
    return;
  }
  else if (dayTime < 0.28 && dayTime > 0.25) {
    newColor = new THREE.Color(Colors.dawnDusk);
    starOpacity = 0.2;
  }
  else if (dayTime < 0.31 && dayTime >= 0.28) {
    newColor = new THREE.Color(Colors.morningEvening);
    starOpacity = 0;
  }
  else if (dayTime < 0.72 && dayTime >= 0.68) {
    newColor = new THREE.Color(Colors.morningEvening);
    starOpacity = 0;
  }
  else if (dayTime < 0.75 && dayTime >= 0.72) {
    newColor = new THREE.Color(Colors.dawnDusk);
    starOpacity = 0.2;
  }
  else {
    newColor = new THREE.Color(Colors.nightTime);
    starOpacity = 1;
  }

  this.sunLight.color = newColor;
  this.ambientLight.color = newColor;
  this.hemisphereLight.color = newColor;
  this.stars.updateOpacity(starOpacity);
  this.setTextColor(true, false);
}

Weather3D.prototype.updateTimeOfDay = function() {
  var sunrise = that.weather.sunrise;
  var sunset = that.weather.sunset;
  var now = Date.now() / 1000;
  if (that.weather.time > now)
    now = that.weather.time;
  var originalTime = that.effectController.timeOfDay;
  var targetTime;
  if (now >= sunrise && now <= sunset) {
    targetTime = 0.25 + (now - sunrise) / (2 * (sunset - sunrise));
  }
  else if (now > sunset) {
    targetTime = 0.75 + (now - sunset) / (2 * ((sunrise + 86400) - sunset));
  }
  else if (now < sunrise) {
    targetTime = 0.5 * (now - (sunset - 86400)) / (2 * (sunrise - (sunset - 86400)));
  }
  TweenMax.to(that.effectController, 2, {
    timeOfDay: targetTime,
    onUpdate: that.updateSky,
    ease: Quad.easeInOut,
  })
}

Weather3D.prototype.createSky = function() {
  // Add Sky Mesh
  this.sky = new THREE.Sky();
  this.scene.add(this.sky.mesh);
  // Add Sun Helper
  this.sphereHelper = new THREE.Mesh(
    new THREE.SphereBufferGeometry(160, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff
    })
  );
  // this.scene.add(this.sphereHelper);

  // var gui = new dat.GUI();
  // gui.add(this.effectController, "turbidity", 1.0, 20.0, 0.1).onChange(this.updateSky);
  // gui.add(this.effectController, "rayleigh", 0.0, 4, 0.001).onChange(this.updateSky);
  // gui.add(this.effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(this.updateSky);
  // gui.add(this.effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(this.updateSky);
  // gui.add(this.effectController, "luminance", 0.0, 2).onChange(this.updateSky);
  // gui.add(this.effectController, "timeOfDay", 0, 1, 0.0001).onChange(this.updateSky);
  // gui.add(this.effectController, "sun").onChange(this.updateSky);

  this.updateSky();
}

Weather3D.prototype.createStormEvents = function() {
  for (var i = 0; i < 2; i++) {
    this.stormEvents.push(new StormEvent(this.scene));
  }
}

Weather3D.prototype.updateSky = function() {
  var uniforms = that.sky.uniforms;
  uniforms.turbidity.value = that.effectController.turbidity;
  uniforms.rayleigh.value = that.effectController.rayleigh;
  uniforms.luminance.value = that.effectController.luminance;
  uniforms.mieCoefficient.value = that.effectController.mieCoefficient;
  uniforms.mieDirectionalG.value = that.effectController.mieDirectionalG;

  that.sphereHelper.position.x = Math.sin((that.effectController.timeOfDay * 2 * Math.PI) - (Math.PI)) * 250;
  that.sphereHelper.position.y = Math.cos((that.effectController.timeOfDay * 2 * Math.PI) - (Math.PI)) * 500;
  that.sphereHelper.position.z = -600;
  that.sphereHelper.visible = that.effectController.sun;
  that.sky.uniforms.sunPosition.value.copy(that.sphereHelper.position);

  that.moon.mesh.position.x = Math.sin((that.effectController.timeOfDay * 2 * Math.PI)) * 250 * 1.2;
  that.moon.mesh.position.y = -50 + Math.cos((that.effectController.timeOfDay * 2 * Math.PI)) * 500 * 1.1 - 100;
  that.moon.mesh.position.z = -600;

  that.sun.mesh.position.x = that.sphereHelper.position.x * 1.2;
  that.sun.mesh.position.y = that.sphereHelper.position.y * 1.1 - 100 - (50 * 1.2);

  that.updateLightColors();
  that.sunLight.position.x = that.sphereHelper.position.x;
  that.sunLight.position.y = that.sphereHelper.position.y;
  that.moonLight.position.x = that.moon.mesh.position.x;
  that.moonLight.position.y = that.moon.mesh.position.y;

  that.renderOneFrame();
}

Weather3D.prototype.updateWeather = function() {
  // hide all objects, we can selectively show them afterwards
  console.log(this.weather);
  oldTime = this.effectController.timeOfDay;
  this.scene.fog.far = 2000;
  this.effectController = new EffectController();
  this.effectController.timeOfDay = oldTime;
  this.lightClouds.setCoverage(0);
  this.heavyClouds.mesh.visible = false;
  this.rain.rainPointCloud.visible = false;
  this.snow.snowPointCloud.visible = false;
  this.sun.mesh.visible = false;
  this.moon.mesh.visible = false;
  this.stars.mesh.visible = false;
  this.stormEventsPossible = false;
  // this.weather.clouds.all = 30;
  // this.weather.description = "Clear";
  // show objects based on weather type
  if (this.weather.clouds < 80 && (this.weather.description != "Rain" &&
      this.weather.description != "Snow" &&
      this.weather.description != "Thunderstorm")) {
    this.lightClouds.setCoverage(this.weather.clouds);
    this.stars.mesh.visible = true;
    this.sun.mesh.visible = true;
    this.moon.mesh.visible = true;
    this.earth.mesh.material.color = new THREE.Color(Colors.green);
  }
  else {
    this.heavyClouds.mesh.visible = true;
    this.ambientLight.color = new THREE.Color(0xce3ece);
    this.ambientLight.intensity = 0.3;
    this.effectController.rayleigh = 1;
    this.effectController.turbidity = 11;
    this.effectController.luminance = 0.6;
    this.effectController.mieDirectionalG = 0.087;
    this.sunLight.intensity = 0.8;
    this.earth.mesh.material.color = new THREE.Color(Colors.greenDesaturated);
    this.heavyClouds.mesh.material.color = new THREE.Color(Colors.grey);
    this.effectController.turbidity = 80;
    if (this.weather.description === "Rain" || this.weather.description === "Drizzle") {
      this.rain.rainPointCloud.visible = true;
      this.heavyClouds.mesh.material.color = new THREE.Color(Colors.greyDark);
    }

    else if (this.weather.description == "Snow") {
      this.snow.snowPointCloud.visible = true;
      this.earth.mesh.material.color = new THREE.Color(0x999999);
      this.effectController.rayleigh = 0.1;
    }

    else if (this.weather.description == "Thunderstorm") {
      this.stormEventsPossible = true;
      this.rain.rainPointCloud.visible = true;
      this.heavyClouds.mesh.material.color = new THREE.Color(Colors.greyDark);
      this.earth.mesh.material.color = new THREE.Color(0x396023);
    }
  }

  if (this.weather.description == "Fog") {
    this.scene.fog.far = 800;
  }

  updateUI(this.weather);
  this.updateTimeOfDay();
}

Weather3D.prototype.startRenderLoop = function() {
  that.newTime = new Date().getTime();
  deltaTime = that.newTime - that.oldTime;
  that.oldTime = that.newTime;

  if (that.rain.rainPointCloud.visible)
    that.rain.simulateRain();

  if (that.snow.snowPointCloud.visible)
    that.snow.simulateSnow();

  // if (that.lightClouds.enabled)
  that.lightClouds.driftClouds();

  if (that.heavyClouds.mesh.visible)
    that.heavyClouds.moveSurface();

  that.earth.moveSurface(1.0);

  if (that.stormEventsPossible) {
    var lightningProbability = 0.005;
    var roll = Math.random();
    if (roll <= lightningProbability) {
      console.log("flash!");
      for (var i = 0; i < that.stormEvents.length; i++) {
        if (!that.stormEvents[i].active) {
          that.stormEvents[i].active = true;
          break;
        }
      }
    }

    for (var i = 0; i < that.stormEvents.length; i++) {
      if (that.stormEvents[i].active)
        that.stormEvents[i].step();
    }
  }

  that.renderOneFrame();
  requestAnimationFrame(that.startRenderLoop);
}

Weather3D.prototype.renderOneFrame = function() {
  this.renderer.render(this.scene, this.camera);
}

Weather3D.prototype.setTextColor = function(night, rain) {
  var weatherData = document.querySelector(".weatherData");
  var header = document.querySelector(".header");
  if (that.weather.guiElement !== undefined) {
    var divider = that.weather.guiElement.children[0];
    var dots = document.querySelector(".slick-dots");
    var next = document.querySelector(".slick-next");
    var prev = document.querySelector(".slick-prev");
  }
  var hamburger = document.querySelector("#hamburgerMenu");
  var location = document.querySelector("#location");

  if (night) {
    weatherData.style.color = "#fff";
    header.style.color = "#fff";
    hamburger.style.color = "#fff";
    location.style.color = "#fff";
    if (that.weather.guiElement !== undefined) {
      divider.style.borderTopColor = "#fff";
      dots.style.color = "#fff";
      next.style.borderColor = "#fff";
      prev.style.borderColor = "#fff";
    }
  }

  else {
    weatherData.style.color = "#000";
    header.style.color = "#000";
    if (rain)
      location.style.color = "#eee";
    else
      location.style.color = "#000";
    hamburger.style.border = "#000";

    if (that.weather.guiElement !== undefined) {
      divider.style.borderTopColor = "#000";
      dots.style.color = "#000";
      next.style.borderColor = "#000";
      prev.style.borderColor = "#000";
    }
  }
}

Weather3D.prototype.preLoadCloudModels = function() {
  var that = this;
  var objLoader = new THREE.OBJLoader();
  objLoader.load("resources/obj/cloud1.obj", function(object) {
    that.lightCloudMeshes.push(object.children[0]);
    objLoader.load("resources/obj/cloud2.obj", function(object) {
      that.lightCloudMeshes.push(object.children[0]);
      objLoader.load("resources/obj/cloud3.obj", function(object) {
        that.lightCloudMeshes.push(object.children[0]);
        that.createWeatherScene();
      });
    });
  });
}

Weather3D.prototype.createWeatherScene = function() {
  this.createSceneObjects();

  window.setInterval(this.updateTimeOfDay, 20000);
  this.updateTimeOfDay();

  // controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
  // controls.addEventListener( 'change', this.renderOneFrame );
  // //controls.maxPolarAngle = Math.PI / 2;
  // controls.enableZoom = false;
  // controls.enablePan = false;

  this.updateWeather();
  this.startRenderLoop();
}

Weather3D.prototype.init = function() {
  this.preLoadCloudModels();
}

function createUI(weatherData) {

}

function updateUI(weatherUnit) {
  var locDOM = document.querySelector("#location");
  var counrty = document.querySelector("#country");
  locDOM.innerHTML = weatherUnit.city;
  country.innerHTML = weatherUnit.country;
  var tempDOM = document.querySelector("#temp");
  if (that.metricUnits)
    tempDOM.innerHTML = parseInt(weatherUnit.temp) + "&#176;";
  else
    tempDOM.innerHTML = parseInt(weatherUnit.temp * (9 / 5) + 32) + "&#176;";

  // var updateTime = document.querySelector(".updateTime");
  // updateTime.innerHTML = "Data Last Updated at: " + formattedTime(new Date(weatherUnit.dt * 1000));
  document.querySelector("#load").setAttribute("class", "loaded");
}

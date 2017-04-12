//COLORS
var THREE = require('three')
var weather;
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  brownDark: 0x23190f,
  pink: 0xF5986E,
  yellow: 0xf4ce93,
  blue: 0x68c3c0,
  green: 0x579149,
  grey: 0xeeeeee,
  greyDark: 0x878787,
  dawnDusk: 0x351304,
  morningEvening: 0xd1a287,
  nightTime: 0x010321
};

var lightCloudMeshes = [];

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0.01;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();

function resetGame() {
  game = {
    speed: 0.00002,
    defaultCamHeight: 100,

    earthRadius: 800,
    earthLength: 800,
    earthRotationSpeed: 0.006,

    wavesMinAmp: 4,
    wavesMaxAmp: 10,
    wavesMinSpeed: 0.001,
    wavesMaxSpeed: 0.003,

    cloudWavesMinAmp: 1,
    cloudWavesMaxAmp: 4,
    cloudWavesMinSpeed: 0.001,
    cloudWavesMaxSpeed: 0.003,
  };
}

//THREEJS RELATED VARIABLES

var scene,
  camera, fieldOfView, aspectRatio, nearPlane, farPlane,
  renderer,
  container,
  controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
  mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 1000000000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  scene.fog = new THREE.Fog(0xcacaca, 100, 2000);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = game.defaultCamHeight * 1.3;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

var ambientLight, hemisphereLight, sunLight, moonLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8)

  ambientLight = new THREE.AmbientLight(0x1f1b4e, .1);

  sunLight = new THREE.DirectionalLight(0xffffff, .9);
  sunLight.position.set(150, 350, 350);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -400;
  sunLight.shadow.camera.right = 400;
  sunLight.shadow.camera.top = 400;
  sunLight.shadow.camera.bottom = -400;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 1000;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;

  moonLight = new THREE.DirectionalLight(0xaaaaff, .6);
  moonLight.position.set(0, 0, 350);
  moonLight.castShadow = true;
  moonLight.shadow.camera.left = -400;
  moonLight.shadow.camera.right = 400;
  moonLight.shadow.camera.top = 400;
  moonLight.shadow.camera.bottom = -400;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 1000;
  moonLight.shadow.mapSize.width = 4096;
  moonLight.shadow.mapSize.height = 4096;


  var ch = new THREE.CameraHelper(moonLight.shadow.camera);

  // scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(sunLight);
  scene.add(ambientLight);
  scene.add(moonLight);
}

// 3D Models
var earth;
var sun;
var moon;
var stars;
var heavyClouds;
var lightClouds
var rain;
var snow;

function createStars() {
  stars = new Stars();
  scene.add(stars.stars);
}

function createRain() {
  rain = new Rain();
  scene.add(rain.rainPointCloud);
}

function createSnow() {
  snow = new Snow();
  scene.add(snow.rainPointCloud);
}

function createSun() {
  sun = new Sun();
  scene.add(sun.mesh)
}

function createMoon() {
  moon = new Moon();
  scene.add(moon.mesh);
}

function createEarth() {
  earth = new Earth();
  earth.mesh.position.y = -game.earthRadius;
  scene.add(earth.mesh);
}

function createHeavyClouds() {
  heavyClouds = new HeavyClouds();
  heavyClouds.mesh.position.y = game.defaultCamHeight * 3.4;
  heavyClouds.mesh.position.z = camera.position.z;
  scene.add(heavyClouds.mesh);
}

function createLightClouds(cloudNum) {
  lightClouds = new LightClouds(cloudNum);
  for (var i = 0; i < lightClouds.cloudNum; i++) {
    scene.add(lightClouds.clouds[i].mesh);
  }
}

function initSky(effectController) {
  // Add Sky Mesh
  sky = new THREE.Sky();
  scene.add(sky.mesh);
  // Add Sun Helper
  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(160, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff00ff })
  );
  sunSphere.visible = true;
  scene.add(sunSphere);

  window.setInterval(updateTimeOfDay, 20000, effectController);
  updateTimeOfDay(effectController);

  function updateLightColors() {
    if (effectController.timeOfDay <= 0.25 || effectController.timeOfDay >= 0.75) {
      sunLight.color = new THREE.Color(Colors.nightTime);
      ambientLight.color = new THREE.Color(Colors.nightTime);
      hemisphereLight.color = new THREE.Color(Colors.nightTime);
      if (stars)
        stars.stars.material.opacity = 0.8;
    }
    else if (effectController.timeOfDay < 0.28 && effectController.timeOfDay > 0.25) {
      sunLight.color = new THREE.Color(Colors.dawnDusk);
      ambientLight.color = new THREE.Color(Colors.dawnDusk);
      hemisphereLight.color = new THREE.Color(Colors.dawnDusk);
      if (stars)
        stars.stars.material.opacity = 0.2;
    }
    else if (effectController.timeOfDay < 0.31 && effectController.timeOfDay >= 0.28) {
      sunLight.color = new THREE.Color(Colors.morningEvening);
      ambientLight.color = new THREE.Color(Colors.morningEvening);
      hemisphereLight.color = new THREE.Color(Colors.morningEvening);
      if (stars)
        stars.stars.material.opacity = 0;
    }
    else if (effectController.timeOfDay < 0.72 && effectController.timeOfDay >= 0.68) {
      sunLight.color = new THREE.Color(Colors.morningEvening);
      ambientLight.color = new THREE.Color(Colors.morningEvening);
      hemisphereLight.color = new THREE.Color(Colors.morningEvening);
      if (stars)
        stars.stars.material.opacity = 0;
    }
    else if (effectController.timeOfDay < 0.75 && effectController.timeOfDay >= 0.72) {
      sunLight.color = new THREE.Color(Colors.dawnDusk);
      ambientLight.color = new THREE.Color(Colors.dawnDusk);
      hemisphereLight.color = new THREE.Color(Colors.dawnDusk);
      if (stars)
        stars.stars.material.opacity = 0.2;
    } 
    else {
      sunLight.color = new THREE.Color(0xffffff);
      ambientLight.color = new THREE.Color(0x9fabce);
      hemisphereLight.color = new THREE.Color(0xaaaaaa);
      if (stars)
        stars.stars.material.opacity = 0;
    }
  }

  function updateTimeOfDay(effectController) {
    var sunrise = weather.weatherData.sys.sunrise;
    var sunset = weather.weatherData.sys.sunset;
    var now = Date.now() / 1000;
    if (now >= sunrise && now <= sunset) {
      effectController.timeOfDay = 0.25 + (now - sunrise) / (2 * (sunset - sunrise));
    }
    else if (now > sunset) {
      effectController.timeOfDay = 0.75 + (now - sunset) / (2 * ((sunrise + 86400) - sunset));
    }
    else if (now < sunrise) {
      effectController.timeOfDay = (now - (sunset - 86400)) / (2 * (sunrise - (sunset - 86400)))
    }
    guiChanged();
    console.log("hej")
  }

  function guiChanged() {
    var uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    sunSphere.position.x = Math.sin((effectController.timeOfDay * 2 * Math.PI) - (Math.PI)) * 250;
    sunSphere.position.y = -50 + Math.cos((effectController.timeOfDay * 2 * Math.PI) - (Math.PI)) * 500;
    sunSphere.position.z = -600;

    if (moon) {
      moon.mesh.position.x = Math.sin((effectController.timeOfDay * 2 * Math.PI)) * 250 * 1.2;
      moon.mesh.position.y = -50 + Math.cos((effectController.timeOfDay * 2 * Math.PI)) * 500 * 1.1 - 100;
      moon.mesh.position.z = -600;
      moonLight.position.x = moon.mesh.position.x;
      moonLight.position.y = moon.mesh.position.y;
    }
    if (sun) {
      sun.mesh.position.x = sunSphere.position.x * 1.2;
      sun.mesh.position.y = sunSphere.position.y * 1.1 - 100;
    }
    updateLightColors();
    sunLight.position.x = sunSphere.position.x;
    sunLight.position.y = sunSphere.position.y;
    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy(sunSphere.position);
    renderOneFrame();
    setTextColor(effectController);
  }
  var gui = new dat.GUI();
  gui.add(effectController, "turbidity", 1.0, 20.0, 0.1).onChange(guiChanged);
  gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
  gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
  gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
  gui.add(effectController, "luminance", 0.0, 2).onChange(guiChanged);
  gui.add(effectController, "timeOfDay", 0, 1, 0.0001).onChange(guiChanged);
  gui.add(effectController, "sun").onChange(guiChanged);
  guiChanged();
}

function init(event) {

  // UI
  var date = new Date();
  var current_hour = date.getHours();
  resetGame();
  createScene();

  var effectController = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.261,
    luminance: 1,
    timeOfDay: 0.5,
    sun: false
  };
  var objLoader = new THREE.OBJLoader();
  objLoader.load("resources/obj/cloud1.obj", function(object) {
    lightCloudMeshes.push(object.children[0]);
    objLoader.load("resources/obj/cloud2.obj", function(object) {
      lightCloudMeshes.push(object.children[0]);
      objLoader.load("resources/obj/cloud3.obj", function(object) {
        lightCloudMeshes.push(object.children[0]);
        weather = new Weather();
        window.addEventListener('weatherLoaded', function() {
          createLights();
          createEarth();

          if (weather.weatherData.clouds.all < 80) {
            createMoon();
            createStars();
            createSun();
            createLightClouds(weather.weatherData.clouds.all / 100 * 80);
          } 
          else {
            createHeavyClouds(false);
            createRain();
            // createSnow();
            ambientLight.color = new THREE.Color(0xcecece);
            ambientLight.intensity = 1.0;
            effectController.rayleigh = 0;
            effectController.turbidity = 20;
            effectController.luminance = 0.4;
            effectController.mieDirectionalG = 0.087;
            sunLight.intensity = 0.5;

            earth.mesh.material.color = new THREE.Color(0x599043);
          }

          // controls = new THREE.OrbitControls( camera, renderer.domElement );
          // controls.addEventListener( 'change', renderOneFrame );
          // //controls.maxPolarAngle = Math.PI / 2;
          // controls.enableZoom = false;
          // controls.enablePan = false;

          initSky(effectController);

          setTextColor(effectController);

          startRenderLoop();
        });
      });
    });
  });
}


function startRenderLoop() {

  newTime = new Date().getTime();
  deltaTime = newTime - oldTime;
  oldTime = newTime;

  if (rain)
    rain.simulateRain();

  if (snow)
    snow.simulateSnow();

  if (lightClouds)
    lightClouds.driftClouds();

  if (heavyClouds)
    heavyClouds.moveSurface();

  earth.moveSurface();

  renderOneFrame();
  requestAnimationFrame(startRenderLoop);
}

function renderOneFrame() {
  renderer.render(scene, camera);
}

function setTextColor(effectController) {

  var weatherData = document.querySelector(".weatherData");
  var header = document.querySelector(".header");
  var divider = document.querySelector(".divider");

  if (effectController.timeOfDay <= 0.30 || effectController.timeOfDay >= 0.72) {
    weatherData.style.color = "#f1d7d0";
    header.style.color = "#f1d7d0";
    divider.style.borderTopColor = "#f1d7d0";
  } 
  else {
    weatherData.style.color = "#111710";
    header.style.color = "#515750";
    divider.style.borderTopColor = "#515750";
  }
}

window.addEventListener('load', init, false);

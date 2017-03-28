//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,
    green:0x47c149,
};

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0.01;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();

function resetGame() {
  game = {
    speed:0.00002,
    initSpeed:.00035,
    baseSpeed:.00035,
    targetBaseSpeed:.00035,
    incrementSpeedByTime:.0000025,
    incrementSpeedByLevel:.000005,
    distanceForSpeedUpdate:100,
    speedLastUpdate:0,

    distance:0,
    ratioSpeedDistance:50,
    energy:100,
    ratioSpeedEnergy:3,

    level:1,
    levelLastUpdate:0,
    distanceForLevelUpdate:1000,

    planeDefaultHeight:100,
    planeAmpHeight:80,
    planeAmpWidth:75,
    planeMoveSensivity:0.005,
    planeRotXSensivity:0.0008,
    planeRotZSensivity:0.0004,
    planeFallSpeed:.001,
    planeMinSpeed:1.2,
    planeMaxSpeed:1.6,
    planeSpeed:0,
    planeCollisionDisplacementX:0,
    planeCollisionSpeedX:0,

    planeCollisionDisplacementY:0,
    planeCollisionSpeedY:0,

    earthRadius:800,
    earthLength:800,
    earthRotationSpeed:0.006,
    wavesMinAmp : 5,
    wavesMaxAmp : 20,
    wavesMinSpeed : 0.001,
    wavesMaxSpeed : 0.003,

    cameraFarPos:500,
    cameraNearPos:150,
    cameraSensivity:0.002,

    coinDistanceTolerance:15,
    coinValue:3,
    coinsSpeed:.5,
    coinLastSpawn:0,
    distanceForCoinsSpawn:100,

    enemyDistanceTolerance:10,
    enemyValue:10,
    enemiesSpeed:.6,
    enemyLastSpawn:0,
    distanceForEnemiesSpawn:50,

    status : "playing",

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
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xcacaca, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = game.planeDefaultHeight;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event) {
  if (game.status == "waitingReplay") {
    resetGame();
    hideReplay();
  }
}


function handleTouchEnd(event) {
  if (game.status == "waitingReplay") {
    resetGame();
    hideReplay();
  }
}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}

Sky = function() {
  this.mesh = new THREE.Object3D();
  this.nClouds = 40;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++) {
    var c = new Cloud();
    var sun = new Sun();
    this.clouds.push(c);
    var a = stepAngle*i + (-5 + Math.random()*10);
    var h = game.earthRadius + 150 + Math.random();
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = 10;
    c.mesh.rotation.z = a + Math.PI/2;

    sun.mesh.position.y = Math.sin(a)*h;
    sun.mesh.position.x = Math.cos(a)*h;
    sun.mesh.position.z = 10;
    sun.mesh.rotation.z = a + Math.PI/2;


    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    sun.mesh.scale.set(s,s,s);
    this.mesh.add(sun.mesh);
    this.mesh.add(c.mesh);
  }
}

Sky.prototype.moveClouds = function() {
  for(var i=0; i<this.nClouds; i++) {
    var c = this.clouds[i];
    c.rotate();
  }
  this.mesh.rotation.z += game.speed*deltaTime/4;
}

earth = function() {
  var geom = new THREE.CylinderGeometry(game.earthRadius,game.earthRadius,game.earthLength,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++) {
    var v = geom.vertices[i];
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.green,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

earth.prototype.moveSurface = function () {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++) {
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang/10)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang/10)*vprops.amp;
    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function() {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.BoxGeometry(5,5,5);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,
    shininess: 1,
    transparent: true,
    opacity: 0.6 + Math.random()/3
  });

  //*
  var nBlocs = 15+Math.floor(Math.random()*5);
  for (var i=0; i<nBlocs; i++ ) {
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*1.1;
    m.position.y = Math.random()*5;
    m.position.z = Math.random()*4;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .4+ Math.random()*.3;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
}

Cloud.prototype.rotate = function() {
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++) {
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.005;
    m.rotation.y+= Math.random()*.002;
  }
}

Sun = function() {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "sun";
  var geom = new THREE.OctahedronGeometry(5, 3);
  var mat = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('resources/images/5.jpg'),
    color:Colors.yellow,
    shading:THREE.FlatShading,
    shininess: 1
  });

  var spriteMap = new THREE.TextureLoader().load( "resources/images/glow.png" );
  var spriteMaterial = new THREE.SpriteMaterial( {
    map: spriteMap,
    color: Colors.yellow,
    transparent: true,
    blending: THREE.AdditiveBlending
  } );
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(50, 50, 1)
  this.mesh.add(sprite); // this centers the glow at the mesh

  this.mesh.add(new THREE.Mesh(geom, mat));
}

// 3D Models
var earth;
var sun;

function createSun() {
  sun = new Sun();
  scene.add(sun.mesh)
}

function createEarth() {
  earth = new earth();
  earth.mesh.position.y = -game.earthRadius;
  scene.add(earth.mesh);
}

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -game.earthRadius;
  scene.add(sky.mesh);
}

function createCoins() {
  coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
}

function createEnemies() {
  for (var i=0; i<10; i++) {
    var enemy = new Ennemy();
    enemiesPool.push(enemy);
  }
  enemiesHolder = new EnemiesHolder();
  scene.add(enemiesHolder.mesh)
}

function createParticles() {
  for (var i=0; i<10; i++) {
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  scene.add(particlesHolder.mesh)
}

function loop() {

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if ( earth.mesh.rotation.z > 2*Math.PI)  earth.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  sky.moveClouds();
  earth.moveSurface();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

var blinkEnergy=false;


function normalize(v,vmin,vmax,tmin, tmax) {
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;

function init(event) {

  // UI

  resetGame();
  createScene();

  createLights();
  createEarth();
  createSun();
  createSky();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

window.addEventListener('load', init, false);

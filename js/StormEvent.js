StormEvent = function(scene) {
  this.keyFrames = [];
  this.currentKeyFrame = 0;
  this.position = new THREE.Vector3(0, 0, 0);
  this.position.x = Math.random() * 1000 - 500;
  this.position.y = params.defaultCamHeight * 2;
  this.position.z = Math.random() * 200 - 200;
  this.loadTextures();
  this.generateKeyFrames();
  this.pointLight = new THREE.PointLight(0xdfdfff, 0, 1000, 1);
  this.pointLight.position.set(this.position.x, this.position.y, this.position.z);
  scene.add(this.pointLight);
  this.active = false; 
}

StormEvent.prototype.generateKeyFrames = function() {
  var numKeyFrames = Math.random() * 5 + 25;

  for (var i = 0; i < numKeyFrames; i++)
    this.keyFrames.push(new KeyFrame());

  this.generateFlashes();

};

StormEvent.prototype.generateFlashes = function() {
  var flashFrameStart = Math.random() * 6 + 10;
  flashFrameStart = Math.round(flashFrameStart);
  var flashFrameEnd = flashFrameStart + 6;
  var showLightningBoltProb = 0.5;
  var roll = Math.random();
  for (i = flashFrameStart; i < flashFrameEnd; i++) {
    var currFlashFrame = i - flashFrameStart;
    this.keyFrames[i].pointLightIntensity = 5 * Math.sin(currFlashFrame / 4);
    if (roll < showLightningBoltProb)
      this.keyFrames[i].lightningBolt = true;
  }
}

StormEvent.prototype.loadTextures = function() {
  this.particles = new THREE.Geometry();

  var particle = new THREE.Vector3(this.position.x, this.position.y, this.position.z);

  this.particles.vertices.push(particle);

  var lightningTexture = new THREE.TextureLoader().load("resources/images/lightning1.png");

  this.particleMaterial = new THREE.PointsMaterial({
    color: 0x333399,
    map: lightningTexture,
    size: 100,
    transparent: true,
  });

  this.lightningBolt = new THREE.Points(this.particles, this.particleMaterial);
};

StormEvent.prototype.step = function() {
  this.active = true;
  this.pointLight.intensity = this.keyFrames[this.currentKeyFrame].pointLightIntensity;
  this.lightningBolt.visible = this.keyFrames[this.currentKeyFrame].lightningBolt;
  this.currentKeyFrame++;
  if (this.currentKeyFrame >= this.keyFrames.length)
    this.reset();
};

StormEvent.prototype.reset = function() {
  this.currentKeyFrame = 0;
  this.active = false;

  this.position.x = Math.random() * 1000 - 500;
  this.position.y = params.defaultCamHeight;
  this.position.z = Math.random() * 200 - 200;

  this.pointLight.position.set(this.position.x, this.position.y, this.position.z);
  this.particles.vertices[0] = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
};

KeyFrame = function() {
  this.pointLightIntensity = 0;
  this.lightningBolt = false;
}
Earth = function() {
  var geom = new THREE.CylinderGeometry(game.earthRadius, game.earthRadius, game.earthLength, 40, 10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i = 0; i < l; i++) {
    var v = geom.vertices[i];
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      ang: Math.random() * Math.PI * 2,
      amp: game.wavesMinAmp + Math.random() * (game.wavesMaxAmp - game.wavesMinAmp),
      speed: game.wavesMinSpeed + Math.random() * (game.wavesMaxSpeed - game.wavesMinSpeed)
    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.green,
    transparent: true,
    opacity: 1,
    shading: THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "Earth";
  this.mesh.receiveShadow = true;

  // for (var i = 0; i < 150; i++)
  //   this.moveSurface();
}

Earth.prototype.moveSurface = function() {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i = 0; i < l; i++) {
    var v = verts[i];
    var vprops = this.waves[i];
    v.x = vprops.x + Math.cos(vprops.ang / 10) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang / 10) * vprops.amp;
    vprops.ang += vprops.speed * deltaTime;
    this.mesh.geometry.verticesNeedUpdate = true;
  }
}

HeavyClouds = function(dark) {
  var geom = new THREE.BoxGeometry(300, 300, game.earthLength / 2, 40, 10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];
  if (dark)
    cloudColor = Colors.greyDark;
  else
    cloudColor = Colors.grey;
  var cloudColor = dark ? Colors.greyDark : Colors.grey;
  for (var i = 0; i < l; i++) {
    var v = geom.vertices[i];
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      ang: Math.random() * Math.PI * 2,
      amp: game.cloudWavesMinAmp + Math.random() * (game.cloudWavesMaxAmp - game.cloudWavesMinAmp),
      speed: game.cloudWavesMinSpeed + Math.random() * (game.cloudWavesMaxSpeed - game.cloudWavesMinSpeed)
    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color: cloudColor,
    shading: THREE.FlatShading,
    transparent: true,
    opacity: 0.7
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "HeavyClouds";
  this.mesh.castShadow = false;
  this.mesh.rotation.x = 0.2;

  // for (var i = 0; i < 150; i++)
  //   this.moveSurface();
}

HeavyClouds.prototype.moveSurface = function() {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i = 0; i < l; i++) {
    var v = verts[i];
    var vprops = this.waves[i];
    v.x = vprops.x + Math.cos(vprops.ang / 10) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang / 10) * vprops.amp;
    vprops.ang += vprops.speed * deltaTime;
    this.mesh.geometry.verticesNeedUpdate = true;
  }
}

LightCloud = function() {
  this.velocity = new THREE.Vector3(0, 0, 0);

  var cloudType = Math.random() * 3;

  if (cloudType >= 2.0)
    cloudType = 2;
  else if (cloudType >= 1.0)
    cloudType = 1;
  else
    cloudType = 0;
  
  this.mesh = lightCloudMeshes[cloudType].clone();
  console.log(this.mesh);
  this.mesh.name = "LightCloud";
  this.mesh.castShadow = false;
  this.mesh.position.y = game.defaultCamHeight * 2.1;
  this.mesh.position.z = Math.random() * 200 - 150;
  this.mesh.position.x = Math.random() * 1000 - 500;


  var heightScale = Math.random() * 4 + 5;
  var widthDepthScale = 15;
  this.mesh.scale.set(widthDepthScale, heightScale, widthDepthScale);
  this.velocity.x = Math.random() * 0.1 - 0.05;

  var verticalFlip = Math.random() < 0.5 ? true : false;
  var horizontalFlip = Math.random() < 0.5 ? true : false;

  if (verticalFlip)
    this.mesh.rotation.x = Math.PI;
  if (horizontalFlip)
    this.mesh.rotation.y = Math.PI;

  this.mesh.material.opacity = 0.6;
}

LightCloud.prototype.drift = function() {
  this.mesh.position.x += this.velocity.x;
  if (this.mesh.position.x < -600)
    this.mesh.position.x = 600;
 
 else if (this.mesh.position.x > 600)
    this.mesh.position.x = -600;
}

LightClouds = function(cloudNum) {
  this.clouds = []
  this.cloudNum = cloudNum;

  for (var i = 0; i < this.cloudNum; i++) {
    this.clouds.push(new LightCloud());
  }
}

LightClouds.prototype.driftClouds = function() {
  for (var i = 0; i < this.cloudNum; i++) {
    this.clouds[i].drift();
  }
}

Stars = function() {
  this.particleCount = 4000;

  this.particles = new THREE.Geometry();

  for (var p = 0; p < this.particleCount; p++) {
    var x = Math.random() * 4000 - 2000;
    var y = Math.random() * 800 - 200;
    var z = Math.random() * -200 - 400;

    var particle = new THREE.Vector3(x, y, z);

    this.particles.vertices.push(particle);
  }

  this.particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);
  this.stars = this.particleSystem;
}

Rain = function() {
  this.particleCount = 9000;

  this.particles = new THREE.Geometry();

  for (var p = 0; p < this.particleCount; p++) {
    var x = Math.random() * 4000 - 2000;
    var y = Math.random() * 350 - 100;
    var z = Math.random() * 200 - 400;

    var particle = new THREE.Vector3(x, y, z);
    particle.velocity = new THREE.Vector3(0, -4, 0);
    particle.maxXvel = weather.weatherData.wind.speed / 10;
    this.particles.vertices.push(particle);
  }

  var rainTexture = new THREE.TextureLoader().load("resources/images/raindrop.png");
  this.particleMaterial = new THREE.PointsMaterial({
    color: 0x333399,
    map: rainTexture,
    size: 25,
    transparent: true,
  });

  this.rainPointCloud = new THREE.Points(this.particles, this.particleMaterial);
}

Rain.prototype.simulateRain = function() {
  var pCount = this.particleCount;
  while (pCount--) {
    var particle = this.particles.vertices[pCount];

    if (particle.y < -100) {
      particle.y = 250;
      particle.x = Math.random() * 4000 - 2000;
      particle.velocity.x /= 2;
    }

    if (particle.velocity.y < -4.5)
      particle.velocity.y = -4.5;
    if (Math.abs(particle.velocity.x) >= particle.maxXvel) {
      if (particle.velocity.x < 0)
        particle.velocity.x = -particle.maxXvel;
      else
        particle.velocity.x = particle.maxXvel;
    }


    particle.velocity.y -= Math.random() * .02;
    particle.velocity.x += Math.random() * .02;

    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
  }

  this.particles.verticesNeedUpdate = true;
};

Snow = function() {
  this.particleCount = 9000;

  this.particles = new THREE.Geometry();

  for (var p = 0; p < this.particleCount; p++) {
    var x = Math.random() * 4000 - 2000;
    var y = Math.random() * 350 - 100;
    var z = Math.random() * 200 - 400;

    var particle = new THREE.Vector3(x, y, z);
    particle.velocity = new THREE.Vector3(0, -3.5, 0);
    particle.maxXvel = weather.weatherData.wind.speed / 20;
    this.particles.vertices.push(particle);
  }

  this.particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  this.rainPointCloud = new THREE.Points(this.particles, this.particleMaterial);
}

Snow.prototype.simulateSnow = function() {
  var pCount = this.particleCount;
  while (pCount--) {
    var particle = this.particles.vertices[pCount];

    if (particle.y < -100) {
      particle.y = 250;
      particle.x = Math.random() * 4000 - 2000;
      particle.velocity.x /= 10;
    }

    if (particle.velocity.y < -1)
      particle.velocity.y = -1;

    if (Math.abs(particle.velocity.x) >= particle.maxXvel)
      particle.velocity.x /= 1.1;

    particle.velocity.y -= Math.random() * .02;
    particle.velocity.x += Math.random() - 0.4;

    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
  }

  this.particles.verticesNeedUpdate = true;
};

Sun = function() {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "sun";
  var geom = new THREE.OctahedronGeometry(24, 3);
  var sunTexture = new THREE.TextureLoader().load("resources/images/sunbig.jpg");
  var mat = new THREE.MeshBasicMaterial({
    map: sunTexture,
    shading: THREE.FlatShading
  });

  var spriteMap = new THREE.TextureLoader().load("resources/images/glow.png");
  var spriteMaterial = new THREE.SpriteMaterial({
    map: spriteMap,
    color: Colors.yellow,
    transparent: true
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(120, 120, 1)
  this.mesh.add(sprite); // this centers the glow at the mesh

  this.mesh.position.x = 0;
  this.mesh.position.z = -500;
  this.mesh.position.y = game.defaultCamHeight * 2.5;

  this.mesh.add(new THREE.Mesh(geom, mat));
}

Moon = function() {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "moon";
  var geom = new THREE.OctahedronGeometry(24, 3);
  var sunTexture = new THREE.TextureLoader().load("resources/images/moon.jpg");
  var mat = new THREE.MeshBasicMaterial({
    map: sunTexture,
    shading: THREE.FlatShading
  });

  var spriteMap = new THREE.TextureLoader().load("resources/images/glow.png");
  var spriteMaterial = new THREE.SpriteMaterial({
    map: spriteMap,
    color: Colors.white,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(80, 80, 1)
  this.mesh.add(sprite); // this centers the glow at the mesh

  this.mesh.add(new THREE.Mesh(geom, mat));
}

// 17 — 3D Wave Volume (WEBGL)
// 16×16 grid with 3 shift-samplers — one per axis.
// Every axis breathes independently, creating a living 3D volume.

var N       = 16;
var SPACING = 22;
var half    = (N - 1) * SPACING / 2;

var samplerY, samplerX, samplerZ;

function setup() {
  createCanvas(460, 460, WEBGL).parent('sketch-container');
  frameRate(30);
  noFill();
  strokeWeight(4);

  // Three desynchronised shift-samplers — each axis has its own wave life
  samplerY = Waves.createSampler({
    shift: true,
    shiftInterval: 3,
    shiftDuration: 1.5,
    range: [-6, 6],
    frequency: 0.4,
    seed: 0
  });

  samplerX = Waves.createSampler({
    shift: true,
    shiftInterval: 4,
    shiftDuration: 1.2,
    range: [-3, 3],
    frequency: 0.3,
    seed: 42
  });

  samplerZ = Waves.createSampler({
    shift: true,
    shiftInterval: 5,
    shiftDuration: 1,
    range: [-3, 3],
    frequency: 0.35,
    seed: 77
  });
}

function draw() {
  background(12);
  orbitControl();
  rotateX(-0.5);
  rotateY(frameCount * 0.005);

  var t = millis() / 1000;

  beginShape(POINTS);
  for (var xi = 0; xi < N; xi++) {
    for (var zi = 0; zi < N; zi++) {
      // Y: main surface displacement — full range across the cube
      var dy = samplerY.sample(xi * 0.9 + zi * 0.6, t);

      // X: horizontal breathing — points drift sideways
      var dx = samplerX.sample(zi * 0.8 + xi * 0.3, t * 0.85);

      // Z: depth warping — grid pulses in and out
      var dz = samplerZ.sample(xi * 0.7 + zi * 0.5, t * 0.7);

      // Map dy to a grid row and spread points around the surface
      var surfaceRow = N / 2 + dy;
      var thick = 2.5;

      for (var yi = 0; yi < N; yi++) {
        var gap = Math.abs(yi - surfaceRow);
        if (gap < thick) {
          var glow = 1 - gap / thick;
          var bright = Math.round(80 + (yi / (N - 1)) * 175);
          stroke(bright, bright, 255, 255 * glow);
          vertex(
            -half + xi * SPACING + dx * SPACING * 0.4,
            -half + yi * SPACING,
            -half + zi * SPACING + dz * SPACING * 0.4
          );
        }
      }
    }
  }
  endShape();
}

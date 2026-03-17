// 17 — 3D Wave Volume (WEBGL)
// 16×16×16 point lattice. Two Waves.wave() calls define a wave surface;
// the wave type cycles every 2 seconds (60 frames at 30 fps).

var N        = 16;
var SPACING  = 22;
var CYCLE    = 60;   // frames per wave (30 fps × 2 s)
var COUNT    = 34;   // total wave types

function setup() {
  createCanvas(460, 460, WEBGL).parent('sketch-container');
  frameRate(30);
  colorMode(RGB, 255);
  noFill();
}

function draw() {
  background(12);
  orbitControl();

  var t     = frameCount * 0.008;
  var half  = (N - 1) * SPACING / 2;
  var waveX = Math.floor(frameCount / CYCLE) % COUNT;
  var waveZ = (waveX + 1) % COUNT;

  strokeWeight(4);

  for (var xi = 0; xi < N; xi++) {
    for (var zi = 0; zi < N; zi++) {

      var wv = Waves.wave(xi * 0.38, { wave: waveX, t: t,        amplitude: (N - 1) / 2 })
             + Waves.wave(zi * 0.38, { wave: waveZ, t: t * 0.85, amplitude: (N - 1) / 2 });
      var surfaceY = wv / 2;

      for (var yi = 0; yi < N; yi++) {
        var dist = Math.abs(yi - (N / 2 + surfaceY));
        if (dist < 3) {
          var alpha  = 220 * (1 - dist / 3);
          var bright = Math.round(80 + (yi / (N - 1)) * 175);
          stroke(bright, bright, 255, alpha);
          point(
            -half + xi * SPACING,
            -half + yi * SPACING,
            -half + zi * SPACING
          );
        }
      }
    }
  }
}

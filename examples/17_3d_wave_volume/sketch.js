// 17 — 3D Wave Volume (WEBGL)
// 16×16×16 point lattice in one batched beginShape(POINTS) call.
// Wave type cycles every 2 seconds (60 frames at 30 fps).

var N       = 16;
var SPACING = 22;
var CYCLE   = 60;

function setup() {
  createCanvas(460, 460, WEBGL).parent('sketch-container');
  frameRate(30);
  noFill();
  stroke(120, 160, 255);
  strokeWeight(4);
}

function draw() {
  background(12);
  orbitControl();

  var t     = frameCount * 0.008;
  var half  = (N - 1) * SPACING / 2;
  var waveX = Math.floor(frameCount / CYCLE) % Waves.count;
  var waveZ = (waveX + 1) % Waves.count;

  beginShape(POINTS);
  for (var xi = 0; xi < N; xi++) {
    for (var zi = 0; zi < N; zi++) {
      var wv = Waves.wave(xi * 0.38, { wave: waveX, t: t,        amplitude: (N - 1) / 2 })
             + Waves.wave(zi * 0.38, { wave: waveZ, t: t * 0.85, amplitude: (N - 1) / 2 });
      var yi = Math.round(N / 2 + wv / 2);
      yi = Math.max(0, Math.min(N - 1, yi));
      vertex(
        -half + xi * SPACING,
        -half + yi * SPACING,
        -half + zi * SPACING
      );
    }
  }
  endShape();
}

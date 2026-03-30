// 17 — 3D Wave Volume (WEBGL)
// 16×16×16 point lattice. wave: [a, b] + mix crossfades between formulas
// over 15 frames at the end of each 2-second cycle.

var N          = 16;
var SPACING    = 22;
var CYCLE      = 60;   // frames per wave (30 fps × 2 s)
var TRANSITION = 15;   // crossfade window (frames)

function setup() {
  createCanvas(460, 460, WEBGL).parent('sketch-container');
  frameRate(30);
  noFill();
  stroke(120, 160, 255);
  strokeWeight(4);
}

function draw() {
  background(12);
  rotateX(-0.5);
  rotateY(frameCount * 0.006);

  var t        = frameCount * 0.008;
  var half     = (N - 1) * SPACING / 2;
  var cyclePos = frameCount % CYCLE;
  var slot     = Math.floor(frameCount / CYCLE) % Waves.count;
  var waveX    = slot;
  var waveZ    = (slot + 1) % Waves.count;
  var nextX    = (slot + 1) % Waves.count;
  var nextZ    = (slot + 2) % Waves.count;
  var mix      = cyclePos >= (CYCLE - TRANSITION)
               ? (cyclePos - (CYCLE - TRANSITION)) / TRANSITION
               : 0;

  beginShape(POINTS);
  for (var xi = 0; xi < N; xi++) {
    for (var zi = 0; zi < N; zi++) {
      var wv = Waves.wave(xi * 0.38, { wave: [waveX, nextX], t: t,        amplitude: 3.5, mix: mix })
             + Waves.wave(zi * 0.38, { wave: [waveZ, nextZ], t: t * 0.85, amplitude: 3.5, mix: mix });
      var yi = Math.max(0, Math.min(N - 1, Math.round(N / 2 + wv / 2)));
      vertex(
        -half + xi * SPACING,
        -half + yi * SPACING,
        -half + zi * SPACING
      );
    }
  }
  endShape();
}

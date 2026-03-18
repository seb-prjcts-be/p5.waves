// 14 — Breathing Type
// The word repeats across a 4×5 grid — each cell driven independently
// by wave-based size, lift, and opacity. Same word, structured surprise.

var WORD = 'WAVES';
var COLS = 4;
var ROWS = 5;

var sizeSamplers = [];
for (var k = 0; k < COLS * ROWS; k++) {
  sizeSamplers.push(Waves.createSampler({ seed: k * 7, range: [10, 32] }));
}

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
}

function draw() {
  background(245);
  var t   = frameCount * 0.018;
  var cw  = width  / COLS;
  var ch  = height / ROWS;

  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var k     = row * COLS + col;
      var cx    = col * cw + cw * 0.5;
      var cy    = row * ch + ch * 0.5;

      var sz    = sizeSamplers[k].sample(k * 0.6, t);
      var lift  = Waves.wave(k * 0.6, { seed: k + 20, range: [-12, 12], t: t });
      var alpha = Waves.wave(k * 1.1, { seed: k + 40, range: [60, 255],  t: t });

      textSize(sz);
      fill(0, 0, 0, alpha);
      text(WORD, cx, cy + lift);
    }
  }
}

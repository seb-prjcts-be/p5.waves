// 14 — Breathing Type
// 4×5 grid of WAVES — each letter in each cell is an independent instance
// with its own size sampler, lift, and opacity wave. 100 instances total.

var WORD  = 'WAVES';
var COLS  = 4;
var ROWS  = 5;
var NLET  = WORD.length;  // 5

var sizeSamplers = [];
for (var k = 0; k < COLS * ROWS * NLET; k++) {
  sizeSamplers.push(Waves.createSampler({ seed: k * 7, range: [8, 28] }));
}

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
}

function draw() {
  background(245);
  var t     = frameCount * 0.018;
  var cellW = width  / COLS;
  var cellH = height / ROWS;

  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var k = row * COLS + col;
      var cx = col * cellW + cellW * 0.5;
      var cy = row * cellH + cellH * 0.5;

      // First pass: compute sizes to centre the word in its cell
      var sizes = [];
      for (var l = 0; l < NLET; l++) {
        sizes.push(sizeSamplers[k * NLET + l].sample((k * NLET + l) * 0.6, t));
      }
      var totalW = 0;
      for (var l = 0; l < NLET; l++) totalW += sizes[l] * 0.72;

      var x = cx - totalW * 0.5 + sizes[0] * 0.36;

      // Second pass: draw each letter independently
      for (var l = 0; l < NLET; l++) {
        var idx   = k * NLET + l;
        var sz    = sizes[l];
        var lift  = Waves.wave(idx * 0.6, { seed: idx + 20, range: [-12, 12], t: t });
        var alpha = Waves.wave(idx * 1.1, { seed: idx + 40, range: [60, 255], t: t });

        textSize(sz);
        fill(0, 0, 0, alpha);
        text(WORD[l], x, cy + lift);

        x += sz * 0.72;
      }
    }
  }
}

// 14 — Breathing Type
// 4×5 grid — each letter an independent instance.
// Wave formula morphs smoothly every 2 seconds across all 100 letters.

var WORD     = 'WAVES';
var COLS     = 4;
var ROWS     = 5;
var NLET     = WORD.length;   // 5
var INTERVAL = 2.16;          // 2 s at 60 fps (frameCount * 0.018)

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
}

function draw() {
  background(245);
  var t      = frameCount * 0.018;
  var cellW  = width  / COLS;
  var cellH  = height / ROWS;

  var era   = floor(t / INTERVAL);
  var blend = constrain(map(t % INTERVAL, 0, INTERVAL * 0.35, 0, 1), 0, 1);

  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var k  = row * COLS + col;
      var cx = col * cellW + cellW * 0.5;
      var cy = row * cellH + cellH * 0.5;

      // First pass: sizes for centring
      var sizes = [];
      for (var l = 0; l < NLET; l++) {
        var idx  = k * NLET + l;
        var wA   = (idx * 7 + era)     % Waves.count;
        var wB   = (idx * 7 + era + 1) % Waves.count;
        sizes.push(Waves.wave(idx * 0.6, { wave: [wA, wB], mix: blend, range: [8, 28], t: t }));
      }
      var totalW = 0;
      for (var l = 0; l < NLET; l++) totalW += sizes[l] * 0.72;
      var x = cx - totalW * 0.5 + sizes[0] * 0.36;

      // Second pass: draw each letter
      for (var l = 0; l < NLET; l++) {
        var idx   = k * NLET + l;
        var wA    = (idx * 7 + era)     % Waves.count;
        var wB    = (idx * 7 + era + 1) % Waves.count;
        var lift  = Waves.wave(idx * 0.6, { wave: [wA, wB], mix: blend, seed: idx + 20, range: [-12, 12], t: t });
        var alpha = Waves.wave(idx * 1.1, { wave: [wA, wB], mix: blend, seed: idx + 40, range: [60, 255],  t: t });

        textSize(sizes[l]);
        fill(0, 0, 0, alpha);
        text(WORD[l], x, cy + lift);
        x += sizes[l] * 0.72;
      }
    }
  }
}

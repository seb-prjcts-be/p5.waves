// 15 — Morph Wave
// A field of horizontal lines where each row blends two wave formulas.
// Top rows = pure waveA. Bottom rows = pure waveB. Middle = the morph.
// The blend sweeps up and down over time — you see the shape transform.

var WAVE_A = 'wobble sine';
var WAVE_B = 'meta sine';
var ROW_COUNT = 50;
var t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
}

function draw() {
  background(250);
  t += 0.0375;

  // the morph centre sweeps up and down
  var centre = (sin(t * 0.3) + 1) * 0.5;
  var rowH = height / ROW_COUNT;

  for (var row = 0; row < ROW_COUNT; row++) {
    var rowFrac = row / (ROW_COUNT - 1);
    // distance from the sweeping centre determines the mix
    var dist = abs(rowFrac - centre);
    var morphMix = constrain(1 - dist * 3, 0, 1);
    var yBase = row * rowH + rowH * 0.5;

    // colour: waveA is blue, waveB is warm — morph zone glows
    var r = lerp(40, 210, morphMix);
    var gn = lerp(90, 60, morphMix);
    var b = lerp(200, 100, morphMix);
    var rowAlpha = 60 + (1 - dist) * 180;

    noFill();
    stroke(r, gn, b, rowAlpha);
    strokeWeight(1.2 + morphMix * 1.4);
    beginShape();
    for (var x = 0; x < width; x += 3) {
      var waveY = Waves.wave(x, {
        wave: [WAVE_A, WAVE_B],
        mix:  morphMix,
        t:    t + row * 0.06,
        frequency: 0.08,
        amplitude: rowH * 1.8
      });
      vertex(x, yBase + constrain(waveY, -rowH * 0.45, rowH * 0.45));
    }
    endShape();
  }

  // labels
  noStroke();
  fill(40, 90, 200, 200);
  textSize(10);
  textFont('monospace');
  textAlign(LEFT);
  text(WAVE_A, 8, 16);
  fill(210, 60, 100, 200);
  textAlign(RIGHT);
  text(WAVE_B, width - 8, height - 8);
}

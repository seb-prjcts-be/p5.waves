// Morph Wave
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

    // waveA = blue, waveB = red — morph zone blends
    var r = round(lerp(0, 255, morphMix));
    var b = round(lerp(255, 0, morphMix));

    noFill();
    stroke(r, 0, b);
    strokeWeight(1.2 + morphMix * 1.8);
    beginShape();
    for (var x = 0; x < width; x += 3) {
      var waveY = Waves.wave(x, {
        wave: [WAVE_A, WAVE_B],
        mix:  morphMix,
        t:    t + row * 0.06,
        frequency: 0.08,
        amplitude: rowH * 2.5
      });
      vertex(x, yBase + constrain(waveY, -rowH * 0.7, rowH * 0.7));
    }
    endShape();
  }

  // labels
  noStroke();
  fill(0, 0, 255);
  textSize(10);
  textFont('monospace');
  textAlign(LEFT);
  text(WAVE_A, 8, 16);
  fill(255, 0, 0);
  textAlign(RIGHT);
  text(WAVE_B, width - 8, height - 8);
}

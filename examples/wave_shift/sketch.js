// Wave Shift
// Filled ribbons that auto-shift between random wave formulas.
// Color flows from red to blue across the strips.

var STRIPS = 20;
var sampler = Waves.createSampler({
  shift:     true,
  amplitude: 1,
  frequency: 0.5
});

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  textFont('monospace');
}

function draw() {
  background(245);
  var t = millis() / 1000;
  var sw = width / STRIPS;
  var cy = height / 2;
  var rowH = height * 0.42;

  for (var i = 0; i < STRIPS; i++) {
    var frac = i / (STRIPS - 1);
    var r = round(255 * (1 - frac));
    var b = round(255 * frac);
    fill(r, 0, b);
    var v = sampler.sample(i * 0.4, t + i * 0.1);
    rect(i * sw, cy - v * rowH, sw - 1, v * rowH * 2);
  }

  fill(0, 0, 0, 140);
  textSize(11);
  textAlign(LEFT);
  text(sampler.waveName, 8, 16);
}

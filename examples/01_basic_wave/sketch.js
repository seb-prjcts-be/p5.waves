// 01 — Wave Shift
// A curtain of wave lines that auto-shift between random formulas.
// Each line has its own phase offset, creating an organic ripple.

var LINE_COUNT = 10;
var sampler = Waves.createSampler({
  shift:     true,
  amplitude: 70,
  frequency: 0.6
});

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  strokeCap(ROUND);
}

function draw() {
  background(245);
  var t = millis() / 1000;

  noFill();
  for (var i = 0; i < LINE_COUNT; i++) {
    var shade = 40 + (i / (LINE_COUNT - 1)) * 140;
    var phaseOff = i * 0.35;
    stroke(shade);
    strokeWeight(1.4);
    beginShape();
    for (var x = 0; x <= width; x += 4) {
      vertex(x, height / 2 + sampler.sample(x + phaseOff * 60, t + phaseOff * 0.2));
    }
    endShape();
  }

  // wave name label
  noStroke();
  fill(0, 0, 0, 140);
  textFont('monospace');
  textSize(11);
  textAlign(LEFT);
  text(sampler.waveName, 8, 16);
}

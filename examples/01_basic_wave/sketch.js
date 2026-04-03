// 01 — Wave Shift
// A curtain of wave lines that auto-shift between random formulas.
// Each line has its own phase offset, creating an organic ripple.

var LINE_COUNT = 10;
var sampler = Waves.createSampler({
  shift:     true,
  amplitude: 50,
  frequency: 0.6
});
var t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  strokeCap(ROUND);
  textFont('monospace');
  textAlign(CENTER, CENTER);
}

function draw() {
  background(245);
  t += 0.014;

  noFill();
  for (var i = 0; i < LINE_COUNT; i++) {
    var shade = 40 + (i / (LINE_COUNT - 1)) * 140;
    var phaseOff = i * 0.35;
    stroke(shade);
    strokeWeight(1.6);
    beginShape();
    for (var y = 0; y <= height; y += 3) {
      var x = width / 2 + sampler.sample(y + phaseOff * 60, t + phaseOff * 0.2);
      vertex(x, y);
    }
    endShape();
  }

  // wave name label
  noStroke();
  fill(0, 0, 0, 160);
  textSize(10);
  text(sampler.waveName, width / 2, height - 30);

  if (sampler.shifting) {
    fill(0, 0, 0, map(sampler.mix, 0, 1, 0, 160));
    text(sampler.targetName, width / 2, height - 16);
  }
}

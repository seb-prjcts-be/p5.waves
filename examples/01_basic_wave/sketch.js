// 01 — Wave Shift
// One wave, shifting into random formulas automatically.
// createSampler({ shift: true }) handles timing, picking, and easing.

var sampler = Waves.createSampler({
  shift:     true,
  amplitude: 120,
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
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (var y = 0; y <= height; y += 3) {
    vertex(width / 2 + sampler.sample(y, t), y);
  }
  endShape();

  noStroke();
  fill(0, 0, 0, 160);
  textSize(10);
  text(sampler.waveName, width / 2, height - 30);

  if (sampler.shifting) {
    fill(0, 0, 0, map(sampler.mix, 0, 1, 0, 160));
    text(sampler.targetName, width / 2, height - 16);
  }
}

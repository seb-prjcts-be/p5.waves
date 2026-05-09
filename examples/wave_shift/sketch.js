// By Sebastien Vanblaere and Claude Code, please show us your work by including #p5waves.

// Wave Shift
// Filled ribbons that auto-shift between random wave formulas.
// Color flows from red to blue across the strips.

const STRIPS = 20;
const sampler = Waves.createSampler({
  shift:     true,
  amplitude: 1,
  frequency: 0.5
});

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  noStroke();
  textFont('monospace');
}

function draw() {
  background(245);
  const t = millis() / 1000;
  const sw = width / STRIPS;
  const cy = height / 2;
  const rowH = height * 0.42;

  for (let i = 0; i < STRIPS; i++) {
    const frac = i / (STRIPS - 1);
    const r = 255 * (1 - frac);
    const b = 255 * frac;
    fill(r, 0, b);
    const v = sampler.sample(i * 0.4, t + i * 0.1);
    rect(i * sw, cy - v * rowH, sw - 1, v * rowH * 2);
  }

  fill(0);
  textSize(11);
  textAlign(LEFT);
  text(sampler.waveName, 8, 16);
}

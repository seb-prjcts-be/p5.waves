// 01 — Basic Wave (global mode)
// Draws a wave line using Waves.wave().
// wave(y, { wave, t, amplitude }) → always a number.

const SELECT = 'classic sine';
const SCALE  = 80;
const STEP   = 4;

function setup() {
  createCanvas(400, 200);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += STEP) {
    const x = width / 2 + Waves.wave(y, {
      wave:      SELECT,
      t:         frameCount * 0.5,
      amplitude: SCALE
    });
    if (Number.isFinite(x) && Number.isFinite(y)) vertex(x, y);
  }
  endShape();
}

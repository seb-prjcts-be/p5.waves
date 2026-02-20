// 05 — WEBGL (two samplers for x and z offsets)
// In v2, createSampler() always returns a number.
// Use two samplers with different seeds to get independent x and z.

const STEP = 30;
const SIZE = 8;
let samplerX, samplerZ;

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  fill(0);

  samplerX = Waves.createSampler({ seed: 0, wave: 'classic sine', range: [-80, 80] });
  samplerZ = Waves.createSampler({ seed: 1, range: [-80, 80] });
}

function draw() {
  background(245);
  rotateX(-0.5);
  rotateY(frameCount * 0.01);

  const t = frameCount * 0.01;

  for (let y = -200; y <= 200; y += STEP) {
    for (let x = -200; x <= 200; x += STEP) {
      const ox = samplerX.sample(y, t);
      const oz = samplerZ.sample(y, t);
      push();
      translate(x + ox, 0, y + oz);
      box(SIZE);
      pop();
    }
  }
}

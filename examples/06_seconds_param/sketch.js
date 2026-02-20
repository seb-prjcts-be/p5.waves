// 06 — createSampler (reusable sampler object)
// In v2 there is no auto-advancing seconds parameter.
// Instead, create a sampler once and call sample(y, t) in draw().
// This example was previously "seconds_param" — it now demonstrates createSampler.

let sampler;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  sampler = Waves.createSampler({
    wave:  'classic sine',
    range: [-120, 120]
  });
}

function draw() {
  background(245);
  const t = frameCount * 0.01;

  for (let y = 0; y < height; y += 10) {
    const x = sampler.sample(y, t);
    circle(width / 2 + x, y, 5);
  }
}

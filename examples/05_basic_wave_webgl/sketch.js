let t = 0;
const STEP = 30;
const SIZE = 8;
let sampler;

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  fill(0);
  sampler = Waves.createSampler({
    axis: 'xz',
    amplitude: 80,
    normalize: true,
    range: [-1, 1],
    wave: 'classic sine',
    refresh: 3
  });
}

function draw() {
  background(245);
  rotateX(-0.5);
  rotateY(frameCount * 0.01);

  for (let y = -200; y <= 200; y += STEP) {
    for (let x = -200; x <= 200; x += STEP) {
      const o = sampler.sample(y + t, { t: frameCount * 0.01 });
      push();
      translate(x + o.x, 0, y + o.z);
      box(SIZE);
      pop();
    }
  }

  t += 0.01;
}

// 06 — Flow Field
// 350 particles follow direction angles sampled from Waves.createSampler.
// The wave type determines the flow character:
//   noise       → organic, unpredictable streams
//   stepped sine → angular corridors
//   meta sine   → swirling vortices

const sampler = Waves.createSampler({ wave: 'noise', amplitude: TWO_PI * 1.4 });
const N = 350;
const particles = [];

function setup() {
  createCanvas(600, 600);
  noStroke();
  for (let i = 0; i < N; i++) {
    particles.push({ x: random(width), y: random(height) });
  }
}

function draw() {
  background(245, 245, 245, 12);
  const t = frameCount * 0.008;

  fill(0, 0, 0, 160);
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const angle = sampler.sample(p.x * 0.007 + p.y * 0.004, t);
    p.x += cos(angle) * 2.2;
    p.y += sin(angle) * 2.2;
    if (p.x < 0)      p.x = width;
    if (p.x > width)  p.x = 0;
    if (p.y < 0)      p.y = height;
    if (p.y > height) p.y = 0;
    circle(p.x, p.y, 2.5);
  }
}

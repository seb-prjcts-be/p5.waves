// 06 — Swarm Flows
// Four createSampler() calls, each a different wave, steer 120 particles.
// Particles wrap at canvas edges, leaving soft trails.

let samplers = [];
const particles = [];
const N = 120;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();

  ['classic sine', 'wobble', 'pulse', 'plasma'].forEach((w, i) => {
    samplers.push(Waves.createSampler({ wave: w, seed: i * 11, range: [-1.8, 1.8] }));
  });

  for (let i = 0; i < N; i++) {
    particles.push({ x: random(width), y: random(height), s: i % 4 });
  }
}

function draw() {
  background(245, 245, 245, 22);
  const t = frameCount * 0.014;

  for (const p of particles) {
    p.x += samplers[p.s].sample(p.y * 0.009, t) * 2.2;
    p.y += samplers[(p.s + 2) % 4].sample(p.x * 0.009, t) * 2.2;

    if (p.x < 0)      p.x += width;
    if (p.x > width)  p.x -= width;
    if (p.y < 0)      p.y += height;
    if (p.y > height) p.y -= height;

    fill(0, 0, 0, 160);
    circle(p.x, p.y, 3);
  }
}

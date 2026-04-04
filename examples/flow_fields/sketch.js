// Flow Fields
// Four createSampler() calls, each a different wave, steer 120 particles.
// Particles wrap at canvas edges, leaving soft trails.

var colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]];
var samplers = [
  Waves.createSampler({ wave: 'classic sine', seed:  0, range: [-3, 3], frequency: 0.8 }),
  Waves.createSampler({ wave: 'wobble sine',  seed: 11, range: [-3, 3], frequency: 0.8 }),
  Waves.createSampler({ wave: 'pulse',        seed: 22, range: [-3, 3], frequency: 0.8 }),
  Waves.createSampler({ wave: 'meta sine',    seed: 33, range: [-3, 3], frequency: 0.8 })
];
var particles = [];
var N = 120;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  for (var i = 0; i < N; i++) {
    particles.push({ x: random(width), y: random(height), s: i % 4 });
  }
}

var t = 0;
function draw() {
  background(245, 245, 245, 16);
  t += 0.018;
  for (var i = 0; i < particles.length; i++) {
    var pt = particles[i];
    pt.x += samplers[pt.s].sample(pt.y * 0.015, t);
    pt.y += samplers[(pt.s + 2) % 4].sample(pt.x * 0.015, t);
    if (pt.x < 0) pt.x += width;  if (pt.x > width)  pt.x -= width;
    if (pt.y < 0) pt.y += height; if (pt.y > height) pt.y -= height;
    var c = colors[pt.s];
    fill(c[0], c[1], c[2]);
    circle(pt.x, pt.y, 6);
  }
}

// 08 — Triangle wave over a small input domain
// Maps y to [-1, 1] before sampling, so the triangle period is clearly visible.
// In v2 there is no domain option; just map your input range explicitly.

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const u = map(y, 0, height, -1, 1) + frameCount * 0.004;
    const x = Waves.wave(u, {
      wave:  'triangle',
      range: [-140, 140]
    });
    circle(width / 2 + x, y, 5);
  }
}

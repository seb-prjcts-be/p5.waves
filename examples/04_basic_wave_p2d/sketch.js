// 04 — Contour Map (P2D renderer)
// 30 horizontal wave lines, phase offset per row → topographic map.
// Explicit P2D renderer; Waves.wave() is renderer-agnostic.

const LINES = 30;
let t = 0;

function setup() {
  createCanvas(460, 460, P2D).parent('sketch-container');
  stroke(0);
  noFill();
}

function draw() {
  background(245);
  t += 0.01;

  for (let i = 0; i < LINES; i++) {
    const y0    = map(i, 0, LINES - 1, 30, height - 30);
    const phase = i * 0.24;
    const sw    = map(i % 3, 0, 2, 0.5, 1.5);
    const alpha = map(i % 4, 0, 3, 50, 200);

    stroke(0, 0, 0, alpha);
    strokeWeight(sw);

    beginShape();
    for (let x = 0; x <= width; x += 4) {
      const dy = Waves.wave(x * 0.011, {
        wave:      'wobble sine',
        t:         t + phase,
        amplitude: 13,
        frequency: 3.2
      });
      vertex(x, y0 + dy);
    }
    endShape();
  }
}

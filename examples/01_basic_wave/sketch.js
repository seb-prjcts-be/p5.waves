// 01 — Wave Curtain
// 50 vertical threads displaced by Waves.wave() create a flowing cloth.
// Phase offset between threads makes the wave travel sideways.

const THREADS = 50;
let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  strokeCap(ROUND);
  noFill();
}

function draw() {
  background(245);
  t += 0.012;

  for (let i = 0; i < THREADS; i++) {
    const x0    = map(i, 0, THREADS - 1, 20, width - 20);
    const phase = i * 0.22;
    const alpha = map(sin(i * 0.28 - t * 0.4), -1, 1, 55, 210);
    const sw    = map(sin(i * 0.35 + t * 0.3), -1, 1, 0.5, 2.5);

    stroke(0, 0, 0, alpha);
    strokeWeight(sw);

    beginShape();
    for (let y = 0; y <= height; y += 3) {
      const dx = Waves.wave(y * 0.012, {
        wave:      'smooth step',
        t:         t + phase,
        amplitude: 14,
        frequency: 1.6
      });
      vertex(x0 + dx, y);
    }
    endShape();
  }
}

// 04 — Contour Map (P2D renderer)
// 22 horizontal wave lines, phase offset per row → topographic map.
// Alternate bands filled to show enclosed regions like a topo chart.

const LINES = 22;
let t = 0;

function setup() {
  createCanvas(460, 460, P2D).parent('sketch-container');
}

function draw() {
  background(245);
  t += 0.01;

  for (let i = 0; i < LINES - 1; i++) {
    const y0    = map(i,     0, LINES - 1, 30, height - 30);
    const y1    = map(i + 1, 0, LINES - 1, 30, height - 30);
    const phase = i * 0.24;

    // Filled band between line i and i+1 (alternating)
    if (i % 2 === 0) {
      noStroke();
      fill(0, 0, 0, 14);
      beginShape();
      for (let x = 0; x <= width; x += 4) {
        const dy = Waves.wave(x * 0.011, {
          wave: 'wobble sine', t: t + phase, amplitude: 45, frequency: 2.4
        });
        vertex(x, y0 + dy);
      }
      for (let x = width; x >= 0; x -= 4) {
        const dy = Waves.wave(x * 0.011, {
          wave: 'wobble sine', t: t + phase + 0.24, amplitude: 45, frequency: 2.4
        });
        vertex(x, y1 + dy);
      }
      endShape(CLOSE);
    }
  }

  // Draw lines on top
  for (let i = 0; i < LINES; i++) {
    const y0    = map(i, 0, LINES - 1, 30, height - 30);
    const phase = i * 0.24;
    const sw    = map(i % 3, 0, 2, 0.5, 1.5);
    const alpha = map(i % 4, 0, 3, 60, 220);

    stroke(0, 0, 0, alpha);
    strokeWeight(sw);
    noFill();
    beginShape();
    for (let x = 0; x <= width; x += 4) {
      const dy = Waves.wave(x * 0.011, {
        wave: 'wobble sine', t: t + phase, amplitude: 45, frequency: 2.4
      });
      vertex(x, y0 + dy);
    }
    endShape();
  }
}

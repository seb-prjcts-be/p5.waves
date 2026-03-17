// 09 — Luminance Field
// range: [0, 1] maps wave output to a 0–1 fraction used directly as brightness.
// Three layers at different speeds and axes create a dense greyscale interference grid.

const GRID = 90;
let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
}

function draw() {
  background(245);
  t += 0.014;
  const cell = width / GRID;

  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const v1 = Waves.wave(gx * 0.12 + gy * 0.07, {
        wave:  'smooth solid sine',
        t:     t,
        range: [0, 1]
      });
      const v2 = Waves.wave(gy * 0.1 - gx * 0.05, {
        wave:  'classic sine',
        t:     t * 0.7,
        range: [0, 1]
      });
      const v3 = Waves.wave(gx * 0.08 - gy * 0.09, {
        wave:  'triangle',
        t:     t * 1.3,
        range: [0, 1]
      });

      fill((v1 + v2 + v3) / 3 * 230);
      rect(gx * cell, gy * cell, cell, cell);
    }
  }
}

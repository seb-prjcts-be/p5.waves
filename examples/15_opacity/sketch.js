// 15 — Fade Field
// Wave output drives alpha only — no movement, no size change.
// Two overlapping grids at different speeds create interference in opacity.

const COLS = 11;
const ROWS = 11;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
}

function draw() {
  background(245);
  const t  = frameCount * 0.01;
  const cw = width  / COLS;
  const ch = height / ROWS;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = (c + 0.5) * cw;
      const cy = (r + 0.5) * ch;

      // Layer 1 — slow drift
      const a1 = Waves.wave(c * 0.35 + r * 0.28, {
        wave:  'classic sine',
        t:     t,
        range: [0, 220]
      });

      // Layer 2 — faster, offset wave
      const a2 = Waves.wave(c * 0.28 - r * 0.35, {
        wave:  'triangle',
        t:     t * 1.6,
        range: [0, 180]
      });

      // Draw both layers at the same position
      fill(0, a1);
      circle(cx, cy, cw * 0.72);

      fill(30, 80, 180, a2);
      circle(cx, cy, cw * 0.38);
    }
  }
}

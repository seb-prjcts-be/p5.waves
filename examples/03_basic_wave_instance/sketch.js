// 03 — Breathing Grid (instance mode)
// range: [0, 1] gives a 0–1 fraction usable directly as a size scale.
// The grid of dots breathes as the wave moves through it.

new p5(function (p) {
  const GRID   = 28;
  const maxDot = 13;

  p.setup = function () {
    p.createCanvas(460, 460).parent('sketch-container');
    p.noStroke();
  };

  p.draw = function () {
    p.background(245);
    const t    = p.frameCount * 0.018;
    const cell = p.width / GRID;

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const val = p.waves(gx * 0.22 + gy * 0.15, {
          wave:  'smooth step',
          t:     t + gx * 0.04 + gy * 0.06,
          range: [0, 1]
        });

        p.fill(0, 0, 0, 185);
        p.circle(
          (gx + 0.5) * cell,
          (gy + 0.5) * cell,
          val * maxDot
        );
      }
    }
  };
});

// 03 — Breathing Grid (instance mode)
// range: [0, 1] gives a 0–1 fraction usable directly as a size scale.
// A second wave drives each dot's shade — size and colour breathe independently.

new p5(function (p) {
  const GRID   = 28;
  const maxDot = 18;

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
          wave:  'smooth solid sine',
          t:     t + gx * 0.04 + gy * 0.06,
          range: [0, 1]
        });

        const shade = p.waves(gx * 0.18 - gy * 0.12, {
          wave:  'triangle',
          t:     t * 0.7 + gx * 0.05,
          range: [0, 1]
        });

        p.fill(shade * 180, shade * 180, shade * 180, 210);
        p.circle(
          (gx + 0.5) * cell,
          (gy + 0.5) * cell,
          val * maxDot
        );
      }
    }
  };
});

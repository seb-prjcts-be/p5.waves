// 02 — Sampler Orbits (instance mode)
// Two samplers drive X and Y, tracing Lissajous-like orbit paths.
// p.waves() is equivalent to Waves.wave() in instance mode.

new p5(function (p) {
  let samplerX, samplerY;
  const NUM = 80;

  p.setup = function () {
    p.createCanvas(460, 460).parent('sketch-container');
    p.noStroke();

    samplerX = Waves.createSampler({ wave: 'classic sine', seed: 3, range: [-200, 200] });
    samplerY = Waves.createSampler({ wave: 'wobble sine',  seed: 9, range: [-200, 200] });
  };

  p.draw = function () {
    p.background(245, 245, 245, 18);
    const t = p.frameCount * 0.035;

    for (let i = 0; i < NUM; i++) {
      const phase = (i / NUM) * p.TWO_PI * 2;
      const x     = p.width  / 2 + samplerX.sample(phase, t);
      const y     = p.height / 2 + samplerY.sample(phase + 0.8, t);

      const alpha = p.map(i, 0, NUM - 1, 40, 200);
      p.fill(0, 0, 0, alpha);
      p.circle(x, y, 4);
    }
  };
});

// 03 — Basic Wave (instance mode, range normalisation)
// range: [-120, 120] normalises the wave output directly to that span.

new p5(function (p) {
  p.setup = function () {
    p.createCanvas(600, 600);
    p.noStroke();
    p.fill(0);
  };

  p.draw = function () {
    p.background(245);

    for (let y = 0; y < p.height; y += 10) {
      const x = p.waves(y, {
        wave:  'classic sine',
        t:     p.frameCount * 0.01,
        range: [-120, 120]
      });
      p.circle(p.width / 2 + x, y, 5);
    }
  };
});

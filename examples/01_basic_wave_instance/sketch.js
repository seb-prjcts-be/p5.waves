new p5(function (p) {
  let t = 0;

  p.setup = function () {
    p.createCanvas(600, 600);
  };

  p.draw = function () {
    p.background(245);

    for (let y = 0; y < p.height; y += 10) {
      const x = p.waves(y + t, 'classicSine', null, { amplitude: 120 });
      p.circle(p.width / 2 + x, y, 5);
    }

    t += 0.01;
  };
});



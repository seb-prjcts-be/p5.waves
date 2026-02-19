const SELECT = 'classic sine';
const SCALE = 80;
const STEP = 4;
const SPEED = 0.5;
const SECONDS = 1.5;

new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
    p.noFill();
    p.stroke(20);
  };

  p.draw = function () {
    p.background(245);
    p.beginShape();
    for (let y = 0; y <= p.height; y += STEP) {
      const x = p.width / 2 + p.waves(y + p.frameCount * SPEED, SELECT, SECONDS, {
        axis: 'x',
        amplitude: SCALE
      });
      p.vertex(x, y);
    }
    p.endShape();
  };
});

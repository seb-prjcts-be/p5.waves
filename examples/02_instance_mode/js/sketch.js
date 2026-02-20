// 02 — Instance Mode
// Same as 01 but using p5 instance mode with p.waves().

const SELECT = 'classic sine';
const SCALE  = 80;
const STEP   = 4;

new p5(function (p) {
  p.setup = function () {
    p.createCanvas(400, 200);
    p.noFill();
    p.stroke(0);
  };

  p.draw = function () {
    p.background(245);
    p.beginShape();
    for (let y = 0; y <= p.height; y += STEP) {
      const x = p.width / 2 + p.waves(y, {
        wave:      SELECT,
        t:         p.frameCount * 0.5,
        amplitude: SCALE
      });
      p.vertex(x, y);
    }
    p.endShape();
  };
});

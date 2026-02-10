const SELECT = 'triangle';
const SCALE = 60;
const STEP = 30;
const SPEED = 0.02;
const SIZE = 8;

function setup() {
  createCanvas(500, 500, WEBGL);
  noStroke();
  fill(20);
}

function draw() {
  background(240);
  rotateX(-0.4);
  rotateY(frameCount * 0.01);

  const t = frameCount * SPEED;
  for (let y = -150; y <= 150; y += STEP) {
    for (let x = -150; x <= 150; x += STEP) {
      const o = Waves.wave(y + t, SELECT, null, {
        axis: 'xz',
        scale: SCALE,
        vars: { t }
      });
      push();
      translate(x + o.x, 0, y + o.z);
      box(SIZE);
      pop();
    }
  }
}

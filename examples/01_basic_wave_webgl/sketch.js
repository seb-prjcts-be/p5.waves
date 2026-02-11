let t = 0;
const STEP = 30;
const SIZE = 8;

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  fill(20);
}

function draw() {
  background(245);
  rotateX(-0.5);
  rotateY(frameCount * 0.01);

  for (let y = -200; y <= 200; y += STEP) {
    for (let x = -200; x <= 200; x += STEP) {
      const o = Waves.wave(y + t, 'classicSine', null, { axis: 'xz', amplitude: 80 });
      push();
      translate(x + o.x, 0, y + o.z);
      box(SIZE);
      pop();
    }
  }

  t += 0.01;
}



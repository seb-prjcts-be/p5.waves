const SELECT = 'classic sine';
const SCALE = 80;
const STEP = 4;
const SPEED = 0.5;

function setup() {
  createCanvas(400, 200);
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  beginShape();
  for (let y = 0; y <= height; y += STEP) {
    const x = width / 2 + Waves.wave(y + frameCount * SPEED, SELECT, null, {
      axis: 'x',
      scale: SCALE
    });
    vertex(x, y);
  }
  endShape();
}

// Flow Fields
// A grid of ASCII characters forms a flow field.
// Each cell's direction comes from waves() - like noise(), but with structure.
// The wave formula shifts automatically every few seconds.

const COLS = 30;
const ROWS = 30;
const DIRS = ['-', '/', '|', '\\'];
let sampler;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  textFont('monospace');
  textAlign(CENTER, CENTER);
  noStroke();
  fill(0);
  sampler = createWaveSampler({
    shift: true,
    shiftInterval: 4,
    shiftDuration: 2,
    frequency: 2
  });
}

function draw() {
  background(255);
  let t = millis() / 1000;
  let sz = floor(width / COLS);
  textSize(sz * 0.9);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let val = sampler.sample(col * 0.5, t + row * 0.4);
      let idx = constrain(floor(map(val, -1, 1.001, 0, 4)), 0, 3);
      text(DIRS[idx], col * sz + sz / 2, row * sz + sz / 2);
    }
  }
}

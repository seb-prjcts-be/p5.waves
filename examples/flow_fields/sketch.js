// Flow Fields
// A grid of ASCII characters forms a flow field.
// Each cell's direction comes from waves() — like noise(), but with structure.
// A different wave formula is picked on every page load.

const COLS = 30;
const ROWS = 30;
const DIRS = ['-', '/', '|', '\\'];
let waveIdx;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
  textAlign(CENTER, CENTER);
  noStroke();
  fill(0);
  waveIdx = floor(random(Waves.count));
}

function draw() {
  background(255);
  let t = millis() / 1000;
  let sz = width / COLS;
  textSize(sz * 0.9);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let val = waves(col * 0.5, {
        wave: waveIdx,
        t: t + row * 0.4,
        frequency: 2
      });
      let idx = constrain(floor(map(val, -1, 1.001, 0, 4)), 0, 3);
      text(DIRS[idx], col * sz + sz / 2, row * sz + sz / 2);
    }
  }
}

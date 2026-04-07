// Wild Mode
// Grid of circles: left half stable, right half wild.
// mouseX controls unpredictability — drag to feel the chaos build.

const COLS = 20, ROWS = 14;
let t = 0;
let wildWave;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  noStroke();
  textFont('monospace');
  textAlign(CENTER);
  wildWave = floor(random(Waves.count));
}

function draw() {
  background(238);
  t += 0.012;
  const cw = width / COLS;
  const ch = (height - 24) / ROWS;
  const maxR = min(cw, ch) * 0.44;
  const half = COLS / 2;
  const unpred = constrain(map(mouseX, 0, width, 0, 1), 0, 1);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = (col + 0.5) * cw;
      const cy = (row + 0.5) * ch;
      const coord = col * 0.15 + row * 0.3;

      if (col < half) {
        const sz = Waves.wave(coord, { wave: wildWave, t: t, range: [3, maxR] });
        fill(0);
        circle(cx, cy, sz * 2);
      } else {
        const szW = Waves.wave(coord, {
          wave: wildWave, t: t, range: [3, maxR],
          mode: 'wild', unpredictability: unpred
        });
        fill(0);
        circle(cx, cy, szW * 2);
      }
    }
  }

  stroke(0, 0, 0, 30);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height - 24);
  noStroke();
  fill(0);
  textSize(10);
  text('stable', width / 4, height - 6);
  text('wild  ' + nf(unpred, 1, 2), 3 * width / 4, height - 6);
}

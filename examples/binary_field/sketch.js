// By Sebastien Vanblaere and Claude Code, please show us your work by including #p5waves.

// Binary Field
// Two samplers, summed per cell, thresholded into a 2D pattern.
// Both samplers shift independently, so the field's character keeps
// evolving. Sometimes interference, sometimes stripes, sometimes checker.

const COLS = 30;
const ROWS = 20;

const rowS = Waves.createSampler({
  shift:         true,
  shiftInterval: 4,
  shiftDuration: 1,
  range:         [-1, 1],
  seed:          1
});

const colS = Waves.createSampler({
  shift:         true,
  shiftInterval: 4.5,
  shiftDuration: 1.2,
  range:         [-1, 1],
  seed:          2
});

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  noStroke();
  textFont('monospace');
}

function draw() {
  background(245);
  const t = millis() / 1000;
  const labelH = 28;
  const cw = width / COLS;
  const ch = (height - labelH) / ROWS;
  const offset = t * 0.4;

  for (let row = 0; row < ROWS; row++) {
    const rv = rowS.sample(row * 5 + offset, t);
    for (let col = 0; col < COLS; col++) {
      const cv = colS.sample(col * 2.5 - offset, t);
      const on = (rv + cv) > 0;
      fill(on ? 15 : 230);
      rect(col * cw, labelH + row * ch, cw - 0.5, ch - 0.5);
    }
  }

  fill(40);
  textSize(11);
  textAlign(LEFT, CENTER);
  text(rowS.waveName + '  ×  ' + colS.waveName, 8, labelH / 2);
}

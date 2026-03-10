// 07 — Wave Taxonomy
// Waves.list() returns all 34 wave descriptors.
// 4×4 grid shows 16 waves; { wave: N } selects by direct index.

let allWaves;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  allWaves = Waves.list();
  noFill();
  stroke(0);
}

function draw() {
  background(245);
  const t    = frameCount * 0.012;
  const COLS = 4;
  const ROWS = 4;
  const cw   = width  / COLS;
  const rh   = height / ROWS;

  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x0  = col * cw;
    const y0  = row * rh;
    const idx = i * 2;   // indices 0, 2, 4 … 30

    // cell border
    noFill();
    stroke(0, 0, 0, 30);
    strokeWeight(0.5);
    rect(x0, y0, cw, rh);

    // wave preview
    stroke(0);
    strokeWeight(1.3);
    beginShape();
    for (let y = y0 + 22; y < y0 + rh - 4; y += 2) {
      const x = Waves.wave(y * 0.025, {
        wave:  idx,
        t:     t,
        range: [x0 + 6, x0 + cw - 6]
      });
      vertex(x, y);
    }
    endShape();

    // label
    noStroke();
    fill(0, 0, 0, 120);
    textSize(8);
    textAlign(LEFT);
    textFont('monospace');
    text('#' + idx + ' ' + allWaves[idx].name, x0 + 5, y0 + 14);
    noFill();
    stroke(0);
  }
}

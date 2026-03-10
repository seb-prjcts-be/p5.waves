// 05 — Terrain Mesh (WEBGL)
// createGrid() generates a Float32Array height map each frame.
// Drawn as TRIANGLE_STRIP rows — a full animated 3D terrain mesh.

const COLS = 28;
const ROWS = 28;
let grid;

function setup() {
  createCanvas(460, 460, WEBGL).parent('sketch-container');
  stroke(0);
  strokeWeight(0.5);
  noFill();

  grid = Waves.createGrid(COLS, ROWS, {
    range: [-55, 55],
    speed: 0.5
  });
}

function draw() {
  background(245);
  rotateX(-0.65);
  rotateY(frameCount * 0.006);

  const data = grid.sample(frameCount * 0.016);
  const size = 300 / Math.max(COLS, ROWS);

  for (let r = 0; r < ROWS - 1; r++) {
    beginShape(TRIANGLE_STRIP);
    for (let c = 0; c < COLS; c++) {
      const x  = (c - COLS / 2) * size;
      const z0 = (r - ROWS / 2) * size;
      const z1 = z0 + size;
      vertex(x, -data[r * COLS + c],         z0);
      vertex(x, -data[(r + 1) * COLS + c],   z1);
    }
    endShape();
  }
}

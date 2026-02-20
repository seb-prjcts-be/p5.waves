// 07 — Select wave by index
// wave(y, { wave: 4 }) selects wave at index 4 ('pulse').
// wave(y, 4) would use 4 as a seed (picks a wave via hashing).
// Use { wave: N } for direct index selection.

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
}

function draw() {
  background(245);
  const t = frameCount * 0.01;

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, {
      wave:  4,          // index 4 = 'pulse'
      t:     t,
      range: [-90, 90]
    });
    circle(width / 2 + x, y, 5);
  }
}

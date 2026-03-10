// 08 — Interference
// Two triangle waves (domain-mapped x and y) combine to form moiré bands.
// Mouse X controls frequency for live pattern exploration.

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
}

function draw() {
  background(245);
  const t    = frameCount * 0.007;
  const freq = map(mouseX, 0, width, 0.5, 4);

  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      const u = map(x, 0, width,  -freq * PI, freq * PI) + t;
      const v = map(y, 0, height, -freq * PI, freq * PI) + t * 0.7;

      const wx = Waves.wave(u, { wave: 'triangle', range: [0, 1] });
      const wy = Waves.wave(v, { wave: 'triangle', range: [0, 1] });

      const band = abs(wx + wy - 1);
      if (band < 0.22) {
        fill(0, 0, 0, map(band, 0, 0.22, 220, 0));
        circle(x, y, 4);
      }
    }
  }
}

let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 140,
    select: 'triangle',
    normalize: true,
    range: [-1, 1],
    domain: [-1, 1],
    samples: 512
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const u = map(y, 0, height, -1, 1);
    const x = Waves.wave(u + t);
    circle(width / 2 + x, y, 5);
  }

  t += 0.004;
}

let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 90,
    frequency: 0.02,
    select: 4,
    mode: 'wild',
    unpredictability: 0.35,
    normalize: true,
    range: [-1, 1]
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t);
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}
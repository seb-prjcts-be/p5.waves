let t = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    frequency: 0.012,
    mode: 'stable',
    normalize: true,
    range: [-1, 1]
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t, 'tangentBloom', 2, {
      amplitude: 160,
      frequency: 0.022,
      mode: 'wild',
      unpredictability: 0.5
    });
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}
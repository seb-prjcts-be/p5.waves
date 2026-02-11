let t = 0;

function setup() {
  createCanvas(600, 600);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    normalize: true,
    range: [-1, 1],
    domain: [0, 600],
    samples: 512
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + t, 'valleys', 2, { amplitude: 160 });
    circle(width / 2 + x, y, 5);
  }

  t += 0.01;
}



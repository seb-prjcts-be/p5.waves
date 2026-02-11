let t = 0;

function setup() {
  createCanvas(600, 600);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 240,
    select: 'classicSine',
    normalize: true,
    range: [0, 1],
    domain: [0, 600],
    samples: 512
  });
}

function draw() {
  background(245);

  for (let y = 0; y < height; y += 10) {
    const x01 = Waves.wave(y + t);
    circle(x01, y, 5);
  }

  t += 0.01;
}




let t = 0;

function setup() {
  createCanvas(600, 600);

  Waves.setWaveParams({
    axis: 'x',
    amplitude: 80,
    select: 13,
    normalize: false
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



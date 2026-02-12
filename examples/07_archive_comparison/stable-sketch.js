let t = 0;

function setup() {
  createCanvas(560, 420);
  noFill();
}

function draw() {
  background(255);

  stroke(0, 0, 0, 40);
  for (let y = 0; y <= height; y += 35) line(0, y, width, y);

  stroke(0);
  strokeWeight(2);
  beginShape();
  for (let y = 0; y <= height; y += 4) {
    const x = Waves.wave(y + t, 0, null, {
      amplitude: 115,
      frequency: 0.012,
      mode: 'wild',
      unpredictability: 0.35,
      normalize: true,
      range: [-1, 1]
    });
    vertex(width * 0.5 + x, y);
  }
  endShape();

  noStroke();
  fill(255, 0, 0);
  const marker = Waves.wave(height * 0.4 + t, 4, null, {
    amplitude: 110,
    frequency: 0.02,
    mode: 'wild',
    unpredictability: 0.55,
    normalize: true,
    range: [-1, 1]
  });
  circle(width * 0.5 + marker, height * 0.4, 12);

  t += 0.9;
}
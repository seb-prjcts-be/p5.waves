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
      normalize: true,
      range: [-1, 1],
      refresh: 7
    });
    vertex(width * 0.5 + x, y);
  }
  endShape();

  noStroke();
  fill(255, 0, 0);
  const marker = Waves.wave(height * 0.4 + t, 28, null, {
    amplitude: 115,
    normalize: true,
    range: [-1, 1],
    refresh: 7
  });
  circle(width * 0.5 + marker, height * 0.4, 12);

  t += 0.9;
}
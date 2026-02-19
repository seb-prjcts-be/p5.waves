const TARGET_FPS = 30;
const INPUT_SPEED = 6;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
  frameRate(1);

  Waves.setTimeMode('tick');
  Waves.setWaveParams({
    axis: 'x',
    amplitude: 120,
    select: 'classic sine',
    seconds: 1,
    normalize: true,
    range: [-1, 1],
    refresh: 4
  });
}

function draw() {
  background(245);
  Waves.tick(1 / TARGET_FPS);

  const inputOffset = Waves._timeSeconds * INPUT_SPEED;
  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y + inputOffset);
    circle(width / 2 + x, y, 5);
  }

  noStroke();
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`mode: tick\nframeRate: 1 fps\ntick: 1/${TARGET_FPS}\nsimSeconds: ${Waves._timeSeconds.toFixed(2)}`, 12, 12);
}

// 11 — Manual time control
// In v2 there is no tick/clock mode. Time is just a number you pass.
// This example runs at 1 fps but advances simTime at TARGET_FPS rate,
// producing the same animation as if it were running at TARGET_FPS.

const TARGET_FPS  = 30;
const INPUT_SPEED = 6;
let simTime = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  fill(0);
  frameRate(1);  // low real frame rate to show the effect
}

function draw() {
  background(245);
  simTime += 1 / TARGET_FPS;  // advance at fixed simulated rate

  for (let y = 0; y < height; y += 10) {
    const x = Waves.wave(y, {
      wave:  'classic sine',
      t:     simTime * INPUT_SPEED,
      range: [-120, 120]
    });
    circle(width / 2 + x, y, 5);
  }

  noStroke();
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text('frameRate: 1 fps\nsimRate: ' + TARGET_FPS + ' fps\nsimTime: ' + simTime.toFixed(2) + 's', 12, 12);
}

// By Sebastien Vanblaere and Claude Code, please show us your work by including #p5waves.

// Spiky Lissajous - a classic a:b Lissajous curve, but sin() is
// replaced by a spiky p5.waves formula. The pen traces the curve over
// one frozen-phase cycle, then lands exactly back on the start marker -
// proof that even with spikes or sawtooth edges, wave(0) == wave(A * period)
// for integer A, so the path closes.

const SPIKY = [
  { name: 'sharp peaks',   period: Math.PI * 10, color: [70, 220, 130] },
  { name: 'batman',        period: Math.PI * 20, color: [255, 70, 70] },
  { name: 'zig-zag sine',  period: Math.PI * 10, color: [60, 160, 255] },
  { name: 'up down pulse', period: Math.PI * 10, color: [250, 220, 40] }
];

const RATIO_A = 3;
const RATIO_B = 5;
const SEGMENTS = 1400;
const CYCLE_MS = 4500;
let waveIdx = 0;

function setup() {
  createCanvas(720, 720).parent('sketch-container'); // remove .parent() for local use
  strokeJoin(ROUND);
  noFill();
}

function draw() {
  background(12);
  translate(width / 2, height / 2);

  const choice = SPIKY[waveIdx];
  const period = choice.period;
  const radius = min(width, height) * 0.34;

  // Freeze phase for one cycle so the pen draws a genuine closed loop
  // and literally returns to (xs[0], ys[0]) at prog = 1.
  const cycleId = floor(millis() / CYCLE_MS);
  const frozenMs = cycleId * CYCLE_MS;
  const phaseX = frozenMs * 0.00015;
  const phaseY = frozenMs * 0.00021;
  const prog = (millis() % CYCLE_MS) / CYCLE_MS;
  const drawnTo = floor(prog * SEGMENTS);

  const xs = new Array(SEGMENTS + 1);
  const ys = new Array(SEGMENTS + 1);
  for (let i = 0; i <= SEGMENTS; i++) {
    const theta = (i / SEGMENTS) * period;
    xs[i] = radius * Waves.wave(RATIO_A * theta + phaseX * period, {
      wave: choice.name,
      amplitude: 1
    });
    ys[i] = radius * Waves.wave(RATIO_B * theta + phaseY * period + period * 0.25, {
      wave: choice.name,
      amplitude: 1
    });
  }

  // Dim ghost of the full closed loop - proves the target doesn't move.
  noFill();
  stroke(choice.color[0] * 0.22, choice.color[1] * 0.22, choice.color[2] * 0.22);
  strokeWeight(1);
  beginShape();
  for (let i = 0; i <= SEGMENTS; i++) vertex(xs[i], ys[i]);
  endShape(CLOSE);

  // Bright pen trail up to the current progress.
  stroke(choice.color[0], choice.color[1], choice.color[2]);
  strokeWeight(1.4);
  beginShape();
  for (let i = 0; i <= drawnTo; i++) vertex(xs[i], ys[i]);
  endShape();

  // Start marker - the "home" the pen must return to.
  const homeR = 12 + sin(prog * TWO_PI) * 1.5;
  noStroke();
  fill(255); circle(xs[0], ys[0], homeR);
  fill(18);  circle(xs[0], ys[0], homeR - 6);

  // Pen cursor - the moving tip.
  fill(255);
  circle(xs[drawnTo], ys[drawnTo], 8);

  // HUD
  noStroke();
  fill(220);
  textFont('monospace');
  textSize(12);
  text(choice.name + '  /  ratio ' + RATIO_A + ':' + RATIO_B,
       -width / 2 + 18, -height / 2 + 24);
  fill(120);
  textSize(10);
  text('click to cycle wave  /  the pen returns to the white dot',
       -width / 2 + 18, -height / 2 + 42);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    waveIdx = (waveIdx + 1) % SPIKY.length;
  }
}

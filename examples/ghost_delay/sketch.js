// By Sebastien Vanblaere and Claude Code, please show us your work by including #p5waves.

// Ghost Delay - one 1D wave, read against a delayed copy of itself.
// x = sample(u), y = sample(u + tau): one scalar wave closes into a loop ring
// (its phase portrait). shift morphs the wave, so the loop family keeps changing.
// The strip along the bottom is that one wave; the dots are the two read points.

let sampler;
const N = 800;

function setup() {
  createCanvas(720, 720).parent('sketch-container'); // remove .parent() for local use
  colorMode(HSB, 360, 100, 100, 100);
  strokeJoin(ROUND);
  noFill();
  // 'ghost' is a built-in pool of closing waves that stay clean under this
  // delay. range [-1, 1] gives unit output (the default would be amplitude 100).
  sampler = Waves.createSampler({ group: 'ghost', shift: true, range: [-1, 1] });
}

function draw() {
  background(230, 25, 8);
  noFill();   // re-assert every frame: the strip dots and HUD text set a fill
              // that would otherwise leak into next frame's ring and fill it in
  const t = millis() / 1000;
  const hue = (t * 12) % 360;
  const period = sampler.period;                      // ghost waves share one period
  const tau = period * (0.5 + 0.35 * sin(t * 0.35));  // the ghost delay, breathing

  // The ring: the wave against its own delayed self.
  const rad = min(width, height) * 0.36;
  stroke(hue, 55, 100, 90);
  strokeWeight(1.4);
  push();
  translate(width / 2, height / 2 - 30);
  beginShape();
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * period;                       // one period -> the ring closes
    vertex(sampler.sample(u, t) * rad, sampler.sample(u + tau, t) * rad);
  }
  endShape(CLOSE);
  pop();

  drawWaveStrip(t, tau, hue, period);

  // shift is cycling the ghost pool; name the current wave.
  noStroke();
  fill(0, 0, 70);
  textFont('monospace');
  textSize(12);
  text(sampler.waveName, 18, 26);
}

// The raw 1D wave as a height line, with the two read points (u and u + tau)
// marked. The whole trick is reading this one wave twice.
function drawWaveStrip(t, tau, hue, period) {
  const baseY = height - 60;
  const w = width - 120;
  const left = 60;
  const amp = 24;

  stroke(hue, 45, 100, 70);
  strokeWeight(1.2);
  beginShape();
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * period;
    vertex(left + (i / N) * w, baseY - sampler.sample(u, t) * amp);
  }
  endShape();

  noStroke();
  fill(0, 0, 100);
  circle(left, baseY - sampler.sample(0, t) * amp, 7);
  fill(hue, 70, 100);
  circle(left + (tau % period) / period * w, baseY - sampler.sample(tau, t) * amp, 7);
}

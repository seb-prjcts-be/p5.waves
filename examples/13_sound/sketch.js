// 13 — Wave Synth
// Three createSampler() calls drive Web Audio oscillator frequencies.
// The moving cursor plays the wave like a score — visual and audio are one.

const WAVE_NAMES = ['classic sine', 'triangle', 'stepped sine'];
const RANGES     = [[110, 330], [220, 550], [330, 770]];
const COLORS     = ['#e05540', '#4466ee', '#33bb88'];
const TRACK_CY   = [76, 230, 384];

const samplers = [
  Waves.createSampler({ wave: WAVE_NAMES[0], seed:  0, range: RANGES[0] }),
  Waves.createSampler({ wave: WAVE_NAMES[1], seed:  5, range: RANGES[1] }),
  Waves.createSampler({ wave: WAVE_NAMES[2], seed: 10, range: RANGES[2] }),
];

let audioCtx, oscs = [], running = false;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');
}

function mousePressed() {
  if (!running) {
    audioCtx = new AudioContext();
    oscs = [];
    for (let i = 0; i < 3; i++) {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.05;
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      oscs.push(osc);
    }
    running = true;
  } else {
    for (const o of oscs) o.stop();
    audioCtx.close();
    oscs    = [];
    running = false;
  }
}

function draw() {
  background(18);

  const cursor = (frameCount * 2) % width;
  const t      = frameCount * 0.012;
  const hw     = 54; // half-height of each track

  for (let i = 0; i < 3; i++) {
    const [minF, maxF] = RANGES[i];
    const cy = TRACK_CY[i];

    // Wave path across full canvas
    noFill();
    stroke(COLORS[i]);
    strokeWeight(1.5);
    beginShape();
    for (let x = 0; x < width; x += 3) {
      const freq = samplers[i].sample(x * 0.018, t);
      const y    = map(freq, minF, maxF, cy + hw, cy - hw);
      vertex(x, y);
    }
    endShape();

    // Current frequency at cursor position
    const curFreq = samplers[i].sample(cursor * 0.018, t);
    const curY    = map(curFreq, minF, maxF, cy + hw, cy - hw);

    if (running) oscs[i].frequency.value = curFreq;

    // Cursor dot
    fill(COLORS[i]);
    noStroke();
    circle(cursor, curY, 10);

    // Label
    textSize(10);
    textAlign(LEFT, BOTTOM);
    fill(COLORS[i]);
    text(`${WAVE_NAMES[i]}  ${round(curFreq)} Hz`, 8, cy - hw - 2);
  }

  // Cursor line
  stroke(255, 255, 255, 50);
  strokeWeight(1);
  line(cursor, 0, cursor, height);

  // Click hint
  if (!running) {
    noStroke();
    fill(255, 180);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('click to start', width / 2, height - 18);
  }
}

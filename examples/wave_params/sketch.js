// Shape Parameters
// mouseX = frequency, mouseY = amplitude.
// Wave formula shifts automatically.
// Drag to feel what each parameter does.

let shiftSampler;
let t = 0;
const LINE_COUNT = 8;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  textFont('monospace');

  // Only used to get shifting wave names
  shiftSampler = Waves.createSampler({
    shift: true,
    shiftInterval: 4,
    shiftDuration: 1.5,
    seed: 42
  });
}

function draw() {
  background(245);
  t += 0.015;

  // Mouse drives parameters
  let freq = map(mouseX, 0, width, 0.15, 3.5);
  let amp = map(mouseY, 0, height, 120, 8);
  freq = constrain(freq, 0.15, 3.5);
  amp = constrain(amp, 8, 120);

  // Ping the sampler to keep shift state updated
  shiftSampler.sample(0, t);
  let waveName = shiftSampler.waveName;

  // Draw layered lines — each offset in phase for depth
  for (let i = 0; i < LINE_COUNT; i++) {
    let progress = i / (LINE_COUNT - 1);
    let phase = i * 0.7;
    let lineAmp = amp * (1 - progress * 0.5);
    let gray = lerp(0, 200, progress);
    let weight = lerp(2.5, 0.8, progress);

    stroke(gray);
    strokeWeight(weight);
    noFill();
    beginShape();
    for (let x = 0; x <= width; x += 3) {
      let val = Waves.wave(x, {
        wave: waveName,
        t: t,
        amplitude: lineAmp,
        frequency: freq * 0.01,
        phase: phase
      });
      vertex(x, height / 2 + val);
    }
    endShape();
  }

  // Labels
  noStroke();
  fill(0, 0, 0, 60);
  textSize(10);
  textAlign(LEFT, TOP);
  text(waveName, 8, 8);

  textAlign(LEFT, BOTTOM);
  text('frequency: ' + freq.toFixed(2), 8, height - 8);

  textAlign(RIGHT, BOTTOM);
  text('amplitude: ' + amp.toFixed(0), width - 8, height - 8);

  // Crosshair
  stroke(0, 0, 0, 20);
  strokeWeight(0.5);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);
}

// By Sebastien Vanblaere and Claude Code, please show us your work by including #p5waves.

// Static Field
// A wave-driven take on `random(155) + 100`.
// Three slow base samplers set a per-channel floor in [0, 155].
// Three faster field samplers add 0 to 100 on top, per cell.
// Each channel stays inside a moving 100-wide window that drifts and morphs.

let baseR, baseG, baseB;
let fieldR, fieldG, fieldB;

function setup() {
  createCanvas(460, 460).parent('sketch-container'); // remove .parent() for local use
  noStroke();

  baseR = Waves.createSampler({
    shift: true, group: 'gentle',
    range: [0, 155], frequency: 0.20,
    shiftInterval: 7, shiftDuration: 2
  });
  baseG = Waves.createSampler({
    shift: true, group: 'gentle',
    range: [0, 155], frequency: 0.17,
    shiftInterval: 8, shiftDuration: 2
  });
  baseB = Waves.createSampler({
    shift: true, group: 'gentle',
    range: [0, 155], frequency: 0.13,
    shiftInterval: 9, shiftDuration: 2
  });

  fieldR = Waves.createSampler({
    shift: true,
    group: ['classic sine', 'triangle', 'bumpy sine', 'mountain peaks', 'wobble sine'],
    range: [0, 1], frequency: 0.08,
    shiftInterval: 4, shiftDuration: 1.5
  });
  fieldG = Waves.createSampler({
    shift: true,
    group: ['sine', 'triangle', 'squared sine', 'valleys', 'round linked sine'],
    range: [0, 1], frequency: 0.06,
    shiftInterval: 5, shiftDuration: 1.5
  });
  fieldB = Waves.createSampler({
    shift: true,
    group: ['classic sine', 'sharp peaks', 'bumpy sine', 'half sine', 'smooth solid sine'],
    range: [0, 1], frequency: 0.07,
    shiftInterval: 6, shiftDuration: 1.5
  });
}

function draw() {
  background(245);
  const cell = 8;
  const top  = 30;
  const t    = millis() / 1000;

  const r0 = floor(constrain(baseR.sample(0,   t), 0, 155));
  const g0 = floor(constrain(baseG.sample(100, t), 0, 155));
  const b0 = floor(constrain(baseB.sample(200, t), 0, 155));

  for (let y = top; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      let rp = constrain(fieldR.sample(x + y * 0.35,        t), 0, 1);
      let gp = constrain(fieldG.sample(x * 0.3 + y,         t), 0, 1);
      let bp = constrain(fieldB.sample(x * 0.7 - y * 0.25,  t), 0, 1);

      rp = lerp(rp, random(), 0.15);
      gp = lerp(gp, random(), 0.15);
      bp = lerp(bp, random(), 0.15);

      fill(r0 + rp * 100, g0 + gp * 100, b0 + bp * 100);
      rect(x, y, cell, cell);
    }
  }

  fill(20);
  textFont('monospace');
  textSize(11);
  textAlign(LEFT, CENTER);
  text('R ' + r0 + '-' + (r0 + 100) +
       '   G ' + g0 + '-' + (g0 + 100) +
       '   B ' + b0 + '-' + (b0 + 100), 8, 12);
}

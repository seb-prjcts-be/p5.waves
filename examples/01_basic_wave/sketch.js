// 01 — Wave Shift
// One wave line, smoothly morphing into a randomly chosen formula
// every few seconds using the library's built-in lerp: wave: ['a','b'] + mix.

var MORPH_DURATION = 120;        // frames to complete a morph
var HOLD_DURATION  = 180;        // frames to hold the new shape
var AMP            = 120;
var FREQ           = 1.2;

var waveA, waveB;
var morphFrame = 0;
var phase      = 'hold';         // 'morph' or 'hold'
var holdFrame  = HOLD_DURATION;
var t          = 0;

function pickRandom(exclude) {
  var idx;
  do { idx = floor(random(Waves.count)); } while (idx === exclude);
  return idx;
}

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noFill();
  strokeCap(ROUND);
  textFont('monospace');
  textAlign(CENTER, CENTER);

  waveA = 0;
  waveB = pickRandom(waveA);
}

function draw() {
  background(245);
  t += 0.014;

  // ── State machine: hold → morph → hold ──
  if (phase === 'hold') {
    holdFrame--;
    if (holdFrame <= 0) {
      phase      = 'morph';
      morphFrame = 0;
      waveB      = pickRandom(waveA);
    }
  }

  if (phase === 'morph') {
    morphFrame++;
    if (morphFrame >= MORPH_DURATION) {
      waveA     = waveB;
      phase     = 'hold';
      holdFrame = HOLD_DURATION;
    }
  }

  var mix = phase === 'morph'
    ? morphFrame / MORPH_DURATION
    : 0;

  // Ease in–out for a smooth transition
  mix = mix * mix * (3 - 2 * mix);

  // ── Draw the wave ──
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (var y = 0; y <= height; y += 3) {
    var x = Waves.wave(y * 0.012, {
      wave:      [Waves.data[waveA].name, Waves.data[waveB].name],
      mix:       mix,
      t:         t,
      amplitude: AMP,
      frequency: FREQ
    });
    vertex(width / 2 + x, y);
  }
  endShape();

  // ── Labels ──
  var nameA = Waves.data[waveA].name;
  var nameB = Waves.data[waveB].name;

  noStroke();
  fill(0, 0, 0, 160);
  textSize(10);
  text(nameA, width / 2, height - 30);

  if (phase === 'morph') {
    fill(0, 0, 0, map(mix, 0, 1, 0, 160));
    text(nameB, width / 2, height - 16);

    // progress bar
    var barW = 100;
    var barX = width / 2 - barW / 2;
    fill(220);
    rect(barX, height - 7, barW, 2);
    fill(0);
    rect(barX, height - 7, barW * mix, 2);
  }
}

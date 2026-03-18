// 01 — Wave Curtain
// 50 vertical threads, each with a randomly chosen wave formula,
// amplitude, and frequency. Threads animate independently via phase offset.

const THREADS = 50;
const threads = [];
let t = 0;

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  strokeCap(ROUND);
  noFill();

  for (let i = 0; i < THREADS; i++) {
    threads.push({
      wave: floor(random(Waves.count)),
      amp:  random(25, 55),
      freq: random(0.7, 1.8)
    });
  }
}

function draw() {
  background(245);
  t += 0.012;

  for (let i = 0; i < THREADS; i++) {
    const x0    = map(i, 0, THREADS - 1, 20, width - 20);
    const phase = i * 0.22;
    const alpha = Waves.wave(i * 0.28, { wave: 'sine', t: -t * 0.4, range: [55, 210] });
    const sw    = Waves.wave(i * 0.35, { wave: 'sine', t:  t * 0.3, range: [0.5, 2.5] });

    stroke(0, 0, 0, alpha);
    strokeWeight(sw);

    beginShape();
    for (let y = 0; y <= height; y += 3) {
      const dx = Waves.wave(y * 0.012, {
        wave:      threads[i].wave,
        t:         t + phase,
        amplitude: threads[i].amp,
        frequency: threads[i].freq
      });
      vertex(x0 + dx, y);
    }
    endShape();
  }
}

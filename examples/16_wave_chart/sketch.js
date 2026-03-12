// 16 — Wave Chart
// All 34 wave formulas rendered as animated bars simultaneously.
// Bar height = current output of each wave. A live reference chart.

function setup() {
  createCanvas(460, 460).parent('sketch-container');
  noStroke();
  textAlign(CENTER, TOP);
}

function draw() {
  background(245);

  const n    = Waves.count;   // 34
  const t    = frameCount * 0.016;
  const barW = width / n;
  const midY = height * 0.54;
  const amp  = height * 0.40;

  // Baseline
  stroke(200);
  strokeWeight(0.5);
  line(0, midY, width, midY);
  noStroke();

  colorMode(HSB, n, 100, 100);
  for (let i = 0; i < n; i++) {
    const v = Waves.wave(t * 28, { wave: i, range: [-amp, amp] });
    const h = abs(v);
    const y = v < 0 ? midY : midY - h;

    fill(i, 65, 78);
    rect(i * barW + 1, y, barW - 2, h);

    // Index label below baseline
    fill(0, 0, 59);
    textSize(7);
    text(i, i * barW + barW / 2, midY + 3);
  }
  colorMode(RGB, 255);
}

// Added Waves: three samplers, one surface. Shared by all three example views.
// Include p5.js, p5.waves.js and a <div data-added-waves></div> before this file.
function addedWavesSketch(p, host) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let broadWave;
  let fineWave;
  let roamingWave;
  let clothTime = 0;
  let paused = motion.matches;
  let visible = false;
  let fingerPresent = false;
  let fingerStrength = 0;
  let fingerX = 0;
  let fingerY = 0;
  let targetX = 0;
  let targetY = 0;
  let canvas;
  let pauseButton;

  function syncPlayback() {
    if (visible && !document.hidden && !paused) p.loop();
    else p.noLoop();
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    pauseButton.setAttribute('aria-pressed', String(paused));
  }

  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) * p.width / bounds.width;
    targetY = (event.clientY - bounds.top) * p.height / bounds.height;
    fingerPresent = true;
    if (paused) {
      fingerX = targetX;
      fingerY = targetY;
      fingerStrength = 1;
      p.redraw();
    }
  }

  function releasePointer() {
    fingerPresent = false;
    if (paused) {
      fingerStrength = 0;
      p.redraw();
    }
  }

  function resizeCloth() {
    const w = Math.max(1, Math.round(host.clientWidth));
    const h = Math.round(w < 600 ? w : w * 9 / 16);
    p.resizeCanvas(w, h);
    host.style.aspectRatio = w + ' / ' + h;
    fingerX = targetX = w * 0.5;
    fingerY = targetY = h * 0.5;
    if (paused || !visible) p.redraw();
  }

  p.setup = function() {
    const w = Math.max(1, Math.round(host.clientWidth));
    const surface = p.createCanvas(w, Math.round(w < 600 ? w : w * 9 / 16));
    canvas = surface.elt;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Three added waves form a moving fabric of light. Move your pointer to lift it.');
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    p.frameRate(30);
    broadWave = Waves.createSampler({
      wave: 'classic sine',
      range: [-1, 1]
    });
    fineWave = Waves.createSampler({
      wave: 'bumpy sine',
      range: [-1, 1]
    });
    roamingWave = Waves.createSampler({
      wave: 'wobble sine',
      range: [-1, 1]
    });
    fingerX = targetX = w * 0.5;
    fingerY = targetY = p.height * 0.5;

    pauseButton = document.createElement('button');
    pauseButton.type = 'button';
    pauseButton.className = 'added-waves-pause';
    pauseButton.setAttribute('aria-label', 'Pause animation');
    pauseButton.addEventListener('click', function() {
      paused = !paused;
      pauseButton.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
      syncPlayback();
    });
    host.appendChild(pauseButton);
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerleave', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);
    canvas.addEventListener('pointerup', function(event) {
      if (event.pointerType !== 'mouse') releasePointer();
    });
    motion.addEventListener('change', function(event) {
      paused = event.matches;
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    const observer = new IntersectionObserver(function(entries) {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resizeCloth);
    resizeObserver.observe(host);
    syncPlayback();
  };

  p.draw = function() {
    const elapsed = Math.min(p.deltaTime / 1000, 0.05);
    if (!paused) clothTime += elapsed;
    const easing = 1 - Math.exp(-elapsed * 5);
    fingerX += (targetX - fingerX) * easing;
    fingerY += (targetY - fingerY) * easing;
    fingerStrength += ((fingerPresent ? 1 : 0) - fingerStrength) * easing;
    p.background(8, 15, 34);

    const t = clothTime;
    const rows = Math.round(p.constrain(p.height * 0.48, 150, 300));
    const columns = Math.round(p.constrain(p.width / 5, 90, 240));
    const scale = Math.min(p.width * 0.8, p.height);
    const radius = Math.min(p.width, p.height) * 0.25;
    const ctx = p.drawingContext;
    ctx.lineWidth = p.width < 600 ? 0.55 : 0.65;

    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1);
      const edgeFade = Math.pow(Math.sin(Math.PI * v), 0.4);
      ctx.strokeStyle = 'rgba(238,229,209,' + (0.17 + edgeFade * 0.48) + ')';
      ctx.beginPath();
      for (let column = 0; column <= columns; column++) {
        const u = column / columns;
        const envelope = Math.pow(Math.sin(Math.PI * u), 0.65);

        // Every layer keeps its own scale, strength and speed.
        const broad = broadWave.sample(u * 76 + v * 26 - t * 2.6, 0);
        const fine = fineWave.sample(u * 164 - v * 42 + t * 3.2, 0);
        const roaming = roamingWave.sample(u * 46 + v * 38 - t * 1.3, 0);
        const displacement = broad * 0.125 + fine * 0.024 + roaming * 0.052;

        let px = p.width * (0.055 + u * 0.89);
        let py = p.height * (0.24 + v * 0.52);
        py += scale * envelope * displacement;
        py += scale * 0.085 * Math.sin(v * Math.PI) * (u - 0.5);
        px += scale * 0.026 * envelope * roaming;

        const dx = px - fingerX;
        const dy = py - fingerY;
        const lift = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        py -= lift * fingerStrength * scale * 0.105;
        px += lift * fingerStrength * dx * 0.09;
        if (column === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  };
}

const addedWavesHosts = document.querySelectorAll('[data-added-waves]');
for (let i = 0; i < addedWavesHosts.length; i++) {
  const host = addedWavesHosts[i];
  new p5(function(p) { addedWavesSketch(p, host); }, host);
}

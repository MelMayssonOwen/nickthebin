/* UK POLICE — tiny vanilla engine: low-res canvas, nearest-neighbour upscale,
 * window keyboard input (no focus/capture surprises), fixed-timestep loop that
 * I own and that never pauses on blur. Zero dependencies. */
window.UKP = window.UKP || {};
(function (UKP) {
  const VW = 480, VH = 270;
  UKP.VW = VW; UKP.VH = VH;

  // ---- input ----
  const GAME_CODES = new Set([
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'Enter', 'KeyR',
  ]);
  const held = Object.create(null);
  const pressedThisFrame = Object.create(null);
  let firstGesture = false;

  function onFirstGesture() {
    if (firstGesture) return;
    firstGesture = true;
    if (UKP.unlockAudio) UKP.unlockAudio();
  }

  window.addEventListener('keydown', (e) => {
    if (GAME_CODES.has(e.code)) e.preventDefault();   // stop the page scrolling on arrows/space
    onFirstGesture();
    if (!held[e.code]) pressedThisFrame[e.code] = true; // edge: ignore auto-repeat
    held[e.code] = true;
  }, { passive: false });

  window.addEventListener('keyup', (e) => { held[e.code] = false; });

  // if the window loses focus, drop all keys so nothing sticks down
  window.addEventListener('blur', () => { for (const k in held) held[k] = false; });

  UKP.input = {
    down(code) { return !!held[code]; },
    pressed(code) { return !!pressedThisFrame[code]; },
    anyPressed(codes) { return codes.some(c => pressedThisFrame[c]); },
    anyDown(codes) { return codes.some(c => held[c]); },
    _endFrame() { for (const k in pressedThisFrame) pressedThisFrame[k] = false; },
  };

  // ---- canvas ----
  let canvas, ctx;
  UKP.initCanvas = function (parentId) {
    canvas = document.createElement('canvas');
    canvas.width = VW; canvas.height = VH;
    canvas.id = 'screen';
    const parent = document.getElementById(parentId) || document.body;
    parent.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    UKP.ctx = ctx;

    canvas.addEventListener('pointerdown', () => { onFirstGesture(); window.focus(); });

    function fit() {
      // fractional scale to fill the window (pixelated rendering keeps it crisp)
      const scale = Math.max(1, Math.min(window.innerWidth / VW, window.innerHeight / VH));
      canvas.style.width = Math.round(VW * scale) + 'px';
      canvas.style.height = Math.round(VH * scale) + 'px';
    }
    window.addEventListener('resize', fit);
    fit();
    try { window.focus(); } catch (e) { /* ignore */ }
    return ctx;
  };

  // ---- fixed-timestep loop ----
  UKP.run = function (update, render) {
    const STEP = 1 / 60;
    let last = performance.now();
    let acc = 0;
    function frame(now) {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25; // avoid spiral after a tab-switch
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 5) { update(STEP); acc -= STEP; steps++; }
      if (steps === 0 && acc > 0) { /* still render */ }
      ctx.imageSmoothingEnabled = false;
      render(ctx);
      UKP.input._endFrame();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  // ---- helpers ----
  UKP.clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
  UKP.rand = (a, b) => a + Math.random() * (b - a);
  UKP.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  UKP.choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
})(window.UKP);

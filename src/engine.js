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

    // tapping the canvas advances menus (title/win/over) and unlocks audio
    canvas.addEventListener('pointerdown', () => { onFirstGesture(); try { window.focus(); } catch (e) { /* ignore */ } pressedThisFrame['Enter'] = true; });

    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', layout);
    setupTouch();
    layout();
    try { window.focus(); } catch (e) { /* ignore */ }
    return ctx;
  };

  function isCoarse() {
    return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
  }

  // Desktop / landscape: 480x270 fitted & centred (unchanged). Mobile portrait:
  // render at a portrait view width so the game fills the screen edge-to-edge.
  function layout() {
    if (!canvas) return;
    const w = window.innerWidth, h = window.innerHeight;
    const portrait = isCoarse() && h > w;
    const vw = portrait ? Math.max(120, Math.round(VH * w / h)) : 480;
    if (canvas.width !== vw) canvas.width = vw;
    if (canvas.height !== VH) canvas.height = VH;
    ctx.imageSmoothingEnabled = false;
    if (UKP.setWidth) UKP.setWidth(vw);
    if (portrait) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';     // fill the whole screen
    } else {
      const scale = Math.max(1, Math.min(w / vw, h / VH));
      canvas.style.width = Math.round(vw * scale) + 'px';
      canvas.style.height = Math.round(VH * scale) + 'px';
    }
    document.body.style.alignItems = 'center';
  }

  // ---- on-screen touch controls (touch devices only; desktop is untouched) ----
  function setupTouch() {
    if (!isCoarse()) return;
    document.documentElement.style.touchAction = 'none';

    const style = document.createElement('style');
    style.textContent =
      '#ctrl{position:fixed;inset:0;pointer-events:none;z-index:50;font-family:monospace;user-select:none;-webkit-user-select:none;}' +
      '.grp{position:fixed;bottom:4%;pointer-events:auto;display:flex;gap:14px;align-items:center;}' +
      '#gL{left:5%;}#gR{right:5%;}' +
      '.btn{display:flex;align-items:center;justify-content:center;width:68px;height:68px;font-size:30px;' +
      'background:rgba(18,20,28,0.4);color:#fff;border:2px solid rgba(255,255,255,0.6);border-radius:16px;' +
      'font-weight:bold;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;}' +
      '.btn:active{background:rgba(255,255,255,0.45);}' +
      '#bJ{font-size:16px;}#bA{width:82px;height:82px;font-size:16px;background:rgba(36,86,42,0.5);}';
    document.head.appendChild(style);

    const wrap = document.createElement('div'); wrap.id = 'ctrl';
    const gL = document.createElement('div'); gL.id = 'gL'; gL.className = 'grp';
    const gR = document.createElement('div'); gR.id = 'gR'; gR.className = 'grp';
    function mk(parent, id, label, code) {
      const b = document.createElement('div'); b.id = id; b.className = 'btn'; b.textContent = label;
      const on = (e) => { e.preventDefault(); e.stopPropagation(); if (!held[code]) pressedThisFrame[code] = true; held[code] = true; onFirstGesture(); };
      const off = (e) => { e.preventDefault(); e.stopPropagation(); held[code] = false; };
      b.addEventListener('touchstart', on, { passive: false });
      b.addEventListener('touchend', off, { passive: false });
      b.addEventListener('touchcancel', off, { passive: false });
      b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
      parent.appendChild(b);
    }
    mk(gL, 'bL', '◀', 'ArrowLeft');
    mk(gL, 'bR', '▶', 'ArrowRight');
    mk(gR, 'bJ', 'JUMP', 'ArrowUp');
    mk(gR, 'bA', 'BIN', 'Space');
    wrap.appendChild(gL); wrap.appendChild(gR);
    document.body.appendChild(wrap);
  }

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

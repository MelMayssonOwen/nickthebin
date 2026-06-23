/* Nick the Bin — chiptune sound effects via WebAudio. No audio files.
 * One shared AudioContext, resumed on the first user gesture (autoplay policy). */
window.UKP = window.UKP || {};

(function (UKP) {
  let ctx = null;
  let master = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { enabled = false; return null; }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Full unlock: create context + play a silent buffer + resume, all inside the gesture.
  UKP.unlockAudio = function () {
    const c = ac();
    if (!c) return;
    try {
      const b = c.createBuffer(1, 1, 22050);
      const s = c.createBufferSource(); s.buffer = b; s.connect(master); s.start(0);
    } catch (e) { /* ignore */ }
    if (c.state === 'suspended') c.resume();
  };
  // belt & braces: resume whenever the tab regains focus
  window.addEventListener('focus', function () { if (ctx && ctx.state === 'suspended') ctx.resume(); });
  document.addEventListener('visibilitychange', function () { if (ctx && ctx.state === 'suspended' && !document.hidden) ctx.resume(); });

  function tone(freq, dur, type, vol, when) {
    if (!enabled) return;
    const c = ac(); if (!c) return;
    const t0 = (c.currentTime + (when || 0));
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur);
  }
  function sweep(f1, f2, dur, type, vol, when) {
    if (!enabled) return;
    const c = ac(); if (!c) return;
    const t0 = (c.currentTime + (when || 0));
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
    g.gain.setValueAtTime(vol || 0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur);
  }
  // white-noise burst (crashes, smashes, hits)
  function noise(dur, vol, lp, when) {
    if (!enabled) return;
    const c = ac(); if (!c) return;
    const t0 = (c.currentTime + (when || 0));
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp || 2200;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur);
  }
  function arp(notes, step, dur, type, vol) {
    notes.forEach((f, i) => tone(f, dur, type || 'square', vol || 0.18, i * step));
  }

  UKP.sfx = {
    throw() { sweep(420, 760, 0.14, 'square', 0.14); },
    pickup() { tone(560, 0.05, 'square', 0.12); tone(760, 0.06, 'square', 0.12, 0.05); },
    hit() { noise(0.12, 0.18, 1800); sweep(300, 90, 0.16, 'sawtooth', 0.16); },
    bossHit() { noise(0.16, 0.22, 1400); sweep(220, 70, 0.2, 'sawtooth', 0.2); },
    hurt() { sweep(380, 110, 0.24, 'triangle', 0.2); },
    stomp() { noise(0.1, 0.2, 1200); sweep(200, 60, 0.16, 'square', 0.2); },
    jump() { sweep(300, 600, 0.12, 'square', 0.1); },
    punch() { sweep(240, 80, 0.1, 'square', 0.16); },
    brick() { tone(180, 0.05, 'square', 0.14); tone(120, 0.05, 'square', 0.12, 0.03); },
    charge() { sweep(120, 360, 0.6, 'sawtooth', 0.16); noise(0.6, 0.1, 600); },
    smash() { noise(0.22, 0.26, 2600); sweep(180, 50, 0.2, 'square', 0.2); },
    clang() { tone(1200, 0.05, 'square', 0.16); tone(900, 0.08, 'square', 0.12, 0.04); noise(0.06, 0.12, 4000); },
    collect() { arp([784, 1047, 1319], 0.06, 0.12, 'square', 0.16); },
    clear() { arp([523, 659, 784, 1047], 0.1, 0.16, 'square', 0.16); },
    win() { arp([523, 659, 784, 1047, 880, 1047, 1319], 0.13, 0.2, 'square', 0.18); },
    over() { arp([392, 311, 247, 196], 0.16, 0.24, 'triangle', 0.16); },
    siren() { sweep(640, 1040, 0.4, 'sine', 0.08); sweep(1040, 640, 0.4, 'sine', 0.08, 0.4); },
    title() { arp([392, 523, 659, 784], 0.09, 0.14, 'square', 0.14); },
    // crowd "OUT! OUT! OUT!" — three rhythmic low pulses with a rising punch
    chant() {
      for (let i = 0; i < 3; i++) {
        tone(160, 0.12, 'square', 0.18, i * 0.22);
        sweep(120, 220, 0.12, 'sawtooth', 0.12, i * 0.22);
        noise(0.08, 0.1, 800, i * 0.22);
      }
    },
  };
})(window.UKP);

/* UK POLICE — tiny WebAudio chiptune blips. No audio files.
 * One shared AudioContext, resumed on first user gesture (autoplay policy).
 */
window.UKP = window.UKP || {};

(function (UKP) {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { enabled = false; return null; }
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  UKP.unlockAudio = function () { ac(); };

  function blip(freq, dur, type, vol) {
    if (!enabled) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const gnode = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, c.currentTime);
    gnode.gain.setValueAtTime(vol || 0.12, c.currentTime);
    gnode.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(gnode); gnode.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  }

  function sweep(f1, f2, dur, type, vol) {
    if (!enabled) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const gnode = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    gnode.gain.setValueAtTime(vol || 0.12, c.currentTime);
    gnode.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(gnode); gnode.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur);
  }

  UKP.sfx = {
    throw() { sweep(420, 740, 0.14, 'square', 0.10); },
    pickup() { blip(620, 0.07, 'square', 0.09); },
    hit() { sweep(300, 90, 0.18, 'sawtooth', 0.16); },
    bossHit() { sweep(220, 70, 0.22, 'sawtooth', 0.18); },
    hurt() { sweep(360, 120, 0.22, 'triangle', 0.16); },
    jump() { sweep(300, 560, 0.12, 'square', 0.08); },
    clear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'square', 0.12), i * 110)); },
    over() { [392, 311, 247, 196].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.14), i * 160)); },
    siren() { sweep(700, 1100, 0.5, 'sine', 0.05); },
  };
})(window.UKP);

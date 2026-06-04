/* UK POLICE — NO NONSENSE (vanilla build)
 * Side-scrolling bin-throwing brawler. Dependency-free: own loop, own input,
 * pixel sprites + bitmap font. See README. */
window.UKP = window.UKP || {};
(function (UKP) {
  const VW = 480, VH = 270, HUD_H = 46, GROUND_Y = 246;
  const GRAV = 900, SPEED = 130, JUMP = -330;

  const COP_LINES = [
    "I DON'T THINK SO, MATE.", "OI! YOU'RE NICKED!", "NOT ON MY WATCH, SUNSHINE.",
    "'ELLO 'ELLO 'ELLO.", "MIND THE BINS, YOU MUPPET!", "STOP RIGHT THERE!",
    "THAT'S 80 QUID, MATE.",
  ];
  const COP_DOWN = ["BLIMEY!", "THAT'S NOT CRICKET!", "COR, ME HELMET!", "RIGHT, I'M OFF."];
  const BOSS_LINES = ["YOU'RE GOING DAHN THE NICK.", "I AM THE LAW.", "NICE TRY, SUNSHINE."];

  const STAGES = [
    { name: 'BRICK LANE', worldW: 2200, target: 6, copSpeed: 34, copMax: 3, spawn: 1.7, bossHp: 6, bossName: 'SGT. NONSENSE' },
    { name: 'CAMDEN HIGH ST', worldW: 2600, target: 8, copSpeed: 42, copMax: 4, spawn: 1.4, bossHp: 8, bossName: 'INSP. TRUNCHEON' },
    { name: 'WESTMINSTER', worldW: 3000, target: 10, copSpeed: 50, copMax: 5, spawn: 1.15, bossHp: 11, bossName: 'CHIEF PLOD' },
  ];

  const G = {
    state: 'title', t: 0, stageIndex: 0, score: 0,
    scrollX: 0, worldW: 2200, cfg: STAGES[0],
    player: null, cops: [], bins: [], projectiles: [], bubbles: [], props: { back: [], front: [] },
    defeated: 0, bossActive: false, boss: null, spawnT: 0, lineT: 0,
    msg: null, msgSub: '', msgT: 0, msgPersist: false,
  };
  UKP.G = G;

  const I = () => UKP.input;
  const sfx = () => UKP.sfx || {};

  function setMessage(text, sub, hold) {
    G.msg = text; G.msgSub = sub || '';
    if (hold == null) { G.msgPersist = true; G.msgT = 0; }
    else { G.msgPersist = false; G.msgT = hold; }
  }
  function clearMessage() { G.msg = null; G.msgPersist = false; G.msgT = 0; }
  function bubble(x, y, text, color) { G.bubbles.push({ x, y, text, color: color || '#ffffff', life: 1.6, max: 1.6 }); }

  // ---------------- lifecycle ----------------
  function startGame() {
    G.stageIndex = 0; G.score = 0;
    startStage();
  }
  function startStage() {
    const cfg = STAGES[G.stageIndex];
    G.cfg = cfg; G.worldW = cfg.worldW;
    G.player = { x: 80, y: GROUND_Y, vx: 0, vy: 0, facing: 1, onGround: true, carrying: null, hearts: 5, invuln: 0, action: 0, walkT: 0, walkF: 0, tex: 'man_idle' };
    G.cops = []; G.projectiles = []; G.bubbles = [];
    G.bins = [];
    const colors = ['bin_blue', 'bin_brown', 'bin_grey'];
    let n = 0;
    for (let x = 200; x < cfg.worldW - 160; x += 240) { G.bins.push({ x, y: GROUND_Y, key: colors[n % 3] }); n++; }
    // props
    G.props = { back: [], front: [] };
    G.props.back.push({ img: 'car', x: cfg.worldW - 120, y: GROUND_Y + 4 });
    G.props.back.push({ img: 'sign', x: 150, y: GROUND_Y + 4 });
    for (let x = 220; x < cfg.worldW; x += 360) G.props.front.push({ img: 'lamp', x, y: GROUND_Y + 4 });
    G.defeated = 0; G.bossActive = false; G.boss = null; G.spawnT = 0; G.lineT = 0; G.scrollX = 0;
    G.state = 'play';
    setMessage('STAGE ' + (G.stageIndex + 1), cfg.name, 1.7);
  }

  // ---------------- update ----------------
  function update(dt) {
    G.t += dt;
    // bubbles always animate
    for (const b of G.bubbles) { b.life -= dt; b.y -= 7 * dt; }
    G.bubbles = G.bubbles.filter(b => b.life > 0);

    if (G.state === 'title') {
      if (I().anyPressed(['Enter', 'Space'])) { sfx().pickup && sfx().pickup(); startGame(); }
      return;
    }
    if (G.state === 'clear') {
      if (I().anyPressed(['Enter', 'Space'])) { G.stageIndex++; startStage(); }
      return;
    }
    if (G.state === 'over' || G.state === 'win') {
      if (I().anyPressed(['Enter', 'Space', 'KeyR'])) { clearMessage(); G.state = 'title'; }
      return;
    }

    // ---- play ----
    if (G.msgT > 0) { G.msgT -= dt; if (G.msgT <= 0 && !G.msgPersist) clearMessage(); }

    const p = G.player;
    const left = I().anyDown(['ArrowLeft', 'KeyA']);
    const right = I().anyDown(['ArrowRight', 'KeyD']);
    const jump = I().anyPressed(['ArrowUp', 'KeyW']);
    const act = I().pressed('Space');

    p.vx = left ? -SPEED : right ? SPEED : 0;
    if (p.vx < 0) p.facing = -1; else if (p.vx > 0) p.facing = 1;
    if (jump && p.onGround) { p.vy = JUMP; p.onGround = false; sfx().jump && sfx().jump(); }

    p.vy += GRAV * dt;
    p.y += p.vy * dt;
    if (p.y >= GROUND_Y) { p.y = GROUND_Y; p.vy = 0; p.onGround = true; }
    p.x = UKP.clamp(p.x + p.vx * dt, 16, G.worldW - 16);
    if (p.invuln > 0) p.invuln -= dt;
    if (p.action > 0) p.action -= dt;
    if (act) doAction();

    // player animation
    if (p.action > 0) p.tex = 'man_throw';
    else if (!p.onGround) p.tex = 'man_idle';
    else if (p.vx !== 0) { p.walkT += dt; if (p.walkT > 0.12) { p.walkT = 0; p.walkF ^= 1; } p.tex = p.walkF ? 'man_walk1' : 'man_walk2'; }
    else p.tex = 'man_idle';

    // camera
    G.scrollX = UKP.clamp(p.x - 160, 0, Math.max(0, G.worldW - VW));

    updateProjectiles(dt);
    checkStomp();
    updateSpawns(dt);
    updateCops(dt);
  }

  // Jump on a copper's head -> he takes a knee. 3 knees and he's done.
  function checkStomp() {
    const p = G.player;
    if (p.vy <= 0) return; // only while falling
    for (const c of G.cops) {
      if (c.ko) continue;
      const copH = 44 * c.scale;
      const headTop = c.y - copH;
      if (Math.abs(p.x - c.x) < 11 + 4 * c.scale && p.y > headTop - 2 && p.y < headTop + 22 * c.scale) {
        stompCop(c);
        p.vy = -260; p.onGround = false; // bounce off his helmet
        break;
      }
    }
  }
  function stompCop(c) {
    sfx().stomp && sfx().stomp();
    if (c.isBoss) { c.kneel = 0.6; hitBoss(1); return; }
    c.knees += 1; c.kneel = 1.8; G.score += 50;
    if (c.knees >= 3) { koCop(c); return; }
    bubble(c.x, c.y - 50, c.knees === 1 ? 'OOF!' : 'OW! ME KNEES!', '#ffd23a');
  }

  function doAction() {
    const p = G.player;
    if (p.carrying) { throwBin(); return; }
    // nearest bin
    let near = null, nd = 28;
    for (const b of G.bins) { const d = Math.abs(b.x - p.x); if (d < nd) { nd = d; near = b; } }
    if (near) { p.carrying = near.key; G.bins = G.bins.filter(b => b !== near); p.action = 0.18; sfx().pickup && sfx().pickup(); return; }
    bash();
  }
  function throwBin() {
    const p = G.player;
    const key = p.carrying; p.carrying = null; p.action = 0.26; p.tex = 'man_throw';
    G.projectiles.push({ x: p.x + p.facing * 10, y: p.y - 36, vx: p.facing * 250, vy: -210, key, rot: 0 });
    sfx().throw && sfx().throw();
    if (Math.random() < 0.4) bubble(p.x, p.y - 50, 'HAVE IT!', '#ffffff');
  }
  function bash() {
    const p = G.player; p.action = 0.24; p.tex = 'man_throw';
    let hit = false;
    for (const c of G.cops) {
      if (c.ko) continue;
      const dx = (c.x - p.x) * p.facing;
      if (dx > -6 && dx < 30 && Math.abs(c.y - p.y) < 30) { c.isBoss ? hitBoss(1) : koCop(c); hit = true; }
    }
    if (!hit) sfx().throw && sfx().throw();
  }

  function updateProjectiles(dt) {
    for (const b of G.projectiles) {
      b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += dt * 9 * Math.sign(b.vx || 1);
      // cop collision
      for (const c of G.cops) {
        if (c.ko) continue;
        if (Math.abs(b.x - c.x) < 14 && Math.abs(b.y - (c.y - 22)) < 26) {
          b.dead = true; c.isBoss ? hitBoss(1) : koCop(c); break;
        }
      }
      if (!b.dead && b.y >= GROUND_Y) { b.dead = true; G.bins.push({ x: UKP.clamp(b.x, 16, G.worldW - 16), y: GROUND_Y, key: b.key }); }
      if (b.y > VH + 60) b.dead = true;
    }
    G.projectiles = G.projectiles.filter(b => !b.dead);
  }

  function updateSpawns(dt) {
    if (G.bossActive) return;
    G.spawnT += dt; G.lineT += dt;
    if (G.lineT >= 2.6) { G.lineT = 0; copChatter(); }
    if (G.spawnT >= G.cfg.spawn) {
      G.spawnT = 0;
      const alive = G.cops.filter(c => !c.ko && !c.isBoss).length;
      if (G.defeated >= G.cfg.target) startBoss();
      else if (alive < G.cfg.copMax) spawnCop(false);
    }
  }

  function spawnCop(boss) {
    const c = {
      x: UKP.clamp(G.scrollX + VW + 30, 20, G.worldW - 20), y: GROUND_Y,
      vx: 0, vy: 0, facing: -1, ko: false, isBoss: !!boss, scale: boss ? 1.5 : 1,
      hp: boss ? G.cfg.bossHp : 1, speed: boss ? G.cfg.copSpeed * 0.7 : G.cfg.copSpeed + UKP.randInt(-6, 10),
      nextPunch: 0, nextLine: G.t + UKP.rand(1.5, 4), flash: 0, walkT: 0, walkF: 0, punch: 0, tex: 'cop_idle', koT: 0, rot: 0,
      kneel: 0, knees: 0,
    };
    G.cops.push(c);
    return c;
  }

  function startBoss() {
    G.bossActive = true;
    G.boss = spawnCop(true);
    sfx().siren && sfx().siren();
    setMessage('VILLAIN!', G.cfg.bossName, 1.6);
    bubble(G.boss.x, G.boss.y - 60, UKP.choice(BOSS_LINES), '#ff8a3a');
  }

  function updateCops(dt) {
    const p = G.player;
    for (const c of G.cops) {
      if (c.flash > 0) c.flash -= dt;
      if (c.ko) {
        c.vy += GRAV * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += dt * 8 * (c.vx < 0 ? -1 : 1);
        c.koT -= dt;
        continue;
      }
      if (c.kneel > 0) { // stunned on one knee — can't chase or punch
        c.kneel -= dt; c.vx = 0; c.tex = 'cop_kneel';
        c.facing = (p.x < c.x) ? -1 : 1;
        continue;
      }
      const dx = p.x - c.x;
      const dir = dx < 0 ? -1 : 1;
      c.facing = dir;
      const range = c.isBoss ? 26 : 20;
      if (Math.abs(dx) > range) {
        c.vx = dir * c.speed; c.x += c.vx * dt;
        c.walkT += dt; if (c.walkT > 0.14) { c.walkT = 0; c.walkF ^= 1; }
        c.tex = c.walkF ? 'cop_walk1' : 'cop_walk2';
      } else {
        c.vx = 0;
        if (G.t > c.nextPunch && Math.abs(p.y - c.y) < 34) {
          c.punch = 0.18; c.nextPunch = G.t + (c.isBoss ? 0.9 : 1.2); hurtPlayer();
        }
        if (c.punch > 0) { c.punch -= dt; c.tex = 'cop_punch'; } else c.tex = 'cop_idle';
      }
      if (!c.isBoss && G.t > c.nextLine) { c.nextLine = G.t + UKP.rand(4, 8); if (Math.random() < 0.5) bubble(c.x, c.y - 50, UKP.choice(COP_LINES), '#cfe3ff'); }
    }
    G.cops = G.cops.filter(c => !(c.ko && c.koT <= 0));
  }

  function copChatter() {
    const list = G.cops.filter(c => !c.ko && !c.isBoss);
    if (!list.length) return;
    const c = UKP.choice(list);
    bubble(c.x, c.y - 50, UKP.choice(COP_LINES), '#cfe3ff');
  }

  function koCop(c) { koSprite(c); G.defeated++; G.score += 150; sfx().hit && sfx().hit(); if (Math.random() < 0.6) bubble(c.x, c.y - 50, UKP.choice(COP_DOWN), '#ffffff'); }
  function koSprite(c) { c.ko = true; c.vy = -200; c.vx = G.player.facing * 60; c.koT = 1.0; }

  function hitBoss(dmg) {
    const c = G.boss; if (!c) return;
    c.hp -= dmg; c.flash = 0.12; c.x += G.player.facing * 6; sfx().bossHit && sfx().bossHit(); G.score += 60;
    if (c.hp <= 0) defeatBoss();
    else if (Math.random() < 0.5) bubble(c.x, c.y - 60, UKP.choice(BOSS_LINES), '#ff8a3a');
  }
  function defeatBoss() {
    koSprite(G.boss); G.boss = null; G.bossActive = false; G.score += 1000;
    sfx().clear && sfx().clear();
    if (G.stageIndex + 1 < STAGES.length) { G.state = 'clear'; setMessage('STAGE CLEAR!', 'PRESS ENTER'); }
    else { G.state = 'win'; setMessage('NO NONSENSE!', 'YOU WIN - PRESS ENTER'); }
  }

  function hurtPlayer() {
    const p = G.player;
    if (p.invuln > 0) return;
    p.hearts -= 1; sfx().hurt && sfx().hurt();
    p.vx = -p.facing * 120; p.vy = -150; p.onGround = false;
    if (p.hearts <= 0) { gameOver(); return; }
    p.invuln = 0.9;
  }
  function gameOver() {
    G.state = 'over';
    setMessage('NICKED!', 'GAME OVER - PRESS ENTER');
    sfx().over && sfx().over();
  }

  // ---------------- render ----------------
  function spr(ctx, img, worldX, feetY, facing, scale, alpha, rot) {
    if (!img) return;
    scale = scale || 1;
    const w = img.width * scale, h = img.height * scale;
    const sx = Math.round(worldX - G.scrollX - w / 2), sy = Math.round(feetY - h);
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    if (rot) { ctx.translate(sx + w / 2, sy + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2); if (facing < 0) { ctx.translate(w, 0); ctx.scale(-1, 1); } ctx.drawImage(img, 0, 0, w, h); }
    else if (facing < 0) { ctx.translate(sx + w, sy); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); }
    else ctx.drawImage(img, sx, sy, w, h);
    ctx.restore();
  }

  function render(ctx) {
    const SP = UKP.SP;
    if (G.state === 'title') { renderTitle(ctx); return; }

    ctx.drawImage(SP.sky, 0, 0);
    // clouds (slow parallax)
    const cs = G.scrollX * 0.18;
    for (let i = 0; i < 6; i++) {
      ctx.drawImage(SP.cloud, Math.round(i * 150 - (cs % 150)), 56 + (i % 2) * 20);
    }
    // skyline
    const sk = G.scrollX * 0.4;
    for (let x = -((sk % 230) + 230) % 230; x < VW + 10; x += 230) ctx.drawImage(SP.skyline, Math.round(x), GROUND_Y - 96);
    // houses / wall / pavement (scroll 1)
    tile(ctx, SP.houses, 120, 110);
    tile(ctx, SP.wall, 40, 212);
    tile(ctx, SP.pave, 40, 246);
    ctx.fillStyle = UKP.C.ROAD; ctx.fillRect(0, 268, VW, VH - 268);
    // back props
    for (const pr of G.props.back) spr(ctx, SP[pr.img], pr.x, pr.y, 1, 1);
    // bins
    for (const b of G.bins) spr(ctx, SP[b.key], b.x, b.y, 1, 1);
    // cops
    for (const c of G.cops) {
      const a = c.ko ? Math.max(0, c.koT) : 1;
      spr(ctx, SP[c.tex], c.x, c.y, c.facing, c.scale, a, c.ko ? c.rot : 0);
      if (c.flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; spr(ctx, SP[c.tex], c.x, c.y, c.facing, c.scale, 0.5, 0); ctx.restore(); }
    }
    // projectiles
    for (const b of G.projectiles) spr(ctx, SP[b.key], b.x, b.y, 1, 1, 1, b.rot);
    // player
    const p = G.player;
    const pa = (p.invuln > 0 && Math.floor(p.invuln * 12) % 2) ? 0.3 : 1;
    if (p.carrying) spr(ctx, SP[p.carrying], p.x + p.facing * 2, p.y - 36, p.facing, 1, pa);
    spr(ctx, SP[p.tex], p.x, p.y, p.facing, 1, pa);
    // front props
    for (const pr of G.props.front) spr(ctx, SP[pr.img], pr.x, pr.y, 1, 1);
    // bubbles
    for (const b of G.bubbles) drawBubble(ctx, b);

    drawHUD(ctx);
    if (G.msg) drawMessage(ctx);
  }

  function tile(ctx, img, w, y) {
    const start = Math.floor(G.scrollX / w) * w;
    for (let wx = start; wx < G.scrollX + VW; wx += w) ctx.drawImage(img, Math.round(wx - G.scrollX), y);
  }

  function drawBubble(ctx, b) {
    const sx = Math.round(b.x - G.scrollX), w = UKP.textWidth(b.text, 1) + 6;
    const al = UKP.clamp(b.life / 0.5, 0, 1);
    ctx.save(); ctx.globalAlpha = al;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(Math.round(sx - w / 2), Math.round(b.y - 9), w, 11);
    UKP.drawTextCentered(ctx, b.text, sx, Math.round(b.y - 7), 1, '#ffffff');
    ctx.restore();
  }

  function drawHUD(ctx) {
    const SP = UKP.SP;
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, VW, HUD_H);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, HUD_H - 1, VW, 1);
    // left
    ctx.fillStyle = '#222a3a'; ctx.fillRect(6, 6, 30, 30);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(6.5, 6.5, 29, 29);
    ctx.drawImage(SP.portrait_man, 7, 7);
    UKP.drawText(ctx, 'BRITISH MAN', 42, 6, 1, '#ffffff');
    for (let i = 0; i < 5; i++) ctx.drawImage(i < G.player.hearts ? SP.heart : SP.heart_empty, 44 + i * 12, 18);
    UKP.drawText(ctx, 'SCORE ' + String(G.score).padStart(6, '0'), 42, 33, 1, '#ffd23a');
    // middle — big Union Jack
    ctx.drawImage(SP.flag, 216, 10, 36, 24);
    // right
    UKP.drawText(ctx, 'POLICE OFFICER', VW - 152, 6, 1, '#ff8a3a');
    UKP.drawText(ctx, 'VILLAIN', VW - 152, 17, 1, '#ff8a3a');
    ctx.fillStyle = '#222a3a'; ctx.fillRect(VW - 36, 6, 30, 30);
    ctx.strokeRect(VW - 35.5, 6.5, 29, 29);
    ctx.drawImage(SP.portrait_cop, VW - 35, 7);
    // boss bar
    const bx = VW - 152, by = 30, bw = 110;
    ctx.fillStyle = G.bossActive ? '#3a1414' : '#1a1f2a'; ctx.fillRect(bx, by, bw, 8);
    if (G.bossActive && G.boss) { ctx.fillStyle = '#e2502a'; ctx.fillRect(bx + 1, by + 1, Math.round((bw - 2) * Math.max(0, G.boss.hp / G.cfg.bossHp)), 6); }
    UKP.drawText(ctx, G.bossActive ? G.cfg.bossName : 'ON PATROL', bx, by, 1, '#ffd2c2');
  }

  function drawMessage(ctx) {
    UKP.drawTextCentered(ctx, G.msg, VW / 2, 116, 3, '#ffffff');
    if (G.msgSub) UKP.drawTextCentered(ctx, G.msgSub, VW / 2, 150, 1, '#ffd23a');
  }

  function renderTitle(ctx) {
    const SP = UKP.SP;
    ctx.drawImage(SP.sky, 0, 0);
    for (let x = 0; x < VW; x += 230) ctx.drawImage(SP.skyline, x, GROUND_Y - 96);
    ctx.drawImage(SP.cloud, 60, 36); ctx.drawImage(SP.cloud, 330, 60);
    for (let x = 0; x < VW; x += 40) ctx.drawImage(SP.pave, x, 246);
    ctx.fillStyle = UKP.C.ROAD; ctx.fillRect(0, 268, VW, VH - 268);
    const bob = Math.sin(G.t * 4) * 3;
    spr2(ctx, SP.man_idle, 120, 248 + bob, 1, 1.6);
    spr2(ctx, SP.bin_blue, 240, 210, 1, 1.4);
    spr2(ctx, SP.cop_idle, 360, 248 - bob, -1, 1.6);
    UKP.drawTextCentered(ctx, 'UK POLICE', VW / 2, 52, 4, '#ffffff');
    UKP.drawTextCentered(ctx, 'NO NONSENSE', VW / 2, 92, 2, '#ffd23a');
    if (Math.floor(G.t * 2) % 2 === 0) UKP.drawTextCentered(ctx, 'PRESS ENTER OR CLICK', VW / 2, 150, 1, '#ffffff');
    UKP.drawTextCentered(ctx, 'MOVE  ARROWS    JUMP  UP    BIN/BASH  SPACE', VW / 2, 175, 1, '#dfe6ee');
  }
  // simple non-camera sprite blit for the title screen
  function spr2(ctx, img, x, feetY, facing, scale) {
    const w = img.width * scale, h = img.height * scale;
    const dx = Math.round(x - w / 2), dy = Math.round(feetY - h);
    ctx.save();
    if (facing < 0) { ctx.translate(dx + w, dy); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); }
    else ctx.drawImage(img, dx, dy, w, h);
    ctx.restore();
  }

  // ---------------- boot ----------------
  UKP.start = function () {
    UKP.initCanvas('game');
    UKP.buildSprites(VW, VH);
    clearMessage();
    if (window.location.hash === '#play') startGame(); else G.state = 'title';
    UKP.run(update, render);
  };

  // deterministic test hook (lets a harness step the sim without relying on rAF cadence)
  UKP._test = { update, checkStomp, stompCop, spawnCop, koCop, startStage };

  if (document.readyState === 'complete' || document.readyState === 'interactive') UKP.start();
  else window.addEventListener('DOMContentLoaded', UKP.start);
})(window.UKP);

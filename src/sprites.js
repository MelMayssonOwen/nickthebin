/* UK POLICE — sprite + scenery factory.
 * Every sprite is pre-rendered once to a small offscreen <canvas> by painting
 * integer-aligned rects, then blitted with drawImage. No image files. */
window.UKP = window.UKP || {};
(function (UKP) {
  const C = {
    SKIN: '#e2a079', SKINSH: '#c07c54', HAIR: '#4a2f17', MUST: '#33210f',
    JACK: '#8a5126', JACKSH: '#5e3415', SHIRTB: '#1f356e', SHIRTR: '#c0263a', WHITE: '#eef0f2',
    JEANS: '#33538f', JEANSSH: '#274169', BOOT: '#281a0e', BLACK: '#141414',
    UNIF: '#20212b', UNIFSH: '#12131a', HELM: '#16161d', SILVER: '#c9ccd6',
    HEART: '#e23b3b', HEARTD: '#3a2630',
    GREY: '#b9bdc1', GREYD: '#8c9195', BROW: '#4a4a4a', GLASS: '#14141a', LENS: '#aebdc9',
    SUIT: '#23262e', SUITSH: '#14161c', TIE: '#c0263a', TIESH: '#8e1b2a',
    BRICK: '#7a4326', MORTAR: '#5c3320', PANE: '#bfe0f2', FRAME: '#ede9df', DOOR: '#274a8f', DOORK: '#16305f',
    HEDGE: '#3f7a3a', HEDGED: '#2d5a2a', WALL: '#8a5a36',
    PAVE: '#9aa0a6', PAVED: '#7d8389', ROAD: '#4a4d52',
    CLOUD: '#f4fbff', SKYLINE: '#32597f', SKYLINED: '#274a6b',
    CARW: '#eef1f4', CARB: '#163e9e', CARY: '#f3d23a', LIGHTB: '#2b6fe0', LIGHTR: '#d83a3a', TIRE: '#16181c',
    BINB: '#2f6fd0', BINBL: '#4a87de', BINBD: '#23509c',
    BINR: '#6b4a2a', BINRL: '#84603a', BINRD: '#4f3720',
    BING: '#888f97', BINGL: '#a6acb2', BINGD: '#60656c', LIDK: '#141414',
    LAMP: '#202028', LAMPG: '#f7e08a', SIGN: '#f2f2ee', SIGNB: '#202020',
  };
  UKP.C = C;

  function make(w, h, draw) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    draw(cx);
    return cv;
  }
  function R(cx, c, x, y, w, h) { cx.fillStyle = c; cx.fillRect(x, y, w, h); }
  // paint a baked pixel grid (rows of hex strings / null) one fillRect per cell
  function drawPixels(cx, grid, ox, oy) {
    if (!grid) return;
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) { const c = row[x]; if (c) { cx.fillStyle = c; cx.fillRect(ox + x, oy + y, 1, 1); } }
    }
  }

  // ---- British Man parts (24x42, feet at bottom) ----
  function manHead(g) {
    R(g, C.HAIR, 7, 2, 10, 3);
    R(g, C.HAIR, 7, 5, 2, 6); R(g, C.HAIR, 15, 5, 2, 6);
    R(g, C.SKIN, 9, 5, 6, 9);
    R(g, C.HAIR, 9, 5, 6, 2);
    R(g, C.BLACK, 10, 8, 1, 2); R(g, C.BLACK, 13, 8, 1, 2);
    R(g, C.MUST, 9, 11, 6, 2);
    R(g, C.SKINSH, 11, 10, 2, 1);
  }
  function manTorso(g) {
    // open leather jacket: side panels + collar, jumper shows down the middle
    R(g, C.JACK, 5, 16, 4, 14); R(g, C.JACK, 15, 16, 4, 14);
    R(g, C.JACKSH, 17, 16, 2, 14);
    R(g, C.JACK, 5, 16, 14, 2);
    // Union Jack jumper (centre, prominent)
    const jx = 8, jy = 18, jw = 8, jh = 12;
    R(g, C.SHIRTB, jx, jy, jw, jh);
    R(g, C.WHITE, jx, jy, 2, 2); R(g, C.WHITE, jx + jw - 2, jy, 2, 2);
    R(g, C.WHITE, jx, jy + jh - 2, 2, 2); R(g, C.WHITE, jx + jw - 2, jy + jh - 2, 2, 2);
    R(g, C.WHITE, jx + 2, jy, 4, jh);
    R(g, C.WHITE, jx, jy + 4, jw, 4);
    R(g, C.SHIRTR, jx + 3, jy, 2, jh);
    R(g, C.SHIRTR, jx, jy + 5, jw, 2);
  }
  function manArmsGuard(g) {
    R(g, C.JACK, 4, 16, 3, 7); R(g, C.JACK, 4, 12, 3, 5); R(g, C.SKIN, 4, 10, 3, 3);
    R(g, C.JACK, 17, 16, 3, 7); R(g, C.JACK, 17, 12, 3, 5); R(g, C.SKIN, 17, 10, 3, 3);
  }
  function manArmsThrow(g) {
    R(g, C.JACK, 5, 10, 3, 8); R(g, C.JACK, 5, 4, 3, 7); R(g, C.SKIN, 5, 2, 3, 3);
    R(g, C.JACK, 16, 10, 3, 8); R(g, C.JACK, 16, 4, 3, 7); R(g, C.SKIN, 16, 2, 3, 3);
  }
  function manLegs(g, pose) {
    if (pose === 1) {
      R(g, C.JEANS, 7, 30, 4, 9); R(g, C.BOOT, 6, 39, 5, 3);
      R(g, C.JEANS, 13, 31, 4, 8); R(g, C.BOOT, 13, 40, 5, 2);
    } else if (pose === 2) {
      R(g, C.JEANS, 7, 31, 4, 8); R(g, C.BOOT, 6, 40, 5, 2);
      R(g, C.JEANS, 13, 30, 4, 9); R(g, C.BOOT, 13, 39, 5, 3);
    } else {
      R(g, C.JEANS, 8, 30, 4, 9); R(g, C.JEANS, 13, 30, 4, 9);
      R(g, C.JEANSSH, 16, 30, 1, 9);
      R(g, C.BOOT, 7, 39, 5, 3); R(g, C.BOOT, 13, 39, 5, 3);
    }
  }

  // ---- Officer / boss shared body parts (24x44) ----
  function headCop(g) {
    R(g, C.HELM, 7, 1, 10, 8);
    R(g, C.BLACK, 7, 1, 1, 8); R(g, C.BLACK, 16, 1, 1, 8);
    R(g, C.SILVER, 11, 3, 2, 4);
    R(g, C.BLACK, 6, 9, 12, 2);
    R(g, C.SKIN, 9, 11, 6, 6);
    R(g, C.BLACK, 10, 13, 1, 2); R(g, C.BLACK, 13, 13, 1, 2);
    R(g, C.MUST, 9, 16, 6, 1);
  }
  // Boss head: a pixelated photo of the real Keir Starmer (20x24, oval-masked)
  function headBoss(g) {
    if (UKP.STARMER_HEAD) { drawPixels(g, UKP.STARMER_HEAD, 2, -1); return; }
    // fallback: drawn likeness (silver hair, glasses, clean-shaven)
    R(g, C.GREY, 6, 1, 12, 4); R(g, C.SKIN, 8, 5, 8, 10);
    R(g, C.GLASS, 8, 8, 8, 3); R(g, C.LENS, 9, 9, 2, 1); R(g, C.LENS, 13, 9, 2, 1);
  }
  function torsoCop(g) {
    R(g, C.UNIF, 5, 18, 14, 14);
    R(g, C.UNIFSH, 16, 18, 3, 14);
    R(g, C.BLACK, 8, 18, 8, 1);
    R(g, C.SILVER, 11, 20, 1, 1); R(g, C.SILVER, 11, 23, 1, 1); R(g, C.SILVER, 11, 26, 1, 1);
  }
  // Boss: charcoal suit, white shirt, red tie
  function torsoBoss(g) {
    R(g, C.SUIT, 5, 17, 14, 15);
    R(g, C.SUITSH, 16, 17, 3, 15);
    R(g, C.WHITE, 10, 17, 4, 9);
    R(g, C.SUIT, 9, 17, 2, 6); R(g, C.SUIT, 14, 17, 2, 6);
    R(g, C.TIE, 11, 18, 2, 10); R(g, C.TIESH, 11, 26, 2, 2); R(g, C.TIE, 11, 17, 2, 1);
  }
  function armsGuardU(g, col) {
    R(g, col, 4, 18, 3, 7); R(g, col, 4, 13, 3, 5); R(g, C.SKIN, 4, 11, 3, 3);
    R(g, col, 17, 18, 3, 7); R(g, col, 17, 13, 3, 5); R(g, C.SKIN, 17, 11, 3, 3);
  }
  function armsPunchU(g, col) {
    R(g, col, 2, 19, 5, 3); R(g, C.SKIN, 0, 19, 3, 3);
    R(g, col, 17, 18, 3, 7); R(g, col, 17, 15, 3, 4); R(g, C.SKIN, 17, 13, 3, 3);
  }
  function legsU(g, pose, col, sh) {
    if (pose === 1) {
      R(g, col, 7, 32, 4, 10); R(g, C.BLACK, 6, 42, 5, 2);
      R(g, col, 13, 33, 4, 9); R(g, C.BLACK, 13, 43, 5, 1);
    } else if (pose === 2) {
      R(g, col, 7, 33, 4, 9); R(g, C.BLACK, 6, 43, 5, 1);
      R(g, col, 13, 32, 4, 10); R(g, C.BLACK, 13, 42, 5, 2);
    } else {
      R(g, col, 8, 32, 4, 10); R(g, col, 13, 32, 4, 10);
      R(g, sh, 16, 32, 1, 10);
      R(g, C.BLACK, 7, 42, 5, 2); R(g, C.BLACK, 13, 42, 5, 2);
    }
  }
  // genuine one-knee pose: back knee on the ground, front foot planted, torso upright
  function kneelU(g, headFn, col, sh) {
    R(g, col, 6, 30, 4, 8);
    R(g, col, 5, 38, 6, 3);
    R(g, C.BLACK, 4, 41, 7, 3);
    R(g, col, 11, 31, 5, 4);
    R(g, col, 14, 34, 4, 8);
    R(g, C.BLACK, 13, 42, 6, 2);
    R(g, col, 7, 17, 12, 14);
    R(g, sh, 16, 17, 3, 14);
    R(g, col, 16, 19, 3, 8); R(g, C.SKIN, 16, 27, 3, 2);
    R(g, col, 10, 23, 3, 5); R(g, C.SKIN, 11, 28, 3, 2);
    g.save(); g.translate(0, 7); headFn(g); g.restore();
  }

  function bin(g, body, light, dark) {
    // lid (overhangs slightly)
    R(g, C.LIDK, 1, 0, 16, 1);
    R(g, dark, 1, 1, 16, 3);
    // body
    R(g, body, 3, 4, 12, 14);
    R(g, light, 3, 4, 2, 14);
    R(g, dark, 13, 4, 2, 14);
    R(g, body, 4, 18, 10, 2);
    // one big wheel, on one side (the back)
    R(g, '#0c0c0c', 2, 16, 8, 8);
    R(g, '#2a2a2a', 3, 17, 6, 6);
    R(g, '#5a5a5a', 4, 18, 4, 4);
    R(g, '#0c0c0c', 5, 19, 2, 2);
  }

  // uniform add-ons (drawn over the cop torso)
  function vestHivis(g) {
    R(g, '#e9e02a', 5, 18, 13, 13);
    R(g, '#cfc722', 16, 18, 2, 13);
    R(g, '#eef0f2', 5, 22, 13, 1); R(g, '#eef0f2', 5, 27, 13, 1);
    R(g, '#9aa0a6', 8, 18, 1, 13); R(g, '#9aa0a6', 14, 18, 1, 13);
  }
  // a riot shield held up on the front side
  function riotShield(g) {
    R(g, '#16181d', 1, 14, 9, 24);
    R(g, '#2c3038', 2, 15, 7, 22);
    R(g, '#4a505a', 2, 15, 7, 2);
    R(g, '#aeb6c0', 3, 19, 5, 9);
    R(g, '#3a3f47', 3, 30, 5, 5);
  }
  function heart(g, col) {
    R(g, col, 1, 1, 2, 2); R(g, col, 6, 1, 2, 2);
    R(g, col, 0, 2, 9, 2); R(g, col, 1, 4, 7, 1);
    R(g, col, 2, 5, 5, 1); R(g, col, 3, 6, 3, 1); R(g, col, 4, 7, 1, 1);
  }
  function flagUK(g) {
    R(g, C.SHIRTB, 0, 0, 18, 12);
    R(g, C.WHITE, 0, 0, 3, 2); R(g, C.WHITE, 15, 0, 3, 2);
    R(g, C.WHITE, 0, 10, 3, 2); R(g, C.WHITE, 15, 10, 3, 2);
    R(g, C.WHITE, 7, 0, 4, 12); R(g, C.WHITE, 0, 4, 18, 4);
    R(g, C.SHIRTR, 8, 0, 2, 12); R(g, C.SHIRTR, 0, 5, 18, 2);
  }
  function portraitMan(g) {
    R(g, C.HAIR, 6, 3, 16, 4);
    R(g, C.HAIR, 6, 7, 3, 10); R(g, C.HAIR, 19, 7, 3, 10);
    R(g, C.SKIN, 9, 7, 10, 13);
    R(g, C.BLACK, 11, 11, 2, 2); R(g, C.BLACK, 15, 11, 2, 2);
    R(g, C.MUST, 9, 15, 10, 3);
    R(g, C.JACK, 4, 21, 20, 7);
    R(g, C.SHIRTB, 11, 21, 6, 7);
    R(g, C.WHITE, 13, 21, 2, 7); R(g, C.WHITE, 11, 23, 6, 2);
    R(g, C.SHIRTR, 12, 22, 4, 3);
  }
  function portraitCop(g) {
    R(g, C.HELM, 7, 1, 14, 11);
    R(g, C.SILVER, 12, 4, 4, 5);
    R(g, C.BLACK, 5, 12, 18, 3);
    R(g, C.SKIN, 9, 15, 10, 9);
    R(g, C.BLACK, 11, 18, 2, 2); R(g, C.BLACK, 15, 18, 2, 2);
    R(g, C.MUST, 9, 21, 10, 2);
    R(g, C.UNIF, 4, 24, 20, 4);
  }
  function portraitBoss(g) { drawPixels(g, UKP.STARMER_PORTRAIT, 0, 0); } // pixelated real photo

  UKP.SP = {};

  UKP.buildSprites = function (VW, VH) {
    const S = UKP.SP;
    S.man_idle = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 0); manHead(g); });
    S.man_walk1 = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 1); manHead(g); });
    S.man_walk2 = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 2); manHead(g); });
    S.man_throw = make(24, 42, g => { manTorso(g); manLegs(g, 0); manArmsThrow(g); manHead(g); });

    const U = C.UNIF, US = C.UNIFSH, SU = C.SUIT, SS = C.SUITSH;
    S.cop_idle = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 0, U, US); headCop(g); });
    S.cop_walk1 = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 1, U, US); headCop(g); });
    S.cop_walk2 = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 2, U, US); headCop(g); });
    S.cop_punch = make(24, 44, g => { torsoCop(g); armsPunchU(g, U); legsU(g, 0, U, US); headCop(g); });
    S.cop_kneel = make(24, 44, g => kneelU(g, headCop, U, US));

    // hi-vis variant (yellow vest over the uniform)
    S.cophivis_idle = make(24, 44, g => { torsoCop(g); vestHivis(g); armsGuardU(g, U); legsU(g, 0, U, US); headCop(g); });
    S.cophivis_walk1 = make(24, 44, g => { torsoCop(g); vestHivis(g); armsGuardU(g, U); legsU(g, 1, U, US); headCop(g); });
    S.cophivis_walk2 = make(24, 44, g => { torsoCop(g); vestHivis(g); armsGuardU(g, U); legsU(g, 2, U, US); headCop(g); });
    S.cophivis_punch = make(24, 44, g => { torsoCop(g); vestHivis(g); armsPunchU(g, U); legsU(g, 0, U, US); headCop(g); });

    // riot variant (anti-émeute shield)
    S.copshield_idle = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 0, U, US); headCop(g); riotShield(g); });
    S.copshield_walk1 = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 1, U, US); headCop(g); riotShield(g); });
    S.copshield_walk2 = make(24, 44, g => { torsoCop(g); armsGuardU(g, U); legsU(g, 2, U, US); headCop(g); riotShield(g); });
    S.copshield_punch = make(24, 44, g => { torsoCop(g); armsPunchU(g, U); legsU(g, 0, U, US); headCop(g); riotShield(g); });

    S.boss_idle = make(24, 44, g => { torsoBoss(g); armsGuardU(g, SU); legsU(g, 0, SU, SS); headBoss(g); });
    S.boss_walk1 = make(24, 44, g => { torsoBoss(g); armsGuardU(g, SU); legsU(g, 1, SU, SS); headBoss(g); });
    S.boss_walk2 = make(24, 44, g => { torsoBoss(g); armsGuardU(g, SU); legsU(g, 2, SU, SS); headBoss(g); });
    S.boss_punch = make(24, 44, g => { torsoBoss(g); armsPunchU(g, SU); legsU(g, 0, SU, SS); headBoss(g); });
    S.boss_kneel = make(24, 44, g => kneelU(g, headBoss, SU, SS));

    S.bin_blue = make(18, 24, g => bin(g, C.BINB, C.BINBL, C.BINBD));
    S.bin_brown = make(18, 24, g => bin(g, C.BINR, C.BINRL, C.BINRD));
    S.bin_grey = make(18, 24, g => bin(g, C.BING, C.BINGL, C.BINGD));

    S.heart = make(9, 8, g => heart(g, C.HEART));
    S.heart_empty = make(9, 8, g => heart(g, C.HEARTD));
    S.flag = make(18, 12, flagUK);
    S.portrait_man = make(28, 28, portraitMan);
    S.portrait_cop = make(28, 28, portraitCop);
    S.portrait_boss = make(34, 34, portraitBoss);

    // ---------- scenery ----------
    S.sky = make(VW, VH, g => {
      const grd = g.createLinearGradient(0, 0, 0, VH);
      grd.addColorStop(0, '#3f9fe6'); grd.addColorStop(0.62, '#8fcdf0'); grd.addColorStop(1, '#cfeafa');
      g.fillStyle = grd; g.fillRect(0, 0, VW, VH);
    });
    S.cloud = make(60, 22, g => {
      R(g, C.CLOUD, 10, 8, 40, 10); R(g, C.CLOUD, 18, 3, 24, 8);
      R(g, C.CLOUD, 4, 12, 52, 6); R(g, '#dcecf7', 4, 16, 52, 2);
    });
    // landmark skylines (200x90, base ~y82, landmark rises into the sky above the rooftops)
    const Sc = C.SKYLINE, SD = C.SKYLINED, WH = C.CLOUD;
    S.sky_generic = make(200, 90, g => {
      R(g, Sc, 0, 66, 200, 24);
      for (let x = 2; x < 200; x += 24) { R(g, SD, x, 54, 16, 14); R(g, Sc, x + 10, 46, 4, 10); }
    });
    S.sky_bigben = make(200, 90, g => {
      R(g, Sc, 0, 60, 116, 30);
      for (let i = 0; i < 7; i++) R(g, SD, 6 + i * 15, 52, 7, 10);
      R(g, Sc, 150, 16, 22, 74);
      R(g, SD, 150, 30, 22, 3);
      R(g, WH, 156, 32, 9, 9); R(g, SD, 160, 34, 1, 4); R(g, SD, 161, 37, 3, 1);
      R(g, Sc, 153, 6, 16, 12);
      R(g, Sc, 158, 0, 6, 8);
      R(g, Sc, 176, 50, 24, 40);
      for (let i = 0; i < 3; i++) R(g, SD, 180 + i * 7, 44, 4, 8);
    });
    S.sky_eye = make(200, 90, g => {
      g.strokeStyle = Sc; g.fillStyle = Sc;
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(86, 90); g.lineTo(100, 44); g.moveTo(114, 90); g.lineTo(100, 44); g.stroke();
      R(g, SD, 96, 40, 8, 8);
      g.lineWidth = 3; g.beginPath(); g.arc(100, 42, 34, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1; g.beginPath();
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.moveTo(100, 42); g.lineTo(100 + Math.cos(a) * 34, 42 + Math.sin(a) * 34); }
      g.stroke();
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; R(g, SD, Math.round(100 + Math.cos(a) * 34) - 2, Math.round(42 + Math.sin(a) * 34) - 2, 4, 4); }
      R(g, Sc, 0, 82, 200, 8);
    });
    S.sky_bridge = make(200, 90, g => {
      R(g, Sc, 0, 80, 200, 10);
      const tower = (tx) => {
        R(g, Sc, tx, 30, 26, 52); R(g, SD, tx + 5, 40, 16, 28);
        R(g, Sc, tx - 2, 26, 30, 6); R(g, Sc, tx + 5, 16, 16, 12);
        R(g, Sc, tx + 10, 8, 6, 10);
        R(g, Sc, tx, 18, 4, 8); R(g, Sc, tx + 22, 18, 4, 8);
      };
      tower(40); tower(134);
      R(g, Sc, 66, 30, 68, 6); R(g, Sc, 66, 64, 68, 6);
      g.strokeStyle = Sc; g.lineWidth = 2;
      g.beginPath(); g.moveTo(2, 72); g.lineTo(40, 48); g.moveTo(160, 48); g.lineTo(198, 72); g.stroke();
    });
    S.sky_downing = make(200, 90, g => {
      R(g, Sc, 0, 40, 200, 50);
      for (let x = 6; x < 200; x += 22) R(g, SD, x, 28, 6, 12);
      for (let x = 8; x < 200; x += 22) for (let y = 48; y < 84; y += 14) R(g, SD, x, y, 8, 8);
      R(g, Sc, 99, 12, 2, 28);
      R(g, WH, 101, 12, 16, 10);
      R(g, C.SHIRTB, 101, 12, 16, 4); R(g, C.SHIRTR, 101, 17, 16, 2); R(g, C.SHIRTR, 108, 12, 2, 10);
    });
    S.houses = make(120, 120, g => {
      R(g, C.BRICK, 0, 0, 120, 120);
      for (let y = 0; y < 120; y += 6) R(g, C.MORTAR, 0, y, 120, 1);
      for (let y = 0; y < 120; y += 12) for (let x = 0; x < 120; x += 12) R(g, C.MORTAR, x, y, 1, 6);
      for (let y = 6; y < 120; y += 12) for (let x = 6; x < 120; x += 12) R(g, C.MORTAR, x, y, 1, 6);
      R(g, '#5c3320', 0, 0, 120, 4);
      const win = (x, y) => {
        R(g, C.FRAME, x - 1, y - 1, 22, 26); R(g, C.PANE, x, y, 20, 24);
        R(g, '#9cc6de', x, y, 20, 2); R(g, C.FRAME, x + 9, y, 2, 24); R(g, C.FRAME, x, y + 11, 20, 2);
      };
      win(14, 16); win(70, 16); win(14, 64);
      R(g, C.DOORK, 70, 64, 22, 52); R(g, C.DOOR, 71, 65, 20, 51);
      R(g, C.FRAME, 73, 67, 16, 22); R(g, '#cdb24a', 88, 92, 2, 3);
    });
    S.wall = make(40, 28, g => {
      R(g, C.HEDGE, 0, 0, 40, 14); R(g, C.HEDGED, 0, 0, 40, 3);
      for (let x = 2; x < 40; x += 6) R(g, '#4f8c46', x, 4, 3, 6);
      R(g, C.WALL, 0, 14, 40, 14); R(g, '#6e4429', 0, 14, 40, 2);
      for (let x = 0; x < 40; x += 10) R(g, '#6e4429', x, 14, 1, 14);
    });
    S.pave = make(40, 28, g => {
      R(g, C.PAVE, 0, 0, 40, 28); R(g, C.PAVED, 0, 0, 40, 2);
      R(g, C.PAVED, 0, 0, 1, 28); R(g, C.PAVED, 20, 0, 1, 28); R(g, '#b4b9be', 2, 3, 16, 1);
    });
    S.lamp = make(18, 96, g => {
      R(g, C.LAMP, 7, 8, 4, 84); R(g, C.LAMP, 4, 90, 10, 4);
      R(g, C.LAMP, 3, 2, 12, 8); R(g, C.LAMPG, 5, 4, 8, 5); R(g, '#fff4c2', 6, 5, 6, 3);
    });
    S.sign = make(46, 60, g => {
      R(g, '#9a9a9a', 21, 22, 4, 38); R(g, C.SIGNB, 0, 0, 46, 24); R(g, C.SIGN, 2, 2, 42, 20);
    }); // text drawn per-stage at render time
    S.car = make(76, 40, g => {
      R(g, C.TIRE, 12, 34, 12, 6); R(g, C.TIRE, 52, 34, 12, 6);
      R(g, '#55585c', 15, 36, 6, 2); R(g, '#55585c', 55, 36, 6, 2);
      R(g, C.CARW, 2, 20, 72, 16);
      R(g, '#cdd2d6', 14, 10, 48, 12);
      R(g, '#2b3a52', 17, 12, 18, 8); R(g, '#2b3a52', 40, 12, 18, 8);
      for (let i = 0; i < 9; i++) {
        const x = 4 + i * 8;
        R(g, (i % 2 === 0) ? C.CARY : C.CARB, x, 24, 8, 6);
        R(g, (i % 2 === 0) ? C.CARB : C.CARY, x, 30, 8, 4);
      }
      R(g, '#1a1a1a', 26, 6, 24, 5); R(g, C.LIGHTB, 28, 7, 8, 3); R(g, C.LIGHTR, 40, 7, 8, 3);
      R(g, '#111111', 2, 22, 2, 12); R(g, '#111111', 72, 22, 2, 12);
      UKP.drawTextCentered(g, 'POLICE', 38, 26, 1, '#163e9e');
    });

    // ====== per-level environment tiles ======
    // 10 Downing Street: dark Georgian brick + the famous black No.10 door
    S.bld_downing = make(120, 120, g => {
      R(g, '#37302c', 0, 0, 120, 120);
      for (let y = 0; y < 120; y += 6) R(g, '#241d19', 0, y, 120, 1);
      for (let y = 0; y < 120; y += 12) for (let x = 0; x < 120; x += 12) R(g, '#241d19', x, y, 1, 6);
      for (let y = 6; y < 120; y += 12) for (let x = 6; x < 120; x += 12) R(g, '#241d19', x, y, 1, 6);
      R(g, '#241d19', 0, 0, 120, 4);
      const win = (x, y) => {
        R(g, '#e8e6df', x - 1, y - 1, 20, 26); R(g, '#bcd2de', x, y, 18, 24);
        R(g, '#e8e6df', x + 8, y, 2, 24); R(g, '#e8e6df', x, y + 7, 18, 2); R(g, '#e8e6df', x, y + 15, 18, 2);
      };
      win(16, 16); win(72, 16); win(16, 64);
      R(g, '#e8e6df', 67, 56, 28, 60);
      R(g, '#0e0e10', 71, 62, 20, 54);
      R(g, '#1c1c20', 73, 64, 7, 22); R(g, '#1c1c20', 82, 64, 7, 22);
      R(g, '#1c1c20', 73, 90, 7, 16); R(g, '#1c1c20', 82, 90, 7, 16);
      R(g, '#c9a23a', 88, 92, 2, 3);
      R(g, '#e8e6df', 71, 56, 20, 4);
      UKP.drawTextCentered(g, '10', 81, 66, 1, '#e8e6df');
    });
    S.rail_iron = make(40, 28, g => {
      R(g, '#2a2622', 0, 22, 40, 6);
      R(g, '#15161a', 0, 2, 40, 3);
      for (let x = 2; x < 40; x += 5) { R(g, '#15161a', x, 2, 2, 22); R(g, '#15161a', x, 0, 2, 2); }
    });
    S.pave_dark = make(40, 28, g => {
      R(g, '#5a5e63', 0, 0, 40, 28); R(g, '#454a4f', 0, 0, 40, 2);
      R(g, '#454a4f', 0, 0, 1, 28); R(g, '#454a4f', 20, 0, 1, 28);
    });
    // Riverside (London Eye): Thames + Victorian embankment
    S.bld_river = make(120, 120, g => {
      R(g, '#3f6f93', 0, 0, 120, 52);
      for (let x = 0; x < 120; x += 8) R(g, '#5a86a8', x, 14 + ((x / 8) % 3) * 9, 5, 1);
      R(g, '#7e8aa0', 0, 46, 120, 3);
      R(g, '#c7bd9c', 0, 52, 120, 68);
      R(g, '#a89c78', 0, 52, 120, 3);
      for (let x = 0; x < 120; x += 24) { R(g, '#a89c78', x + 8, 60, 8, 50); R(g, '#9a8e6c', x + 9, 62, 6, 44); }
    });
    S.rail_stone = make(40, 28, g => {
      R(g, '#c7bd9c', 0, 22, 40, 6); R(g, '#c7bd9c', 0, 0, 40, 4);
      for (let x = 3; x < 40; x += 8) R(g, '#b3a884', x, 4, 4, 18);
    });
    S.pave_stone = make(40, 28, g => {
      R(g, '#cabf9e', 0, 0, 40, 28); R(g, '#b3a884', 0, 0, 40, 2);
      R(g, '#b3a884', 0, 0, 1, 28); R(g, '#b3a884', 20, 0, 1, 28);
    });
    // Tower Bridge: river + blue steelwork
    S.bld_bridge = make(120, 120, g => {
      R(g, '#3f6f93', 0, 0, 120, 40);
      for (let x = 0; x < 120; x += 8) R(g, '#5a86a8', x, 12 + ((x / 8) % 3) * 7, 5, 1);
      R(g, '#27407a', 0, 40, 120, 80);
      R(g, '#3556a0', 0, 40, 120, 6);
      for (let x = 4; x < 120; x += 12) R(g, '#1d3060', x, 50, 3, 70);
      g.strokeStyle = '#3556a0'; g.lineWidth = 2; g.beginPath();
      for (let x = 0; x <= 120; x += 20) g.lineTo(x, 44 + Math.abs((x % 40) - 20) / 3);
      g.stroke();
    });
    S.rail_blue = make(40, 28, g => {
      R(g, '#27407a', 0, 22, 40, 6); R(g, '#3556a0', 0, 2, 40, 3);
      for (let x = 2; x < 40; x += 5) R(g, '#3556a0', x, 2, 2, 22);
    });
    S.road_deck = make(40, 28, g => {
      R(g, '#3a3d42', 0, 0, 40, 28); R(g, '#2c2f33', 0, 0, 40, 2);
      R(g, '#d8c84a', 14, 4, 12, 3);
    });
    // Westminster: Portland-stone gothic facade
    S.bld_parl = make(120, 120, g => {
      R(g, '#c7bd9c', 0, 0, 120, 120);
      R(g, '#b3a884', 0, 0, 120, 4);
      for (let x = 0; x < 120; x += 30) R(g, '#b3a884', x, 0, 3, 120);
      const win = (x, y) => {
        R(g, '#c7bd9c', x + 3, y - 4, 6, 5);
        R(g, '#3a4a55', x, y, 12, 28); R(g, '#2a3640', x + 2, y + 2, 8, 24);
        R(g, '#b3a884', x + 5, y, 2, 28);
      };
      for (let x = 9; x < 116; x += 30) { win(x, 18); win(x, 66); }
      R(g, '#b3a884', 0, 52, 120, 2);
    });

    // red brick — the throwable once the coppers have nicked all the bins
    S.brick = make(16, 10, g => {
      R(g, '#9a3b2a', 0, 0, 16, 10);
      R(g, '#b5503a', 0, 0, 16, 2);
      R(g, '#7a2c1f', 0, 8, 16, 2);
      R(g, '#6e2418', 5, 0, 1, 10); R(g, '#6e2418', 10, 0, 1, 10);
    });

    // "Bin There, Nicked That" — three coppers loading a wheelie bin into a riot van
    S.binvan = make(154, 68, g => {
      // riot van (right)
      R(g, C.TIRE, 98, 60, 16, 7); R(g, C.TIRE, 132, 60, 16, 7);
      R(g, '#55585c', 102, 62, 8, 3); R(g, '#55585c', 136, 62, 8, 3);
      R(g, '#eef1f4', 76, 16, 78, 46); R(g, '#d6dbe0', 76, 16, 78, 3);
      R(g, '#cdd2d6', 80, 22, 20, 14); R(g, '#2b3a52', 82, 24, 16, 10);
      for (let i = 0; i < 9; i++) { const x = 78 + i * 8; R(g, (i % 2 ? C.CARB : C.CARY), x, 40, 8, 8); R(g, (i % 2 ? C.CARY : C.CARB), x, 48, 8, 6); }
      R(g, '#1a1a1a', 102, 8, 30, 8); R(g, C.LIGHTB, 105, 9, 11, 5); R(g, C.LIGHTR, 119, 9, 11, 5);
      R(g, '#20242a', 142, 22, 12, 40); R(g, '#3a4250', 144, 26, 8, 10);
      UKP.drawTextCentered(g, 'POLICE', 114, 28, 1, '#163e9e');
      // the nicked wheelie bin (centre), tilted toward the van
      R(g, '#34373c', 46, 24, 20, 4); R(g, '#1a1c20', 46, 28, 20, 30); R(g, '#26282c', 46, 28, 3, 30);
      R(g, '#0c0c0c', 49, 58, 5, 4); R(g, '#0c0c0c', 58, 58, 5, 4);
      // three bobbies
      const bobby = (x) => {
        R(g, C.UNIF, x, 36, 10, 24); R(g, C.UNIFSH, x + 8, 36, 2, 24);
        R(g, C.HELM, x + 1, 25, 8, 10); R(g, C.BLACK, x + 1, 25, 1, 10); R(g, C.BLACK, x + 8, 25, 1, 10);
        R(g, C.SILVER, x + 4, 28, 2, 3); R(g, C.BLACK, x, 34, 10, 1); R(g, C.SKIN, x + 3, 34, 4, 2);
        R(g, C.BLACK, x + 1, 60, 4, 4); R(g, C.BLACK, x + 6, 60, 4, 4);
      };
      bobby(20); bobby(66); bobby(90);
      // blue-gloved arms reaching for the bin
      R(g, C.UNIF, 30, 40, 10, 3); R(g, '#2f6fd0', 38, 40, 4, 3);
      R(g, C.UNIF, 60, 40, 8, 3); R(g, '#2f6fd0', 60, 40, 4, 3);
    });

    // the BIG BIN — a big green commercial bin to charge the line with
    S.bigbin = make(44, 40, g => {
      R(g, '#2f7d3a', 2, 7, 40, 27);
      R(g, '#256b30', 2, 7, 40, 3);
      R(g, '#3a8f46', 4, 10, 34, 4);
      R(g, '#1f5a28', 2, 18, 40, 2);
      R(g, '#1f5a28', 14, 7, 2, 27); R(g, '#1f5a28', 28, 7, 2, 27);
      R(g, '#1f5a28', 2, 31, 40, 3);
      R(g, '#20242a', 0, 2, 44, 5); R(g, '#34373c', 0, 2, 44, 2);
      R(g, '#111111', 6, 34, 5, 4); R(g, '#111111', 18, 34, 5, 4); R(g, '#111111', 30, 34, 5, 4);
      R(g, '#cfe0cf', 22, 22, 8, 6); // a logo-ish white panel
    });
    // a hooded mate (helps push the bin)
    S.mate = make(22, 42, g => {
      R(g, '#4a4f55', 5, 4, 12, 9);
      R(g, '#3a3f45', 6, 13, 10, 3);
      R(g, C.SKIN, 8, 9, 6, 4); R(g, '#2e3338', 8, 9, 6, 1);
      R(g, '#3a3f45', 5, 14, 12, 15);
      R(g, '#2e3338', 5, 14, 3, 15);
      R(g, '#3a3f45', 2, 16, 4, 7); R(g, C.SKIN, 2, 22, 3, 2);
      R(g, '#2a2d31', 7, 29, 4, 10); R(g, '#2a2d31', 12, 29, 4, 10);
      R(g, '#141414', 6, 39, 5, 3); R(g, '#141414', 12, 39, 5, 3);
    });

    // foreground Big Ben clock tower (Elizabeth Tower) for the Westminster finale
    S.bigben_tower = make(56, 196, g => {
      const STn = '#c7bd9c', SDn = '#a89c78', GO = '#b89a3a', WHc = '#eef0f2';
      R(g, STn, 8, 22, 40, 174);            // shaft
      R(g, SDn, 8, 22, 40, 2);
      R(g, STn, 4, 184, 48, 12); R(g, SDn, 4, 184, 48, 2);   // base
      // shaft windows (pointed gothic)
      for (let y = 78; y < 182; y += 24) {
        R(g, SDn, 16, y, 7, 14); R(g, SDn, 33, y, 7, 14);
        R(g, STn, 18, y - 3, 3, 4); R(g, STn, 35, y - 3, 3, 4);
      }
      // belfry louvres
      R(g, SDn, 12, 56, 32, 18); for (let x = 14; x < 44; x += 5) R(g, STn, x, 58, 2, 14);
      // clock stage
      R(g, STn, 10, 30, 36, 26); R(g, SDn, 10, 30, 36, 2);
      R(g, GO, 17, 34, 22, 20); R(g, WHc, 19, 36, 18, 16);   // gold-framed clock face
      R(g, '#26282c', 27, 38, 2, 8); R(g, '#26282c', 28, 43, 7, 2);  // hands
      // spire / pinnacle
      R(g, STn, 14, 12, 28, 10); R(g, SDn, 14, 12, 28, 2);
      R(g, STn, 20, 4, 16, 9); R(g, STn, 25, -2, 6, 7);
      R(g, GO, 27, 0, 2, 5);
      // corner pinnacles
      R(g, STn, 6, 14, 4, 10); R(g, STn, 46, 14, 4, 10);
    });
  };
})(window.UKP);

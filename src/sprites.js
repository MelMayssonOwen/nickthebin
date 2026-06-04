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
    R(g, C.JACK, 5, 16, 14, 14);
    R(g, C.JACKSH, 16, 16, 3, 14);
    R(g, C.SHIRTB, 9, 18, 6, 9);
    R(g, C.WHITE, 11, 18, 2, 9);
    R(g, C.WHITE, 9, 21, 6, 2);
    R(g, C.SHIRTR, 11, 20, 2, 2);
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

  // ---- Officer parts (24x44) ----
  function copHead(g) {
    R(g, C.HELM, 7, 1, 10, 8);
    R(g, C.BLACK, 7, 1, 1, 8); R(g, C.BLACK, 16, 1, 1, 8);
    R(g, C.SILVER, 11, 3, 2, 4);
    R(g, C.BLACK, 6, 9, 12, 2);
    R(g, C.SKIN, 9, 11, 6, 6);
    R(g, C.BLACK, 10, 13, 1, 2); R(g, C.BLACK, 13, 13, 1, 2);
    R(g, C.MUST, 9, 16, 6, 1);
  }
  function copTorso(g) {
    R(g, C.UNIF, 5, 18, 14, 14);
    R(g, C.UNIFSH, 16, 18, 3, 14);
    R(g, C.BLACK, 8, 18, 8, 1);
    R(g, C.SILVER, 11, 20, 1, 1); R(g, C.SILVER, 11, 23, 1, 1); R(g, C.SILVER, 11, 26, 1, 1);
  }
  function copArmsGuard(g) {
    R(g, C.UNIF, 4, 18, 3, 7); R(g, C.UNIF, 4, 13, 3, 5); R(g, C.SKIN, 4, 11, 3, 3);
    R(g, C.UNIF, 17, 18, 3, 7); R(g, C.UNIF, 17, 13, 3, 5); R(g, C.SKIN, 17, 11, 3, 3);
  }
  function copArmsPunch(g) {
    R(g, C.UNIF, 2, 19, 5, 3); R(g, C.SKIN, 0, 19, 3, 3);
    R(g, C.UNIF, 17, 18, 3, 7); R(g, C.UNIF, 17, 15, 3, 4); R(g, C.SKIN, 17, 13, 3, 3);
  }
  function copLegs(g, pose) {
    if (pose === 1) {
      R(g, C.UNIF, 7, 32, 4, 10); R(g, C.BLACK, 6, 42, 5, 2);
      R(g, C.UNIF, 13, 33, 4, 9); R(g, C.BLACK, 13, 43, 5, 1);
    } else if (pose === 2) {
      R(g, C.UNIF, 7, 33, 4, 9); R(g, C.BLACK, 6, 43, 5, 1);
      R(g, C.UNIF, 13, 32, 4, 10); R(g, C.BLACK, 13, 42, 5, 2);
    } else {
      R(g, C.UNIF, 8, 32, 4, 10); R(g, C.UNIF, 13, 32, 4, 10);
      R(g, C.UNIFSH, 16, 32, 1, 10);
      R(g, C.BLACK, 7, 42, 5, 2); R(g, C.BLACK, 13, 42, 5, 2);
    }
  }

  function bin(g, body, light, dark) {
    R(g, C.LIDK, 2, 0, 14, 1);
    R(g, dark, 2, 1, 14, 3);
    R(g, body, 3, 4, 12, 16);
    R(g, light, 3, 4, 2, 16);
    R(g, dark, 13, 4, 2, 16);
    R(g, C.LIDK, 4, 20, 3, 2); R(g, C.LIDK, 11, 20, 3, 2);
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

  UKP.SP = {};

  UKP.buildSprites = function (VW, VH) {
    const S = UKP.SP;
    S.man_idle = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 0); manHead(g); });
    S.man_walk1 = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 1); manHead(g); });
    S.man_walk2 = make(24, 42, g => { manTorso(g); manArmsGuard(g); manLegs(g, 2); manHead(g); });
    S.man_throw = make(24, 42, g => { manTorso(g); manLegs(g, 0); manArmsThrow(g); manHead(g); });

    S.cop_idle = make(24, 44, g => { copTorso(g); copArmsGuard(g); copLegs(g, 0); copHead(g); });
    S.cop_walk1 = make(24, 44, g => { copTorso(g); copArmsGuard(g); copLegs(g, 1); copHead(g); });
    S.cop_walk2 = make(24, 44, g => { copTorso(g); copArmsGuard(g); copLegs(g, 2); copHead(g); });
    S.cop_punch = make(24, 44, g => { copTorso(g); copArmsPunch(g); copLegs(g, 0); copHead(g); });

    S.bin_blue = make(18, 22, g => bin(g, C.BINB, C.BINBL, C.BINBD));
    S.bin_brown = make(18, 22, g => bin(g, C.BINR, C.BINRL, C.BINRD));
    S.bin_grey = make(18, 22, g => bin(g, C.BING, C.BINGL, C.BINGD));

    S.heart = make(9, 8, g => heart(g, C.HEART));
    S.heart_empty = make(9, 8, g => heart(g, C.HEARTD));
    S.flag = make(18, 12, flagUK);
    S.portrait_man = make(28, 28, portraitMan);
    S.portrait_cop = make(28, 28, portraitCop);

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
    S.skyline = make(220, 96, g => {
      const Sc = C.SKYLINE, SD = C.SKYLINED;
      R(g, Sc, 0, 60, 130, 36);
      for (let i = 0; i < 9; i++) R(g, SD, 6 + i * 14, 52, 6, 10);
      R(g, Sc, 150, 24, 22, 72);
      R(g, SD, 150, 36, 22, 4);
      R(g, C.CLOUD, 157, 38, 8, 8);
      R(g, SD, 158, 40, 1, 4); R(g, SD, 161, 41, 3, 1);
      R(g, Sc, 154, 14, 14, 12);
      R(g, Sc, 158, 4, 6, 12);
      R(g, Sc, 184, 50, 30, 46);
      for (let i = 0; i < 3; i++) R(g, SD, 188 + i * 9, 44, 5, 8);
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
      UKP.drawTextCentered(g, 'NO', 23, 5, 1, '#202020');
      UKP.drawTextCentered(g, 'NONSENSE', 23, 13, 1, '#202020');
    });
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
  };
})(window.UKP);

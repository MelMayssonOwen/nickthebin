/* UK POLICE — pixel art texture + animation factory.
 * Everything is generated in code (no image files) so the game runs from file://.
 * Each sprite is painted with integer-aligned filled rects; Phaser's pixelArt
 * scaling keeps it crisp and chunky.
 */
window.UKP = window.UKP || {};

(function (UKP) {
  const C = {
    SKIN: 0xe2a079, SKINSH: 0xc07c54, HAIR: 0x4a2f17, MUST: 0x33210f,
    JACK: 0x8a5126, JACKSH: 0x5e3415, SHIRTB: 0x1f356e, SHIRTR: 0xc0263a, WHITE: 0xeef0f2,
    JEANS: 0x33538f, JEANSSH: 0x274169, BOOT: 0x281a0e, BLACK: 0x141414,
    UNIF: 0x20212b, UNIFSH: 0x12131a, HELM: 0x16161d, SILVER: 0xc9ccd6,
    HEART: 0xe23b3b, HEARTD: 0x3a2630,
    BRICK: 0x7a4326, BRICKL: 0x90543a, MORTAR: 0x5c3320, PANE: 0xbfe0f2, FRAME: 0xede9df,
    DOOR: 0x274a8f, DOORK: 0x16305f,
    HEDGE: 0x3f7a3a, HEDGED: 0x2d5a2a, WALL: 0x8a5a36,
    PAVE: 0x9aa0a6, PAVED: 0x7d8389, ROAD: 0x4a4d52,
    SKY1: 0x4aa6e8, SKY2: 0xbfe3f7, CLOUD: 0xf4fbff, SKYLINE: 0x32597f,
    CARW: 0xeef1f4, CARB: 0x163e9e, CARY: 0xf3d23a, LIGHTB: 0x2b6fe0, LIGHTR: 0xd83a3a, TIRE: 0x16181c,
    BINB: 0x2f6fd0, BINBL: 0x4a87de, BINBD: 0x23509c,
    BINR: 0x6b4a2a, BINRL: 0x84603a, BINRD: 0x4f3720,
    BING: 0x888f97, BINGL: 0xa6acb2, BINGD: 0x60656c, LIDK: 0x141414,
    LAMP: 0x202028, LAMPG: 0xf7e08a, SIGN: 0xf2f2ee, SIGNB: 0x202020,
  };
  UKP.C = C;

  function R(g, c, x, y, w, h) { g.fillStyle(c, 1); g.fillRect(x, y, w, h); }

  // ---- British Man parts (24x42 box, feet at bottom) ----
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

  // ---- Police officer parts (24x44 box) ----
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
    // front (left) arm extended toward player
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
    R(g, col, 0, 2, 9, 2);
    R(g, col, 1, 4, 7, 1);
    R(g, col, 2, 5, 5, 1);
    R(g, col, 3, 6, 3, 1);
    R(g, col, 4, 7, 1, 1);
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

  function tex(scene, key, w, h, draw) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  UKP.buildTextures = function (scene) {
    const MW = 24, MH = 42, CW = 24, CH = 44;
    tex(scene, 'man_idle', MW, MH, g => { manTorso(g); manArmsGuard(g); manLegs(g, 0); manHead(g); });
    tex(scene, 'man_walk1', MW, MH, g => { manTorso(g); manArmsGuard(g); manLegs(g, 1); manHead(g); });
    tex(scene, 'man_walk2', MW, MH, g => { manTorso(g); manArmsGuard(g); manLegs(g, 2); manHead(g); });
    tex(scene, 'man_throw', MW, MH, g => { manTorso(g); manLegs(g, 0); manArmsThrow(g); manHead(g); });

    tex(scene, 'cop_idle', CW, CH, g => { copTorso(g); copArmsGuard(g); copLegs(g, 0); copHead(g); });
    tex(scene, 'cop_walk1', CW, CH, g => { copTorso(g); copArmsGuard(g); copLegs(g, 1); copHead(g); });
    tex(scene, 'cop_walk2', CW, CH, g => { copTorso(g); copArmsGuard(g); copLegs(g, 2); copHead(g); });
    tex(scene, 'cop_punch', CW, CH, g => { copTorso(g); copArmsPunch(g); copLegs(g, 0); copHead(g); });

    tex(scene, 'bin_blue', 18, 22, g => bin(g, C.BINB, C.BINBL, C.BINBD));
    tex(scene, 'bin_brown', 18, 22, g => bin(g, C.BINR, C.BINRL, C.BINRD));
    tex(scene, 'bin_grey', 18, 22, g => bin(g, C.BING, C.BINGL, C.BINGD));

    tex(scene, 'heart', 9, 8, g => heart(g, C.HEART));
    tex(scene, 'heart_empty', 9, 8, g => heart(g, C.HEARTD));
    tex(scene, 'flag_uk', 18, 12, flagUK);
    tex(scene, 'portrait_man', 28, 28, portraitMan);
    tex(scene, 'portrait_cop', 28, 28, portraitCop);

    // tiny dust puff
    tex(scene, 'dust', 6, 6, g => { R(g, 0xd9d2c4, 1, 1, 4, 4); R(g, 0xfaf6ee, 2, 2, 2, 2); });
  };

  UKP.buildAnims = function (scene) {
    if (!scene.anims.exists('man_walk')) {
      scene.anims.create({ key: 'man_walk', frames: [{ key: 'man_walk1' }, { key: 'man_walk2' }], frameRate: 8, repeat: -1 });
    }
    if (!scene.anims.exists('cop_walk')) {
      scene.anims.create({ key: 'cop_walk', frames: [{ key: 'cop_walk1' }, { key: 'cop_walk2' }], frameRate: 7, repeat: -1 });
    }
  };
})(window.UKP);

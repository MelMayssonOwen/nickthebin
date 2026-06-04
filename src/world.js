/* UK POLICE — background / scenery builder.
 * Recreates the screenshot: blue sky + pixel clouds, hazy Parliament + Big Ben
 * skyline, brown terraced houses, brick wall + hedge, grey pavement, a lamp
 * post, a NO NONSENSE sign, and a parked POLICE car.
 */
window.UKP = window.UKP || {};

(function (UKP) {
  function R(g, c, x, y, w, h) { g.fillStyle(c, 1); g.fillRect(x, y, w, h); }

  function tex(scene, key, w, h, draw) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  UKP.buildSceneryTextures = function (scene, W, H) {
    const C = UKP.C;

    // Sky gradient via a canvas texture.
    if (!scene.textures.exists('sky')) {
      const cv = scene.textures.createCanvas('sky', W, H);
      const cx = cv.getContext();
      const grd = cx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#3f9fe6');
      grd.addColorStop(0.62, '#8fcdf0');
      grd.addColorStop(1, '#cfeafa');
      cx.fillStyle = grd;
      cx.fillRect(0, 0, W, H);
      cv.refresh();
    }

    // Cloud puff
    tex(scene, 'cloud', 60, 22, g => {
      R(g, C.CLOUD, 10, 8, 40, 10);
      R(g, C.CLOUD, 18, 3, 24, 8);
      R(g, C.CLOUD, 4, 12, 52, 6);
      R(g, 0xdcecf7, 4, 16, 52, 2);
    });

    // Hazy skyline tile (Parliament block + Big Ben tower)
    tex(scene, 'skyline', 220, 96, g => {
      const S = C.SKYLINE, SD = 0x274a6b;
      R(g, S, 0, 60, 130, 36);          // parliament long block
      for (let i = 0; i < 9; i++) R(g, SD, 6 + i * 14, 52, 6, 10); // pinnacles
      R(g, S, 150, 24, 22, 72);          // big ben tower
      R(g, SD, 150, 36, 22, 4);          // clock band
      R(g, C.CLOUD, 157, 38, 8, 8);      // clock face
      R(g, SD, 158, 40, 1, 4); R(g, SD, 161, 41, 3, 1);
      R(g, S, 154, 14, 14, 12);          // belfry
      R(g, S, 158, 4, 6, 12);            // spire
      R(g, S, 184, 50, 30, 46);          // portcullis side block
      for (let i = 0; i < 3; i++) R(g, SD, 188 + i * 9, 44, 5, 8);
    });

    // Terraced house tile (repeats horizontally)
    tex(scene, 'houses', 120, 120, g => {
      R(g, C.BRICK, 0, 0, 120, 120);
      // mortar grid
      for (let y = 0; y < 120; y += 6) R(g, C.MORTAR, 0, y, 120, 1);
      for (let y = 0; y < 120; y += 12) for (let x = 0; x < 120; x += 12) R(g, C.MORTAR, x, y, 1, 6);
      for (let y = 6; y < 120; y += 12) for (let x = 6; x < 120; x += 12) R(g, C.MORTAR, x, y, 1, 6);
      // roofline shadow
      R(g, 0x5c3320, 0, 0, 120, 4);
      // windows (two floors, two bays)
      const win = (x, y) => {
        R(g, C.FRAME, x - 1, y - 1, 22, 26);
        R(g, C.PANE, x, y, 20, 24);
        R(g, 0x9cc6de, x, y, 20, 2);
        R(g, C.FRAME, x + 9, y, 2, 24);
        R(g, C.FRAME, x, y + 11, 20, 2);
      };
      win(14, 16); win(70, 16);
      win(14, 64);
      // door
      R(g, C.DOORK, 70, 64, 22, 52);
      R(g, C.DOOR, 71, 65, 20, 51);
      R(g, C.FRAME, 73, 67, 16, 22);
      R(g, 0xcdb24a, 88, 92, 2, 3); // door handle
    });

    // Brick wall + hedge strip (front of houses)
    tex(scene, 'wall', 40, 28, g => {
      R(g, C.HEDGE, 0, 0, 40, 14);
      R(g, C.HEDGED, 0, 0, 40, 3);
      for (let x = 2; x < 40; x += 6) R(g, 0x4f8c46, x, 4, 3, 6);
      R(g, C.WALL, 0, 14, 40, 14);
      R(g, 0x6e4429, 0, 14, 40, 2);
      for (let x = 0; x < 40; x += 10) R(g, 0x6e4429, x, 14, 1, 14);
    });

    // Pavement tile
    tex(scene, 'pave', 40, 28, g => {
      R(g, C.PAVE, 0, 0, 40, 28);
      R(g, C.PAVED, 0, 0, 40, 2);
      R(g, C.PAVED, 0, 0, 1, 28); R(g, C.PAVED, 20, 0, 1, 28);
      R(g, 0xb4b9be, 2, 3, 16, 1);
    });

    // Lamp post (foreground)
    tex(scene, 'lamp', 18, 96, g => {
      R(g, C.LAMP, 7, 8, 4, 84);
      R(g, C.LAMP, 4, 90, 10, 4);
      R(g, C.LAMP, 3, 2, 12, 8);
      R(g, C.LAMPG, 5, 4, 8, 5);
      R(g, 0xfff4c2, 6, 5, 6, 3);
    });

    // NO NONSENSE sign on a post
    tex(scene, 'sign', 46, 60, g => {
      R(g, 0x9a9a9a, 21, 22, 4, 38);
      R(g, C.SIGNB, 0, 0, 46, 24);
      R(g, C.SIGN, 2, 2, 42, 20);
    });

    // POLICE car (~76x34)
    tex(scene, 'car', 76, 36, g => {
      R(g, C.TIRE, 12, 30, 12, 6); R(g, C.TIRE, 52, 30, 12, 6);
      R(g, 0x55585c, 15, 32, 6, 2); R(g, 0x55585c, 55, 32, 6, 2);
      R(g, C.CARW, 2, 16, 72, 16);     // body
      R(g, 0xcdd2d6, 14, 6, 48, 12);   // cabin
      R(g, 0x2b3a52, 17, 8, 18, 8);    // windscreen
      R(g, 0x2b3a52, 40, 8, 18, 8);    // rear window
      // battenburg checks
      for (let i = 0; i < 9; i++) {
        const x = 4 + i * 8;
        R(g, (i % 2 === 0) ? C.CARY : C.CARB, x, 20, 8, 6);
        R(g, (i % 2 === 0) ? C.CARB : C.CARY, x, 26, 8, 4);
      }
      // light bar
      R(g, 0x1a1a1a, 26, 2, 24, 5);
      R(g, C.LIGHTB, 28, 3, 8, 3);
      R(g, C.LIGHTR, 40, 3, 8, 3);
      R(g, 0x111111, 2, 18, 2, 12); R(g, 0x111111, 72, 18, 2, 12);
    });
  };

  // Lays out the parallax layers + props across the world for one stage.
  UKP.buildBackground = function (scene, worldW, W, H, hudH) {
    UKP.buildSceneryTextures(scene, W, H);
    const groundY = scene.registry.get('groundY');

    scene.add.image(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0).setDepth(-100);

    // clouds (slow parallax)
    for (let x = 40; x < worldW * 0.35; x += 150) {
      const cy = 18 + ((x * 7) % 40);
      scene.add.image(x, hudH + cy, 'cloud').setScrollFactor(0.18).setDepth(-90).setOrigin(0, 0);
    }

    // skyline (mid parallax) along the horizon
    const horizon = groundY - 96;
    for (let x = -20; x < worldW * 0.5; x += 230) {
      scene.add.image(x, horizon, 'skyline').setScrollFactor(0.4).setDepth(-80).setOrigin(0, 0);
    }

    // terraced houses
    scene.add.tileSprite(0, groundY - 16, worldW, 120, 'houses')
      .setOrigin(0, 1).setScrollFactor(1).setDepth(-60);

    // wall + hedge
    scene.add.tileSprite(0, groundY - 6, worldW, 28, 'wall')
      .setOrigin(0, 1).setScrollFactor(1).setDepth(-50);

    // pavement
    scene.add.tileSprite(0, groundY, worldW, 28, 'pave')
      .setOrigin(0, 0).setScrollFactor(1).setDepth(-40);
    scene.add.rectangle(0, groundY + 28, worldW, H, UKP.C.ROAD).setOrigin(0, 0).setScrollFactor(1).setDepth(-45);

    // a parked police car near the far end of the street
    scene.add.image(worldW - 120, groundY + 2, 'car').setOrigin(0.5, 1).setScrollFactor(1).setDepth(-30);

    // lamp posts + signs (foreground)
    for (let x = 220; x < worldW; x += 360) {
      scene.add.image(x, groundY + 4, 'lamp').setOrigin(0.5, 1).setScrollFactor(1).setDepth(60);
    }
    scene.add.image(150, groundY + 4, 'sign').setOrigin(0.5, 1).setScrollFactor(1).setDepth(58);
    scene.add.text(150, groundY - 44, 'NO\nNONSENSE', {
      fontFamily: "'Press Start 2P', monospace", fontSize: '5px', color: '#202020', align: 'center', lineSpacing: 2,
    }).setOrigin(0.5, 0.5).setScrollFactor(1).setDepth(59);

    scene.add.text(worldW - 120, groundY - 30, 'POLICE', {
      fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#163e9e',
    }).setOrigin(0.5, 0.5).setScrollFactor(1).setDepth(-29);
  };
})(window.UKP);

/* UK POLICE — NO NONSENSE
 * A daft 8-bit British beat-'em-up. Lug wheelie bins at custodian-helmet bobbies
 * across three London streets. They are not impressed: "I don't think so, mate."
 *
 * Boot/title -> Game (side-scroll brawler) + UI (HUD overlay).
 */
window.UKP = window.UKP || {};

(function (UKP) {
  const W = 480, H = 270, HUD_H = 46;
  UKP.HUD_H = HUD_H;
  UKP.bus = new Phaser.Events.EventEmitter();

  const FONT = "'Press Start 2P', monospace";
  const GROUND_Y = 246; // feet line

  const COP_LINES = [
    "I don't think so, mate.",
    "Oi! You're nicked!",
    "Not on my watch, sunshine.",
    "'Ello 'ello 'ello.",
    "Mind the bins, you muppet!",
    "Stop right there!",
    "That's a £80 fixed penalty.",
  ];
  const COP_DOWN = ["Blimey!", "That's not cricket!", "Cor, me helmet!", "Right, I'm off."];
  const BOSS_LINES = ["You're going dahn the nick.", "I AM the long arm of the law.", "Nice try, sunshine."];

  const STAGES = [
    { name: 'BRICK LANE',     worldW: 2200, target: 6,  copSpeed: 34, copMax: 3, spawnMs: 1700, bossHp: 6,  bossName: 'SGT. NONSENSE' },
    { name: 'CAMDEN HIGH ST', worldW: 2600, target: 8,  copSpeed: 42, copMax: 4, spawnMs: 1400, bossHp: 8,  bossName: 'INSP. TRUNCHEON' },
    { name: 'WESTMINSTER',    worldW: 3000, target: 10, copSpeed: 50, copMax: 5, spawnMs: 1150, bossHp: 11, bossName: 'CHIEF PLOD' },
  ];

  // ---------------------------------------------------------------- Boot/title
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    create() {
      this.registry.set('groundY', GROUND_Y);
      UKP.buildTextures(this);
      UKP.buildAnims(this);
      UKP.buildSceneryTextures(this, W, H);

      this.add.image(0, 0, 'sky').setOrigin(0, 0);
      this.add.image(W / 2, 70, 'cloud').setScale(1.2);
      this.add.image(W / 2 - 30, 150, 'skyline').setOrigin(0.5, 1).setScale(1.1);
      this.add.tileSprite(0, GROUND_Y, W, 28, 'pave').setOrigin(0, 0);
      this.add.rectangle(0, GROUND_Y + 28, W, H, UKP.C.ROAD).setOrigin(0, 0);

      const man = this.add.image(120, GROUND_Y + 2, 'man_idle').setOrigin(0.5, 1).setScale(1.7);
      const cop = this.add.image(360, GROUND_Y + 2, 'cop_idle').setOrigin(0.5, 1).setScale(1.7).setFlipX(true);
      this.add.image(240, GROUND_Y - 44, 'bin_blue').setScale(1.4);
      this.tweens.add({ targets: man, y: man.y - 6, yoyo: true, repeat: -1, duration: 600 });
      this.tweens.add({ targets: cop, y: cop.y - 6, yoyo: true, repeat: -1, duration: 600, delay: 300 });

      this.add.text(W / 2, 52, 'UK POLICE', {
        fontFamily: FONT, fontSize: '22px', color: '#ffffff', stroke: '#163e9e', strokeThickness: 6,
      }).setOrigin(0.5);
      this.add.text(W / 2, 80, 'NO NONSENSE', {
        fontFamily: FONT, fontSize: '11px', color: '#ffd23a', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5);

      const prompt = this.add.text(W / 2, 132, 'PRESS ENTER OR TAP TO START', {
        fontFamily: FONT, fontSize: '9px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5);
      this.tweens.add({ targets: prompt, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });

      this.add.text(W / 2, 154, 'MOVE  < >      JUMP  ^ / W      BIN / BASH  SPACE', {
        fontFamily: FONT, fontSize: '6px', color: '#dfe6ee', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      const start = () => { UKP.unlockAudio(); this.scene.start('Game', { stage: 0, score: 0, lives: 3 }); };
      this.input.keyboard.once('keydown-ENTER', start);
      this.input.keyboard.once('keydown-SPACE', start);
      this.input.once('pointerdown', start);
      if (window.location.hash === '#play') this.time.delayedCall(50, start);
    }
  }

  // ------------------------------------------------------------------- Gameplay
  class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    init(data) {
      this.stageIndex = data.stage || 0;
      this.score = data.score || 0;
      this.lives = (data.lives == null) ? 3 : data.lives;
    }

    create() {
      const cfg = STAGES[this.stageIndex];
      this.cfg = cfg;
      this.registry.set('groundY', GROUND_Y);
      this.physics.world.setBounds(0, 0, cfg.worldW, H);

      UKP.buildBackground(this, cfg.worldW, W, H, HUD_H);

      // invisible ground
      this.ground = this.add.rectangle(cfg.worldW / 2, GROUND_Y + 8, cfg.worldW, 16, 0x000000, 0);
      this.physics.add.existing(this.ground, true);

      // player
      const p = this.physics.add.sprite(80, GROUND_Y - 30, 'man_idle').setOrigin(0.5, 1);
      p.setDepth(10);
      p.body.setSize(13, 40).setOffset(5, 2);
      p.setCollideWorldBounds(true);
      this.physics.add.collider(p, this.ground);
      this.player = p;
      this.facing = 1;
      this.invuln = false;
      this.carrying = null;
      this.actionLock = 0;

      // groups
      this.cops = this.physics.add.group();
      this.bins = this.physics.add.group();       // pickups resting in the world
      this.projectiles = this.physics.add.group(); // bins in flight

      this.physics.add.collider(this.cops, this.ground);
      this.physics.add.collider(this.bins, this.ground, (bin) => { bin.body.setVelocityX(0); });
      this.physics.add.collider(this.projectiles, this.ground, (b) => this.binLands(b));
      this.physics.add.overlap(this.projectiles, this.cops, (b, c) => this.binHitsCop(b, c));

      // seed bins along the street
      const colors = ['bin_blue', 'bin_brown', 'bin_grey'];
      for (let x = 200; x < cfg.worldW - 160; x += 240) {
        this.spawnBin(x, colors[(x / 240 | 0) % 3]);
      }

      // camera + HUD
      this.cameras.main.setBounds(0, 0, cfg.worldW, H);
      this.cameras.main.startFollow(p, true, 0.12, 0.12);
      this.cameras.main.setFollowOffset(-40, 30);

      if (!this.scene.isActive('UI')) this.scene.launch('UI');
      this.time.delayedCall(0, () => {
        UKP.bus.emit('score', this.score);
        UKP.bus.emit('lives', this.lives);
        UKP.bus.emit('hearts', 5);
        UKP.bus.emit('boss', { active: false });
        UKP.bus.emit('message', { text: 'STAGE ' + (this.stageIndex + 1), sub: cfg.name, hold: 1500 });
      });

      // state
      this.hearts = 5;
      this.defeated = 0;
      this.boss = null;
      this.bossPhase = false;
      this.gameEnded = false;

      // input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        w: 'W', a: 'A', d: 'D', space: 'SPACE', r: 'R',
      });
      this.input.keyboard.on('keydown-SPACE', () => this.doAction());

      // spawner
      this.spawnTimer = this.time.addEvent({ delay: cfg.spawnMs, loop: true, callback: () => this.trySpawnCop() });
      this.lineTimer = this.time.addEvent({ delay: 2600, loop: true, callback: () => this.copChatter() });
    }

    // ---- bins ----
    spawnBin(x, key) {
      const b = this.bins.create(x, GROUND_Y - 10, key).setOrigin(0.5, 1);
      b.setDepth(9);
      b.body.setSize(14, 18).setOffset(2, 3);
      b.body.setCollideWorldBounds(true);
      b.binKey = key;
      return b;
    }

    binLands(b) {
      if (!b.active) return;
      b.body.setVelocity(0, 0);
      b.body.setAllowGravity(true);
      b.setAngularVelocity(0); b.setRotation(0);
      this.projectiles.remove(b, false, false);
      this.bins.add(b);
      b.body.setSize(14, 18).setOffset(2, 3);
    }

    binHitsCop(b, c) {
      if (!b.active || !c.active || c.ko) return;
      b.destroy();
      if (c.isBoss) this.hitBoss(c, 1);
      else this.koCop(c);
    }

    // ---- action: throw / bash / pick up ----
    doAction() {
      const t = this.time.now;
      if (this.gameEnded || t < this.actionLock) return;
      const p = this.player;

      if (this.carrying) { this.throwBin(); return; }

      // grab a nearby bin
      let nearest = null, nd = 30;
      this.bins.getChildren().forEach(b => {
        if (!b.active) return;
        const d = Math.abs(b.x - p.x);
        if (d < nd && Math.abs(b.y - p.y) < 40) { nd = d; nearest = b; }
      });
      if (nearest) { this.pickBin(nearest); return; }

      this.bash();
    }

    pickBin(b) {
      const key = b.binKey;
      b.destroy();
      const held = this.add.image(this.player.x, this.player.y - 44, key).setOrigin(0.5, 1).setDepth(12);
      this.carrying = held;
      this.carryKey = key;
      this.actionLock = this.time.now + 180;
      UKP.sfx.pickup();
    }

    throwBin() {
      const p = this.player;
      this.carrying.destroy();
      this.carrying = null;
      this.setPlayerTexture('man_throw');
      this.actionLock = this.time.now + 260;

      const b = this.projectiles.create(p.x + this.facing * 10, p.y - 36, this.carryKey).setOrigin(0.5, 1);
      b.setDepth(11);
      b.body.setSize(14, 18).setOffset(2, 3);
      b.body.setAllowGravity(true);
      b.setVelocity(this.facing * 250, -210);
      b.setAngularVelocity(this.facing * 240);
      UKP.sfx.throw();
      if (Math.random() < 0.4) this.speak(p, "Have it!", '#ffffff', -52);
    }

    bash() {
      const p = this.player;
      this.setPlayerTexture('man_throw');
      this.actionLock = this.time.now + 240;
      const reach = 30;
      let hit = false;
      this.cops.getChildren().forEach(c => {
        if (!c.active || c.ko) return;
        const dx = (c.x - p.x) * this.facing;
        if (dx > -6 && dx < reach && Math.abs(c.y - p.y) < 30) {
          if (c.isBoss) this.hitBoss(c, 1); else this.koCop(c);
          hit = true;
        }
      });
      if (!hit) UKP.sfx.throw();
    }

    // ---- cops ----
    trySpawnCop() {
      if (this.gameEnded || this.bossPhase) return;
      const aliveRegular = this.cops.getChildren().filter(c => c.active && !c.isBoss && !c.ko).length;
      if (aliveRegular >= this.cfg.copMax) return;
      if (this.defeated >= this.cfg.target) { this.startBoss(); return; }
      this.spawnCop();
    }

    spawnCop(boss) {
      const cam = this.cameras.main;
      const fromRight = this.player.x < this.cfg.worldW - 200 ? true : false;
      let x = fromRight ? cam.scrollX + W + 30 : Math.max(20, cam.scrollX - 30);
      x = Phaser.Math.Clamp(x, 20, this.cfg.worldW - 20);
      const c = this.cops.create(x, GROUND_Y - 32, 'cop_idle').setOrigin(0.5, 1);
      c.setDepth(10);
      c.body.setSize(13, 42).setOffset(5, 2);
      c.ko = false;
      c.isBoss = !!boss;
      c.nextPunch = 0;
      c.nextLine = this.time.now + Phaser.Math.Between(1500, 4000);
      if (boss) {
        c.setScale(1.5);
        c.hp = this.cfg.bossHp;
        c.speed = this.cfg.copSpeed * 0.7;
      } else {
        c.speed = this.cfg.copSpeed + Phaser.Math.Between(-6, 10);
      }
      return c;
    }

    startBoss() {
      if (this.bossPhase) return;
      this.bossPhase = true;
      // clear stragglers gently
      this.boss = this.spawnCop(true);
      UKP.sfx.siren();
      UKP.bus.emit('boss', { active: true, ratio: 1, name: this.cfg.bossName });
      UKP.bus.emit('message', { text: 'VILLAIN!', sub: this.cfg.bossName, hold: 1500 });
      this.speak(this.boss, Phaser.Utils.Array.GetRandom(BOSS_LINES), '#ff8a3a', -64);
    }

    hitBoss(c, dmg) {
      c.hp -= dmg;
      c.setTint(0xff6a6a);
      this.time.delayedCall(120, () => c.active && c.clearTint());
      c.body.setVelocityX(this.facing * 80);
      UKP.sfx.bossHit();
      UKP.bus.emit('boss', { active: true, ratio: Math.max(0, c.hp / this.cfg.bossHp), name: this.cfg.bossName });
      this.addScore(60);
      if (c.hp <= 0) this.defeatBoss(c);
      else if (Math.random() < 0.5) this.speak(c, Phaser.Utils.Array.GetRandom(BOSS_LINES), '#ff8a3a', -64);
    }

    defeatBoss(c) {
      this.koSprite(c);
      this.boss = null;
      this.addScore(1000);
      UKP.bus.emit('boss', { active: false });
      this.gameEnded = true;
      this.spawnTimer.remove();
      this.lineTimer.remove();

      if (this.stageIndex + 1 < STAGES.length) {
        UKP.sfx.clear();
        UKP.bus.emit('message', { text: 'STAGE CLEAR!', sub: 'TAP TO CONTINUE', persist: true });
        this.endHandoff(() => this.scene.restart({ stage: this.stageIndex + 1, score: this.score, lives: this.lives }));
      } else {
        UKP.sfx.clear();
        UKP.bus.emit('message', { text: 'NO NONSENSE!', sub: 'YOU WIN — TAP TO PLAY AGAIN', persist: true });
        this.endHandoff(() => this.scene.start('Boot'));
      }
    }

    koCop(c) {
      this.koSprite(c);
      this.defeated += 1;
      this.addScore(150);
      UKP.sfx.hit();
      if (Math.random() < 0.6) this.speak(c, Phaser.Utils.Array.GetRandom(COP_DOWN), '#ffffff', -50);
    }

    koSprite(c) {
      c.ko = true;
      c.body.setVelocity(this.facing * 60, -200);
      c.body.setAllowGravity(true);
      c.setAngularVelocity(this.facing * 300);
      this.tweens.add({ targets: c, alpha: 0, delay: 500, duration: 500, onComplete: () => c.destroy() });
    }

    copChatter() {
      const list = this.cops.getChildren().filter(c => c.active && !c.ko && !c.isBoss);
      if (!list.length) return;
      const c = Phaser.Utils.Array.GetRandom(list);
      this.speak(c, Phaser.Utils.Array.GetRandom(COP_LINES), '#cfe3ff', -50);
    }

    speak(sprite, text, color, dy) {
      const bub = this.add.text(sprite.x, sprite.y + (dy || -50), text, {
        fontFamily: FONT, fontSize: '6px', color: color || '#ffffff', align: 'center',
        backgroundColor: '#00000088', padding: { x: 3, y: 2 }, stroke: '#000000', strokeThickness: 2,
        wordWrap: { width: 120 },
      }).setOrigin(0.5, 1).setDepth(40);
      this.tweens.add({ targets: bub, y: bub.y - 6, alpha: 0, delay: 1100, duration: 600, onComplete: () => bub.destroy() });
    }

    // ---- player damage ----
    hurtPlayer() {
      if (this.invuln || this.gameEnded) return;
      this.hearts -= 1;
      UKP.bus.emit('hearts', this.hearts);
      UKP.sfx.hurt();
      this.player.body.setVelocity(-this.facing * 140, -160);
      if (this.hearts <= 0) { this.loseLife(); return; }
      this.invuln = true;
      this.blink(900, () => { this.invuln = false; });
    }

    loseLife() {
      this.lives -= 1;
      UKP.bus.emit('lives', this.lives);
      if (this.lives < 0) { this.gameOver(); return; }
      this.hearts = 5;
      UKP.bus.emit('hearts', this.hearts);
      this.invuln = true;
      this.blink(1400, () => { this.invuln = false; });
    }

    gameOver() {
      this.gameEnded = true;
      this.spawnTimer.remove();
      this.lineTimer.remove();
      this.player.setTint(0x888888);
      UKP.sfx.over();
      UKP.bus.emit('message', { text: 'NICKED!', sub: 'GAME OVER — TAP TO RETRY', persist: true });
      this.endHandoff(() => this.scene.start('Boot'));
    }

    endHandoff(fn) {
      this.time.delayedCall(900, () => {
        this.input.keyboard.once('keydown-ENTER', fn);
        this.input.keyboard.once('keydown-SPACE', fn);
        this.input.once('pointerdown', fn);
      });
    }

    blink(ms, done) {
      const tw = this.tweens.add({ targets: this.player, alpha: 0.25, yoyo: true, repeat: -1, duration: 90 });
      this.time.delayedCall(ms, () => { tw.stop(); this.player.setAlpha(1); done && done(); });
    }

    addScore(n) { this.score += n; UKP.bus.emit('score', this.score); }

    setPlayerTexture(key) {
      if (this.player.anims.isPlaying) this.player.anims.stop();
      this.player.setTexture(key);
    }

    // ---- main loop ----
    update(time, delta) {
      const p = this.player;
      if (this.gameEnded) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.scene.start('Boot');
        return;
      }

      const left = this.cursors.left.isDown || this.keys.a.isDown;
      const right = this.cursors.right.isDown || this.keys.d.isDown;
      const up = this.cursors.up.isDown || this.keys.w.isDown;
      const onGround = p.body.blocked.down || p.body.touching.down;
      const SPEED = 130;

      let vx = 0;
      if (left) { vx = -SPEED; this.facing = -1; }
      else if (right) { vx = SPEED; this.facing = 1; }
      p.body.setVelocityX(vx);
      p.setFlipX(this.facing === -1);

      if (up && onGround) { p.body.setVelocityY(-330); UKP.sfx.jump(); }

      // animation (don't override a brief throw pose)
      if (time >= this.actionLock) {
        if (!onGround) this.setPlayerTexture('man_idle');
        else if (vx !== 0) { if (p.anims.getName() !== 'man_walk') p.anims.play('man_walk', true); }
        else this.setPlayerTexture('man_idle');
      }

      // carried bin follows hands
      if (this.carrying) {
        this.carrying.x = p.x + this.facing * 2;
        this.carrying.y = p.y - 40;
        this.carrying.setFlipX(this.facing === -1);
      }

      // cops chase + attack
      this.cops.getChildren().forEach(c => {
        if (!c.active) return;
        if (c.ko) { return; }
        const dx = p.x - c.x;
        const dir = dx < 0 ? -1 : 1;
        const range = c.isBoss ? 26 : 20;
        if (Math.abs(dx) > range) {
          c.body.setVelocityX(dir * c.speed);
          c.setFlipX(dir === 1);
          if (c.anims.getName() !== 'cop_walk') c.anims.play('cop_walk', true);
        } else {
          c.body.setVelocityX(0);
          c.anims.stop();
          c.setFlipX(dir === 1);
          if (time > c.nextPunch && Math.abs(p.y - c.y) < 34) {
            c.setTexture('cop_punch');
            this.time.delayedCall(160, () => { c.active && !c.ko && c.setTexture('cop_idle'); });
            c.nextPunch = time + (c.isBoss ? 900 : 1200);
            this.hurtPlayer();
          } else if (c.anims.getName() !== 'cop_walk') {
            c.setTexture('cop_punch'); // hold a ready pose at range 0
          }
        }
        if (time > c.nextLine && !c.isBoss) {
          c.nextLine = time + Phaser.Math.Between(4000, 8000);
          if (Math.random() < 0.5) this.speak(c, Phaser.Utils.Array.GetRandom(COP_LINES), '#cfe3ff', -50);
        }
      });

      // tidy projectiles that fly offscreen below
      this.projectiles.getChildren().forEach(b => {
        if (b.active && b.y > H + 40) b.destroy();
      });
    }
  }

  // ---------------------------------------------------------------------- boot
  function boot() {
    const config = {
      type: Phaser.AUTO,
      parent: 'game',
      width: W,
      height: H,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#3f9fe6',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
      scene: [BootScene, GameScene, UKP.UIScene],
    };
    UKP.game = new Phaser.Game(config);
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})(window.UKP);

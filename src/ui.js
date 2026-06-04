/* UK POLICE — HUD overlay scene.
 * Mirrors the screenshot: left BRITISH MAN panel (portrait, hearts, lives, flag,
 * score), right POLICE OFFICER VILLAIN panel (label, health bar, portrait),
 * plus big centre messages (stage intro / clear / game over / win / start).
 */
window.UKP = window.UKP || {};

(function (UKP) {
  const FONT = "'Press Start 2P', monospace";

  class UIScene extends Phaser.Scene {
    constructor() { super('UI'); }

    create() {
      const W = this.scale.width;
      const hudH = UKP.HUD_H;

      this.add.rectangle(0, 0, W, hudH, 0x000000).setOrigin(0, 0).setScrollFactor(0);
      this.add.rectangle(0, hudH - 1, W, 1, 0xffffff, 0.5).setOrigin(0, 0).setScrollFactor(0);

      // --- left: British Man ---
      this.add.rectangle(6, 6, 30, 30, 0x222a3a).setOrigin(0, 0).setStrokeStyle(1, 0xffffff);
      this.add.image(21, 21, 'portrait_man').setOrigin(0.5, 0.5);
      this.txt(42, 5, 'BRITISH MAN', 7, '#ffffff');

      this.hearts = [];
      for (let i = 0; i < 5; i++) {
        this.hearts.push(this.add.image(44 + i * 12, 22, 'heart').setOrigin(0, 0));
      }
      this.scoreText = this.txt(42, 33, 'SCORE 000000', 8, '#ffd23a');

      // --- middle: lives + flag ---
      this.livesText = this.txt(200, 14, 'x 03', 9, '#ffffff');
      this.add.image(244, 12, 'flag_uk').setOrigin(0, 0);

      // --- right: villain ---
      this.txt(W - 150, 5, 'POLICE OFFICER', 7, '#ff8a3a');
      this.txt(W - 150, 16, 'VILLAIN', 7, '#ff8a3a');
      this.add.rectangle(W - 44, 6, 30, 30, 0x222a3a).setOrigin(0, 0).setStrokeStyle(1, 0xffffff);
      this.add.image(W - 29, 21, 'portrait_cop').setOrigin(0.5, 0.5);

      this.bossBarBg = this.add.rectangle(W - 150, 30, 124, 8, 0x3a1414).setOrigin(0, 0).setStrokeStyle(1, 0x000000);
      this.bossBar = this.add.rectangle(W - 149, 31, 122, 6, 0xe2502a).setOrigin(0, 0);
      this.bossSub = this.txt(W - 150, 30, '', 6, '#ffd2c2');

      // --- centre message ---
      this.msgBig = this.add.text(W / 2, 150, '', {
        fontFamily: FONT, fontSize: '18px', color: '#ffffff', align: 'center',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0);
      this.msgSub = this.add.text(W / 2, 180, '', {
        fontFamily: FONT, fontSize: '8px', color: '#ffd23a', align: 'center',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0);

      const bus = UKP.bus;
      bus.on('score', s => this.scoreText.setText('SCORE ' + String(s).padStart(6, '0')), this);
      bus.on('hearts', n => this.setHearts(n), this);
      bus.on('lives', n => this.livesText.setText('x ' + String(Math.max(0, n)).padStart(2, '0')), this);
      bus.on('boss', d => this.setBoss(d), this);
      bus.on('message', m => this.showMessage(m), this);

      this.setHearts(5);
      this.setBoss({ active: false });
    }

    txt(x, y, s, size, color) {
      return this.add.text(x, y, s, { fontFamily: FONT, fontSize: size + 'px', color })
        .setOrigin(0, 0).setScrollFactor(0);
    }

    setHearts(n) {
      this.hearts.forEach((h, i) => h.setTexture(i < n ? 'heart' : 'heart_empty'));
    }

    setBoss(d) {
      if (!d || !d.active) {
        this.bossBar.setSize(0, 6);
        this.bossSub.setText('ON PATROL');
        this.bossBarBg.setFillStyle(0x1a1f2a);
        return;
      }
      this.bossBarBg.setFillStyle(0x3a1414);
      this.bossBar.setSize(Math.max(0, Math.round(122 * d.ratio)), 6);
      this.bossSub.setText(d.name || '');
    }

    showMessage(m) {
      this.msgBig.setText(m.text || '');
      this.msgSub.setText(m.sub || '');
      this.tweens.killTweensOf([this.msgBig, this.msgSub]);
      this.msgBig.setAlpha(1); this.msgSub.setAlpha(1);
      if (!m.persist) {
        this.time.delayedCall(m.hold || 1400, () => {
          this.tweens.add({ targets: [this.msgBig, this.msgSub], alpha: 0, duration: 400 });
        });
      }
    }

    clearMessage() {
      this.tweens.killTweensOf([this.msgBig, this.msgSub]);
      this.msgBig.setText(''); this.msgSub.setText('');
    }
  }

  UKP.UIScene = UIScene;
})(window.UKP);

# UK POLICE — No Nonsense

A daft 8-bit British beat-'em-up. You are **British Man** (mustache, Union Jack
tee, leather jacket). Lug **wheelie bins** at custodian-helmet bobbies who are
thoroughly unimpressed: *"I don't think so, mate."* Old-school arcade vibe,
pixel art, chiptune blips — all generated in code, no asset files.

> Fiction / comedy. Cartoon ragdoll bobbies, no blood, no real people.

## Run it

It's a static site. Easiest:

```bash
cd uk-police
python3 -m http.server 8000
# open http://localhost:8000
```

(Phaser and the Press Start 2P font load from a CDN, so you need internet the
first time. Opening `index.html` directly off disk also works.)

Add `#play` to the URL to skip the title and drop straight into Stage 1
(handy for testing): `http://localhost:8000/index.html#play`

## Controls

| Action | Keys |
|---|---|
| Move | `←` `→` or `A` `D` |
| Jump | `↑` or `W` |
| Pick up bin / Throw bin / Bash | `SPACE` |

`SPACE` is context-sensitive: grabs the nearest bin if one's by your feet,
throws it if you're carrying one, otherwise throws a punch.

## How it plays

- Side-scrolling brawler across **3 stages** (Brick Lane → Camden High St →
  Westminster), each a longer street with faster, more numerous officers.
- Knock out a target number of officers, then a **boss bobby** appears with a
  health bar in the VILLAIN panel. Bin him enough times to clear the stage.
- 5 hearts per life, 3 lives. An officer's punch costs a heart. Clear all three
  stages for **NO NONSENSE!**
- Officers heckle you with proper British nonsense as they close in.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Loads Phaser + scripts, pixelated canvas |
| `src/art.js` | Pixel-art sprite + animation factory (characters, bins, HUD icons) |
| `src/world.js` | Scenery textures + parallax layout (sky, skyline, terraces, props, car) |
| `src/audio.js` | WebAudio chiptune blips |
| `src/ui.js` | `UIScene` — the HUD overlay |
| `src/game.js` | `BootScene` (title) + `GameScene` (gameplay) + Phaser config |

All art is drawn at runtime with integer-aligned rectangles; Phaser's `pixelArt`
mode keeps it crisp. Tech: **Phaser 3.80** (chosen per design), no build step.

See `docs/superpowers/specs/2026-06-04-uk-police-design.md` for the design.

# UK POLICE — No Nonsense

A daft 8-bit British beat-'em-up. You are **British Man** (mustache, Union Jack
tee, leather jacket). Lug **wheelie bins** at custodian-helmet bobbies who are
thoroughly unimpressed: *"I don't think so, mate."* Old-school arcade vibe.

> Fiction / comedy. Cartoon ragdoll bobbies, no blood, no real people.

**Zero dependencies.** No frameworks, no CDN, no fonts to download — the whole
game (engine, pixel sprites, bitmap font, chiptune audio) is generated in code.

## Run it

Just open `index.html` in a browser — double-click it, or serve it:

```bash
cd uk-police
python3 -m http.server 8000
# open http://localhost:8000
```

Add `#play` to skip the title and drop straight into Stage 1 (for testing):
`http://localhost:8000/index.html#play`

## Controls

| Action | Keys |
|---|---|
| Move | `←` `→` (or `A` `D`) |
| Jump (and stomp) | `↑` (or `W`) |
| Pick up bin / Throw bin / Bash | `SPACE` |

`SPACE` is context-sensitive: grabs the nearest bin if one's by your feet,
throws it if you're carrying one, otherwise throws a punch.

## How it plays

- Side-scrolling brawler across **3 stages** (Brick Lane → Camden High St →
  Westminster), each longer with faster, more numerous officers.
- Two ways to take a bobby down:
  - **Bin him** — throw a wheelie bin (one hit drops a regular officer).
  - **Stomp him** — jump on his helmet. He takes a knee for a few seconds.
    **Three knees and he's done.**
- Clear all the officers (a **boss bobby** with a VILLAIN health bar shows up as
  the finale) to pass the stage.
- You have **5 hearts**. An officer's punch costs one — **lose them all and it's
  game over** (you're nicked). Clear all three stages for **NO NONSENSE!**
- Officers heckle you with proper British nonsense as they close in.

## Why vanilla (not a framework)

This started life on Phaser. The game logic was fine, but Phaser's scene /
focus / page-visibility handling made the loop freeze in some real browsers
right after gameplay started. Rather than fight the framework, it was rewritten
as a tiny, self-contained Canvas engine: **I own the game loop** (it never pauses
on blur), input is plain `keydown`/`keyup` on the window with `preventDefault`
(no capture quirks), and there's no CDN that can fail to load.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Loads the five scripts onto a pixelated canvas |
| `src/font.js` | 5×7 bitmap font (text drawn as pixel rects) |
| `src/sprites.js` | Pixel-art sprites + scenery, pre-rendered to offscreen canvases |
| `src/engine.js` | Canvas/scaling, keyboard input, fixed-timestep loop, helpers |
| `src/audio.js` | WebAudio chiptune blips |
| `src/game.js` | Game states, entities, AI, stages, and all rendering |

Rendering: everything is painted at a 480×270 backbuffer resolution and the
canvas is scaled up with nearest-neighbour (`image-rendering: pixelated`), so
sprites and text share the same chunky pixel grid.

See `docs/superpowers/specs/2026-06-04-uk-police-design.md` for the design.

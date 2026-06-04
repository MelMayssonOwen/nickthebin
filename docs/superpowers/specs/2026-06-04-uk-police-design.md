# UK POLICE — No Nonsense — Design

**Date:** 2026-06-04
**Status:** Built — playable prototype.

## Purpose

A fun, fictional 8-bit arcade beat-'em-up. The player is a mustachioed
"British Man" in a Union Jack t-shirt who throws **wheelie bins** at UK police
officers (custodian helmets), who retort with deadpan British lines like
*"I don't think so, mate."* Old-school side-scrolling brawler vibe, styled to
match the provided reference screenshot.

This is comedy fiction: cartoon ragdoll officers, no blood, no real individuals.

## Decisions (locked by the user)

- **Output:** a playable web prototype (not a design doc only).
- **Game loop:** side-scrolling beat-'em-up **+** level-based stages (combined).
- **Tech:** **Phaser 3** (HTML5), loaded from CDN, no build step. All art and
  audio generated in code so it runs as a static site.
- **Look:** must resemble the reference — 8-bit pixel art, brown terraced houses,
  hazy Big Ben / Parliament skyline, blue/brown/grey wheelie bins, custodian-
  helmet bobbies, a parked POLICE car, and a hearts + score + VILLAIN HUD.

## Core loop

1. Walk right down a London street (camera follows, parallax background).
2. Pick up a wheelie bin (`SPACE` near one) and throw it (`SPACE`) at officers.
   No bin to hand → throw a punch instead.
3. Officers approach and punch; each hit costs a heart.
4. Defeat the stage's target count of officers → a **boss officer** spawns with a
   health bar shown in the VILLAIN panel. Bin him down to clear the stage.
5. Three stages of increasing difficulty; clear all three to win.

## Components

- **BootScene** — builds all textures/anims, shows the title screen, waits for
  start (or `#play` to auto-start for testing).
- **GameScene** — gameplay: player controller, bin pickups/projectiles, officer
  AI (chase + punch + heckle), bosses, stage progression, lives/hearts, camera.
- **UIScene** — HUD overlay mirroring the screenshot (player panel, lives + flag,
  villain panel, centre messages). Communicates via a shared `UKP.bus` emitter.
- **art.js** — pixel sprite/animation factory (man, officer, bins, hearts, flag,
  portraits) drawn with integer-aligned rects.
- **world.js** — scenery textures + parallax layout (sky gradient, clouds,
  skyline, terraces, wall/hedge, pavement, lamp, sign, POLICE car).
- **audio.js** — tiny WebAudio chiptune blips (throw, hit, hurt, jump, fanfare).

## Data / state

- Run state passed between stages via scene data: `{ stage, score, lives }`.
- Per-stage config table (`STAGES`): world width, defeat target, officer speed /
  max alive / spawn cadence, boss HP, boss name.
- HUD state pushed over `UKP.bus` events: `score`, `hearts`, `lives`, `boss`,
  `message`.

## Stages

| # | Name | Target | Officers | Boss |
|---|---|---|---|---|
| 1 | Brick Lane | 6 | slower, max 3 | SGT. NONSENSE (6 HP) |
| 2 | Camden High St | 8 | max 4 | INSP. TRUNCHEON (8 HP) |
| 3 | Westminster | 10 | fastest, max 5 | CHIEF PLOD (11 HP) |

## Controls

- Move `← →` / `A D`; Jump `↑` / `W`; Action `SPACE` (pick / throw / bash).

## Error / edge handling

- `SPACE` is context-sensitive so the player always has a valid action.
- Thrown bins that miss land and become pickups again (bins are never "used up").
- Invulnerability window + blink after taking a hit; respawn on life loss; game
  over → return to title; stage clear / win → continue.

## Verification done

- All scripts syntax-checked.
- Headless Chrome screenshots confirm the title screen and Stage 1 render
  correctly (HUD, characters, scenery match the reference).
- Not verified headlessly: live input/combat (movement, throwing, officer AI) —
  these were reviewed in code but need a real browser to play-test.

## Possible follow-ups (out of scope for the prototype)

- On-screen touch controls for mobile.
- More bin/throw feel (arc preview, screen shake, KO animation frames).
- Background music loop; pause menu; high-score persistence.
- Show Big Ben more prominently between rooftops.

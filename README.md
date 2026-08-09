# STATIC — playable vertical slice

A working, deployable creature-collecting RPG slice. No build step, no
framework, no external art files — every sprite is drawn in code at runtime
(`assets/engine/sprites.js`). Plain HTML/CSS/JS with ES modules throughout.

## What's actually in this slice
- **Two connected maps**: Analog Outskirts ↔ Relay Tunnel (via a tunnel connector).
- **Three Glyphs**: Tuner, Buffer, Rift — full stats, movesets, wild encounter tables.
- **Full turn-based battle engine**: wild encounters AND multi-Glyph trainer
  battles with deploy order (opponent auto-sends the next Glyph as each faints).
- **One dialogue-only NPC** (Relay Keeper) and **one trainer NPC** (Jinx —
  neon_rival_01) with pre-battle/victory/defeat/rechallenge dialogue, Blicks +
  item rewards, and a 20-hour rechallenge cooldown.
- **One quest** (collect 3 Static Shards, return to the Relay Keeper).
- **Items + a fully hand-coded backpack** (DOM/CSS only — no image assets of
  any kind in the backpack UI, per spec).
- **Blicks currency**, wallet, and trainer-defeat state — all in the save file.
- **File-based save/load**: download a real `.json`, re-import it, land back
  in the exact spot, map, party HP, quest progress, and wallet.
- **Touch joystick + keyboard**, multi-touch safe, no page scroll anywhere.
- **Global error overlay** — any crash shows centered text instead of a blank page.

## How to run it
Just open `index.html` in a browser — no build, no server required (though a
local static server avoids any browser file:// quirks: `npx serve .`).

## Deploy to GitHub Pages
1. Push this whole folder to a repo (index.html must be at the repo root, or
   set Pages to serve from `/docs` and rename this folder accordingly).
2. Repo Settings → Pages → Deploy from branch → `main` → `/ (root)`.
3. Done — it's fully static.

## Known simplifications (intentional, for a working slice)
- **Stat stages are direct multipliers**, not a clamped ±6-stage system —
  simpler and still functional, easy to swap later in `battleEngine.js`'s
  `applyStatusEffect`.
- **The "return and talk" quest step** completes as soon as both conditions
  are true in any order (collect 3, AND have talked to the Relay Keeper at
  any point) rather than strictly requiring a fresh visit *after* finishing
  collection. Harmless — the quest still completes and grants its reward —
  just slightly more lenient than "must physically walk back after."
- **Sprites are procedurally drawn shapes**, not hand-illustrated art. This
  was a deliberate substitution: there's no general web-image-download tool
  available to pull "real" art, and doing so would also risk copyright on
  anything that wasn't originally licensed. Swapping in real PNGs later is a
  drop-in change — see `assets/engine/sprites.js`, everything renders through
  `getSprite(kind, w, h, descriptor)`.
- **Content volume is intentionally small** (2 maps, 3 creatures, 2 NPCs, 1
  quest) so every system is real and fully wired end-to-end, rather than
  broad and half-working. Follow the modular pattern already established —
  one new file + one registry line — to expand any category:
  `assets/maps/`, `assets/creatures/`, `assets/items/`, `assets/npcs/`,
  `assets/quests/`.

## How to add things (the modular pattern, proven by this slice)
- **New map**: add `assets/maps/{id}.js` following the existing shape, import
  it in `assets/maps/index.js`. Connect it to another map with a `connectors[]`
  entry + a matching `spawnPoints[]` entry on the other side.
- **New creature**: add `assets/creatures/{id}.js`, import in
  `assets/creatures/index.js`. Reference its moves from `assets/data/moves.js`
  (add new moves there the same way).
- **New item**: add `assets/items/{id}.js`, import in `assets/items/index.js`.
- **New NPC**: add `assets/npcs/{id}.js`, import in `assets/npcs/index.js`.
  Add an optional `trainer: {...}` block to make it battle-capable — dialogue-
  only NPCs need no changes to support this, it's fully opt-in.
- **New quest**: add `assets/quests/{id}.js`, import in `assets/quests/index.js`.
  Step types `collect` / `talk` / `defeat` / `reach` are generic — `defeat`
  works against both a creature `speciesId` and a trainer NPC `id`.

## Testing notes
Every file passed `node --check` (ES module syntax), every relative import
resolves to a real file, and every named import has a matching export —
verified programmatically before packaging. One real logic bug was caught
and fixed during review: a simultaneous opponent-team-advance + player-faint
on the same turn could previously mask the player's forced-switch prompt;
`checkFaintsAndContinue()` in `battleEngine.js` now checks both sides on
every call.

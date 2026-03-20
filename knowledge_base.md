# p5.waves — Knowledge Base

## Architecture

- Single-file IIFE library (`p5.waves.js`, ~502 lines) with a hand-maintained minified copy (`p5.waves.min.js`).
- No build pipeline, no `package.json`, no test suite. Minified file must be regenerated manually.
- 34 wave formulas compiled at runtime via `new Function()` with a compile cache.
- Deterministic randomness via FNV-1a seeding + Mulberry32 PRNG. Deterministic noise via hash-based value noise.
- CI: GitHub Pages deployment on push to `main` or `fusion/v1-spirit` only.

## Key API Surface

| Function | Returns |
|---|---|
| `Waves.wave(y, secondParam)` | Number (amplitude-scaled or range-normalised) |
| `Waves.createSampler(opts)` | `{ sample(y, t, mix) → Number }` |
| `Waves.createGrid(cols, rows, opts)` | `{ sample(t) → Float32Array or Uint8Array }` |
| `Waves.list()` | Array of `{ index, name, algo }` |

## Defaults (v2.1.1)

- `amplitude`: **100** (changed from 1 in v2.1.0; docs corrected in v2.1.1)
- `frequency`: 1
- `phase`: 0
- `mode`: 'stable'
- `seed`: 0

## Naming Conflicts Resolved

Several identifiers were renamed to avoid collisions with p5.js globals:
- `WORD` → `LETTERS`
- `step` → `stride`
- `focused` → `hoveredWave`
- `GRID` → `CELLS`
- `brightness` → `luma`

## Morph Behaviour

- Morph path (`wave: ['a', 'b']`) performs linear interpolation: `(valA + (valB - valA) * mix) * amplitude`.
- Morph path does **not** apply `range` normalisation — this is by design after the fix in commit `b3dea93`.

## File Layout

| Path | Purpose |
|---|---|
| `p5.waves.js` | Full source |
| `p5.waves.min.js` | Minified build (manual) |
| `index.html` | Main showcase landing page |
| `docs/` | Site pages: guide, about, examples gallery |
| `docs/sketch.js` | All p5 sketches for the showcase |
| `docs/style.css` | Shared styles for docs pages |
| `examples/` | 17 standalone example folders (00–17, no 07). Ex 01 = "Wave Shift" (single wave morphing via lerp) |
| `examples/showcase.css` | Shared styles for examples |
| `examples2/` | 6 creative showcase examples (18–23) |
| `examples2/showcase.css` | Shared styles for examples2 |
| `docs/examples2.html` | Examples 2 animated gallery page |
| `src/content/libraries/en/p5.waves.yaml` | p5.js library registry entry |

## Examples 2 — Creative Showcases

| Folder | Concept |
|---|---|
| `18_mood_machine` | Pick a feeling (calm, anxious, playful, dreamy, mechanical, broken) — same radial composition, different wave formula |
| `19_wave_zoo` | Bestiary: 34 wave "creatures" with name, temperament, and animated portrait |
| `20_one_scene_34_moods` | Identical grid of circles — only the wave index changes, formula determines atmosphere |
| `21_fabric` | Material simulation (silk, water, burlap, rubber, grass, cable) — no physics, just waves |
| `22_particle_forces` | Wave-driven particles: smoke, dust, confetti, fireflies, snow, sparks |
| `23_poster_generator` | Graphic design engine: breathing borders, flowing ornaments, wave-modulated typography |

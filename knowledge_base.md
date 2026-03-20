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
| `examples/` | 18 standalone example folders |
| `examples/showcase.css` | Shared styles for examples |
| `src/content/libraries/en/p5.waves.yaml` | p5.js library registry entry |

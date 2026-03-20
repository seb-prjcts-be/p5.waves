# p5.waves — Strategy

## Health Inspection (2026-03-20) — Resolved

All critical and moderate issues from the initial inspection have been fixed:

| # | Issue | Resolution |
|---|---|---|
| 1 | amplitude default wrong in docs (`1` vs `100`) | Fixed in `README.md`, `README_NL.md`, `docs/guide.html` |
| 2 | Version header stuck at 2.1.0 | Bumped to 2.1.1 in source, minified, all CDN refs, doc badges, example footers |
| 3 | YAML says 35 waves (library has 34) | Fixed in `src/content/libraries/en/p5.waves.yaml` |
| 4 | Orphaned `examples/06_create_sampler/` | Removed (unreferenced, duplicate `06_` prefix) |

## Examples 2 (2026-03-20) — Added

New `examples2/` directory with 6 creative showcases. Goal: show the library as a behaviour/character engine, not just an oscilloscope.

| # | Example | Concept |
|---|---|---|
| 18 | Mood Machine | User picks a feeling → wave + palette + speed change together |
| 19 | Wave Zoo | Bestiary of 34 waves with name, temperament, animated portrait |
| 20 | One Scene, 34 Moods | Identical composition — only the formula changes the atmosphere |
| 21 | Fabric | Material simulation without physics (silk, water, burlap, rubber, grass, cable) |
| 22 | Particle Forces | Waves as force fields (smoke, dust, confetti, fireflies, snow, sparks) |
| 23 | Poster Generator | Graphic design engine with breathing borders and wave-modulated typography |

p5.js global naming conflicts found and fixed: `GRID` → `CELLS`, `brightness` → `luma`.

## Examples 1 Review (2026-03-20) — Use Case I

Example 01 redesigned from "Wave Curtain" (50-thread complexity) to **"Wave Shift"** — a single wave that randomly morphs into a new formula every few seconds using the library's built-in lerp (`wave: ['a', 'b']` + `mix`).

| Aspect | Before | After |
|---|---|---|
| Usability | Complex (50 threads, multiple params) | One wave, one concept, easy to copy |
| Beauty | Busy curtain effect | Clean single-line morph with smooth easing |
| Simplicity | Many moving parts | Minimal state machine: hold → morph → hold |
| Originality | Generic multi-thread demo | Showcases the unique morph/lerp API as the first thing new users see |

Changes: `sketch.js` rewritten, `index.html` updated (title, description, code snippet), `docs/examples.html` gallery section and inline thumbnail sketch updated. Legacy `js/` and `css/` subfolders removed.

### Remaining observations (non-blocking)

- **No automated minification**: `p5.waves.min.js` is hand-maintained.
- **No `AGENTS.md`**: intentionally deleted.
- **Gallery is curated**: 14 of 17 examples shown as thumbnails; intentional.
- **CI deploys `main` and `fusion/v1-spirit` only**.
- **No test suite or `package.json`**: zero-dependency vanilla JS library.

# p5.waves — Version History

## v2.2.0

### Internal normalization

All 34 wave formulas are now internally normalized to [-1, 1] before amplitude scaling.

- `amplitude: N` guarantees output in [-N, N] for every formula
- Shift transitions are smooth — no scale jumps between formulas
- Wild mode is more predictable and usable at higher unpredictability values
- `range` works as before — unaffected by the change
- Amplitude default remains 100
- p5.js updated to 2.2.2

## 2.1.1

- Examples page redesigned as a lightweight animated gallery: 14 small thumbnail sketches replace the previous layout of full code panels + full-size canvases running simultaneously. Each thumbnail links to its standalone example page where the full code lives.
- Removed copy-paste code blocks and copy-button from examples.html — code is on the individual example pages.
- Added example `17_3d_wave_volume` to README and README_NL example lists.
- Guide: updated working-examples count to 17.

## 2.1.0

- Default amplitude changed from `1` to `100` — `Waves.wave()` and `createSampler()` now produce visible pixel values out of the box without setting amplitude explicitly
- Gallery showcase: larger amplitude, removed Math.tanh clamp for more expressive wave rendering
- CDN references updated to v2.1.0

## 2.0.0 — Complete Rewrite

**v1 call patterns are not supported in v2.** The v1 source is available at the [`v1` tag](https://github.com/seb-prjcts-be/p5.waves/tree/v1) on GitHub.

### What changed

- `wave(y, secondParam)` always returns a **number**. No more `{x, z}` objects, no axis parameter.
- Time is **explicit**: pass `t` in options instead of relying on an internal clock.
- `range: [min, max]` replaces the old `normalize + range` combination.
- 34 curated waves with **unique names** (removed 3 near-identical duplicates from v1).
- `createSampler(opts).sample(y, t)` returns a number. Use two samplers for 3D.
- `createGrid(cols, rows, opts).sample(t)` returns `Float32Array` or `Uint8Array`.

### Removed functions

| v1 | v2 replacement |
| --- | --- |
| `setWaveParams` | pass options directly to `wave()` |
| `setTimeMode` | pass `t` explicitly |
| `tick` | increment your own time variable |
| `sample` | `createSampler().sample(y, t)` |
| `grid` / `createGridSampler` | `createGrid(cols, rows, opts).sample(t)` |
| `seedFrom` | internal; not exposed |
| `aliases` / `families` | removed |
| `getWaveByIndex` / `getWaveByName` | `Waves.list()` / `Waves.data` |

### Removed parameters

| parameter | reason |
| --- | --- |
| `axis` | `wave()` always returns a number now |
| `refresh` / `seconds` | time is explicit via `t` |
| `normalize` (bool) | replaced by `range: [min, max]` |
| `domain` | map your input manually before passing `y` |
| `samples` | internal detail, not needed |
| `modulation` | removed; use `mode: 'wild'` instead |

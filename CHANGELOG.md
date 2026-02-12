# Changelog

## 2.2.0
- Added `archive/v1` preservation layer with historical legacy build files:
  - `archive/v1/p5.waves.v1.js`
  - `archive/v1/p5.waves.v1.min.js`
  - `archive/v1/dataset.json` (37-wave snapshot)
  - `archive/v1/README_ARCHIVE.md`
- Added `examples/07_archive_comparison` to visualize stable v2.1 core vs legacy archive personality.
- Updated README with an `Archive & Legacy Builds` section and clear positioning of archive vs default engine.

## 2.1.0
- Reworked wave engine to an energy-consistent architecture with external `frequency` and `amplitude`.
- Added normalized unit-phase wave definitions grouped by family (`classic` and `sculptural`).
- Added soft-clipping safety for explosive sculptural formulas before normalization.
- Implemented stable per-wave normalization with RMS energy matching for more predictable dynamics.
- Rebuilt `createSampler()` around the new architecture, including optional modulation.
- Added `mode: 'stable' | 'wild'` and `unpredictability` controls for controlled chaos on top of the stable core.
- Added `createGridSampler()` / `grid()` for binary matrix workflows (14x14 style) with thresholding and pair stepping.
- Replaced preset set with 5 rewritten examples: `classicSine`, `triangle`, `sawRise`, `squarePulse`, `tangentBloom`.

## 2.0.0
- Breaking: wave name strings are now camelCase (legacy spaced or shape names still resolve).
- Synced examples and documentation to use camelCase names.
- Synced example bundles to the v2.0.0 library build.

## 1.1.0
- Added `amplitude` as the preferred option; `scale` remains supported.
- Added a non-conflicting `p.waves(...)` alias for instance mode.
- Updated documentation and examples.

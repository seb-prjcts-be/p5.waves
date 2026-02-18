# Changelog

## 1.2.0
- Legacy continuation release branched from `1.1.0`.
- Documentation now states the legacy target clearly: normalize formulas into simple, usable variations.
- Added primary normalization names: `inputDomain` and `outputRange` (`domain`/`range` remain aliases).
- Added central `Waves.sample(y, options)` path while preserving legacy signatures.
- Added stepping modes via `step.seconds` and `step.frames`.
- Added deterministic order controls: `sequential`, `shuffle`, `random`, with `orderSeed` and `noRepeat`.
- Added formula variable support via `v` plus `formulaVars`/`params` merging.
- Added diagnostics tooling: `Waves.stats`, `Waves.analyze`, and `Waves.flagOutliers`.
- Added `Waves.migrateAlgo` helper for replacing fixed constants with `v.*` style params.

## 1.1.0
- Added `amplitude` as the preferred option; `scale` remains supported.
- Added a non-conflicting `p.waves(...)` alias for instance mode.
- Updated documentation and examples.

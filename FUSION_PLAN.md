# Fusion Plan: p5.waves v1 spirit + selected upgrades

## Why
This repo drifted between two goals:
- `p5.waves`: expressive formula-driven legacy behavior.
- `v2+`: newer "energy-consistent" direction that may belong in a separate project (`p5.easywaves`).

This plan keeps the soul of `v1.0` while taking only the upgrades that improve reliability and usability.

## Product direction (current decision)
- Keep this repo focused on `p5.waves` identity.
- Use `v1.0` behavior as creative baseline.
- Pull in selected technical improvements from `v1.2` and later work.
- Move fully new model ideas (energy engine / grid engine experiments) to a separate repo (`p5.easywaves`).

## Baseline findings from git history
- `v1.0.0` -> classic formula set and simple mental model (`scale`, direct formula character).
- `v1.2.0` -> strongest compatibility layer:
  - `amplitude` (with `scale` alias),
  - better naming/lookup flexibility,
  - diagnostics (`stats`, `analyze`, `flagOutliers`),
  - safer p5 alias (`p.waves`) and no global `wave` collision dependency.
- `v2.0.0` (tag) -> mostly transitional cleanup (naming and API polish), not final architecture.
- `main` (`v2.1.0`) -> substantial new engine (frequency/phase/mode/grid model), likely better as separate product line.

## Keep / Adopt / Exclude

### Keep (core identity)
- Formula-driven wave dataset character.
- `Waves.wave(y, select, seconds, axisOrOptions)` as main entry.
- Simple "sample one input, get x/z offsets" workflow.

### Adopt in this repo
- `amplitude` as preferred output control (`scale` remains alias).
- `p.waves` alias for instance mode safety.
- Robust name resolving (spaces/hyphens/case-insensitive matching).
- Optional diagnostics from `v1.2` (`stats`, `analyze`, `flagOutliers`).

### Exclude from this repo (move to p5.easywaves)
- Full energy-consistent replacement model.
- Grid engine as primary identity.
- Wild/stable behavior modes as mandatory default concept.

## Technical roadmap

### Phase 1: Stabilize branch intent
1. Keep `legacy-formulas-v1.2.0-work` as maintenance line.
2. Create new feature branch from `v1.0.0` (working name: `fusion/v1-spirit`).
3. Port selective commits/API pieces from `v1.2` into `fusion/v1-spirit`.

### Phase 2: Compatibility hardening
1. Add regression checks for key named waves across fixed inputs.
2. Verify `scale` and `amplitude` parity.
3. Confirm API parity for:
   - `Waves.wave`
   - `Waves.sample`
   - `Waves.createSampler`
   - p5 prototype aliases

### Phase 3: Split advanced line
1. Create/prepare `p5.easywaves` repo from `main` direction.
2. Keep shared naming and docs references clear between projects.
3. Cross-link both projects in README files with explicit "when to use which".

## Immediate next implementation target
- Build `fusion/v1-spirit` branch and apply the smallest safe merge set:
  1. `amplitude` + `scale` compatibility,
  2. `p.waves` alias,
  3. no global `wave` helper,
  4. improved name resolution.

If this target stays stable after tests/examples, we can add diagnostics in a second pass.

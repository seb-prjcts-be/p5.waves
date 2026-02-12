# p5.waves Legacy Archive (v1)

This folder preserves the pre-v2 waveform system as a historical archive.

## Purpose

`p5.waves` v2.x is the primary, energy-consistent engine.
This archive exists to preserve early community formula culture and exploratory math behavior.

## Included Files

- `p5.waves.v1.js`: original legacy build from tag `v1.1.0`
- `p5.waves.v1.min.js`: original legacy minified build from tag `v1.1.0`
- `dataset.json`: extracted 37-wave dataset snapshot from the legacy build

## Archive Characteristics

Legacy waves are intentionally raw and may:

- spike or overflow
- show uneven energy between formulas
- feel less predictable
- differ strongly from v2 normalized behavior

This is expected and preserved by design.

## Important Boundaries

- Legacy build is not auto-loaded.
- Legacy build is not the default engine.
- v2.x API and behavior stay primary.
- This folder is preservation, not fallback.

## Quick Local Use

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js"></script>
<script src="../../archive/v1/p5.waves.v1.min.js"></script>
```

```js
const x = Waves.wave(y + t, 'classic sine', null, {
  amplitude: 120,
  normalize: true,
  range: [-1, 1]
});
```

## Attribution

The historical dataset includes formulas inspired by and attributed to community handles, including:

- `tw@GenerativePunk`
- `gh@ffd8`

See root `README.md` for broader credits and attribution notes.
# p5.waves — Strategy

## Health Inspection Findings (2026-03-20)

### Critical — Documentation/Code Mismatch

1. **amplitude default wrong in README**: Both `README.md` (line 48) and `README_NL.md` (line 48) document `amplitude` default as `1`. Code uses `100` since v2.1.0. The copy-paste template sections also show `// amplitude: 1`.

2. **Version header not bumped to 2.1.1**: `HISTORY.md` documents v2.1.1 changes, but `p5.waves.js` and `p5.waves.min.js` both still say `Version 2.1.0` in the header comment.

3. **YAML says 35 waves, library has 34**: `src/content/libraries/en/p5.waves.yaml` description says "35 wave types" — the library defines 34.

### Moderate

4. **Orphaned `examples/06_create_sampler/`**: Exists on disk but is referenced nowhere (no docs, no gallery, no README). Uses old-style layout without `showcase.css` or footer template. Shares the `06_` prefix with the active `06_seconds_param` folder.

5. **No automated minification**: `p5.waves.min.js` is hand-maintained. Currently appears functionally in sync with source, but any source edit risks drift.

6. **Missing `AGENTS.md`**: Intentionally deleted (commit `1ad2a4b`). No agent context for automated tooling.

### Minor / Observations

7. **Gallery is curated**: `docs/examples.html` shows 14 of 18 examples as thumbnails. Five standalone examples (`03`, `04`, `05`, `08`, `09`) are not in the gallery but are listed in the README. Likely intentional.

8. **CI only deploys `main` and `fusion/v1-spirit`**: Feature branches are not deployed to Pages.

9. **No test suite or package.json**: The project is a zero-dependency vanilla JS library with no automated tests.

## Recommended Actions

| Priority | Action | Files |
|---|---|---|
| High | Fix amplitude default in docs from `1` → `100` | `README.md`, `README_NL.md` |
| High | Bump version to 2.1.1 in source headers | `p5.waves.js`, `p5.waves.min.js` |
| High | Fix YAML wave count 35 → 34 | `src/content/libraries/en/p5.waves.yaml` |
| Medium | Decide: delete or integrate orphaned `06_create_sampler` | `examples/06_create_sampler/` |
| Low | Consider adding automated minification (e.g. `terser`) | — |
| Low | Consider adding basic automated tests | — |

# p5.waves — Strategy

## Health Inspection (2026-03-20) — Resolved

All critical and moderate issues from the initial inspection have been fixed:

| # | Issue | Resolution |
|---|---|---|
| 1 | amplitude default wrong in docs (`1` vs `100`) | Fixed in `README.md`, `README_NL.md`, `docs/guide.html` |
| 2 | Version header stuck at 2.1.0 | Bumped to 2.1.1 in source, minified, all CDN refs, doc badges, example footers |
| 3 | YAML says 35 waves (library has 34) | Fixed in `src/content/libraries/en/p5.waves.yaml` |
| 4 | Orphaned `examples/06_create_sampler/` | Removed (unreferenced, duplicate `06_` prefix) |

### Remaining observations (non-blocking)

- **No automated minification**: `p5.waves.min.js` is hand-maintained.
- **No `AGENTS.md`**: intentionally deleted.
- **Gallery is curated**: 14 of 17 examples shown as thumbnails; intentional.
- **CI deploys `main` and `fusion/v1-spirit` only**.
- **No test suite or `package.json`**: zero-dependency vanilla JS library.

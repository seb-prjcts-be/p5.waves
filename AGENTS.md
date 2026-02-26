# AGENTS.md

## Cursor Cloud specific instructions

This is **p5.waves** — a vanilla JavaScript library (addon for p5.js) with no build system, no package manager, and no dependencies to install.

### Running the project

Serve the repo root with any static HTTP server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` for the examples landing page, or go directly to an example such as `http://localhost:8080/examples/00_wave_lab/`.

### Key facts

- There is no `package.json`, no npm/yarn/pnpm, and no build step. The library ships as hand-written `p5.waves.js` and pre-minified `p5.waves.min.js`.
- There is no test framework or linting configuration. Validation is done by running the examples in a browser.
- p5.js is loaded from CDN (`https://cdn.jsdelivr.net/npm/p5@2.1.1/lib/p5.js`) in each example's `index.html`. No local install needed.
- The Wave Lab (`examples/00_wave_lab/`) is the primary interactive explorer for testing library behavior.
- Examples reference the library via relative path `../../p5.waves.min.js`, so the HTTP server must be started from the repo root.
- Deployment is via GitHub Pages (`.github/workflows/pages.yml`), triggered on pushes to `fusion/v1-spirit`.

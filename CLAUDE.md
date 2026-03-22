# CLAUDE.md — Project Briefing for AI Agents

> **MANDATORY — Read this file completely before writing, editing, or
> suggesting any code, file, or documentation in this project.**
>
> This applies to every session, every task, every change — no exceptions.
> A partial read is not sufficient. Start no work until you have read
> every section.
>
> Confirm you have read this document by opening your first response with
> a summary of these three non-negotiable decisions:
> 1. `Waves.wave()` always returns a number — no exceptions
> 2. Time is always explicit — the library has no internal clock
> 3. Every example change must be applied at all three levels simultaneously
>
> If you cannot confirm all three, re-read sections 4, 5, and 10
> before proceeding.

---

## 1. Project Identity

p5.waves is a p5.js addon library that provides 34 curated wave formulas
as a single number-returning function — analogous to `noise(y)`, but with
distinct, named, periodic characters that can be switched, morphed, and
varied to produce structured surprise.

**One-line definition:**
Pass a coordinate, get a number. Use that number for anything.

**Mental model for the AI:**
Think of `Waves.wave(y)` exactly as you think of `noise(y)` in p5.js.
The difference: instead of one Perlin field, you have 34 curated formulas,
each with a recognisable character. Switching between them produces
variation that is always structured — never random noise, never chaos.

**Version:** 2.1.1 (current stable, deployed via CDN and GitHub Pages)
**License:** MIT
**File:** single-file IIFE — `p5.waves.js` with a hand-maintained `p5.waves.min.js`
**No build pipeline. No package.json. No test suite.**

---

## 2. Core Design Principles

These three principles are non-negotiable. Every decision — API design,
example code, documentation, AI suggestions — must be measured against them.

### 2.1 Simplicity is a hard requirement, not a style choice

If a user has to contort their code to use this library, the library is broken.
The fix belongs in the library, not in the user's sketch.

- The entry point is always `Waves.wave(y)` — one function, one number back
- Instance mode, createSampler, and createGrid are advanced features;
  never lead with them when simpler alternatives exist
- Copy-paste examples must work without modification

### 2.2 Variation is the core value proposition

p5.js sketches are deterministic by default — they look the same on every run.
p5.waves exists to change that. Wave switching, seeding, morphing, and wild mode
give the sketch a different result every time, while remaining structurally legible.

- Apply this principle to the examples themselves: sketches should show
  variation across runs, not just demonstrate a static API call
- Transitions between wave formulas are essential — use wave shapes
  for the transitions themselves (easing via wave output, not linear lerp)

### 2.3 Creativity return on investment

Examples must give back more than the user puts in.
A short, simple sketch should produce a surprising, expressive result.
If an example feels like a lot of code for a small payoff, it is wrong.

- Think: play, minimal effort, maximum visual surprise
- Out-of-the-box imagination is the standard, not the exception
- Chaos (including tan artifacts, wild mode extremes) is a feature —
  but it must always be switchable off

---

## 3. Aesthetic Contract

### 3.1 Structured surprise

The library operates in the space between predictability and chaos.
Every wave formula is periodic and structurally legible — you can follow
its rhythm. Switching formulas produces unexpected variation, but the
result always has a recognisable shape.

This is not a rule about visual style. It is a rule about what the library
is allowed to produce. Output that feels purely random has failed.

### 3.2 Chaos is welcome, but must be controllable

Tan artifacts, extreme wild mode values, and formula-switching discontinuities
are not bugs — they are part of the character of the library.
They must remain accessible. They must also be switchable off.

- `mode: 'stable'` is the safe default
- `mode: 'wild'` with `unpredictability: 0..1` is the chaos dial
- Never remove or suppress extreme behaviour in the formulas themselves
- Document chaos-prone formulas; do not sanitise them silently

### 3.3 Transitions are first-class

Moving from one wave formula to another is not an afterthought.
Transitions are part of the aesthetic experience and should:
- Use wave output to shape the transition curve (not plain linear interpolation)
- Be measurable and controllable by the user
- Be demonstrated explicitly in examples where relevant

### 3.4 Timing and rhythm matter

Variation is not just about which formula is active — it is about
when it changes and how fast. Time (`t`) is always explicit and
always the user's responsibility. The library never drives time internally.

### 3.5 UI and code sobriety

Work with existing UI elements, styles, and patterns — never introduce
new CSS classes, layout structures, or JS patterns when existing ones cover the need.
Reuse what is there. The codebase has an established visual language;
extend it, do not compete with it.

- `examples/showcase.css` and `examples2/showcase.css` are the shared style bases
- `docs/style.css` governs all documentation pages
- Before adding a style rule, check if an existing rule already applies
- Before adding a helper function, check if the pattern already exists in the sketch

---

## 4. API Mental Model

### 4.1 Entry point: always start here

The correct introduction to this library is always:

```js
Waves.wave(y)
```

One function. One number back. No setup, no configuration required.
This is the mental model. Everything else is optional layering on top.

### 4.2 Onboarding order — never skip steps

Introduce features in this order only:

1. `Waves.wave(y)` — pass a coordinate, get a number
2. `Waves.wave(y, 'triangle')` — pick a formula by name
3. `Waves.wave(y, { wave: 'triangle', t: millis()/1000 })` — add time
4. `Waves.wave(y, { range: [-80, 80] })` — normalise output
5. `Waves.createSampler(opts)` — reuse config across calls
6. `Waves.createGrid(cols, rows, opts)` — 2D grid sampling
7. `mode: 'wild'`, `unpredictability` — controlled chaos

Never lead with instance mode, createSampler, or createGrid
when a simpler form of the API solves the problem.

### 4.3 Global mode first

All examples use p5.js global mode unless the example is explicitly
about instance mode. In global mode, `waves()`, `createWaveSampler()`,
and `createWaveGrid()` are available without the `Waves.` prefix.

### 4.4 Time is always explicit

`t` is never managed internally. The user passes `millis()/1000`
or their own counter. Do not suggest internal clocks, `frameCount`,
or automatic time increments as defaults — always show explicit `t`.

### 4.5 secondParam shorthand

`Waves.wave(y, 3)` — `3` is a **seed** (hashed to select a formula).
`Waves.wave(y, { wave: 3 })` — `3` is a direct **index**.
These are not the same. Never conflate them in documentation or examples.

---

## 5. The Three-Level Sync Rule

Every example exists at three levels simultaneously.
A change at any level must be applied to all three before the work is done.

### The three levels

| Level | Location | What it contains |
|---|---|---|
| Gallery thumbnail | `docs/examples.html` or `docs/examples2.html` | Inline p5 sketch (small canvas) + short description |
| Standalone page | `examples/NN_name/index.html` | Full code visible on page, full-size canvas |
| Downloadable folder | `examples/NN_name/sketch.js` | The actual working sketch file |

### Rules

- Never update only one or two levels. All three, always.
- The inline thumbnail sketch in the gallery must match the standalone sketch
  in concept and API usage — not necessarily pixel-perfect, but never contradictory
- If the standalone sketch uses a specific wave formula or parameter,
  the gallery description must reflect that
- If a variable is renamed in the sketch, rename it everywhere:
  gallery inline code, standalone index.html code block, and sketch.js

### Examples 2

`examples2/` follows the same rule with its own gallery at `docs/examples2.html`.
Treat examples2 as a parallel system with identical sync obligations.

### Verification checklist before finishing any example change

- [ ] `docs/examples.html` or `docs/examples2.html` gallery section updated
- [ ] `examples/NN_name/index.html` standalone page updated
- [ ] `examples/NN_name/sketch.js` working file updated
- [ ] No console errors in any of the three
- [ ] Variable names checked against p5.js 2.x globals

---

## 6. Examples Philosophy

### 6.1 One concept per example

Each example demonstrates exactly one idea.
Not one function — one concept. The concept should be stated in the
folder name and the page title. If you cannot state it in three words,
the example is trying to do too much.

### 6.2 Variation by default

Examples are not static demonstrations. They should produce a different
result on every run, or respond to interaction in a way that reveals
variation. Acceptable variation mechanisms:

- Random seed selection at startup (`floor(random(34))` to pick a wave)
- Automatic morphing between formulas over time
- User interaction that changes the active formula or parameter
- Wild mode with a visible unpredictability dial

A sketch that looks identical on every run is not demonstrating
the library's core value.

### 6.3 Creativity ROI

The ratio of code to visual payoff must favour the output.
Short sketches that produce rich, surprising results are the standard.
If the sketch is long and the result is modest, simplify the sketch.

Reference bar: Example 01 (Wave Shift) — one wave, one morph cycle,
smooth easing, striking result. This is the benchmark for simplicity
and payoff.

### 6.4 Code style — no exceptions

All example code must follow these rules without exception:

- Regular functions only — no arrow functions, no `.map()`, no `.forEach()`
- `for` loops for iteration
- No `let`/`const` inside `draw()` for values that do not change —
  declare at the top of the sketch
- Variable names must not conflict with p5.js 2.x globals, methods,
  or constants — triple-check before committing
- Comments use `//` only — no block comments in example code
- Comments in English, concise, only where the logic is not self-evident

### 6.5 Audience calibration

Write examples as if the reader knows p5.js basics but has never seen
this library. Do not assume knowledge of instance mode, samplers, or
advanced options on first encounter. Complexity may increase across
the example series — never within a single example.

### 6.6 Examples 2 — creative showcases

`examples2/` (18–23) are creative showcases, not API tutorials.
They demonstrate the library as a behaviour and character engine.
The bar is higher: each must feel like a finished piece, not a demo.
Variation, atmosphere, and surprise are mandatory — not optional.

---

## 7. Audience

### 7.1 Primary audience

Creative coders who use p5.js — ranging from students encountering
generative code for the first time to experienced practitioners building
interactive installations, data visualisations, or generative art.

The reference projects are **p5.play** and **Scratch**:
accessible enough for classroom use, expressive enough for professionals.

### 7.2 What this means in practice

**For beginners:**
- The first example they see must work by copy-paste, with zero configuration
- Error messages from the library must never appear in a working sketch
- Variable names in examples must be self-explanatory (`waveHeight`, not `v`)
- Comments explain the *why*, not the *what*

**For experienced users:**
- The advanced API (createSampler, createGrid, wild mode, morph paths)
  must be discoverable without reading the full guide
- The guide at `docs/guide.html` is the authoritative reference —
  keep it current with every API change
- Both READMEs (`README.md` and `README_NL.md`) must stay in sync
  with each other and with the guide at all times

### 7.3 Tone in documentation and examples

- Direct and concrete — no marketing language
- Show the result first, explain the mechanism second
- Never write "powerful" or "flexible" — show it instead
- Dutch and English are both used in this project;
  `README_NL.md` is the Dutch version of `README.md` —
  any change to one requires the same change to the other

---

## 8. What AI Must Never Do

These are failure modes observed in previous sessions.
Treat each item as a hard stop, not a guideline.

### 8.1 Never introduce arrow functions or array methods in example code

This restriction applies to sketch files and inline gallery code only.
The library source (`p5.waves.js`) may use arrow functions, complex patterns,
and modern JS freely — speed and internal clarity are priorities there.

In example code (sketch.js, inline thumbnails, code blocks in index.html):
- Regular functions only — no arrow functions
- `for` loops for iteration — no `.map()`, `.forEach()`, `.filter()`
- Comments use `//` only — no block comments in example code
- This applies even when the arrow function version is shorter or "cleaner"

### 8.2 Never lead with advanced API features

Do not introduce `Waves.createSampler`, `Waves.createGrid`, or instance mode
as the first or default solution. Always check whether `Waves.wave(y)`
solves the problem first. Complexity is introduced only when the simpler
form is genuinely insufficient.

### 8.3 Never update only one or two levels of an example

If a sketch changes, all three levels change: gallery thumbnail,
standalone page, downloadable sketch file. Partial updates are bugs.

### 8.4 Never leave console errors in place

Console errors are bugs. A working sketch produces no console output.
Check for errors after every change, not just after major rewrites.

### 8.5 Never reuse a variable name that exists in p5.js 2.x

Before naming any variable, check it against p5.js globals, methods,
and constants. Known past conflicts: `step`, `focused`, `WORD`,
`colorMode`, `alpha`, `mix`, `brightness`, `GRID`.
When in doubt, prefix with a context word (`waveAlpha`, not `alpha`).

### 8.6 Never make the user's code more complex to work around a library limitation

If user code becomes awkward, the fix belongs in the library or the example —
not in instructions to the user to write differently.

### 8.7 Never sync documentation partially

`README.md`, `README_NL.md`, and `docs/guide.html` describe the same API.
A change to one requires the same change to the other two.
Version numbers, default values, parameter names — all three, always.

### 8.8 Never add styles, helpers, or abstractions without checking what exists

Before writing a new CSS rule, check `showcase.css` and `docs/style.css`.
Before writing a helper function, check if the pattern already exists in the sketch.
Reuse first. Add only what is genuinely absent.

### 8.9 Never suppress or sanitise chaos

Tan artifacts, wild mode extremes, and discontinuous formula switches
are features. Do not clamp, smooth, or remove them silently.
If they must be controllable, expose the control — do not hide the behaviour.

### 8.10 Never write `wave()` without a prefix or context

`wave()` alone does not exist. Use:
- `Waves.wave(y)` — namespace form, always available
- `waves(y)` — global mode only (p5 prototype method)
- `p.waves(y)` — instance mode only

---

## 9. File Map & Sync Points

### 9.1 Core library files

| File | Purpose | Touch when |
|---|---|---|
| `p5.waves.js` | Full source — single IIFE | API changes, bug fixes, new features |
| `p5.waves.min.js` | Hand-maintained minified copy | Every time `p5.waves.js` changes |

The minified file is maintained manually. There is no build step.
After every change to `p5.waves.js`, update `p5.waves.min.js`.

### 9.2 Documentation files — always in sync

| File | Purpose | Touch when |
|---|---|---|
| `README.md` | English reference + API overview | Any API change, default value change, new example |
| `README_NL.md` | Dutch translation of README.md | Every time README.md changes |
| `docs/guide.html` | Full API guide with examples | Any API change, default value change |
| `docs/about.html` | Project background | Major version changes only |

These three documents describe the same API. They must always agree
on function names, parameter names, default values, and version number.

### 9.3 Examples — the three-level system

```
examples/
  00_wave_lab/          // interactive Wave Lab
  01_basic_wave/        // Wave Shift — morph demo, benchmark for simplicity
  02_instance_mode/
  03_basic_wave_instance/
  04_basic_wave_p2d/
  05_basic_wave_webgl/
  06_flow_fields/
  07_wave_params/
  08_triangle_domain/
  09_range_0_1/
  10_wave_override/
  11_tick_time_mode/
  12_color_spectrum/
  13_sound/
  14_typography/
  15_opacity/
  16_wave_chart/
  17_3d_wave_volume/

examples2/
  18_mood_machine/
  19_wave_zoo/
  20_one_scene_34_moods/
  21_fabric/
  22_particle_forces/
  23_poster_generator/
```

Each folder contains at minimum: `index.html`, `sketch.js`.
Shared styles live in `examples/showcase.css` and `examples2/showcase.css` —
never duplicate style rules into individual example folders.

### 9.4 Gallery pages

| File | Covers |
|---|---|
| `docs/examples.html` | Examples 00–17 (14 shown as thumbnails, curated) |
| `docs/examples2.html` | Examples 18–23 |

Gallery thumbnails are small inline p5 sketches — not iframes, not screenshots.
They must match the standalone sketch in concept and API usage.

### 9.5 Showcase

| File | Purpose |
|---|---|
| `index.html` | Main landing page with animated showcase |
| `docs/sketch.js` | All p5 sketches powering the showcase |
| `docs/style.css` | Shared styles for all docs pages |

### 9.6 CI / Deployment

| Trigger | Result |
|---|---|
| Push to `main` | Deploy to GitHub Pages |
| Push to `fusion/v1-spirit` | Deploy to GitHub Pages |
| All other branches | No deployment |

No build step. The entire repository is copied as-is to `_site/`.
`.git` and `.github` are excluded from the deployed artifact.

---

## 10. Non-negotiable Decisions

These decisions were made deliberately and have been confirmed through use.
Do not propose reversing them. Do not work around them.
If a use case seems to require revisiting one, flag it explicitly —
do not silently implement an alternative.

### 10.1 Waves.wave() always returns a number

No objects, no arrays, no `{x, z}` pairs. One coordinate in, one number out.
This is the entire contract of the primary API. It cannot be relaxed
without breaking every sketch that uses the library.

### 10.2 Time is always explicit

The library has no internal clock. The user passes `t` (typically `millis()/1000`).
`frameCount` is not a substitute. Automatic time is not a feature.
This decision enables reproducibility, composability, and manual control.

### 10.3 v1 call patterns are not supported in v2

`setWaveParams`, `setTimeMode`, `tick`, `sample`, `grid`, `seedFrom`,
`aliases`, `families`, `getWaveByIndex`, `getWaveByName` — all removed.
Parameters `axis`, `refresh`, `seconds`, `normalize` (bool), `domain`,
`samples`, `modulation` — all removed.
The v1 source is archived at the `v1` git tag. Do not re-introduce v1 patterns.

### 10.4 34 curated wave formulas — fixed set

The formula count is 34. Three near-identical duplicates were removed in v2.
Do not add formulas without a clear aesthetic reason that distinguishes
the new formula from all existing ones.
Do not remove formulas — sketches in the wild depend on index stability.

### 10.5 No build pipeline, no package.json, no test suite

This is intentional. The library is a single vanilla JS file.
Minification is done manually. Do not introduce npm, bundlers, or test runners.
If tooling is ever added, it must be proposed and approved explicitly —
never assumed as part of a routine task.

### 10.6 Morph path does not apply range normalisation

`wave: ['a', 'b']` with `mix` performs linear interpolation between two
evaluated values. `range` is intentionally not applied in morph mode.
This is a confirmed design decision (commit `b3dea93`). Do not "fix" it.

### 10.7 No AGENTS.md

The file was intentionally deleted. Do not recreate it.
`CLAUDE.md` is the AI briefing document for this project.

---

## 11. p5.js 2.x Compatibility & Official Library Guidelines

### 11.1 Target version

Everything in this project must work on **p5.js 2.x**.
Do not use deprecated 1.x patterns. Test against p5.js 2.x before committing.

### 11.2 API call forms — never confuse these

| Form | Available | Write as |
|---|---|---|
| Namespace form | always | `Waves.wave(y)` |
| p5 global mode | only in global mode | `waves(y)` |
| p5 instance mode | only in instance mode | `p.waves(y)` |

`wave()` without prefix or context does not exist. Never write it.
`Waves.wave()` and `waves()` are not interchangeable in documentation —
use the form that matches the context of the example.

The same applies to:
- `Waves.createSampler()` → `createWaveSampler()` in global mode
- `Waves.createGrid()` → `createWaveGrid()` in global mode

### 11.3 Never overwrite p5.js globals

Before naming any variable, check it against p5.js 2.x globals, methods,
and constants. This applies to variables in examples, internal library
variables, and any added prototype methods.

Known past conflicts (renamed to resolve):
- `alpha` → `dotAlpha`, `strokeA`
- `mix` → `morphMix`
- `step` → `cellSz`, `stride`
- `colorMode` → `terrainColor`
- `focused` → `hoveredWave`
- `WORD` → `LETTERS`
- `GRID` → `CELLS`
- `brightness` → `luma`

When in doubt, prefix with a context word. Triple-check after every rename:
search the full repo, not just the file being edited.

### 11.4 Official library guidelines compliance

Source: https://p5js.org/contribute/creating_libraries/

- Extend `p5.prototype` for methods available in both global and instance mode
- Use regular functions (not arrow functions) for prototype methods —
  arrow functions break the `this` reference to the sketch object
- The library source (`p5.waves.js`) may use arrow functions internally —
  this restriction applies only to prototype-attached methods
- Class names: PascalCase. Method names: camelCase.
- Do not prefix custom classes with `p5.` — use `Waves`, not `p5.Waves`
- File name follows the convention: `p5.[featurename].js` (lowercase) ✓
- Use `registerMethod()` for lifecycle hooks (pre, post, remove, etc.)
- Use `_decrementPreload()` for async operations in the preload cycle

### 11.5 Console errors are bugs

A working sketch produces no console output.
Check for errors after every change. Errors introduced by a rename,
a new variable, or a p5 version bump are treated as blocking bugs —
not warnings to be noted and left.

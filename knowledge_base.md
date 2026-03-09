# Knowledge Base

## API observations (v2.0.0)

## Wave Lab UX inzichten (2026-03-08)

### Ritme-workflow vraagt formule-lock

Bij ritmisch werken wil de gebruiker meestal frequent variëren zonder kernparameters te verliezen (frequency, phase, range/normalise, mode). Daarom is een gescheiden actie nuttig:
- `Random Formula` wijzigt alleen de `wave`-formule.
- `Surprise Me` blijft de volledige randomize-optie.

Deze scheiding maakt gecontroleerd experimenteren mogelijk naast volledige exploratie.

### `wave` optie-key binnen `Waves.wave()` is zelf-refererend

De aanroep `Waves.wave(y, { wave: 'triangle' })` leest verwarrend omdat `wave` zowel de functienaam als de optie-key is. Een gebruiker moet twee betekenissen van hetzelfde woord scheiden in dezelfde regel.

Mogelijke alternatieven voor de optie-key:
- `type` → `Waves.wave(y, { type: 'triangle' })`
- `shape` → `Waves.wave(y, { shape: 'triangle' })`
- `name` → `Waves.wave(y, { name: 'triangle' })`

Dit is een breaking change en zou een major version bump vereisen. Documenteer de huidige situatie goed in de Notes-sectie van de README.

### Seed vs index subtiliteit

`Waves.wave(y, 3)` gebruikt `3` als **seed** (hash-gebaseerde selectie), maar `Waves.wave(y, { wave: 3 })` selecteert direct **index** 3. Dit is logisch wanneer je het begrijpt, maar het verschil is subtiel genoeg om gebruikers te verrassen. De Notes-sectie in de README legt dit nu uit.

### Geen versie-pinning in CDN link

De jsDelivr GitHub CDN link (`https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves/p5.waves.min.js`) serveert altijd de default branch. Bij een v3 met breaking changes zou dit bestaande sketches breken. Overweeg een versie-tag in de URL, bijv.:
```
https://cdn.jsdelivr.net/gh/seb-prjcts-be/p5.waves@v2.0.0/p5.waves.min.js
```

## Rendering-robuustheid (2026-03-09)

Wanneer een p5 `vertex()` waarschuwing meldt over niet-numerieke parameters, is de meest stabiele mitigatie in deze codebase om op renderpad-niveau te valideren:

- Guard vlak voor `vertex()` (`Number.isFinite(x)` en `Number.isFinite(y)`).
- Geen extra pagina of framework nodig; past binnen de bestaande vanilla JS setup.
- Ook snippets/voorbeelden moeten dezelfde guard hebben, anders komt de fout terug bij copy-paste gebruik buiten Wave Lab.

## Repository-inzicht: AGENTS.md verwijderd (2026-03-09)

- `AGENTS.md` was een cloud/agent-instructiebestand en geen runtime dependency van de library.
- Verwijderen heeft geen effect op `p5.waves.js`, voorbeelden of browsergedrag.
- Housekeeping-wijzigingen blijven het best beperkt en expliciet gelogd in bestaande kennisbestanden.

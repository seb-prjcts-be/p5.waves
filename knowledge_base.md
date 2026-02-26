# Knowledge Base

## API observations (v2.0.0)

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

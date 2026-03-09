# Strategy

## Wave Lab auto-random aanpak (2026-03-08)

1. Houd bestaande controls leidend en voeg opties modulair toe in de bestaande Render-sectie.
2. Scheid twee vormen van random:
   - `Random Formula`: wijzigt alleen `wave`.
   - `Surprise Me`: blijft volledige randomize van meerdere parameters.
3. Voeg voor beide een auto-modus met secondeninterval toe:
   - `Auto random formula` + `Formula every (s)`.
   - `Auto surprise me` + `Surprise every (s)`.
4. Gebruik timerlogica in `draw()` met `Date.now()` zodat er geen extra interval-processen nodig zijn.
5. Reset timer-basis bij toggle/interval-wijziging om onverwachte directe triggers te voorkomen.
6. Houd controls duidelijk door seconde-sliders visueel te disablen als de bijbehorende auto-toggle uit staat.

## Vertex-guard bij line rendering (2026-03-09)

1. Reproduceer consolefout eerst in de bestaande Wave Lab flow; wijzig geen pagina-structuur.
2. Hardening in bestaande tekenloops: roep `vertex()` enkel aan als `x` en `y` finite numbers zijn.
3. Houd de fix modulair via een kleine helper (`isFiniteNumber`) i.p.v. verspreide ad-hoc checks.
4. Pas dezelfde guard toe in basisvoorbeelden en gegenereerde code-snippet, zodat copy-paste code ook veilig blijft.
5. Valideer handmatig in browser met DevTools-console tijdens interactie (line/grid wissel + randomize).

## Repo housekeeping: AGENTS.md verwijderen (2026-03-09)

1. Verwijder enkel `AGENTS.md`; laat overige repository-documentatie intact.
2. Leg de wijziging kort vast in `strategy.md` en `knowledge_base.md` voor traceerbaarheid.
3. Vermijd extra structurele wijzigingen; dit is een gerichte housekeeping-aanpassing.

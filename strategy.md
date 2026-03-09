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

## Vertex-parameter fout afvangen (2026-03-09)

1. Wijzig bestaande voorbeeldbestanden in plaats van nieuwe pagina's/bestanden toe te voegen.
2. Harden de tekenlus defensief: gebruik een geldige `y`-stap (`>= 1`) en een veilige canvasgrens.
3. Roep `vertex()` alleen aan wanneer `x` en `y` allebei eindige getallen zijn.
4. Houd de fix modulair met kleine helperfunctie (`finiteOr`) in Wave Lab.
5. Test handmatig in alle drie de voorbeelden met console open op afwezigheid van `vertex()`-typefouten.

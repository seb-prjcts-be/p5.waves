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

# Country Sound Match (Prototype)

A lightweight multiplayer prototype where players hear a Kannada audio clue and click the target country on a world map.

## Prototype scope
- Map provider: Leaflet + OpenStreetMap tiles (no API key required)
- Country boundaries: public GeoJSON from `johan/world.geo.json`
- Audio clue: local MP3 clip in `assets/audio/kannada-10s.mp3`
- Rule: click **India** = +1 point, any other country = 0 points
- Multiplayer mode: local turn-based players with a live scoreboard

## Run locally
Serve the repo root with any static server:

```powershell
cd wisslr-2026
npx serve .
```

Then open the local URL shown in your terminal.

## Deploy to GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for the Pages URL.

## Audio attribution
The Kannada clip is a 10-second derivative from the Nithya Kannada audio collection.
See `assets/audio/ATTRIBUTION.md` for source, author, and license details.


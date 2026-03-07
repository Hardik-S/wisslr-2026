# Wisslr Event Submission Prototype

Single-page form prototype for event submissions.

## Form flow
1. Name field
2. Language guessing game (audio clue + map click)
3. Question 1 with 3 text fields
4. Question 2 with 3 text fields
5. Final question with 1 text field

## Editable text copy
All user-facing form text is loaded from:
- `form-copy.txt`

Update values in that file to change labels, button text, instructions, and feedback messages without editing HTML/JS.

## Acceptable answers template
Starter document for answer criteria:
- `acceptable-answers-template.txt`

## Run locally
Serve the project root with any static server:

```powershell
cd wisslr-2026
npx serve .
```

Then open the local URL from your terminal.

## Notes
- Language game target country is currently fixed to India.
- Audio clue is loaded from `assets/audio/kannada-10s.mp3`.
- Country boundaries are loaded from `johan/world.geo.json`.
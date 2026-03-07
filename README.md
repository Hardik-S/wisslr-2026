# Wisslr Event Submission Prototype

Single-page form prototype for event submissions.

## Form flow
1. Name field
2. Language guessing game (audio clue + map click)
3. Phono Inventory - Physical Set 1 (3 fields)
4. Phono Inventory - Physical Set 2 (3 fields)
5. Scavenger Hunt (2 fields)

## Editable text copy
All user-facing form text is loaded from:
- `form-copy.txt`

Update values in that file to change labels, button text, instructions, and feedback messages without editing HTML/JS.

## Answer key
Automatic non-case-sensitive answer matching is loaded from:
- `acceptable-answers.txt`

Format:
- `fieldId=answer1|answer2|answer3`

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

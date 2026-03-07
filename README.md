# Wisslr Event Submission Prototype

Forward-only multi-page flow:
1. Name
2. LanguaGeo (map + language question)
3. Phono Inventory Set 1
4. Phono Inventory Set 2
5. Scavenger Hunt
6. Recent LanguaGeo map answers + review summary (auto-saved)

## Editable text
All user-facing copy is in:
- `form-copy.txt`

## Answer key
Automatic non-case-sensitive matching is in:
- `acceptable-answers.txt`

Format:
- `fieldId=answer1|answer2|answer3`

## Storage (GitHub Pages friendly)
Configure:
- `storage-config.txt`

Modes:
- `mode=local` uses browser localStorage (no setup, not shared across users)
- `mode=supabase` uses Supabase REST (shared across users)

## Run locally (static)
Use any static server:

```powershell
cd wisslr-2026
npx serve .
```

Then open the local URL shown by the server.

## Notes
- Primary color is `#8d42f5`.
- LanguaGeo target country is India.
- LanguaGeo language answer is Kannada.

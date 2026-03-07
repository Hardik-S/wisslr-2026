# Wisslr Event Submission Prototype

Forward-only multi-page flow:
1. Name
2. LanguaGeo (map + language question)
3. Phono Inventory Set 1
4. Phono Inventory Set 2
5. Scavenger Hunt
6. Review submission
7. Recent LanguaGeo map answers (last 10)

## Editable text
All user-facing copy is in:
- `form-copy.txt`

## Answer key
Automatic non-case-sensitive matching is in:
- `acceptable-answers.txt`

Format:
- `fieldId=answer1|answer2|answer3`

## Local records storage
Submissions are appended to:
- `records.txt`

## Run locally
Use the built-in local server (required for records saving and history map):

```powershell
cd wisslr-2026
node server.js
```

Then open:
- `http://127.0.0.1:3000`

## Notes
- Primary color is `#8d42f5`.
- LanguaGeo target country is India.
- LanguaGeo language answer is Kannada.

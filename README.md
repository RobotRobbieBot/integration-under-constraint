# Integration Under Constraint

A depth psychology & stoic practice framework for active learning and integration.

## Structure

```
/public
  - index.html (main app shell)
  - app.js (React/vanilla JS frontend)
  - styles.css
  - data.js (local passage library reference)

/docs
  - visual-maps.md (Mermaid diagrams)
  - passage-schema.md (data structure)
  - n8n-workflow.md (audio generation setup)

/data
  - sample-passages.json (example structure)
```

## Quick Start

1. Populate Google Sheet (Passages tab)
2. Set up n8n workflow (ElevenLabs integration)
3. Frontend fetches passages from Sheet via n8n API
4. User studies, rates, synthesizes monthly

## Tech Stack

- Frontend: Vanilla JS + React (GitHub Pages)
- Data: Google Sheets
- Audio: ElevenLabs API via n8n
- State: localStorage

---

**Phase 1:** Content curation (passages)
**Phase 2:** Frontend build
**Phase 3:** Visual maps + synthesis layer
**Phase 4:** Launch + refinement


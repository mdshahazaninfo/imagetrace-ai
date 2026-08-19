# Architecture

```text
Browser
  |
  | image + optional confirmed public name
  v
Next.js /api/analyze
  |
  +--> file validation + SHA-256
  +--> EXIF safe metadata (no GPS)
  +--> Google Vision
  |      - WEB_DETECTION
  |      - TEXT_DETECTION
  |      - LOGO_DETECTION
  |      - LANDMARK_DETECTION
  |      - LABEL_DETECTION
  |
  +--> Presence engine (only if user supplies a name)
         - Wikipedia Action API
         - Brave Search
         - optional Google CSE legacy fallback
  |
  +--> Evidence scoring / categorization
  |
  +--> Optional Supabase persistence
  v
Result UI / History
```

## Trust model

A name entered by the user is treated as a search key, not as a verified identity claim. Web results are ranked using textual context only. The system does not compare the uploaded face to profile pictures.

## Supabase model

`analysis_jobs` stores structured JSON reports per authenticated user. RLS is enabled and direct access by anon/authenticated database roles is not granted by the provided schema; the Next.js server verifies the user's Supabase JWT and performs persistence server-side.

## Provider abstraction

`src/lib/presence/search-provider.ts` selects Brave first and optionally falls back to Google CSE legacy. This keeps the app replaceable as search APIs change.

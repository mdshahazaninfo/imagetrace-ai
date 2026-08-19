# Project Status

**Code package:** complete starter / MVP implementation

## Implemented

- Responsive Next.js UI
- JPG/PNG/WEBP validation and SHA-256 hashing
- Google Vision Web Detection, OCR, logo, landmark and label analysis
- Wikipedia lookup
- Brave Search provider
- Optional Google CSE legacy fallback
- Facebook/Instagram/official website/company/news candidate searches based on a user-supplied public name
- Textual confidence scoring
- Supabase email/password auth
- Supabase per-user history persistence
- RLS-enabled SQL schema
- Vercel configuration and setup guides
- Privacy guardrails and no-face-recognition design

## Requires your credentials before live operation

- Supabase project URL / publishable key / service-role key
- Google Cloud Vision API key
- Brave Search API key (recommended for general web presence)
- Optional existing Google CSE credentials

## Validation state

Source/config syntax has been checked in the build environment. A real provider integration test and `next build` require dependency installation plus your external API credentials.

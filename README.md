# ImageTrace AI

A privacy-aware image source and public-web presence intelligence app built with Next.js, Supabase and Vercel.

## What it does

- Upload JPG, PNG or WEBP images (4 MB default for Vercel-safe multipart requests).
- Runs Google Cloud Vision Web Detection, OCR, logo, landmark and label detection.
- Extracts a limited set of non-location EXIF metadata.
- Shows full/partial image matches and web pages where the image appears.
- If the user supplies a **confirmed public name**, searches Wikipedia and public web results for Facebook, Instagram, official websites, company pages and news.
- Scores source evidence without claiming biometric identity.
- Saves analysis history to Supabase for authenticated users when configured.

## What it intentionally does not do

- No face recognition.
- No unknown-person identification from a face.
- No home-address discovery, live tracking, phone-number hunting or private-account scraping.
- No precise EXIF GPS extraction or display.

## Stack

- Next.js 16.3.1 / React 19.2.8
- Supabase Auth + Postgres
- Google Cloud Vision API
- Brave Search API (primary public-web search)
- Wikipedia MediaWiki API
- Optional legacy Google Programmable Search fallback
- Vercel deployment

## Quick start

1. Copy `.env.example` to `.env.local` and fill the keys you need.
2. Create the Supabase schema using `supabase/schema.sql` in the Supabase SQL Editor.
3. In Supabase Auth, enable Email/Password and configure your Site URL + redirect URLs.
4. Enable Google Cloud Vision API and create a restricted server-side API key.
5. Create a Brave Search API key for general public-web results.
6. Install dependencies:

```bash
npm install
npm run verify-env
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Import this repository into Vercel and add the same environment variables in Project Settings → Environment Variables. Never place server secrets in variables beginning with `NEXT_PUBLIC_`.

## Search behavior

General-web presence search only runs when the user supplies a public name. Results are labelled **Candidate public result**, **Strong candidate**, etc. The app never treats a matching social result as proof that an account belongs to the person in the uploaded image.

## Provider fallback

`BRAVE_SEARCH_API_KEY` is the recommended provider. `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_CX` are supported only as a legacy fallback for existing Google Programmable Search JSON API customers.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/SETUP_SUPABASE.md`
- `docs/SETUP_GOOGLE_VISION.md`
- `docs/DEPLOY_VERCEL.md`
- `docs/SAFETY_PRIVACY.md`
- `docs/TESTING.md`
- `docs/GITHUB.md`

## Production hardening

Before public launch, add CAPTCHA/rate limiting, retention limits, abuse monitoring, terms/privacy pages, content-security-policy headers, and provider billing alerts.

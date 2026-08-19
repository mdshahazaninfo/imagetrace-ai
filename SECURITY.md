# Security Policy

## Secrets

Keep `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_VISION_API_KEY`, `BRAVE_SEARCH_API_KEY`, `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX` server-side. Never prefix them with `NEXT_PUBLIC_`.

## Image handling

Uploads are processed in memory. The included code does not upload raw images to Supabase Storage. Only structured analysis results may be saved to Postgres.

## Identity and privacy guardrails

The application does not call Google Vision `FACE_DETECTION`, does not calculate face embeddings, and does not infer a person's identity from a face. Public-presence search requires a name supplied by the user.

Do not extend this project to collect private addresses, live locations, phone numbers, private social profiles, or other sensitive personal data from an image.

## Reporting vulnerabilities

Open a private security report in your hosting/repository platform and rotate any credential that may have been exposed.

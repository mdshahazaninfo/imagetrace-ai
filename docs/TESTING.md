# Testing Checklist

## Static checks completed in this package

- JSON configuration parse validation.
- JavaScript syntax check for `scripts/verify-env.mjs`.
- TypeScript parser validation over all project `.ts` / `.tsx` source files.

A full `next build` requires installing the pinned npm dependencies, which should be run on your machine or CI after cloning.

## Manual integration tests

1. `/api/health` reports configured providers.
2. Sign up and confirm email through Supabase.
3. Sign in and upload a small JPG under 4 MB.
4. Confirm OCR/web matches appear when Google Vision is configured.
5. Enter a known public name and confirm Wikipedia results appear.
6. Configure Brave Search and confirm public Facebook/Instagram/official-site candidates appear.
7. Verify History saves only when signed in and Supabase persistence is enabled.
8. Confirm a fake `.jpg` text file is rejected by magic-byte validation.
9. Confirm no result displays precise EXIF GPS coordinates.
10. Confirm there is no `FACE_DETECTION` request in `src/lib/image/vision.ts`.

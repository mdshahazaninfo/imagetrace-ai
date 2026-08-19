# Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add values from `.env.example` in Project Settings → Environment Variables.
4. Deploy.
5. Add the production Vercel URL to Supabase Auth Site URL / Redirect URLs.
6. Test sign-up, sign-in, one image analysis and history retrieval.

Recommended production settings:

- Enable provider billing alerts.
- Add rate limiting and CAPTCHA before opening anonymous/public traffic.
- Keep all secret keys server-only.
- Set a retention policy for analysis history.

## Upload size

Vercel Functions have a 4.5 MB request/response payload limit. This starter therefore defaults `MAX_IMAGE_MB=4` to leave multipart overhead. For larger images, add a direct client-to-object-storage upload flow rather than proxying the file through the Function.

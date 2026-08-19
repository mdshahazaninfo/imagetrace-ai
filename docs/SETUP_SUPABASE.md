# Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication → Providers, keep Email enabled.
4. In Authentication → URL Configuration, set your local and production Site URLs/redirect URLs.
5. Copy Project URL and Publishable Key to:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Copy the server service-role/secret key to `SUPABASE_SERVICE_ROLE_KEY` in server-only environment variables.

The service-role key bypasses RLS and must never be exposed to the browser. The API route verifies the caller's JWT with Supabase Auth before using the server key.

The schema explicitly enables RLS and grants table access only to `service_role`, which is suitable for the included server-mediated history design.

-- ImageTrace AI server-mediated history schema
create extension if not exists pgcrypto;

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_sha256 text not null,
  file_name text,
  mime_type text,
  confirmed_public_name text,
  provider_status jsonb not null default '{}'::jsonb,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analysis_jobs_user_created_idx
  on public.analysis_jobs(user_id, created_at desc);

alter table public.analysis_jobs enable row level security;

-- This starter uses server-mediated access only.
revoke all on table public.analysis_jobs from anon, authenticated;
grant select, insert, update, delete on table public.analysis_jobs to service_role;

-- Defense in depth if direct grants are added in the future.
drop policy if exists "Users can view own analysis" on public.analysis_jobs;
create policy "Users can view own analysis"
  on public.analysis_jobs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

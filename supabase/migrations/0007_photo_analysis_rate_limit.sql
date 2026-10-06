-- Rate limiting for the Gemini photo analysis (src/lib/photo-analysis.ts).
-- One row per analysis that reached Gemini. The IP is stored only as a salted
-- SHA-256 hash, and rows older than 2 days are deleted by the app.
-- Safe to re-run.
create table if not exists public.photo_analyses (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists photo_analyses_ip_time on public.photo_analyses (ip_hash, created_at desc);
create index if not exists photo_analyses_time on public.photo_analyses (created_at desc);

-- RLS on with no policies: only the server (service_role key) can read or write.
alter table public.photo_analyses enable row level security;
revoke all on public.photo_analyses from anon, authenticated;

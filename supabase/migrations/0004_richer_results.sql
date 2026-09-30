-- The quiz/engine were replaced with a much richer, age-branching funnel and
-- a full ColorReport (12-20 color palette, makeup, hair, outfit, etc.) —
-- see src/content/{funnel,navigation,resultLibrary,engine}.ts. The old
-- single-season columns can't represent that, so the app now reads/writes
-- the quiz answers and the generated report as JSON instead.
--
-- The old per-field columns (season_pl, family, best_colors, ...) are left
-- in place, unused, rather than dropped — no real rows exist yet, so
-- nothing is lost, and this avoids a destructive schema change.
alter table public.results
  add column if not exists answers jsonb not null default '{}'::jsonb,
  add column if not exists report jsonb not null default '{}'::jsonb;

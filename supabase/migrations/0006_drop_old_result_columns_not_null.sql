-- 0004 left the old single-season columns in place (unused) rather than
-- dropping them, but never relaxed their NOT NULL constraints — so every
-- insert from the current app (which only sets id/answers/report/is_paid)
-- fails with "null value in column season_pl violates not-null constraint".
-- This is a real functional bug, not just cleanup: without this, no
-- analysis can ever be saved. Made nullable rather than dropped, matching
-- 0004's same non-destructive reasoning (still no real rows to lose either
-- way).
alter table public.results
  alter column season_pl drop not null,
  alter column season_en drop not null,
  alter column family drop not null,
  alter column description drop not null,
  alter column best_colors drop not null,
  alter column avoid_colors drop not null,
  alter column best_neutrals drop not null,
  alter column confidence drop not null;

-- Stores each "Twoje Kolory" color analysis result, replacing the
-- localStorage mock storage in src/lib/api.ts.
create table public.results (
  id uuid primary key default gen_random_uuid(),
  season_pl text not null,
  season_en text not null,
  family text not null check (family in ('Wiosna', 'Lato', 'Jesień', 'Zima')),
  description text not null,
  best_colors jsonb not null,
  avoid_colors jsonb not null,
  best_neutrals jsonb not null,
  confidence numeric not null,
  is_paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;

-- No login system in this app: a result is reached only via its unguessable
-- UUID (/wynik/:id), so anyone holding that id can read it.
create policy "results are readable by id"
  on public.results for select
  using (true);

-- The analysis step (src/lib/api.ts analyzePhoto) runs before any auth,
-- so anon must be able to create a result row.
create policy "anyone can create a result"
  on public.results for insert
  with check (true);

-- TEMPORARY: startCheckout flips is_paid directly from the client, same as
-- the current mock. There is no real payment check yet, so this policy is
-- wide open on purpose — anyone who knows a result's id can mark it paid.
-- Lock this down (e.g. only a payment-webhook edge function can set
-- is_paid = true) before wiring up real payments.
create policy "anyone can mark a result paid (placeholder, insecure)"
  on public.results for update
  using (true)
  with check (true);

-- Saves what the paid dashboard and the order need, next to each result.
--
-- photo_analysis: Gemini's raw reading of the photo (temperature, depth,
--   saturation, contrast + eye/hair/skin colour). The report is built from it,
--   so keeping it lets the app rebuild a report (e.g. older results that were
--   saved before the dashboard existed) without asking for the photo again.
--   The photo itself is still never stored.
-- paid_at, stripe_session_id, customer_email: the order record, written by the
--   Stripe webhook. The email is what the order confirmation is sent to.
-- terms_accepted_at, withdrawal_waiver_at, terms_version: proof that the buyer
--   accepted the Regulamin and asked for immediate delivery (losing the
--   14-day withdrawal right) before paying.
--
-- Safe to re-run.
alter table public.results
  add column if not exists photo_analysis jsonb,
  add column if not exists paid_at timestamptz,
  add column if not exists stripe_session_id text,
  add column if not exists customer_email text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists withdrawal_waiver_at timestamptz,
  add column if not exists terms_version text;

-- get_result() is public to anyone holding a result link, so it now returns
-- only the columns the result page needs — never the buyer's email or the
-- Stripe ids. (The return type changes, so the old function is dropped first.)
drop function if exists public.get_result(uuid);

create function public.get_result(result_id uuid)
returns table (
  id uuid,
  is_paid boolean,
  answers jsonb,
  report jsonb,
  photo_analysis jsonb,
  user_id uuid,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.is_paid, r.answers, r.report, r.photo_analysis, r.user_id, r.created_at
  from public.results r
  where r.id = result_id;
$$;

revoke execute on function public.get_result(uuid) from public;
grant execute on function public.get_result(uuid) to anon, authenticated;

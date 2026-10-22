-- get_result() returned ANY result to whoever had its id (link = key), so a
-- result link opened on another phone or by another account showed the full
-- report. Results are now private to their owner. Rows without an owner
-- (anonymous results from before login was required) stay readable by link
-- until their buyer logs in and claim_my_paid_results() attaches them.
-- Same return columns as 0008, so the app needs no other change. Safe to re-run.
create or replace function public.get_result(result_id uuid)
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
  where r.id = result_id
    and (r.user_id is null or r.user_id = auth.uid());
$$;

revoke execute on function public.get_result(uuid) from public;
grant execute on function public.get_result(uuid) to anon, authenticated;

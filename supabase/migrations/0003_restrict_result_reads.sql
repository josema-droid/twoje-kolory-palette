-- 0001's "readable by id" policy was `using (true)`: anyone with the public
-- key could list every result, not just the one whose link they hold.
-- Direct table reads are now owner-only; a result is opened by its id through
-- get_result(), which returns that single row and nothing else.
--
-- Written defensively (if exists / or replace) since a first attempt at
-- running this in the Supabase SQL Editor can partially apply before failing
-- on a later statement.
drop policy if exists "results are readable by id" on public.results;
drop policy if exists "owners can read their results" on public.results;

create policy "owners can read their results"
  on public.results for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.get_result(result_id uuid)
returns setof public.results
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.results where id = result_id;
$$;

revoke execute on function public.get_result(uuid) from public;
grant execute on function public.get_result(uuid) to anon, authenticated;

-- Clients no longer update the table at all (an UPDATE filtered by id would
-- also need the row to pass the SELECT policy above). Revoking the table
-- privilege also removes 0002's column grant on is_paid.
drop policy if exists "anyone can mark a result paid (placeholder, insecure)" on public.results;
revoke update on public.results from anon, authenticated;

-- TEMPORARY, same as before: anyone holding a result's id can mark it paid.
-- Replace with a payment-webhook edge function when real payments go in.
create or replace function public.mark_result_paid(result_id uuid)
returns setof public.results
language sql
security definer
set search_path = ''
as $$
  update public.results set is_paid = true where id = result_id returning *;
$$;

revoke execute on function public.mark_result_paid(uuid) from public;
grant execute on function public.mark_result_paid(uuid) to anon, authenticated;

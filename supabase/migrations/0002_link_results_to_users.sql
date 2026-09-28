-- Link color analysis results to user accounts (Supabase Auth).
-- A result created while logged in is owned from the start; one created
-- anonymously is claimed after login via claim_results() below.
alter table public.results
  add column user_id uuid references auth.users (id) on delete set null default auth.uid();

create index results_user_id_idx on public.results (user_id);

-- Inserts may only be anonymous or owned by the caller, never by someone else.
drop policy "anyone can create a result" on public.results;
create policy "anyone can create an anonymous or own result"
  on public.results for insert
  with check (user_id is null or user_id = auth.uid());

-- The placeholder update policy is still wide open (see 0001), so limit what
-- clients can change to is_paid: user_id may only be set by claim_results().
revoke update on public.results from anon, authenticated;
grant update (is_paid) on public.results to anon, authenticated;

-- Attach unowned results (ids remembered by the browser that created them)
-- to the logged-in user. Already-owned rows are left untouched.
create function public.claim_results(result_ids uuid[])
returns setof uuid
language sql
security definer
set search_path = ''
as $$
  update public.results
  set user_id = auth.uid()
  where auth.uid() is not null
    and user_id is null
    and id = any (result_ids)
  returning id;
$$;

revoke execute on function public.claim_results(uuid[]) from public, anon;
grant execute on function public.claim_results(uuid[]) to authenticated;

-- Security fixes from the audit of 15 Oct 2026 (security-audit-skill run-1).
-- Safe to re-run.

-- 1. Clients could INSERT any column of results, e.g. is_paid = true, and get
--    the paid analysis without paying. Now the browser may only send the id
--    and the quiz answers; everything else (is_paid, report, order data) keeps
--    its default and is written only by the server (service role).
--    user_id still defaults to auth.uid(), and the RLS insert policy (0002)
--    still checks it.
revoke insert on public.results from anon, authenticated;
grant insert (id, answers) on public.results to anon, authenticated;

-- 2a. claim_results let any logged-in person who knew a result id take over an
--     anonymous result. Login is now required before a result is created, so
--     results are owned from the start and claiming is no longer needed.
revoke execute on function public.claim_results(uuid[]) from authenticated;

-- 2b. Owners read their own rows directly, but never need the order/consent
--     columns in the browser: hide them (the webhook and server still use them).
revoke select on public.results from anon, authenticated;
grant select (id, is_paid, answers, report, photo_analysis, user_id, created_at) on public.results to authenticated;

-- 3. One payment could trigger unlimited Gemini analyses, and the counter was
--    not atomic. Attempts are now tied to the paid result and counted inside
--    one locked transaction. Returns 'ok', 'rate_limited', 'daily_limit' or
--    'too_many_attempts'. Server-only (service role).
alter table public.photo_analyses add column if not exists result_id uuid;
create index if not exists photo_analyses_result on public.photo_analyses (result_id);

create or replace function public.record_analysis_attempt(
  p_result_id uuid,
  p_ip_hash text,
  p_per_result int,
  p_per_ip_hour int,
  p_per_ip_day int,
  p_global_day int
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- One lock for all attempts: counts and insert can't interleave.
  perform pg_advisory_xact_lock(727001);
  if (select count(*) from public.photo_analyses where created_at > now() - interval '1 day') >= p_global_day then
    return 'daily_limit';
  end if;
  if (select count(*) from public.photo_analyses where result_id = p_result_id) >= p_per_result then
    return 'too_many_attempts';
  end if;
  if (select count(*) from public.photo_analyses where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= p_per_ip_hour
     or (select count(*) from public.photo_analyses where ip_hash = p_ip_hash and created_at > now() - interval '1 day') >= p_per_ip_day then
    return 'rate_limited';
  end if;
  insert into public.photo_analyses (ip_hash, result_id) values (p_ip_hash, p_result_id);
  return 'ok';
end;
$$;

revoke execute on function public.record_analysis_attempt(uuid, text, int, int, int, int) from public, anon, authenticated;

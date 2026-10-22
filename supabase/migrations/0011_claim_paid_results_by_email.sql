-- Results bought before login was required (before 15 Oct 2026) were created
-- anonymously (user_id null). 0010 disabled claim_results because anyone who
-- knew a result id could take it. This attaches a paid anonymous result to an
-- account only when the email used to pay in Stripe (customer_email, written by
-- the webhook) matches the account's own verified email. Safe to re-run.
create or replace function public.claim_my_paid_results()
returns setof uuid
language sql
security definer
set search_path = ''
as $$
  update public.results r
  set user_id = auth.uid()
  where auth.uid() is not null
    and r.user_id is null
    and r.is_paid
    and r.customer_email is not null
    and lower(r.customer_email) = (
      select lower(u.email) from auth.users u
      where u.id = auth.uid() and u.email_confirmed_at is not null
    )
  returning r.id;
$$;

revoke execute on function public.claim_my_paid_results() from public, anon;
grant execute on function public.claim_my_paid_results() to authenticated;

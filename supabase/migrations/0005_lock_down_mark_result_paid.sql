-- 0003's mark_result_paid() was an intentional placeholder — callable by
-- anon/authenticated, so anyone holding a result's id could mark it paid
-- without actually paying. Real payment confirmation now exists: the Stripe
-- webhook (src/server.ts handleStripeWebhook) updates is_paid using the
-- service_role key, which bypasses RLS/grants entirely and never needed this
-- function. Revoke client access now that it does.
revoke execute on function public.mark_result_paid(uuid) from anon, authenticated;

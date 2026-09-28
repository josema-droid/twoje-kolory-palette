import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthShell, FormMessage, authErrorMessage } from "@/components/auth-form";
import { pl } from "@/content/pl";
import { sendEmailCode, verifyEmailCode, type CodePurpose } from "@/lib/api";
import { safeRedirect } from "@/lib/utils";

// Must match "Email OTP Length" in Supabase → Authentication → Providers → Email.
const CODE_LENGTH = 6;
// Supabase refuses a new code email to the same address within 60 s.
const RESEND_COOLDOWN = 60;

export const Route = createFileRoute("/weryfikacja")({
  // purpose: "signup" confirms a new account (default), "recovery" leads on to /nowe-haslo.
  validateSearch: (search: Record<string, unknown>): { email: string; purpose?: CodePurpose | undefined; redirect?: string | undefined } => ({
    email: typeof search["email"] === "string" ? search["email"] : "",
    purpose: search["purpose"] === "recovery" ? "recovery" : undefined,
    redirect: safeRedirect(search["redirect"]),
  }),
  head: () => ({ meta: [{ title: pl.auth.verify.metaTitle }, { name: "robots", content: "noindex" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const t = pl.auth.verify;
  const { email, purpose = "signup", redirect } = Route.useSearch();
  const recovery = purpose === "recovery";
  const copy = recovery ? { ...t, ...t.recovery } : t;
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const verify = async (value: string) => {
    if (value.length !== CODE_LENGTH || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await verifyEmailCode(email, value, purpose);
      if (recovery) await navigate({ to: "/nowe-haslo", search: { redirect } });
      else await navigate({ href: redirect ?? "/moje-wyniki" });
    } catch (err) {
      setError(authErrorMessage(err)); setCode(""); setBusy(false);
    }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void verify(code); };
  const resend = async () => {
    setError(""); setNotice("");
    try {
      await sendEmailCode(email, purpose);
      setNotice(t.resent); setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  if (!email) return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={t.missingEmail}><Button asChild className="h-14 w-full rounded-full text-base"><Link to="/logowanie">{pl.auth.login.submit}<ArrowRight size={17} /></Link></Button></AuthShell>;

  return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={<>{copy.sentTo} <strong className="font-semibold break-all text-foreground">{email}</strong></>} footer={<>{copy.wrongEmail} <Link to={recovery ? "/nie-pamietam-hasla" : "/rejestracja"} search={{ redirect }} className="font-semibold text-primary hover:underline">{copy.wrongEmailLink}</Link></>}>
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-col items-center"><span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><MailCheck size={22} strokeWidth={1.6} /></span><label className="mb-3 block text-sm font-medium" htmlFor="otp">{t.codeLabel}</label>
        <InputOTP id="otp" maxLength={CODE_LENGTH} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" autoComplete="one-time-code" autoFocus value={code} onChange={setCode} onComplete={verify} disabled={busy}>
          <InputOTPGroup>{Array.from({ length: CODE_LENGTH }, (_, i) => <InputOTPSlot key={i} index={i} className="h-13 w-11 bg-card text-xl font-semibold sm:w-12" />)}</InputOTPGroup>
        </InputOTP>
      </div>
      {error && <FormMessage>{error}</FormMessage>}
      {notice && <FormMessage tone="info">{notice}</FormMessage>}
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy || code.length !== CODE_LENGTH}>{copy.submit}<ArrowRight size={17} /></Button>
      <div className="text-center"><Button type="button" variant="ghost" className="rounded-full text-primary" disabled={cooldown > 0} onClick={resend}>{cooldown > 0 ? `${t.resendIn} ${cooldown}${t.seconds}` : t.resend}</Button><p className="mt-2 text-xs text-muted-foreground">{t.spamHint}</p></div>
    </form>
  </AuthShell>;
}

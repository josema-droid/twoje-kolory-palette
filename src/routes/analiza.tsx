import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, Check, Lock, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FormMessage, authErrorMessage } from "@/components/auth-form";
import { useAuthUser } from "@/hooks/use-auth-user";
import { DrapeLoader } from "@/components/funnel/drape-loader";
import { pl } from "@/content/pl";
import { trackEvent } from "@/lib/tracking";
import { seo } from "@/lib/seo";

// End of the funnel: "we're working on your analysis" → "it's ready, verify your
// email to see it" → 6-digit code → the result is created for the new account.

const CODE_LENGTH = 6; // must match Supabase "Email OTP Length"
const RESEND_COOLDOWN = 60;
// About 20 s in total: 6 steps of 3.3 s.
const STEP_MS = 3300;

export const Route = createFileRoute("/analiza")({
  head: () => seo({ title: "Twoja analiza", description: "Przygotowujemy Twoją analizę kolorystyczną.", path: "/analiza", noindex: true }),
  component: AnalysisPage,
});

type Phase = "working" | "email" | "code" | "creating" | "missing";

function AnalysisPage() {
  const t = pl.analysis;
  const navigate = useNavigate();
  const user = useAuthUser();
  const [phase, setPhase] = useState<Phase>("working");
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const finish = async () => {
    setPhase("creating");
    try {
      const { createResultFromPending } = await import("@/lib/api");
      const id = await createResultFromPending();
      trackEvent("AnalysisUnlocked");
      await navigate({ to: "/wynik/$id", params: { id }, replace: true });
    } catch (err) {
      console.error(err);
      setError(t.createFailed);
      setPhase("email");
    }
  };

  // The "working" animation, then the next step once the session is known.
  useEffect(() => {
    let cancelled = false;
    void import("@/lib/api").then(({ hasPendingAnalysis }) => {
      if (!cancelled && !hasPendingAnalysis()) setPhase("missing");
    });
    const timers = t.steps.map((_, i) => window.setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    return () => { cancelled = true; timers.forEach(window.clearTimeout); };
  }, [t.steps]);
  const workDone = step >= t.steps.length;
  useEffect(() => {
    if (phase !== "working" || !workDone || user === undefined) return;
    if (user) void finish();
    else setPhase("email");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, workDone, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    if (!address || busy) return;
    setBusy(true); setError("");
    try {
      const { sendEmailCode } = await import("@/lib/api");
      await sendEmailCode(address, "login");
      setEmail(address); setCode(""); setPhase("code"); setCooldown(RESEND_COOLDOWN);
      trackEvent("EmailCodeSent");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (value.length !== CODE_LENGTH || busy) return;
    setBusy(true); setError("");
    try {
      const { verifyEmailCode } = await import("@/lib/api");
      await verifyEmailCode(email, value, "login");
      await finish();
    } catch (err) {
      setError(authErrorMessage(err)); setCode("");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "missing") {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-4xl">{t.missingTitle}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t.missingText}</p>
        <Button asChild className="mt-8 h-14 rounded-full px-8 text-base"><Link to="/test">{t.missingCta}<ArrowRight size={17} /></Link></Button>
      </main>
    );
  }

  if (phase === "working" || phase === "creating") {
    const current = Math.min(step, t.steps.length - 1);
    const last = current === t.steps.length - 1;
    // Each step's share fills linearly over that step (the bar's transition matches STEP_MS).
    const progress = Math.min(100, Math.round(((step + 1) / t.steps.length) * 100));
    return (
      // Fits one phone screen: title, current step, reel (sized to the screen height), progress.
      <main className="flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center px-5 py-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.workingTitle}</p>
        {/* One step at a time: fades in, stays, fades out, then the next. Read out to screen readers too. */}
        <p
          key={current}
          aria-live="polite"
          className={`mt-3 min-h-[4.5rem] max-w-xs font-display text-2xl leading-tight md:text-3xl ${last || phase === "creating" ? "analysis-caption--last" : "analysis-caption"}`}
          style={{ "--step": `${STEP_MS}ms` } as React.CSSProperties}
        >
          {t.steps[current]}…
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white shadow-sm" style={{ width: "min(78vw, 320px, calc((100svh - 4.5rem - 210px) * 0.818))" }}>
          <DrapeLoader />
        </div>
        <div className="mt-5 h-1.5 w-full max-w-[16rem] overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-[3300ms] ease-linear" style={{ width: `${phase === "creating" ? 100 : progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t.stepOf.replace("{n}", String(current + 1)).replace("{total}", String(t.steps.length))}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-14 md:py-20">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary"><Check size={26} /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">{t.readyEyebrow}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{t.readyTitle}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">{phase === "code" ? <>{t.codeSentTo} <strong className="inline-block break-all font-semibold text-foreground">{email}</strong></> : t.readyText}</p>
      </div>

      <div className="mt-9 rounded-lg border border-border bg-card p-5 md:p-7">
        {phase === "email" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <label htmlFor="email" className="block text-sm font-medium">{pl.auth.email}</label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" required placeholder={pl.auth.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-background" />
            {error && <FormMessage>{error}</FormMessage>}
            <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy || !email.trim()}>{t.sendCode}<ArrowRight size={17} /></Button>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Lock size={13} className="mt-0.5 shrink-0 text-primary" />{t.privacy}</p>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void verify(code); }} className="space-y-5">
            <div className="flex flex-col items-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><MailCheck size={22} strokeWidth={1.6} /></span>
              <label className="mb-3 block text-sm font-medium" htmlFor="otp">{pl.auth.verify.codeLabel}</label>
              <InputOTP id="otp" maxLength={CODE_LENGTH} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" autoComplete="one-time-code" autoFocus value={code} onChange={setCode} onComplete={verify} disabled={busy}>
                <InputOTPGroup>{Array.from({ length: CODE_LENGTH }, (_, i) => <InputOTPSlot key={i} index={i} className="h-13 w-11 bg-background text-xl font-semibold sm:w-12" />)}</InputOTPGroup>
              </InputOTP>
            </div>
            {error && <FormMessage>{error}</FormMessage>}
            <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy || code.length !== CODE_LENGTH}>{t.showResult}<ArrowRight size={17} /></Button>
            <div className="text-center text-sm">
              <Button type="button" variant="ghost" className="rounded-full text-primary" disabled={cooldown > 0 || busy} onClick={() => void sendCode()}>
                {cooldown > 0 ? `${pl.auth.verify.resendIn} ${cooldown}${pl.auth.verify.seconds}` : pl.auth.verify.resend}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">{pl.auth.verify.spamHint}</p>
              <button type="button" className="mt-3 text-xs text-primary underline underline-offset-2" onClick={() => { setPhase("email"); setError(""); }}>{t.changeEmail}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

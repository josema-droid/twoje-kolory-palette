import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AuthShell, Field, FormMessage, MIN_PASSWORD_LENGTH, PasswordInput, authErrorMessage, fieldClass } from "@/components/auth-form";
import { pl } from "@/content/pl";
import { signUp } from "@/lib/api";
import { safeRedirect } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/rejestracja")({
  // Always return the key: omitting it would let the raw (unsafe) value through from the root route.
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: safeRedirect(search["redirect"]) }),
  head: () => seo({ title: "Rejestracja konta", description: "Załóż bezpłatne konto i zachowaj swoje wyniki analizy kolorystycznej.", path: "/rejestracja", noindex: true }),
  component: SignupPage,
});

function SignupPage() {
  const t = pl.auth.signup;
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    if (password.length < MIN_PASSWORD_LENGTH) { setError(pl.auth.errors.password_too_short); return; }
    setBusy(true); setError("");
    const address = email.trim();
    try {
      const outcome = await signUp(address, password);
      if (outcome === "exists") { setError(pl.auth.errors.account_exists); setBusy(false); return; }
      if (outcome === "signed_in") { await navigate({ href: redirect ?? "/moje-wyniki" }); return; }
      await navigate({ to: "/weryfikacja", search: redirect ? { email: address, redirect } : { email: address } });
    } catch (err) {
      setError(authErrorMessage(err)); setBusy(false);
    }
  };
  const loginLink = <Link to="/logowanie" search={redirect ? { redirect } : {}} className="font-semibold text-primary hover:underline">{t.switchLink}</Link>;
  return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} footer={<>{t.switchText} {loginLink}</>}>
    <form onSubmit={submit} className="space-y-5">
      <Field label={pl.auth.email}>{(id) => <Input id={id} type="email" inputMode="email" autoComplete="email" placeholder={pl.auth.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />}</Field>
      <Field label={pl.auth.password} hint={pl.auth.passwordHint}>{(id) => <PasswordInput id={id} value={password} onChange={setPassword} autoComplete="new-password" />}</Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4"><Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" /><span className="text-xs leading-5 text-muted-foreground">{t.consentBefore}<Link to="/regulamin" className="text-primary underline">{t.consentTerms}</Link>{t.consentAnd}<Link to="/polityka-prywatnosci" className="text-primary underline">{t.consentPrivacy}</Link>{t.consentAfter}</span></label>
      {error && <FormMessage>{error === pl.auth.errors.account_exists ? <>{error} {loginLink}</> : error}</FormMessage>}
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy || !consent}>{t.submit}<ArrowRight size={17} /></Button>
    </form>
  </AuthShell>;
}

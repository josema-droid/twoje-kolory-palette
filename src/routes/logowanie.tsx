import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, Field, FormMessage, PasswordInput, authErrorMessage, fieldClass } from "@/components/auth-form";
import { pl } from "@/content/pl";
import { AuthFailure, sendEmailCode, signIn } from "@/lib/api";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/logowanie")({
  // Always return the key: omitting it would let the raw (unsafe) value through from the root route.
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: safeRedirect(search["redirect"]) }),
  head: () => ({ meta: [{ title: pl.auth.login.metaTitle }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const t = pl.auth.login;
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const address = email.trim();
    try {
      await signIn(address, password);
      await navigate({ href: redirect ?? "/moje-wyniki" });
    } catch (err) {
      if (err instanceof AuthFailure && err.code === "email_not_confirmed") {
        // Unverified account: send a fresh code and finish verification first.
        await sendEmailCode(address, "signup").catch(() => {});
        await navigate({ to: "/weryfikacja", search: redirect ? { email: address, redirect } : { email: address } });
        return;
      }
      setError(authErrorMessage(err)); setBusy(false);
    }
  };
  return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} footer={<>{t.switchText} <Link to="/rejestracja" search={redirect ? { redirect } : {}} className="font-semibold text-primary hover:underline">{t.switchLink}</Link></>}>
    <form onSubmit={submit} className="space-y-5">
      <Field label={pl.auth.email}>{(id) => <Input id={id} type="email" inputMode="email" autoComplete="email" placeholder={pl.auth.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />}</Field>
      <Field label={pl.auth.password}>{(id) => <PasswordInput id={id} value={password} onChange={setPassword} autoComplete="current-password" />}</Field>
      <p className="-mt-2 text-right text-sm"><Link to="/nie-pamietam-hasla" search={{ redirect }} className="text-primary hover:underline">{t.forgot}</Link></p>
      {error && <FormMessage>{error}</FormMessage>}
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy}>{t.submit}<ArrowRight size={17} /></Button>
    </form>
  </AuthShell>;
}

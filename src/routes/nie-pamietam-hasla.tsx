import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, Field, FormMessage, authErrorMessage, fieldClass } from "@/components/auth-form";
import { pl } from "@/content/pl";
import { sendEmailCode } from "@/lib/api";
import { safeRedirect } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/nie-pamietam-hasla")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: safeRedirect(search["redirect"]) }),
  head: () => seo({ title: "Resetowanie hasła", description: "Podaj adres e-mail, a wyślemy Ci kod do ustawienia nowego hasła.", path: "/nie-pamietam-hasla", noindex: true }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const t = pl.auth.forgot;
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const address = email.trim();
    try {
      // Supabase answers the same whether or not the account exists, so this never reveals who is registered.
      await sendEmailCode(address, "recovery");
      await navigate({ to: "/weryfikacja", search: { email: address, purpose: "recovery", redirect } });
    } catch (err) {
      setError(authErrorMessage(err)); setBusy(false);
    }
  };
  return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} footer={<Link to="/logowanie" search={{ redirect }} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><ArrowLeft size={15} />{t.back}</Link>}>
    <form onSubmit={submit} className="space-y-5">
      <Field label={pl.auth.email}>{(id) => <Input id={id} type="email" inputMode="email" autoComplete="email" placeholder={pl.auth.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />}</Field>
      {error && <FormMessage>{error}</FormMessage>}
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy}>{t.submit}<ArrowRight size={17} /></Button>
    </form>
  </AuthShell>;
}

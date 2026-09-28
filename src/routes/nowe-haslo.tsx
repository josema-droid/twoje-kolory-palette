import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, FormMessage, MIN_PASSWORD_LENGTH, PasswordInput, authErrorMessage } from "@/components/auth-form";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { updatePassword } from "@/lib/api";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/nowe-haslo")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: safeRedirect(search["redirect"]) }),
  head: () => ({ meta: [{ title: pl.auth.newPassword.metaTitle }, { name: "robots", content: "noindex" }] }),
  component: NewPasswordPage,
});

// Reached after verifying a recovery code on /weryfikacja, which leaves the user logged in.
function NewPasswordPage() {
  const t = pl.auth.newPassword;
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const user = useAuthUser();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) { setError(pl.auth.errors.password_too_short); return; }
    setBusy(true); setError("");
    try {
      await updatePassword(password);
      await navigate({ href: redirect ?? "/moje-wyniki" });
    } catch (err) {
      setError(authErrorMessage(err)); setBusy(false);
    }
  };
  return <AuthShell eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
    {user === null ? <div className="space-y-5"><FormMessage>{t.expired}</FormMessage><Button asChild className="h-14 w-full rounded-full text-base"><Link to="/nie-pamietam-hasla" search={{ redirect }}>{t.expiredLink}<ArrowRight size={17} /></Link></Button></div>
      : <form onSubmit={submit} className="space-y-5">
        {/* Lets password managers save the new password under the right account. */}
        <input type="email" autoComplete="username" value={user?.email ?? ""} readOnly hidden />
        <Field label={t.label} hint={pl.auth.passwordHint}>{(id) => <PasswordInput id={id} value={password} onChange={setPassword} autoComplete="new-password" />}</Field>
        {error && <FormMessage>{error}</FormMessage>}
        <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={busy || !user}>{t.submit}<ArrowRight size={17} /></Button>
      </form>}
  </AuthShell>;
}

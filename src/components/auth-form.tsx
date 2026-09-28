import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { pl } from "@/content/pl";
import { AuthFailure } from "@/lib/api";
import { cn } from "@/lib/utils";

export const fieldClass = "h-12 rounded-lg bg-card px-4 text-base md:text-base";

export function AuthShell({ eyebrow, title, subtitle, children, footer }: { eyebrow: string; title: string; subtitle: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return <main className="min-h-[calc(100vh-4.5rem)] bg-secondary/35 px-5 py-12 md:py-20"><div className="mx-auto max-w-md"><div className="text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-card text-primary"><Sparkles size={22} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{title}</h1><div className="mx-auto mt-4 max-w-sm leading-7 text-muted-foreground">{subtitle}</div></div><div className="mt-9 rounded-lg border border-border bg-card/70 p-5 shadow-sm md:p-7">{children}</div>{footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}</div></main>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>{children(id)}{hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}</div>;
}

export function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (value: string) => void; autoComplete: "current-password" | "new-password" }) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input id={id} type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required className={cn(fieldClass, "pr-12")} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? pl.auth.hidePassword : pl.auth.showPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-primary">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>;
}

export function FormMessage({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  return <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg px-4 py-3 text-sm", tone === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground")}>{children}</p>;
}

export function authErrorMessage(error: unknown): string {
  return pl.auth.errors[error instanceof AuthFailure ? error.code : "unknown"];
}

export const MIN_PASSWORD_LENGTH = 8;

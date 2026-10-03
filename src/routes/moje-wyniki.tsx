import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { claimLocalResults, listMyResults, type ResultSummary } from "@/lib/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/moje-wyniki")({
  head: () => seo({ title: "Moje wyniki analiz", description: "Twoje zapisane analizy kolorystyczne i palety kolorów w jednym miejscu.", path: "/moje-wyniki", noindex: true }),
  component: MyResultsPage,
});

function MyResultsPage() {
  const t = pl.myResults;
  const user = useAuthUser();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (user === null) { void navigate({ to: "/logowanie", search: { redirect: "/moje-wyniki" }, replace: true }); return; }
    if (!user) return;
    let active = true;
    // Claim first so a result made just before logging in is already listed.
    claimLocalResults().then(listMyResults).then((value) => { if (active) setResults(value); }, () => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [user, navigate]);

  return <main className="min-h-[calc(100vh-4.5rem)] bg-secondary/35 px-5 py-12 md:py-20"><div className="mx-auto max-w-3xl">
    <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.eyebrow}</p><h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{t.title}</h1><p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">{t.subtitle}</p>{user && <p className="mt-2 text-xs break-all text-muted-foreground">{user.email}</p>}</div>
    <div className="mt-10">
      {failed ? <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">{t.error}</p>
        : !results ? <p className="text-center font-display text-2xl">{t.loading}</p>
        : results.length === 0 ? <div className="rounded-lg border border-border bg-card p-8 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles size={22} /></span><p className="mt-5 text-muted-foreground">{t.empty}</p><Button asChild className="mt-6 h-12 rounded-full px-7"><Link to="/test">{t.emptyCta}<ArrowRight size={16} /></Link></Button></div>
        : <ul className="grid gap-3">{results.map((result) => <li key={result.id}><Link to="/wynik/$id" params={{ id: result.id }} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"><div><p className="font-display text-2xl">{t.resultLabel}</p><p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{new Date(result.createdAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}</span><span className={result.isPaid ? "text-primary" : "inline-flex items-center gap-1"}>{!result.isPaid && <LockKeyhole size={12} />}{result.isPaid ? t.paid : t.locked}</span></p></div><span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"><span className="hidden sm:inline">{t.open}</span><ArrowRight size={16} /></span></Link></li>)}</ul>}
    </div>
  </div></main>;
}

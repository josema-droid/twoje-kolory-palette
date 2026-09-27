import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "@/content/pl";
import { getResult, startCheckout } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";
import type { Color, Result } from "@/types/result";

export const Route = createFileRoute("/wynik/$id")({
  head: () => ({ meta: [{ title: "Twój wynik — Twoje Kolory" }, { name: "description", content: "Poznaj swoją osobistą paletę kolorystyczną." }, { property: "og:title", content: "Twój wynik — Twoje Kolory" }, { property: "og:description", content: "Poznaj swoją osobistą paletę kolorystyczną." }] }),
  component: ResultPage,
});

function Swatches({ colors }: { colors: Color[] }) {
  return <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6">{colors.map((color) => <div key={color.name}><div className="aspect-square rounded-md border border-border/50" style={{ backgroundColor: color.hex }} /><p className="mt-2 text-xs font-medium text-foreground">{color.name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{color.hex.toUpperCase()}</p></div>)}</div>;
}

function ResultPage() {
  const { id } = Route.useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloadNote, setDownloadNote] = useState(false);
  useEffect(() => { let active = true; getResult(id).then((value) => { if (active) { setResult(value); setLoading(false); } }); return () => { active = false; }; }, [id]);
  const unlock = async () => {
    if (!consent || !result) return;
    setBusy(true); trackEvent("InitiateCheckout", { resultId: result.id });
    const paid = await startCheckout(result.id);
    if (paid) { setResult(paid); setConsent(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
    setBusy(false);
  };
  if (loading) return <main className="flex min-h-[65vh] items-center justify-center font-display text-3xl">{pl.result.loading}</main>;
  if (!result) return <main className="mx-auto min-h-[65vh] max-w-4xl px-5 py-20"><h1 className="font-display text-4xl">{pl.result.missing}</h1><Button asChild className="mt-8 rounded-full"><Link to="/">{pl.backHome}</Link></Button></main>;
  const t = pl.result;
  return <main className="pb-20"><section className="bg-secondary/60 px-5 py-14 text-center md:py-20"><div className="mx-auto max-w-3xl"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-card text-primary"><Sparkles size={22} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">{t.eyebrow}</p><h1 className="mt-4 font-display text-5xl leading-tight md:text-7xl">{result.isPaid ? result.season_pl : `${t.familyPrefix} ${t.familyForms[result.family]}`}</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{result.isPaid ? result.description : t.teaserTextByFamily[result.family]}</p></div></section><div className="mx-auto max-w-5xl px-5 pt-14 md:px-10 md:pt-20">{result.isPaid ? <div className="space-y-16"><section><h2 className="mb-7 font-display text-3xl md:text-4xl">{t.best}</h2><Swatches colors={result.best_colors} /></section><section className="border-t border-border pt-12"><h2 className="mb-7 font-display text-3xl md:text-4xl">{t.neutrals}</h2><Swatches colors={result.best_neutrals} /></section><section className="border-t border-border pt-12"><h2 className="mb-7 font-display text-3xl md:text-4xl">{t.avoid}</h2><Swatches colors={result.avoid_colors} /></section><div className="border-t border-border pt-10"><Button variant="outline" className="h-12 rounded-full border-primary/35 px-7 text-primary" onClick={() => setDownloadNote(true)}><Download size={17} />{t.download}</Button>{downloadNote && <p className="mt-3 text-sm text-muted-foreground">{t.downloadPlaceholder}</p>}</div></div> : <><section><h2 className="font-display text-3xl md:text-4xl">{t.teaserPalette}</h2><div className="mt-7"><Swatches colors={result.best_colors.slice(0, 3)} /></div><div className="relative mt-9 overflow-hidden rounded-lg border border-border bg-card p-5"><div aria-hidden="true" className="pointer-events-none grid grid-cols-3 gap-4 blur-lg sm:grid-cols-5">{result.best_colors.slice(3).map((color) => <div key={color.name} className="aspect-square rounded-md" style={{ backgroundColor: color.hex }} />)}</div><div className="absolute inset-0 flex items-center justify-center bg-card/45"><div className="flex flex-col items-center gap-2 text-center"><LockKeyhole size={22} className="text-primary" /><p className="font-display text-xl">{t.hidden}</p></div></div></div></section><section className="mx-auto mt-16 max-w-xl border-t border-border pt-12 text-center"><h2 className="font-display text-4xl">{t.unlockTitle}</h2><p className="mt-4 leading-7 text-muted-foreground">{t.unlockText}</p><label className="mt-8 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 text-left"><Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" /><span className="text-xs leading-5 text-muted-foreground">{t.legalConsent}</span></label><Button className="mt-5 h-14 w-full rounded-full text-base" disabled={!consent || busy} onClick={unlock}>{t.unlock}<ArrowRight size={17} /></Button></section></>}</div></main>;
}
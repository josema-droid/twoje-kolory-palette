import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "@/content/pl";
import { analyzePhoto } from "@/lib/api";
import type { Answers } from "@/content/funnel";
import { trackEvent } from "@/lib/tracking";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/zdjecie")({
  head: () => seo({ title: "Zdjęcie do analizy kolorystycznej", description: "Dodaj naturalne zdjęcie twarzy, aby dokończyć analizę kolorystyczną i poznać swoją paletę kolorów.", path: "/zdjecie", noindex: true }),
  component: PhotoPage,
});

function PhotoPage() {
  const navigate = useNavigate({ from: "/zdjecie" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const choose = (selected?: File) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { setError(pl.photo.invalidFile); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setPreview(URL.createObjectURL(selected)); setError("");
    trackEvent("PhotoUploaded", { type: selected.type, size: selected.size });
  };
  const submit = async () => {
    if (!file || !consent) return;
    setLoading(true);
    const raw = sessionStorage.getItem("twoje-kolory-answers");
    const answers: Answers = raw ? JSON.parse(raw) : {};
    const [result] = await Promise.all([analyzePhoto(answers, file), new Promise((r) => window.setTimeout(r, 4000))]);
    navigate({ to: "/wynik/$id", params: { id: result.id } });
  };
  if (loading) return <main className="flex min-h-[70vh] items-center justify-center px-5 text-center"><div><div className="analysis-pulse mx-auto flex size-24 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles size={38} strokeWidth={1.4} /></div><h1 className="mt-9 font-display text-4xl md:text-5xl">{pl.photo.loadingTitle}</h1><p className="mx-auto mt-4 max-w-md text-muted-foreground">{pl.photo.loadingText}</p></div></main>;
  return <main className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-20"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{pl.photo.eyebrow}</p><h1 className="mt-4 font-display text-4xl md:text-6xl">{pl.photo.title}</h1><p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">{pl.photo.subtitle}</p></div><div className="mt-12 grid gap-8 md:grid-cols-[.8fr_1.2fr]"><aside className="border-t border-border pt-6"><h2 className="font-display text-2xl">{pl.photo.tipsTitle}</h2><div className="mt-6 space-y-4">{pl.photo.tips.map((tip) => <p key={tip} className="flex items-center gap-3 text-sm"><span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary"><Check size={14} /></span>{tip}</p>)}</div></aside><section><input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />{preview ? <div className="relative overflow-hidden rounded-lg border border-border bg-card"><img src={preview} alt={pl.photo.upload} className="aspect-[4/3] w-full object-cover" /><Button variant="secondary" size="sm" className="absolute bottom-4 right-4 rounded-full" onClick={() => inputRef.current?.click()}>{pl.photo.change}</Button></div> : <Button variant="outline" className="flex h-64 w-full flex-col gap-3 rounded-lg border-dashed bg-card text-foreground hover:border-primary hover:bg-secondary" onClick={() => inputRef.current?.click()}><ImagePlus size={34} className="text-primary" /><span className="text-base">{pl.photo.upload}</span><span className="whitespace-normal text-xs font-normal text-muted-foreground">{pl.photo.uploadHint}</span></Button>}<label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4"><Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" /><span className="text-xs leading-5 text-muted-foreground">{pl.photo.consent}</span></label>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<Button className="mt-5 h-14 w-full rounded-full text-base" disabled={!file || !consent} onClick={submit}>{pl.photo.submit}<Sparkles size={17} /></Button></section></div></main>;
}
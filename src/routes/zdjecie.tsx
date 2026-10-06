import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Info, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "@/content/pl";
import { analyzePhoto, PhotoRejected } from "@/lib/api";
import { GENDER_MALE, type Answers } from "@/content/funnel";
import { trackEvent } from "@/lib/tracking";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/zdjecie")({
  head: () => seo({ title: "Zdjęcie do analizy kolorystycznej", description: "Dodaj naturalne zdjęcie twarzy, aby dokończyć analizę kolorystyczną i poznać swoją paletę kolorów.", path: "/zdjecie", noindex: true }),
  component: PhotoPage,
});

type CheckKey = keyof typeof pl.photo.checks;

function readAnswers(): Answers {
  try {
    const raw = sessionStorage.getItem("twoje-kolory-answers");
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

function PhotoPage() {
  const t = pl.photo;
  const navigate = useNavigate({ from: "/zdjecie" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [checks, setChecks] = useState<Partial<Record<CheckKey, boolean>>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setAnswers(readAnswers()), []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const male = answers["gender"] === GENDER_MALE;
  const hasBeard = male && !!answers["beard"] && !String(answers["beard"]).startsWith("Nie");
  // Post-photo questions: men get the beard check instead of the makeup one (and only with a beard).
  const checkKeys: CheckKey[] = ["light", "filter", "visible", ...(male ? (hasBeard ? (["beard"] as const) : []) : (["makeup"] as const))];
  const allChecked = checkKeys.every((k) => checks[k] !== undefined);
  const anyNo = checkKeys.some((k) => checks[k] === false);

  const choose = (selected?: File) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { setError(t.invalidFile); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setPreview(URL.createObjectURL(selected)); setError(""); setChecks({});
    trackEvent("PhotoUploaded", { type: selected.type, size: selected.size });
  };

  const submit = async () => {
    if (!file || !consent || !allChecked) return;
    setLoading(true);
    const photoChecks = checkKeys.map((k) => `${t.checks[k].q} ${checks[k] ? t.yes : t.no}`);
    try {
      const [result] = await Promise.all([analyzePhoto({ ...answers, photoChecks }, file), new Promise((r) => window.setTimeout(r, 4000))]);
      trackEvent("PhotoAnalyzed");
      navigate({ to: "/wynik/$id", params: { id: result.id } });
    } catch (e) {
      const problem = e instanceof PhotoRejected ? e.problem : "unavailable";
      if (!(e instanceof PhotoRejected)) console.error(e);
      trackEvent("PhotoRejected", { problem });
      setError(t.errors[problem]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-5 text-center">
        <div>
          <div className="analysis-pulse mx-auto flex size-24 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles size={38} strokeWidth={1.4} /></div>
          <h1 className="mt-9 font-display text-4xl md:text-5xl">{t.loadingTitle}</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">{male ? t.loadingTextMale : t.loadingText}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{t.title}</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">{t.subtitle}</p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-[.8fr_1.2fr]">
        <aside className="border-t border-border pt-6">
          <h2 className="font-display text-2xl">{t.tipsTitle}</h2>
          <div className="mt-6 space-y-4">
            {(male ? t.tipsMale : t.tips).map((tip) => (
              <p key={tip} className="flex items-center gap-3 text-sm"><span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary"><Check size={14} /></span>{tip}</p>
            ))}
          </div>
        </aside>
        <section>
          <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
          {preview ? (
            <div className="relative overflow-hidden rounded-lg border border-border bg-card">
              <img src={preview} alt={t.upload} className="aspect-[4/3] w-full object-cover" />
              <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 rounded-full" onClick={() => inputRef.current?.click()}>{t.change}</Button>
            </div>
          ) : (
            <Button variant="outline" className="flex h-64 w-full flex-col gap-3 rounded-lg border-dashed bg-card text-foreground hover:border-primary hover:bg-secondary" onClick={() => inputRef.current?.click()}>
              <ImagePlus size={34} className="text-primary" /><span className="text-base">{t.upload}</span><span className="whitespace-normal text-xs font-normal text-muted-foreground">{t.uploadHint}</span>
            </Button>
          )}

          {file && (
            <fieldset className="mt-6 rounded-lg border border-border bg-card p-4 md:p-5">
              <legend className="px-1 font-display text-xl">{t.checksTitle}</legend>
              <div className="mt-2 divide-y divide-border">
                {checkKeys.map((key) => (
                  <div key={key} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">{t.checks[key].q}</p>
                      <div className="flex gap-2" role="group" aria-label={t.checks[key].q}>
                        {[true, false].map((value) => (
                          <Button
                            key={String(value)}
                            type="button"
                            size="sm"
                            variant={checks[key] === value ? "default" : "outline"}
                            aria-pressed={checks[key] === value}
                            className="min-w-16 rounded-full"
                            onClick={() => setChecks((c) => ({ ...c, [key]: value }))}
                          >
                            {value ? t.yes : t.no}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {checks[key] === false && <p className="mt-2 flex gap-2 text-xs leading-5 text-muted-foreground"><Info size={14} className="mt-0.5 shrink-0 text-primary" />{t.checks[key].tip}</p>}
                  </div>
                ))}
              </div>
              {anyNo && <p className="mt-2 text-xs text-muted-foreground">{t.checksNote}</p>}
            </fieldset>
          )}

          <div className="mt-5 rounded-lg border border-border bg-card p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
              <span className="text-xs leading-5 text-foreground/85">{t.consent}</span>
            </label>
            <p className="mt-2 flex gap-2 pl-7 text-xs leading-5 text-muted-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {t.privacyNote}{" "}
                {/* New tab, so the chosen photo and answers aren't lost. */}
                <a href="/polityka-prywatnosci#zdjecie" target="_blank" rel="noopener" className="font-medium text-primary underline underline-offset-2">{t.privacyLink}</a>
              </span>
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button className="mt-5 h-14 w-full rounded-full text-base" disabled={!file || !consent || !allChecked} onClick={submit}>{t.submit}<Sparkles size={17} /></Button>
        </section>
      </div>
    </main>
  );
}

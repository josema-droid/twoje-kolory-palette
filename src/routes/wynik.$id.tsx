import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { analyzePaidFromAnswers, analyzePaidResult, getResult, getTeaser, isAnalysed, PhotoRejected, storedPhoto } from "@/lib/api";
import { previewPalette, type Teaser } from "@/content/teaser";
import { GENDER_MALE } from "@/content/funnel";
import { createCheckoutSession } from "@/lib/checkout";
import { trackEvent } from "@/lib/tracking";
import type { ColorRecommendation } from "@/content/engine";
import type { Result } from "@/types/result";
import { seo } from "@/lib/seo";
import { ResultDashboard } from "@/components/dashboard/result-dashboard";
import { PdfButton } from "@/components/pdf-button";
import { pixelEventOnce } from "@/lib/meta-pixel";
import { CURRENCY, PRICE_PLN } from "@/lib/price";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Route = createFileRoute("/wynik/$id")({
  head: ({ params }) => seo({ title: "Wynik analizy kolorystycznej", description: "Twoja osobista paleta kolorów, neutrale, akcenty oraz wskazówki dotyczące makijażu i biżuterii.", path: `/wynik/${params.id}`, noindex: true }),
  component: ResultPage,
});

function Swatches({ colors }: { colors: ColorRecommendation[] }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
      {colors.map((color) => (
        <div key={color.name}>
          <div className="aspect-square rounded-md border border-border/50" style={{ backgroundColor: color.hex }} />
          <p className="mt-2 text-xs font-medium text-foreground">{color.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{color.hex.toUpperCase()}</p>
        </div>
      ))}
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground">{item}</span>
      ))}
    </div>
  );
}

type AnalysisState = { step: "running" } | { step: "needPhoto"; problem?: string };

/** After payment: analyse the photo kept in this browser, or ask for one (missing or unusable). */
function PaidAnalysis({ resultId, male, onDone }: { resultId: string; male: boolean; onDone: (result: Result) => void }) {
  const t = pl.result;
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<AnalysisState>({ step: "running" });
  const [file, setFile] = useState<File | null>(null);
  const run = async (photo: string | File | null) => {
    setState({ step: "running" });
    try {
      // null = no photo: the report is built from the quiz answers only.
      onDone(photo === null ? await analyzePaidFromAnswers(resultId) : await analyzePaidResult(resultId, photo));
      trackEvent("PhotoAnalyzed");
    } catch (e) {
      const problem = e instanceof PhotoRejected ? e.problem : "unavailable";
      if (!(e instanceof PhotoRejected)) console.error(e);
      trackEvent("PhotoRejected", { problem });
      setState({ step: "needPhoto", problem });
    }
  };
  useEffect(() => {
    const photo = storedPhoto(resultId);
    if (photo) void run(photo);
    else setState({ step: "needPhoto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  if (state.step === "running") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-5 text-center">
        <div>
          <div className="analysis-pulse mx-auto flex size-24 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles size={38} strokeWidth={1.4} /></div>
          <h1 className="mt-9 font-display text-4xl md:text-5xl">{t.analysingTitle}</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">{t.analysingText}</p>
        </div>
      </main>
    );
  }
  const errors = pl.photo.errors as Record<string, string>;
  // Technical problems (not the photo's fault): offer to retry with the same photo.
  const technical = state.problem === "unavailable" || state.problem === "rate_limited" || state.problem === "daily_limit" || state.problem === "not_paid";
  const saved = technical ? storedPhoto(resultId) : null;
  const message = !state.problem ? t.photoNeededText : technical ? errors[state.problem] : `${errors[state.problem] ?? errors["unavailable"]} ${t.photoRetryText}`;
  return (
    <main className="mx-auto min-h-[65vh] max-w-xl px-5 py-16 text-center md:py-24">
      <h1 className="font-display text-4xl md:text-5xl">{saved ? t.analysisFailedTitle : t.photoNeededTitle}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">{message}</p>
      {saved && <Button className="mt-8 h-14 w-full max-w-sm rounded-full text-base" onClick={() => run(saved)}>{t.retry}</Button>}
      <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f?.type.startsWith("image/")) setFile(f); }} />
      <Button variant="outline" className="mt-8 h-12 rounded-full border-primary/35 px-7 text-primary" onClick={() => inputRef.current?.click()}>
        {file ? file.name : t.photoChoose}
      </Button>
      <div>
        <Button className="mt-4 h-14 w-full max-w-sm rounded-full text-base" disabled={!file} onClick={() => file && run(file)}>{t.photoAnalyse}<Sparkles size={17} /></Button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">{male ? pl.photo.tipsMale.join(" · ") : pl.photo.tips.join(" · ")}</p>
      <div className="mx-auto mt-10 max-w-sm border-t border-border pt-6">
        <button type="button" className="text-sm font-medium text-primary underline underline-offset-4" onClick={() => void run(null)}>{t.noPhotoReport}</button>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.noPhotoReportHint}</p>
      </div>
    </main>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const user = useAuthUser();
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  // Meta Pixel (only with marketing consent): the price/payment box is shown →
  // InitiateCheckout; back from Stripe with the result paid → Purchase. Once per result.
  useEffect(() => {
    if (!result) return;
    const value = { value: PRICE_PLN, currency: CURRENCY };
    const search = new URLSearchParams(window.location.search);
    if (!result.isPaid) pixelEventOnce(`checkout:${result.id}`, "InitiateCheckout");
    else if (search.get("paid") === "1") {
      // Order id from Stripe's return URL (cs_…); falls back to the result id.
      const order = /^cs_[A-Za-z0-9_]+$/.test(search.get("order") ?? "") ? search.get("order")! : result.id;
      pixelEventOnce(`purchase:${order}`, "Purchase", value, order);
    }
  }, [result]);
  useEffect(() => {
    if (!result || result.isPaid) return;
    let active = true;
    getTeaser(result.answers).then((t) => { if (active) setTeaser(t); }).catch(() => {});
    return () => { active = false; };
  }, [result]);
  useEffect(() => {
    let active = true;
    const justPaid = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("paid") === "1";
    (async () => {
      // Stripe redirects the browser back right after payment, but the webhook
      // that flips is_paid can land a beat later — retry briefly in that case.
      for (let attempt = 0; active; attempt++) {
        const value = await getResult(id);
        if (!active) return;
        if (value?.isPaid || !justPaid || attempt >= 5) {
          setResult(value);
          setLoading(false);
          return;
        }
        await delay(1000);
      }
    })();
    return () => { active = false; };
  }, [id]);
  const unlock = async () => {
    if (!consent || !terms || !result) return;
    setBusy(true); trackEvent("InitiateCheckout", { resultId: result.id });
    const { url } = await createCheckoutSession({ data: { resultId: result.id, origin: window.location.origin, acceptedTerms: terms, waivedWithdrawal: consent } });
    window.location.href = url;
  };
  if (loading) return <main className="flex min-h-[65vh] items-center justify-center font-display text-3xl">{pl.result.loading}</main>;
  // Results are private to their owner (migration 0012): a logged-out visitor is
  // asked to log in; another account sees that this result isn't theirs.
  if (!result) {
    if (user === undefined) return <main className="flex min-h-[65vh] items-center justify-center font-display text-3xl">{pl.result.loading}</main>;
    return (
      <main className="mx-auto min-h-[65vh] max-w-xl px-5 py-20 text-center">
        <h1 className="font-display text-4xl">{user ? pl.result.notYours : pl.result.loginToSee}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{user ? pl.result.notYoursText : pl.result.loginToSeeText}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {user ? (
            <Button asChild className="h-12 rounded-full px-7"><Link to="/moje-wyniki">{pl.result.savedLink}<ArrowRight size={16} /></Link></Button>
          ) : (
            <Button asChild className="h-12 rounded-full px-7"><Link to="/logowanie" search={{ redirect: `/wynik/${id}` }}>{pl.auth.navLogin}<ArrowRight size={16} /></Link></Button>
          )}
          <Button asChild variant="outline" className="h-12 rounded-full border-primary/30 px-7 text-primary"><Link to="/">{pl.backHome}</Link></Button>
        </div>
      </main>
    );
  }
  const t = pl.result;
  const { report } = result;
  const male = result.answers["gender"] === GENDER_MALE || report.gender === "male";
  const account = (
    <>
        {user === null && !result.userId && (
          <section className="mx-auto mt-16 max-w-xl rounded-lg border border-border bg-secondary/55 p-6 text-center md:p-8">
            <h2 className="font-display text-3xl">{t.saveTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.saveText}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full px-7"><Link to="/rejestracja" search={{ redirect: `/wynik/${result.id}` }}>{t.saveSignup}<ArrowRight size={16} /></Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-primary/30 px-7 text-primary"><Link to="/logowanie" search={{ redirect: `/wynik/${result.id}` }}>{t.saveLogin}</Link></Button>
            </div>
          </section>
        )}
        {user && result.userId === user.id && (
          <p className="mt-16 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Check size={16} className="text-primary" />{t.saved} <Link to="/moje-wyniki" className="font-semibold text-primary hover:underline">{t.savedLink}</Link>
          </p>
        )}
    </>
  );
  // Paid, but the photo hasn't been analysed yet: that happens now, only after payment.
  if (result.isPaid && !isAnalysed(result)) return <PaidAnalysis resultId={result.id} male={male} onDone={setResult} />;
  const preview = isAnalysed(result) ? report.palette : previewPalette(result.answers);
  if (result.isPaid && report.dashboard) {
    return (
      <>
        <ResultDashboard report={report} dashboard={report.dashboard} />
        <div className="mx-auto max-w-5xl px-5 pb-20 md:px-10">{account}</div>
      </>
    );
  }
  return (
    <main className="pb-20">
      <section className="bg-secondary/60 px-5 py-14 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-card text-primary"><Sparkles size={22} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{result.isPaid ? t.profileTitle : t.teaserHeadline}</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{result.isPaid ? report.profile : male ? t.teaserSubtitleMale : t.teaserSubtitle}</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-5 pt-14 md:px-10 md:pt-20">
        {result.isPaid ? (
          <div id="raport" className="space-y-16" data-pdf-block>
            <section>
              <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
                {report.profileDetails.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </section>

            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.paletteTitle}</h2>
              <Swatches colors={report.palette} />
            </section>

            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.baseTitle}</h2>
              <Swatches colors={report.baseColors} />
            </section>

            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.accentsTitle}</h2>
              <Swatches colors={report.accents} />
            </section>

            <section className="grid gap-8 border-t border-border pt-12 md:grid-cols-3">
              <div>
                <h3 className="font-display text-xl">{t.whiteTitle}</h3>
                <p className="mt-2 font-medium">{report.bestWhite.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.bestWhite.reason}</p>
              </div>
              <div>
                <h3 className="font-display text-xl">{t.blackTitle}</h3>
                <p className="mt-2 font-medium">{report.blackAlternative.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.blackAlternative.reason}</p>
              </div>
              <div>
                <h3 className="font-display text-xl">{male ? t.metalTitleMale : t.metalTitle}</h3>
                <p className="mt-2 font-medium">{report.metal.primary}{report.metal.secondary ? ` · ${report.metal.secondary}` : ""}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.metal.reason}</p>
              </div>
            </section>

            {report.menswear && (
              <section className="border-t border-border pt-12">
                <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.menswearTitle}</h2>
                <div className="space-y-10">
                  <div><h3 className="mb-4 font-display text-xl">{t.shirtsTitle}</h3><Swatches colors={report.menswear.shirts} /></div>
                  <div><h3 className="mb-4 font-display text-xl">{t.knitwearTitle}</h3><Swatches colors={report.menswear.knitwear} /></div>
                  <div><h3 className="mb-4 font-display text-xl">{t.jacketsTitle}</h3><Swatches colors={report.menswear.jackets} /></div>
                  <div><h3 className="mb-4 font-display text-xl">{t.suitsTitle}</h3><Swatches colors={report.menswear.suits} /><p className="mt-5 text-sm leading-6 text-muted-foreground">{report.menswear.suitsNote}</p></div>
                </div>
              </section>
            )}

            {report.makeup && (
            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.makeupTitle}</h2>
              <Pills items={report.makeup.colors} />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.makeupBlush}</h4><p className="mt-2 text-sm leading-6">{report.makeup.blush.join(", ")}</p></div>
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.makeupLips}</h4><p className="mt-2 text-sm leading-6">{report.makeup.lips.join(", ")}</p></div>
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.makeupEyes}</h4><p className="mt-2 text-sm leading-6">{report.makeup.eyes.join(", ")}</p></div>
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.makeupBronzer}</h4><p className="mt-2 text-sm leading-6">{report.makeup.bronzer.join(", ")}</p></div>
              </div>
              {report.makeup.priorityAdvice && <p className="mt-6 text-sm leading-6 text-muted-foreground">{report.makeup.priorityAdvice}</p>}
            </section>
            )}

            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{male ? t.hairTitleMale : t.hairTitle}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.hairRecommended}</h4><div className="mt-3"><Pills items={report.hair.recommended} /></div></div>
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.hairAvoid}</h4><div className="mt-3"><Pills items={report.hair.avoid} /></div></div>
              </div>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">{report.hair.personalizedAdvice}</p>
              {report.hair.beardAdvice && <div className="mt-8"><h3 className="font-display text-xl">{t.beardTitle}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{report.hair.beardAdvice}</p></div>}
            </section>

            <section className="border-t border-border pt-12">
              <h2 className="mb-4 font-display text-3xl md:text-4xl">{t.cautionTitle}</h2>
              <Pills items={report.cautionColors} />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{report.cautionNote}</p>
            </section>

            <section className="border-t border-border pt-12">
              <h2 className="mb-4 font-display text-3xl md:text-4xl">{t.outfitTitle}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{report.outfit}</p>
            </section>

            <div className="border-t border-border pt-10">
              <PdfButton targetId="raport" />
            </div>
          </div>
        ) : (
          <>
            <section className="mb-14 rounded-lg border border-primary/25 bg-card p-6 md:p-8">
              <h2 className="font-display text-3xl md:text-4xl">{t.pitchTitle}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{t.pitchText}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {(male ? t.pitchItemsMale : t.pitchItems).map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6"><span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Check size={13} /></span>{item}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Button asChild className="h-13 rounded-full px-8 text-base"><a href="#odblokuj">{t.pitchCta}<ArrowRight size={17} /></a></Button>
                <p className="text-xs text-muted-foreground">{t.pitchPrice}</p>
              </div>
            </section>
            <section>
              <h2 className="font-display text-3xl md:text-4xl">{t.teaserPalette}</h2>
              {teaser ? (
                <>
                  <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{teaser.summary}</p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {teaser.colors.map((c) => (
                      <div key={c.name} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                        <div className="size-20 shrink-0 rounded-md border border-border/50" style={{ backgroundColor: c.hex }} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">{c.role}</p>
                          <p className="mt-1 font-display text-xl leading-tight">{c.name}</p>
                          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{c.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-7"><Swatches colors={preview.slice(0, 3)} /></div>
              )}
              <div className="relative mt-9 overflow-hidden rounded-lg border border-border bg-card p-5">
                <div aria-hidden="true" className="pointer-events-none grid grid-cols-3 gap-4 blur-lg sm:grid-cols-5">
                  {preview.slice(3).map((color) => <div key={color.name} className="aspect-square rounded-md" style={{ backgroundColor: color.hex }} />)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-card/45">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <LockKeyhole size={22} className="text-primary" />
                    <p className="font-display text-xl">{t.hidden}</p>
                  </div>
                </div>
              </div>
            </section>
            <section id="odblokuj" className="mx-auto mt-16 max-w-xl scroll-mt-24 border-t border-border pt-12 text-center">
              <h2 className="font-display text-4xl">{t.unlockTitle}</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{male ? t.unlockTextMale : t.unlockText}</p>
              <label className="mt-8 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-left">
                <Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
                <span className="text-xs leading-5 text-muted-foreground">
                  {t.termsBefore}
                  {/* New tab, so the result page stays open. */}
                  <a href="/regulamin" target="_blank" rel="noopener" className="font-medium text-primary underline underline-offset-2">{t.termsLink}</a>
                </span>
              </label>
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 text-left">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
                <span className="text-xs leading-5 text-muted-foreground">{t.legalConsent}</span>
              </label>
              <Button className="mt-5 h-14 w-full rounded-full text-base" disabled={!consent || !terms || busy} onClick={unlock}>{t.unlock}<ArrowRight size={17} /></Button>
            </section>
          </>
        )}
        {account}
      </div>
    </main>
  );
}

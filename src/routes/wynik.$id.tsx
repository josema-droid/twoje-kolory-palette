import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, LockKeyhole, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getResult } from "@/lib/api";
import { createCheckoutSession } from "@/lib/checkout";
import { trackEvent } from "@/lib/tracking";
import type { ColorRecommendation } from "@/content/engine";
import type { Result } from "@/types/result";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Route = createFileRoute("/wynik/$id")({
  head: () => ({ meta: [{ title: "Twój wynik — Twoje Kolory" }, { name: "description", content: "Poznaj swoją osobistą paletę kolorystyczną." }, { property: "og:title", content: "Twój wynik — Twoje Kolory" }, { property: "og:description", content: "Poznaj swoją osobistą paletę kolorystyczną." }] }),
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

function ResultPage() {
  const { id } = Route.useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloadNote, setDownloadNote] = useState(false);
  const user = useAuthUser();
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
    if (!consent || !result) return;
    setBusy(true); trackEvent("InitiateCheckout", { resultId: result.id });
    const { url } = await createCheckoutSession({ data: { resultId: result.id, origin: window.location.origin } });
    window.location.href = url;
  };
  if (loading) return <main className="flex min-h-[65vh] items-center justify-center font-display text-3xl">{pl.result.loading}</main>;
  if (!result) return <main className="mx-auto min-h-[65vh] max-w-4xl px-5 py-20"><h1 className="font-display text-4xl">{pl.result.missing}</h1><Button asChild className="mt-8 rounded-full"><Link to="/">{pl.backHome}</Link></Button></main>;
  const t = pl.result;
  const { report } = result;
  return (
    <main className="pb-20">
      <section className="bg-secondary/60 px-5 py-14 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-card text-primary"><Sparkles size={22} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{result.isPaid ? t.profileTitle : t.teaserHeadline}</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{result.isPaid ? report.profile : t.teaserSubtitle}</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-5 pt-14 md:px-10 md:pt-20">
        {result.isPaid ? (
          <div className="space-y-16">
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
                <h3 className="font-display text-xl">{t.metalTitle}</h3>
                <p className="mt-2 font-medium">{report.metal.primary}{report.metal.secondary ? ` · ${report.metal.secondary}` : ""}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.metal.reason}</p>
              </div>
            </section>

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

            <section className="border-t border-border pt-12">
              <h2 className="mb-7 font-display text-3xl md:text-4xl">{t.hairTitle}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.hairRecommended}</h4><div className="mt-3"><Pills items={report.hair.recommended} /></div></div>
                <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.hairAvoid}</h4><div className="mt-3"><Pills items={report.hair.avoid} /></div></div>
              </div>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">{report.hair.personalizedAdvice}</p>
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
              <Button variant="outline" className="h-12 rounded-full border-primary/35 px-7 text-primary" onClick={() => setDownloadNote(true)}><Download size={17} />{t.download}</Button>
              {downloadNote && <p className="mt-3 text-sm text-muted-foreground">{t.downloadPlaceholder}</p>}
            </div>
          </div>
        ) : (
          <>
            <section>
              <h2 className="font-display text-3xl md:text-4xl">{t.teaserPalette}</h2>
              <div className="mt-7"><Swatches colors={report.palette.slice(0, 3)} /></div>
              <div className="relative mt-9 overflow-hidden rounded-lg border border-border bg-card p-5">
                <div aria-hidden="true" className="pointer-events-none grid grid-cols-3 gap-4 blur-lg sm:grid-cols-5">
                  {report.palette.slice(3).map((color) => <div key={color.name} className="aspect-square rounded-md" style={{ backgroundColor: color.hex }} />)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-card/45">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <LockKeyhole size={22} className="text-primary" />
                    <p className="font-display text-xl">{t.hidden}</p>
                  </div>
                </div>
              </div>
            </section>
            <section className="mx-auto mt-16 max-w-xl border-t border-border pt-12 text-center">
              <h2 className="font-display text-4xl">{t.unlockTitle}</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{t.unlockText}</p>
              <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 text-left">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
                <span className="text-xs leading-5 text-muted-foreground">{t.legalConsent}</span>
              </label>
              <Button className="mt-5 h-14 w-full rounded-full text-base" disabled={!consent || busy} onClick={unlock}>{t.unlock}<ArrowRight size={17} /></Button>
            </section>
          </>
        )}
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
      </div>
    </main>
  );
}

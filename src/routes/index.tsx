import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import hero from "@/assets/hero-colors.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Twoje Kolory — Odkryj swoje kolory w 60 sekund" },
    { name: "description", content: "Poznaj kolory, które podkreślają Twoją urodę. Krótki test, selfie i Twoja osobista paleta kolorów." },
    { property: "og:title", content: "Twoje Kolory — Odkryj swoje kolory w 60 sekund" },
    { property: "og:description", content: "Krótki test, selfie i Twoja osobista paleta kolorów." },
  ] }),
  component: Home,
});

function Swatch({ color }: { color: { name: string; hex: string } }) {
  return (
    <div>
      <div className="aspect-square rounded-md border border-border/50" style={{ backgroundColor: color.hex }} />
      <p className="mt-1.5 text-[11px] text-muted-foreground">{color.name}</p>
    </div>
  );
}

function Home() {
  const t = pl.landing;
  const heroRef = useRef<HTMLElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyCta(entry ? !entry.isIntersecting : false));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* 1-2. HERO */}
      <section ref={heroRef} className="relative overflow-hidden bg-muted">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-10 md:py-24">
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary"><span className="h-px w-8 bg-primary" />{t.eyebrow}</p>
            <h1 className="font-display text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg">{t.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base shadow-lg md:h-16 md:px-10"><Link to="/test">{t.cta}<ArrowRight size={19} /></Link></Button>
              <a href="#przykladowy-wynik" className="text-sm font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary">{t.secondaryCta}</a>
            </div>
            <p className="mt-5 text-xs font-medium text-muted-foreground">{t.note}</p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-border/60 shadow-sm">
              <img src={hero} alt={t.heroAlt} width={900} height={1050} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute bottom-5 left-1/2 w-[85%] -translate-x-1/2 rounded-lg border border-border bg-card p-4 shadow-xl sm:right-[-1.5rem] sm:bottom-6 sm:left-auto sm:w-64 sm:translate-x-0">
              <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-muted-foreground">{t.heroPaletteLabel}</p>
              <div className="mt-3 grid grid-cols-5 gap-2">{t.heroPaletteSample.map((color) => <Swatch key={color.name} color={color} />)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT YOU GET */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.whatYouGet.eyebrow}</p>
            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight md:text-4xl">{t.whatYouGet.headline}</h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t.whatYouGet.text}</p>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {t.whatYouGet.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85">
                  <Check size={15} className="mt-0.5 shrink-0 text-primary" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {t.whatYouGet.cards.map((card) => (
              <div key={card} className="flex min-h-32 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
                <Sparkles size={17} className="text-primary" />
                <p className="font-display text-lg leading-snug">{card}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BENEFITS */}
      <section className="bg-secondary/55">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24">
          <h2 className="max-w-lg font-display text-3xl leading-tight md:text-4xl">{t.benefits.headline}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {t.benefits.items.map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.howItWorks.eyebrow}</p>
        <h2 className="mt-4 max-w-lg font-display text-3xl leading-tight md:text-4xl">{t.howItWorks.headline}</h2>
        <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t.howItWorks.text}</p>
        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="absolute inset-x-0 top-5 hidden h-px bg-border md:block" aria-hidden="true" />
          {t.howItWorks.steps.map((step) => (
            <div key={step.number} className="relative">
              <span className="font-display text-3xl text-primary/35">{step.number}</span>
              <p className="mt-3 text-xs font-bold uppercase tracking-[.15em] text-primary">{step.label}</p>
              <h3 className="mt-2 font-display text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
              {step.note && <p className="mt-3 text-xs text-muted-foreground/80">{step.note}</p>}
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button asChild size="lg" className="h-14 rounded-full px-8 text-base"><Link to="/test">{t.howItWorks.cta}<ArrowRight size={18} /></Link></Button>
          <p className="mt-3 text-xs font-medium text-muted-foreground">{t.howItWorks.ctaNote}</p>
        </div>
      </section>

      {/* 7. EXAMPLE RESULT */}
      <section id="przykladowy-wynik" className="bg-secondary/55">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 py-20 md:grid-cols-[0.75fr_1.25fr] md:gap-16 md:px-10 md:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.exampleResult.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl">{t.exampleResult.headline}</h2>
            <p className="mt-5 leading-7 text-muted-foreground">{t.exampleResult.text}</p>
            <p className="mt-5 text-xs text-muted-foreground/80">{t.exampleResult.scopeLine}</p>
            <Button asChild size="lg" className="mt-8 h-14 rounded-full px-8 text-base"><Link to="/test">{t.exampleResult.cta}<ArrowRight size={18} /></Link></Button>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{t.exampleResult.ctaNote}</p>
          </div>
          <div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-muted-foreground">{t.exampleResult.cardEyebrow}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">{t.exampleResult.cardLabel}</p>
              <h3 className="mt-2 font-display text-3xl md:text-4xl">{t.exampleResult.cardTitle}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t.exampleResult.cardText}</p>
              <div className="mt-7 grid grid-cols-4 gap-3 sm:grid-cols-8">{t.exampleResult.palette.map((color) => <Swatch key={color.name} color={color} />)}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {t.exampleResult.modules.map((module) => (
                <div key={module.label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{module.label}</p>
                  <p className="mt-1.5 text-sm leading-5">{module.items.join(", ")}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground/80">{t.exampleResult.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* 8. METHODOLOGY */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:py-24">
        <h2 className="font-display text-3xl leading-tight md:text-4xl">{t.methodology.headline}</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">{t.methodology.text}</p>
      </section>

      {/* 9. CREDIBILITY */}
      <section className="bg-secondary/55">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
          <p className="font-display text-2xl italic text-primary/80">{t.credibility.headline}</p>
          <p className="mt-4 font-display text-2xl md:text-3xl">{t.credibility.text1}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{t.credibility.text2}</p>
        </div>
      </section>

      {/* 10. PRICE / VALUE */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-display text-3xl leading-tight md:text-4xl">{t.pricing.insight1}</h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t.pricing.insight2}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <p className="font-display text-xl">{t.pricing.cardTitle}</p>
            <p className="mt-2 font-display text-5xl">{t.pricing.price}</p>
            <ul className="mt-6 space-y-2.5">
              {t.pricing.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85"><Check size={15} className="mt-0.5 shrink-0 text-primary" />{item}</li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-7 h-14 w-full rounded-full text-base"><Link to="/test">{t.pricing.cta}<ArrowRight size={18} /></Link></Button>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="bg-secondary/55">
        <div className="mx-auto max-w-3xl px-5 py-20 md:py-24">
          <h2 className="text-center font-display text-3xl leading-tight md:text-4xl">{t.faq.headline}</h2>
          <div className="mt-12 divide-y divide-border border-t border-border">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground marker:content-none">
                  {item.q}
                  <span className="ml-4 shrink-0 text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA */}
      <section className="mx-auto max-w-2xl px-5 py-20 text-center md:py-28">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.finalCta.eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{t.finalCta.headline}</h2>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">{t.finalCta.text}</p>
        <Button asChild size="lg" className="mt-9 h-14 w-full rounded-full px-8 text-base sm:w-auto md:h-16 md:px-10"><Link to="/test">{t.finalCta.cta}<ArrowRight size={19} /></Link></Button>
        <p className="mt-4 text-xs font-medium text-muted-foreground">{t.finalCta.ctaNote}</p>
      </section>

      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <Button asChild className="h-12 w-full rounded-full text-sm"><Link to="/test">{t.cta}<ArrowRight size={16} /></Link></Button>
        </div>
      )}
    </main>
  );
}

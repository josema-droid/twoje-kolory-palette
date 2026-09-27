import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Check, Palette, Sparkles } from "lucide-react";
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

function Home() {
  const t = pl.landing;
  const sample = pl.mock.palettes.spring.best;
  return <main>
    <section className="relative flex min-h-[610px] items-center overflow-hidden bg-muted md:min-h-[650px] lg:min-h-[680px]">
      <img src={hero} alt="Kobieta trzymająca kolorowe próbki tkanin" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover object-[66%_center] max-md:opacity-35 md:object-center" />
      <div className="absolute inset-0 bg-background/55 md:bg-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 md:px-10">
        <div className="max-w-[590px]"><p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary"><span className="h-px w-8 bg-primary" />{t.eyebrow}</p><h1 className="font-display text-5xl leading-[1.08] font-normal text-foreground sm:text-6xl md:text-7xl lg:text-[5.3rem]">{t.title}</h1><p className="mt-7 max-w-[430px] text-lg leading-relaxed text-foreground/80 md:text-xl">{t.subtitle}</p><Button asChild size="lg" className="mt-9 h-14 rounded-full px-8 text-base shadow-lg md:h-16 md:px-10"><Link to="/test">{t.cta}<ArrowRight size={19} /></Link></Button><p className="mt-5 text-xs font-medium text-muted-foreground">{t.note}</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.stepsEyebrow}</p><h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{t.stepsTitle}</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-8">{t.steps.map((step, i) => { const Icon = [Check, Camera, Palette][i]; return <div key={step.title} className="border-t border-border pt-6"><div className="mb-9 flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><Icon size={23} strokeWidth={1.5} /></span><span className="font-display text-2xl text-primary/45">0{i + 1}</span></div><h3 className="font-display text-2xl">{step.title}</h3><p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">{step.description}</p></div>; })}</div></section>
    <section className="bg-secondary/55"><div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-24"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{t.previewEyebrow}</p><h2 className="mt-4 max-w-md font-display text-4xl leading-tight md:text-5xl">{t.previewTitle}</h2><p className="mt-5 max-w-sm leading-7 text-muted-foreground">{t.previewText}</p><Button asChild variant="outline" className="mt-8 h-12 rounded-full border-primary/30 px-6 text-primary"><Link to="/test">{t.previewCta}<ArrowRight size={16} /></Link></Button></div><div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-7 shadow-sm md:p-9"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">{t.previewLabel}</span><Sparkles className="text-primary" size={18} /></div><h3 className="mt-8 font-display text-4xl">{t.previewSeason}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{t.previewCardText}</p><div className="mt-9 grid grid-cols-4 gap-2">{sample.map((color) => <div key={color.name}><div className="aspect-square rounded-sm" style={{ backgroundColor: color.hex }} /><p className="mt-2 text-[11px] text-muted-foreground">{color.name}</p></div>)}</div></div></div></section>
  </main>;
}
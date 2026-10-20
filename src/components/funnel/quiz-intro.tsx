import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrapeLoader } from "@/components/funnel/drape-loader";
import { pl } from "@/content/pl";

// Short "getting your test ready" screen before the first question: the drape
// reel plus one research-backed fact (picked at random per visit).
const LOAD_MS = 6000;

export function QuizIntro({ onStart }: { onStart: () => void }) {
  const t = pl.quizIntro;
  // Picked after mount so server and browser render the same first frame.
  const [factIndex, setFactIndex] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * t.facts.length));
    const timer = window.setTimeout(() => setReady(true), LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [t.facts.length]);
  const fact = t.facts[factIndex]!;

  return (
    <main className="flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center px-5 py-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{ready ? t.readyEyebrow : t.eyebrow}</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white shadow-sm" style={{ width: "min(46vw, 230px, calc((100svh - 4.5rem - 380px) * 0.818))" }}>
        <DrapeLoader />
      </div>
      <section className="mt-4 w-full max-w-md rounded-lg border border-border bg-card px-4 py-3 text-left sm:px-5 sm:py-4" aria-labelledby="fact-title">
        <p id="fact-title" className="font-display text-lg">{t.factTitle}</p>
        <p className="mt-1.5 text-sm leading-6 text-foreground/85">{fact.text}</p>
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{t.sourceLabel} {fact.source}</p>
      </section>
      <div className="mt-4 w-full max-w-xs">
        {ready ? (
          <Button className="h-13 w-full rounded-full text-base" onClick={onStart}>{t.start}<ArrowRight size={17} /></Button>
        ) : (
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary" aria-label={t.loading} role="progressbar">
            <div className="quiz-intro-bar h-full rounded-full bg-primary" style={{ animationDuration: `${LOAD_MS}ms` }} />
          </div>
        )}
      </div>
    </main>
  );
}

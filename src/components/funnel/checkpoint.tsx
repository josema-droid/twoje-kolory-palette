import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import { EYE_HEX, HAIR_HEX } from "@/content/dashboard";
import type { Answers } from "@/content/funnel";

const t = pl.quiz.checkpoints;

// A palette that "fills in" a little more at every checkpoint.
const DOTS = ["#e0475e", "#f2a08a", "#e3ba7a", "#8fc04f", "#3dbcb3", "#5b83b5", "#8a5c8a", "#6b4430"];
const FILLED = [3, 6, 8];

const text = (answers: Answers, id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");
const firstGoal = (answers: Answers) => {
  const goal = answers["goal"];
  return Array.isArray(goal) ? goal[0] ?? "" : typeof goal === "string" ? goal : "";
};

/** Counts the percentage up from the previous checkpoint, in step with the bar. */
function useCountUp(from: number, to: number, ms = 1200) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setValue(to);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setValue(Math.round(from + (to - from) * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to, ms]);
  return value;
}

export function Checkpoint({ step, answers, onContinue }: { step: 1 | 2 | 3; answers: Answers; onContinue: () => void }) {
  const copy = t.steps[step - 1]!;
  const previous = step === 1 ? 0 : t.steps[step - 2]!.progress;
  const percent = useCountUp(previous, copy.progress);
  const [barWidth, setBarWidth] = useState(previous);
  const button = useRef<HTMLButtonElement>(null);
  // Focus the button for keyboard users without scrolling the title out of view.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    button.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarWidth(copy.progress));
    return () => cancelAnimationFrame(id);
  }, [copy.progress]);

  const eyesHex = EYE_HEX[text(answers, "eyes")];
  const hairHex = HAIR_HEX[text(answers, "naturalHair")];
  const already = step === 1 ? 0 : FILLED[step - 2]!;

  return (
    <section className="cp mx-auto max-w-xl text-center" role="status" aria-live="polite">
      <div className="cp-badge" aria-hidden="true">
        <svg viewBox="0 0 52 52"><circle className="cp-badge__ring" cx="26" cy="26" r="24" /><path className="cp-badge__check" d="M15 27l7 7 15-16" /></svg>
      </div>
      <p className="cp-fade mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary" style={{ "--d": "150ms" } as CSSProperties}>
        {t.eyebrow} {step} {t.of} 3
      </p>
      <h1 className="cp-fade mt-3 font-display text-3xl leading-tight md:text-4xl" style={{ "--d": "250ms" } as CSSProperties}>{copy.title}</h1>
      {/* Progress first, so it's visible without scrolling on phones. */}
      <div className="mx-auto mt-6 max-w-md text-left">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-display text-base">{t.goal}</span>
          <span className="font-semibold tabular-nums text-primary">{percent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={copy.progress} aria-label={t.goal}>
          <div className="cp-bar h-full rounded-full" style={{ width: `${barWidth}%` }} />
        </div>
      </div>

      <p className="cp-fade mx-auto mt-4 max-w-md leading-7 text-muted-foreground" style={{ "--d": "350ms" } as CSSProperties}>{copy.text}</p>

      {/* What they've told us so far: makes the effort visible. */}
      <div className="cp-fade mt-7" style={{ "--d": "500ms" } as CSSProperties}>
        {step === 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            {firstGoal(answers) && <span className="rounded-full border border-border bg-card px-4 py-2 text-sm"><span className="text-muted-foreground">{t.chipsGoal}: </span>{firstGoal(answers)}</span>}
            {text(answers, "style") && <span className="rounded-full border border-border bg-card px-4 py-2 text-sm"><span className="text-muted-foreground">{t.chipsStyle}: </span>{text(answers, "style")}</span>}
          </div>
        )}
        {step === 2 && (eyesHex || hairHex) && (
          <div className="flex justify-center gap-8">
            {eyesHex && <div className="cp-feature"><span style={{ background: eyesHex }} /><p>{t.eyesLabel}</p><p className="text-muted-foreground">{text(answers, "eyes").toLowerCase()}</p></div>}
            {hairHex && <div className="cp-feature"><span style={{ background: hairHex }} /><p>{t.hairLabel}</p><p className="text-muted-foreground">{text(answers, "naturalHair").toLowerCase()}</p></div>}
          </div>
        )}
        {step === 3 && (
          <ul className="mx-auto grid max-w-xs gap-2 text-left">
            {t.checklist.map((item, i) => (
              <li key={item} className="cp-check-item flex items-center gap-3 text-sm" style={{ "--d": `${600 + i * 180}ms` } as CSSProperties}>
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${i < 3 ? "bg-primary text-primary-foreground" : "cp-pending border border-primary text-primary"}`}>
                  {i < 3 ? <Check size={14} /> : <span className="size-1.5 rounded-full bg-primary" />}
                </span>
                <span className={i < 3 ? "" : "font-semibold"}>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-7 flex justify-center gap-2" aria-hidden="true">
        {DOTS.map((hex, i) => (
          <span
            key={hex}
            className={`cp-dot ${i < FILLED[step - 1]! ? (i < already ? "is-on" : "is-on is-new") : ""}`}
            style={{ "--c": hex, "--d": `${700 + (i - already) * 120}ms` } as CSSProperties}
          />
        ))}
      </div>

      <Button className="cp-fade mt-9 h-13 w-full rounded-full text-base sm:w-auto sm:px-10" style={{ "--d": "900ms" } as CSSProperties} onClick={onContinue} ref={button}>
        {step === 3 ? t.toPhoto : t.continue}<ArrowRight size={17} />
      </Button>
    </section>
  );
}

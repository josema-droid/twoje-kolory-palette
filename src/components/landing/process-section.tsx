import { pl } from "@/content/pl";
import { CtaBlock } from "./shared";

export function ProcessSection() {
  const t = pl.landing.process;
  return (
    <section className="lp-section process" aria-labelledby="process-title">
      <div className="lp-container">
        <p className="lp-eyebrow">{t.eyebrow}</p>
        <h2 className="lp-h2" id="process-title">
          {t.headlinePrefix}<em className="text-accent">{t.headlineHighlight}</em><br />{t.headlineSuffix}
        </h2>
        <p className="process__lead">{t.lead}</p>
      </div>

      <div className="process__body">
        <ol className="steps">
          {t.steps.map((step) => (
            <li key={step.number} className="step">
              <p className="step__over" aria-hidden="true">{step.tag}</p>
              <article className="step__card">
                <header className="step__head">
                  <span className="step__num">{step.number}</span>
                  <h3 className="step__title">{step.title}</h3>
                </header>
                <p className="step__text">{step.text}</p>
                {step.note && <p className="step__text">{step.note}</p>}
              </article>
            </li>
          ))}
        </ol>
        <CtaBlock variant="tan" label={pl.landing.cta} note={pl.landing.ctaNote} />
      </div>
    </section>
  );
}

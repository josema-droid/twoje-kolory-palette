import { Link } from "@tanstack/react-router";
import { pl } from "@/content/pl";

export function FaqSection() {
  const t = pl.landing.faq;
  return (
    <section className="lp-section faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__box">
        <header className="center-head">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <p className="faq__eyebrow">{t.eyebrow}</p>
          <h2 className="lp-display" id="faq-title">{t.headline}</h2>
          <p className="center-head__sub">{t.sub}</p>
        </header>

        {/* Native <details> sharing a name = accessible accordion with only one open at a time. */}
        <div className="accordion">
          {t.items.map((item, i) => (
            <details key={item.q} name="faq" className="accordion__item" open={i === 0}>
              <summary>
                <span className="accordion__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="accordion__q">{item.q}</span>
                <span className="accordion__icon" aria-hidden="true" />
              </summary>
              <div className="accordion__a"><p>{item.a}</p></div>
            </details>
          ))}
        </div>

        <div className="faq__cta">
          <p className="faq__cta-text">{t.ctaText}</p>
          <Link to="/test" className="lp-btn lp-btn--pill lp-btn--brown-soft">{t.cta} <span className="lp-btn__arrow" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}

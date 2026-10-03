import { pl } from "@/content/pl";
import cardMark from "@/assets/landing/card-mark.webp";
import swatchBlack from "@/assets/landing/swatch-black.webp";
import swatchGold from "@/assets/landing/swatch-gold.webp";
import swatchLips from "@/assets/landing/swatch-lips.webp";
import swatchNeutral from "@/assets/landing/swatch-neutral.webp";

const t = pl.landing.includes;

const cards = [
  { key: "black", label: t.cards.black, src: swatchBlack, width: 160, height: 299 },
  { key: "gold", label: t.cards.gold, src: swatchGold, width: 300, height: 310 },
  { key: "lips", label: t.cards.lips, src: swatchLips, width: 300, height: 332 },
  { key: "neutral", label: t.cards.neutral, src: swatchNeutral, width: 300, height: 362 },
] as const;

export function IncludesSection() {
  return (
    <section className="lp-section includes" aria-labelledby="includes-title">
      <div className="lp-container includes__grid">
        <div>
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 className="lp-h2" id="includes-title">{t.headline}</h2>
          <p className="includes__lead">{t.lead}</p>
          <ul className="checklist">
            {t.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <ul className="feature-cards">
          {cards.map((card) => (
            <li key={card.key} className="feature-card">
              <img className="feature-card__mark" src={cardMark} width={155} height={200} alt="" />
              <img className={`feature-card__art feature-card__art--${card.key}`} src={card.src} width={card.width} height={card.height} alt="" loading="lazy" decoding="async" />
              <h3 className="feature-card__label">{card.label}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

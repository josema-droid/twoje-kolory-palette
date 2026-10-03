import { pl } from "@/content/pl";
import { CenterHead } from "./shared";
import compareRandom from "@/assets/landing/compare-random.webp";
import compareHarmony from "@/assets/landing/compare-harmony.webp";
import fabricGrey from "@/assets/landing/fabric-grey.webp";
import fabricPlum from "@/assets/landing/fabric-plum.webp";
import fabricRose from "@/assets/landing/fabric-rose.webp";
import fabricIvory from "@/assets/landing/fabric-ivory.webp";
import fabricCoral from "@/assets/landing/fabric-coral.webp";
import fabricTeal from "@/assets/landing/fabric-teal.webp";

const t = pl.landing.compare;

const cards = [
  { ...t.bad, photo: compareRandom, fabrics: [fabricGrey, fabricPlum, fabricRose], good: false },
  { ...t.good, photo: compareHarmony, fabrics: [fabricIvory, fabricCoral, fabricTeal], good: true },
];

export function CompareSection() {
  return (
    <section className="lp-section compare" aria-labelledby="compare-title">
      <div className="lp-container">
        <CenterHead id="compare-title" eyebrow={t.eyebrow} lines={t.headline} sub={t.sub} />

        <div className="compare__grid">
          {cards.map((card) => (
            <article key={card.title} className={`compare-card${card.good ? " compare-card--good" : ""}`}>
              <h3 className="compare-card__title">{card.title}</h3>
              <div className="compare-card__media">
                <img src={card.photo} width={1100} height={825} alt={card.alt} loading="lazy" decoding="async" />
                <ul className="fabrics" aria-label={card.fabricsLabel}>
                  {card.fabrics.map((src) => <li key={src}><img src={src} width={160} height={160} alt="" loading="lazy" /></li>)}
                </ul>
              </div>
              <ul className={`pros-cons ${card.good ? "pros-cons--check" : "pros-cons--minus"}`}>
                {card.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <p className="compare__note">{t.note}</p>
      </div>
    </section>
  );
}

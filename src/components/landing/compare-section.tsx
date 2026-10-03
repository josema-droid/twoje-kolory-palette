import { pl } from "@/content/pl";
import { CenterHead } from "./shared";
import compareRandom from "@/assets/landing/szal-w-niedopasowanym-kolorze.webp";
import compareHarmony from "@/assets/landing/szal-w-dopasowanym-kolorze.webp";
import fabricGrey from "@/assets/landing/tkanina-grafit.webp";
import fabricPlum from "@/assets/landing/tkanina-sliwka.webp";
import fabricRose from "@/assets/landing/tkanina-chlodny-roz.webp";
import fabricIvory from "@/assets/landing/tkanina-ecru.webp";
import fabricCoral from "@/assets/landing/tkanina-koral.webp";
import fabricTeal from "@/assets/landing/tkanina-morska-zielen.webp";

const t = pl.landing.compare;

const cards = [
  { ...t.bad, photo: compareRandom, fabricImages: [fabricGrey, fabricPlum, fabricRose], good: false },
  { ...t.good, photo: compareHarmony, fabricImages: [fabricIvory, fabricCoral, fabricTeal], good: true },
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
                  {card.fabricImages.map((src, i) => <li key={src}><img src={src} width={160} height={160} alt={card.fabrics[i]} loading="lazy" /></li>)}
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

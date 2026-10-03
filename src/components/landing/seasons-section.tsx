import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { pl } from "@/content/pl";
import { CenterHead } from "./shared";
import { swatch } from "./utils";
import lookFlatlay from "@/assets/landing/stylizacja-ecru-mieta-brzoskwinia.webp";
import comboEcru from "@/assets/landing/polaczenie-ecru.webp";
import comboPeach from "@/assets/landing/polaczenie-brzoskwinia.webp";
import comboMint from "@/assets/landing/polaczenie-mieta.webp";

const t = pl.landing.seasons;

const seasonIcons: Record<string, React.ReactNode> = {
  wiosna: <path d="M12 12c0-3 1.5-6 0-8-1.5 2 0 5 0 8Zm0 0c3 0 6 1.5 8 0-2-1.5-5 0-8 0Zm0 0c0 3-1.5 6 0 8 1.5-2 0-5 0-8Zm0 0c-3 0-6-1.5-8 0 2 1.5 5 0 8 0Zm0 0c2-2 3-5 5.5-5.5C17 9 14 10 12 12Zm0 0c2 2 5 3 5.5 5.5C15 17 14 14 12 12Zm0 0c-2 2-3 5-5.5 5.5C7 15 10 14 12 12Zm0 0c-2-2-5-3-5.5-5.5C9 7 10 10 12 12Z" />,
  lato: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  jesien: <><path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Z" /><path d="M5 19 14 10M9 15h4M11 13V9" /></>,
  zima: <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 3.5l3 2 3-2M9 20.5l3-2 3 2M3.6 10.5 6.6 9l-.4-3.5M20.4 13.5l-3 1.5.4 3.5M3.6 13.5l3 1.5-.4 3.5M20.4 10.5l-3-1.5.4-3.5" />,
};

// Photographed fabric swatches exist for this palette; the others use CSS-textured dots.
const comboPhotos: Record<string, string[]> = {
  "jasna-wiosna": [comboEcru, comboPeach, comboMint],
};

export function SeasonsSection() {
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [typeIndex, setTypeIndex] = useState(0);
  const season = t.list[seasonIndex]!;
  const type = season.types[typeIndex]!;
  const photos = comboPhotos[type.key];
  const comboNames = type.combo.text.split(" + ");

  return (
    <section className="lp-section seasons" aria-labelledby="seasons-title">
      <div className="lp-container">
        <CenterHead id="seasons-title" eyebrow={t.eyebrow} lines={t.headline} sub={t.sub} />

        <div className="season-tabs" role="group" aria-label={t.seasonGroupLabel}>
          {t.list.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className="season-tab"
              aria-pressed={i === seasonIndex}
              onClick={() => { setSeasonIndex(i); setTypeIndex(0); }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">{seasonIcons[s.key]}</svg>
              {s.label}
            </button>
          ))}
        </div>

        <div className="subtype-tabs" role="group" aria-label={t.typeGroupLabel}>
          {season.types.map((ty, i) => (
            <button key={ty.key} type="button" className="subtype-tab" aria-pressed={i === typeIndex} onClick={() => setTypeIndex(i)}>
              {ty.label}
            </button>
          ))}
        </div>

        {/* keyed so the fade-in animation replays on every switch */}
        <article key={type.key} className="palette-card" aria-label={type.label}>
          <div className="palette-card__info">
            <p className="palette-card__eyebrow">{t.cardEyebrow}</p>
            <h3 className="palette-card__title">{type.label}</h3>
            <ul className="chips">{type.chips.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="palette-card__desc">{type.description}</p>
            <ul className="swatches">
              {type.swatches.map((c) => <li key={c.name}><span style={swatch(c.hex)} />{c.name}</li>)}
            </ul>
            <div className="combo">
              <p className="palette-card__eyebrow">{t.comboLabel}</p>
              <div className="combo__row">
                <ul className="combo__dots">
                  {type.combo.colors.map((hex, i) => (
                    <li key={hex}>
                      {photos ? <img src={photos[i]} width={120} height={120} alt={`Tkanina: ${comboNames[i] ?? ""}`} loading="lazy" /> : <span style={swatch(hex)} />}
                    </li>
                  ))}
                </ul>
                <p className="combo__text">{type.combo.text}</p>
              </div>
            </div>
          </div>
          <figure className="palette-card__media">
            <img src={lookFlatlay} width={1100} height={1100} alt={t.mediaAlt} loading="lazy" decoding="async" />
            <figcaption>{t.mediaCaption}</figcaption>
            <Link to="/typy-urody/$slug" params={{ slug: type.key }} className="lp-btn lp-btn--pill lp-btn--brown">{t.cta} <span className="lp-btn__arrow" aria-hidden="true">→</span></Link>
          </figure>
        </article>
        <p className="seasons__all"><Link to="/typy-urody">{t.allTypes} →</Link></p>
      </div>
    </section>
  );
}

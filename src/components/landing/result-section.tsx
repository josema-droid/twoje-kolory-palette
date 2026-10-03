import { pl } from "@/content/pl";
import { CtaBlock } from "./shared";
import { swatch } from "./utils";
import jewelryImg from "@/assets/landing/zlota-bizuteria-ciepla-wiosna.webp";
import makeupImg from "@/assets/landing/makijaz-ciepla-wiosna.webp";
import hairImg from "@/assets/landing/kolory-wlosow-ciepla-wiosna.webp";
import outfitImg from "@/assets/landing/stylizacja-ecru-camel-koral.webp";

const productImg = { width: 900, height: 900, loading: "lazy", decoding: "async" } as const;

function Captions({ items }: { items: readonly string[] }) {
  return <ul className="tile__captions">{items.map((c) => <li key={c}>{c}</li>)}</ul>;
}

function SwatchList({ colors, three }: { colors: readonly { name: string; hex: string }[]; three?: boolean }) {
  return (
    <ul className={`tile__swatches${three ? " tile__swatches--3" : ""}`}>
      {colors.map((c) => <li key={c.name}><span style={swatch(c.hex)} />{c.name}</li>)}
    </ul>
  );
}

/** Sample report preview — a static mock of what the paid result looks like. */
export function ResultSection() {
  const t = pl.landing.result;
  const r = t.report;
  return (
    <section className="lp-section result" aria-labelledby="result-title">
      <div className="lp-container result__grid">
        <div className="result__text">
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 className="lp-h2" id="result-title">{t.headline}</h2>
          <p className="result__lead">{t.lead}</p>
          <CtaBlock variant="red" label={pl.landing.cta} note={pl.landing.ctaNote} />
        </div>

        <figure className="report" aria-label={r.ariaLabel}>
          <div className="report__main">
            <p className="report__eyebrow">{r.eyebrow}</p>
            <h3 className="report__title">{r.title}</h3>
            <p className="report__desc">{r.description}</p>
            <ul className="report__palette" aria-label={r.paletteLabel}>
              {r.palette.map((hex) => <li key={hex} style={swatch(hex)} />)}
            </ul>
          </div>

          <div className="report__tiles">
            <section className="tile">
              <h4 className="tile__title">{r.neutrals.title}</h4>
              <SwatchList colors={r.neutrals.colors} />
              <p className="tile__foot">{r.neutrals.foot}</p>
            </section>
            <section className="tile">
              <h4 className="tile__title">{r.accents.title}</h4>
              <SwatchList colors={r.accents.colors} three />
            </section>
            <section className="tile tile--img tile--jewelry">
              <h4 className="tile__title">{r.jewelry.title}</h4>
              <img src={jewelryImg} alt={r.jewelry.alt} {...productImg} />
              <p className="tile__foot">{r.jewelry.foot[0]}<br />{r.jewelry.foot[1]}</p>
            </section>
            <section className="tile tile--img">
              <h4 className="tile__title">{r.makeup.title}</h4>
              <img src={makeupImg} alt={r.makeup.alt} {...productImg} />
              <Captions items={r.makeup.captions} />
            </section>
            <section className="tile tile--img tile--hair">
              <h4 className="tile__title">{r.hair.title}</h4>
              <img src={hairImg} alt={r.hair.alt} {...productImg} />
              <Captions items={r.hair.captions} />
              <p className="tile__foot">{r.hair.foot}</p>
            </section>
            <section className="tile tile--img tile--outfit">
              <h4 className="tile__title">{r.outfit.title}</h4>
              <img src={outfitImg} alt={r.outfit.alt} {...productImg} />
              <p className="tile__foot">{r.outfit.foot}</p>
            </section>
          </div>
        </figure>
      </div>
    </section>
  );
}

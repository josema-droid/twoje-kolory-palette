import { Link } from "@tanstack/react-router";
import { pl } from "@/content/pl";
import { typeBySlug } from "@/content/guide";
import type { ColorReport } from "@/content/engine";
import type { DashboardData, FeatureAnalysis } from "@/content/dashboard";
import { swatch } from "@/components/landing/utils";
import { SHOPPING, SHOPPING_ITEMS } from "@/content/shopping";
import { ShareButton } from "@/components/share-button";
import { PdfButton } from "@/components/pdf-button";
import { CelebrityCard } from "./celebrity-card";
import { DashSection, Meter, Pills, SwatchRow } from "./parts";

const t = pl.dashboard;
const r = pl.result;

const METAL_GRADIENT = {
  gold: "linear-gradient(135deg, #f6e7a8, #d4a83a 45%, #fbe9a6 60%, #b8862b)",
  silver: "linear-gradient(135deg, #f4f5f7, #b9bec5 45%, #fbfcfd 60%, #9aa0a8)",
  rose: "linear-gradient(135deg, #f9dccf, #d9937c 45%, #fbe2d6 60%, #b8725f)",
} as const;

function FeatureCard({ label, enhanceLabel, feature }: { label: string; enhanceLabel: string; feature: FeatureAnalysis }) {
  return (
    <article className="dash-card dash-feature">
      <header className="dash-feature__head">
        <span className="dash-feature__swatch" style={swatch(feature.hex)} aria-hidden="true" />
        <div>
          <h3 className="dash-h3">{label}</h3>
          <p className="dash-feature__name">{feature.name}</p>
          <p className="dash-feature__hex">{feature.hex.toUpperCase()}{feature.source === "quiz" && <span> · {t.fromQuiz}</span>}</p>
        </div>
      </header>
      <p className="dash-label">{t.harmonyLabel}</p>
      <SwatchRow colors={feature.harmony} size="sm" showHex={false} />
      <p className="dash-label dash-label--accent">{enhanceLabel}</p>
      <SwatchRow colors={feature.enhance} size="md" />
      <p className="dash-note">{feature.note}</p>
    </article>
  );
}

export function ResultDashboard({ report, dashboard: d }: { report: ColorReport; dashboard: DashboardData }) {
  const male = report.gender === "male";
  const typePalette = typeBySlug(d.type.key).swatches;
  // Women's search phrases only (they say "damski").
  const shopping = male ? undefined : SHOPPING[d.type.key];
  const nav = [
    ["profil", t.nav.profile], ["cechy", t.nav.features], ["inspiracje", t.nav.celebrities], ["glebia", t.nav.depth], ["paleta", t.nav.palette], ["harmonia", t.nav.harmony],
    ["bizuteria", t.nav.jewelry], male ? ["ubrania", t.nav.clothes] : ["makijaz", t.nav.makeup], ["wlosy", t.nav.hair], ["stylizacja", t.nav.outfit],
  ] as const;

  return (
    <main id="raport" className="landing dash">
      <header id="profil" className="dash-hero" data-pdf-block>
        <div className="dash-wrap">
          <div className="dash-hero__top">
            <p className="eyebrow-line">{t.eyebrow}</p>
            <div className="flex flex-wrap gap-2" data-pdf-ignore>
              <PdfButton targetId="raport" />
              <ShareButton />
            </div>
          </div>
          <h1 className="lp-display dash-hero__title">{t.typePrefix} <span>{d.type.label}</span></h1>
          <Pills items={d.type.chips} />
          <div className="dash-hero__grid">
            <div className="dash-meters">
              {(["temperature", "depth", "saturation", "contrast"] as const).map((k) => (
                <Meter key={k} label={t.meters[k].label} value={d.scales[k]} left={t.meters[k].left} right={t.meters[k].right} />
              ))}
            </div>
            <div className="dash-hero__palette">
              <SwatchRow colors={report.palette.slice(0, 8)} size="sm" showHex={false} />
              <Link to="/typy-urody/$slug" params={{ slug: d.type.key }} className="dash-link">{t.guideLink} →</Link>
            </div>
          </div>
        </div>
      </header>

      <nav className="dash-nav" aria-label="Sekcje raportu">
        <div className="dash-wrap dash-nav__inner">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </div>
      </nav>

      <div className="dash-wrap">
        <DashSection id="podsumowanie" title={t.summaryTitle}>
          <div className="dash-card dash-summary">{d.summary.map((p) => <p key={p}>{p}</p>)}</div>
        </DashSection>

        <DashSection id="cechy" title={t.featuresTitle} intro={t.featuresIntro}>
          <div className="dash-grid-3">
            <FeatureCard label={t.features.eyes} enhanceLabel={t.enhanceLabel.eyes} feature={d.features.eyes} />
            <FeatureCard label={t.features.hair} enhanceLabel={t.enhanceLabel.hair} feature={d.features.hair} />
            <FeatureCard label={t.features.skin} enhanceLabel={t.enhanceLabel.skin} feature={d.features.skin} />
          </div>
        </DashSection>

        {d.celebrities.length > 0 && (
          <DashSection id="inspiracje" title={t.celebritiesTitle} intro={t.celebritiesNote}>
            <div className="dash-celebs">
              {d.celebrities.map((c) => <CelebrityCard key={c.wiki} celebrity={c} palette={typePalette} />)}
            </div>
          </DashSection>
        )}

        <DashSection id="glebia" title={t.depthTitle}>
          <div className="dash-card">
            <div className="dash-grid-2">
              <Meter label={t.meters.depth.label} value={d.scales.depth} left={t.meters.depth.left} right={t.meters.depth.right} />
              <Meter label={t.meters.contrast.label} value={d.scales.contrast} left={t.meters.contrast.left} right={t.meters.contrast.right} />
            </div>
            <p className="dash-note">{d.depth.note}</p>
            <p className="dash-label">{t.depthBest}</p>
            <SwatchRow colors={d.depth.best} />
          </div>
        </DashSection>

        <DashSection id="paleta" title={t.paletteTitle} intro={t.paletteIntro}>
          <SwatchRow colors={report.palette} />
          <div className="dash-grid-2 dash-gap-top">
            <div className="dash-card"><h3 className="dash-h3">{r.baseTitle}</h3><SwatchRow colors={report.baseColors} /></div>
            <div className="dash-card"><h3 className="dash-h3">{r.accentsTitle}</h3><SwatchRow colors={report.accents} /></div>
          </div>
          <div className="dash-grid-2 dash-gap-top">
            <div className="dash-card"><h3 className="dash-h3">{r.whiteTitle}</h3><p className="dash-strong">{report.bestWhite.name}</p><p className="dash-note">{report.bestWhite.reason}</p></div>
            <div className="dash-card"><h3 className="dash-h3">{r.blackTitle}</h3><p className="dash-strong">{report.blackAlternative.name}</p><p className="dash-note">{report.blackAlternative.reason}</p></div>
          </div>
        </DashSection>

        <DashSection id="harmonia" title={t.harmonyTitle} intro={d.harmony.principle}>
          <div className="dash-grid-3">
            {d.harmony.combos.map((combo) => (
              <article key={combo.title} className="dash-card dash-combo">
                <div className="dash-combo__bars" aria-hidden="true">
                  {combo.colors.map((c, i) => <span key={c.name + i} style={{ ...swatch(c.hex), flexGrow: [6, 3, 1][i] }} />)}
                </div>
                <h3 className="dash-h3">{combo.title}</h3>
                <p className="dash-combo__names">{combo.colors.map((c) => c.name).join(" + ")}</p>
                <p className="dash-note">{combo.tip}</p>
              </article>
            ))}
          </div>
          <div className="dash-card dash-gap-top">
            <p className="dash-label">{t.cautionLabel}</p>
            <Pills items={report.cautionColors} />
            <p className="dash-note">{report.cautionNote}</p>
          </div>
        </DashSection>

        <DashSection id="bizuteria" title={male ? t.jewelryTitleMale : t.jewelryTitle} intro={d.jewelry.finish}>
          <div className="dash-grid-3">
            {d.jewelry.metals.map((m) => (
              <article key={m.key} className="dash-card dash-metal">
                <span className="dash-metal__chip" style={{ background: METAL_GRADIENT[m.key] }} aria-hidden="true" />
                <h3 className="dash-h3">{m.label}</h3>
                <div className="dash-score" role="img" aria-label={`${m.label}: ${m.score} na 100`}><span style={{ width: `${m.score}%` }} /></div>
                <p className="dash-strong">{m.verdict}</p>
                <p className="dash-note">{m.reason}</p>
              </article>
            ))}
          </div>
        </DashSection>

        {!male && d.makeup && (
          <DashSection id="makijaz" title={t.makeupTitle} intro={t.makeupIntro}>
            <div className="dash-grid-2">
              {d.makeup.groups.map((g) => (
                <article key={g.key} className="dash-card">
                  <h3 className="dash-h3">{g.label}</h3>
                  <SwatchRow colors={g.colors} />
                  <p className="dash-note">{g.why}</p>
                </article>
              ))}
            </div>
            {report.makeup?.priorityAdvice && <p className="dash-note dash-gap-top">{report.makeup.priorityAdvice}</p>}
          </DashSection>
        )}

        {male && report.menswear && (
          <DashSection id="ubrania" title={r.menswearTitle}>
            <div className="dash-grid-2">
              <div className="dash-card"><h3 className="dash-h3">{r.shirtsTitle}</h3><SwatchRow colors={report.menswear.shirts} /></div>
              <div className="dash-card"><h3 className="dash-h3">{r.knitwearTitle}</h3><SwatchRow colors={report.menswear.knitwear} /></div>
              <div className="dash-card"><h3 className="dash-h3">{r.jacketsTitle}</h3><SwatchRow colors={report.menswear.jackets} /></div>
              <div className="dash-card"><h3 className="dash-h3">{r.suitsTitle}</h3><SwatchRow colors={report.menswear.suits} /><p className="dash-note">{report.menswear.suitsNote}</p></div>
            </div>
          </DashSection>
        )}

        <DashSection id="wlosy" title={male ? r.hairTitleMale : r.hairTitle}>
          <div className="dash-grid-2">
            <div className="dash-card"><p className="dash-label">{r.hairRecommended}</p><Pills items={report.hair.recommended} /></div>
            <div className="dash-card"><p className="dash-label">{r.hairAvoid}</p><Pills items={report.hair.avoid} /></div>
          </div>
          <p className="dash-note dash-gap-top">{report.hair.personalizedAdvice}</p>
          {report.hair.beardAdvice && <div className="dash-card dash-gap-top"><h3 className="dash-h3">{r.beardTitle}</h3><p className="dash-note">{report.hair.beardAdvice}</p></div>}
        </DashSection>

        <DashSection id="stylizacja" title={t.outfitTitle}>
          <div className="dash-card">
            <p className="dash-outfit">{report.outfit.charAt(0).toUpperCase() + report.outfit.slice(1)}</p>
            {report.personalizationNotes.length > 0 && <ul className="guide-list">{report.personalizationNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
          </div>
          {d.materials && (
            <div className="dash-grid-2 dash-gap-top">
              <div className="dash-card"><p className="dash-label">{t.materialsBest}</p><Pills items={d.materials.best} /></div>
              <div className="dash-card"><p className="dash-label">{t.materialsAvoid}</p><Pills items={d.materials.avoid} /></div>
            </div>
          )}
          {d.materials && <p className="dash-note dash-gap-top">{d.materials.note}</p>}
          {shopping && (
            <div className="dash-card dash-gap-top">
              <h3 className="dash-h3">{t.shoppingTitle}</h3>
              <p className="dash-note">{shopping.intro} {t.shoppingIntro}</p>
              <ol className="dash-shop">
                {shopping.phrases.map((q, i) => (
                  <li key={q}>
                    <span className="dash-label">{SHOPPING_ITEMS[i]}</span>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">{q} ↗</a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </DashSection>
      </div>
    </main>
  );
}

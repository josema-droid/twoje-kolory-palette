import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareButton } from "@/components/share-button";
import { swatch } from "@/components/landing/utils";
import type { Crumb } from "@/lib/seo";

type Color = { name: string; hex: string };

/** Page header shared by all guide pages: breadcrumbs, share, eyebrow, H1 and lead. */
export function GuideHero({ crumbs, eyebrow, title, lead }: { crumbs: readonly Crumb[]; eyebrow: string; title: string; lead: readonly string[] }) {
  return (
    <header className="guide-hero">
      <div className="guide-wrap">
        <div className="guide-hero__top">
          <Breadcrumbs crumbs={crumbs} />
          <ShareButton />
        </div>
        <p className="eyebrow-line">{eyebrow}</p>
        <h1 className="lp-display">{title}</h1>
        {lead.map((p) => <p key={p} className="guide-lead">{p}</p>)}
      </div>
    </header>
  );
}

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="guide-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function GuideList({ items }: { items: readonly string[] }) {
  return <ul className="guide-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

export function Swatches({ colors, avoid }: { colors: readonly Color[]; avoid?: boolean }) {
  return (
    <ul className={`guide-swatches${avoid ? " guide-swatches--avoid" : ""}`}>
      {colors.map((c) => <li key={c.name}><span style={swatch(c.hex)} />{c.name}</li>)}
    </ul>
  );
}

export function Dots({ colors }: { colors: readonly string[] }) {
  return <ul className="guide-dots" aria-hidden="true">{colors.map((hex) => <li key={hex} style={swatch(hex)} />)}</ul>;
}

/** Closing call-to-action: every guide page leads to the analysis. */
export function GuideCta({ title, text }: { title: string; text: string }) {
  return (
    <aside className="guide-cta">
      <h2>{title}</h2>
      <p>{text}</p>
      <Link to="/test" className="lp-btn">Odkryj swoją paletę — 39 zł <span className="lp-btn__arrow" aria-hidden="true">➜</span></Link>
    </aside>
  );
}

/** Native <details> accordion with the same look as the landing FAQ. */
export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="accordion">
      {items.map((item, i) => (
        <details key={item.q} name="guide-faq" className="accordion__item">
          <summary>
            <span className="accordion__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="accordion__q">{item.q}</span>
            <span className="accordion__icon" aria-hidden="true" />
          </summary>
          <div className="accordion__a"><p>{item.a}</p></div>
        </details>
      ))}
    </div>
  );
}

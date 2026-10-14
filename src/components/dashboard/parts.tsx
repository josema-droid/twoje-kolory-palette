import type { ReactNode } from "react";
import { swatch } from "@/components/landing/utils";
import type { Swatch } from "@/content/dashboard";

export function DashSection({ id, eyebrow, title, intro, children }: { id: string; eyebrow?: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="dash-section" aria-labelledby={`${id}-title`}>
      {eyebrow && <p className="dash-eyebrow">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="dash-h2">{title}</h2>
      {intro && <p className="dash-intro">{intro}</p>}
      {children}
    </section>
  );
}

/** Colour chips with name and hex code. */
export function SwatchRow({ colors, size = "md", showHex = true }: { colors: readonly Swatch[]; size?: "sm" | "md" | "lg"; showHex?: boolean }) {
  return (
    <ul className={`dash-swatches dash-swatches--${size}`}>
      {colors.map((c) => (
        <li key={c.name + c.hex}>
          <span className="dash-swatch" style={swatch(c.hex)} />
          <span className="dash-swatch__name">{c.name}</span>
          {showHex && <span className="dash-swatch__hex">{c.hex.toUpperCase()}</span>}
        </li>
      ))}
    </ul>
  );
}

/** A labelled 0–1 scale, e.g. temperature from cool to warm. */
export function Meter({ label, value, left, right }: { label: string; value: number; left: string; right: string }) {
  return (
    <div className="dash-meter">
      <div className="dash-meter__top"><span>{label}</span></div>
      <div className="dash-meter__track" role="img" aria-label={`${label}: ${Math.round(value * 100)}% (${left} – ${right})`}>
        <span className="dash-meter__dot" style={{ left: `${value * 100}%` }} />
      </div>
      <div className="dash-meter__ends"><span>{left}</span><span>{right}</span></div>
    </div>
  );
}

export function Pills({ items }: { items: readonly string[] }) {
  return <ul className="chips dash-pills">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

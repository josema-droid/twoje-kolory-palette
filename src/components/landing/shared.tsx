import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

/** Primary call-to-action: every landing CTA starts the analysis funnel. */
export function CtaLink({ variant, children }: { variant: "dark" | "tan" | "red"; children: ReactNode }) {
  return (
    <Link to="/test" className={`lp-btn lp-btn--${variant} lp-btn--lg`}>
      {children} <span className="lp-btn__arrow" aria-hidden="true">➜</span>
    </Link>
  );
}

export function CtaBlock({ variant, label, note, className = "" }: { variant: "tan" | "red"; label: string; note: string; className?: string }) {
  return (
    <div className={`cta-block ${className}`}>
      <CtaLink variant={variant}>{label}</CtaLink>
      <p className="cta-block__note">{note}</p>
    </div>
  );
}

/** Centred section heading: lined eyebrow, display title (one line per entry), subtitle. */
export function CenterHead({ id, eyebrow, lines, sub }: { id: string; eyebrow: string; lines: readonly string[]; sub: string }) {
  return (
    <header className="center-head">
      <p className="eyebrow-line">{eyebrow}</p>
      <h2 className="lp-display" id={id}>
        {lines.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}
      </h2>
      <p className="center-head__sub">{sub}</p>
    </header>
  );
}

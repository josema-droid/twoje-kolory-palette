import { pl } from "@/content/pl";
import { CtaLink } from "./shared";
import { heroImage } from "./utils";

export function HeroSection() {
  const t = pl.landing.hero;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__media">
          <img src={heroImage.src} srcSet={heroImage.srcSet} sizes={heroImage.sizes} width={2400} height={1600} alt="" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero__content">
          <p className="lp-eyebrow lp-eyebrow--light">{t.eyebrow}</p>
          <h1 className="hero__title" id="hero-title">{t.titlePrefix}<em>{t.titleHighlight}</em></h1>
          <p className="hero__lead">{t.lead}</p>
          <CtaLink variant="dark">{pl.landing.cta}</CtaLink>
          <p className="hero__meta">{t.meta}</p>
        </div>
      </div>
    </section>
  );
}

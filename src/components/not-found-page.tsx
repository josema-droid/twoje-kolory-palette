import { Link } from "@tanstack/react-router";
import { pl } from "@/content/pl";

/** Branded 404 screen: root notFoundComponent, and unknown guide slugs. */
export function NotFoundPage() {
  const t = pl.notFound;
  return (
    <main className="landing not-found">
      {/* React hoists these into <head>; the 404 has no route of its own to set them. */}
      <title>{t.metaTitle}</title>
      <meta name="robots" content="noindex, follow" />
      <div>
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <p className="eyebrow-line">{t.eyebrow}</p>
        <h1 className="lp-display">{t.title}</h1>
        <p>{t.text}</p>
        <div className="not-found__actions">
          <Link to="/" className="lp-btn lp-btn--dark">{t.home}</Link>
          <Link to="/typy-urody" className="lp-btn lp-btn--outline">{t.guide}</Link>
          <Link to="/test" className="lp-btn lp-btn--red">{t.test}</Link>
        </div>
      </div>
    </main>
  );
}

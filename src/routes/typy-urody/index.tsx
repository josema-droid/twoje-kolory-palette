import { createFileRoute, Link } from "@tanstack/react-router";
import { guidePillar as g, seasonGuides, typeBySlug } from "@/content/guide";
import { Dots, Faq, GuideCta, GuideHero, GuideSection } from "@/components/guide/guide-parts";
import { articleSchema, breadcrumbSchema, faqSchema, homeCrumb, seo } from "@/lib/seo";

const crumbs = [homeCrumb, { name: g.crumb, path: g.path }];

export const Route = createFileRoute("/typy-urody/")({
  head: () =>
    seo({
      title: g.metaTitle,
      description: g.metaDescription,
      path: g.path,
      type: "article",
      schema: [
        articleSchema({ headline: g.h1, description: g.metaDescription, path: g.path }),
        breadcrumbSchema(crumbs),
        faqSchema(g.faq),
      ],
    }),
  component: GuidePillarPage,
});

function GuidePillarPage() {
  return (
    <main className="landing guide">
      <GuideHero crumbs={crumbs} eyebrow={g.eyebrow} title={g.h1} lead={g.intro} />
      <div className="guide-wrap">
        <GuideSection title={g.howTitle}>
          <p>{g.howIntro}</p>
          <div className="guide-grid">
            {g.dimensions.map((d) => (
              <article key={d.title} className="guide-card">
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </article>
            ))}
          </div>
        </GuideSection>

        <GuideSection title={g.seasonsTitle}>
          <p>{g.seasonsIntro}</p>
          <div className="guide-grid">
            {seasonGuides.map((season) => (
              <article key={season.slug} className="guide-card">
                <h3><Link to="/typy-urody/$slug" params={{ slug: season.slug }}>{season.label}</Link></h3>
                <p>{season.intro}</p>
                <ul className="guide-list">
                  {season.types.map((slug) => {
                    const type = typeBySlug(slug);
                    return (
                      <li key={slug}>
                        <Link to="/typy-urody/$slug" params={{ slug }} className="guide-card__link">{type.label}</Link>
                      </li>
                    );
                  })}
                </ul>
                <Dots colors={season.types.map((slug) => typeBySlug(slug).swatches[0]!.hex)} />
              </article>
            ))}
          </div>
        </GuideSection>

        <GuideSection title={g.faqTitle}>
          <Faq items={g.faq} />
        </GuideSection>

        <GuideCta title={g.findTitle} text={g.findText} />
      </div>
    </main>
  );
}

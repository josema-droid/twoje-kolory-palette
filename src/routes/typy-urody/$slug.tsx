import { createFileRoute, Link } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/not-found-page";
import { findSeason, findType, guidePillar, seasonGuides, typeBySlug, type SeasonGuide, type TypeGuide } from "@/content/guide";
import { Dots, GuideCta, GuideHero, GuideList, GuideSection, Swatches } from "@/components/guide/guide-parts";
import { articleSchema, breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

const pillarCrumb = { name: guidePillar.crumb, path: guidePillar.path };

// One route serves both levels of the cluster: /typy-urody/wiosna (season) and /typy-urody/jasna-wiosna (type).
// The guide is static data, so pages are looked up from the URL directly. Unknown slugs
// render the 404 screen here (src/start.ts sets the 404 status): throwing notFound()
// from a loader/beforeLoad would pull a ~10 KB serializer into every page's bundle.
function resolve(slug: string) {
  const season = findSeason(slug);
  if (season) return { kind: "season" as const, season };
  const type = findType(slug);
  if (type) return { kind: "type" as const, type };
  return null;
}

export const Route = createFileRoute("/typy-urody/$slug")({
  head: ({ params }) => {
    const page = resolve(params.slug);
    if (!page) return {};
    if (page.kind === "season") {
      const s = page.season;
      return seo({
        title: `Typ urody ${s.label.toLowerCase()} — cechy i najlepsze kolory`,
        description: s.metaDescription,
        path: s.path,
        type: "article",
        schema: [articleSchema({ headline: s.h1, description: s.metaDescription, path: s.path }), breadcrumbSchema(seasonCrumbs(s))],
      });
    }
    const t = page.type;
    return seo({
      title: `${t.label} — paleta kolorów, makijaż i biżuteria`,
      description: t.metaDescription,
      path: t.path,
      type: "article",
      schema: [articleSchema({ headline: typeH1(t), description: t.metaDescription, path: t.path }), breadcrumbSchema(typeCrumbs(t))],
    });
  },
  component: GuideDetailPage,
});

const seasonCrumbs = (s: SeasonGuide) => [homeCrumb, pillarCrumb, { name: s.label, path: s.path }];
const typeCrumbs = (t: TypeGuide) => [homeCrumb, pillarCrumb, { name: t.season.label, path: t.season.path }, { name: t.label, path: t.path }];
const typeH1 = (t: TypeGuide) => `${t.label}: kolory, które Ci służą`;

function GuideDetailPage() {
  const { slug } = Route.useParams();
  const data = resolve(slug);
  if (!data) return <NotFoundPage />;
  return data.kind === "season" ? <SeasonPage season={data.season} /> : <TypePage type={data.type} />;
}

function SeasonPage({ season }: { season: SeasonGuide }) {
  const others = seasonGuides.filter((s) => s.slug !== season.slug);
  return (
    <main className="landing guide">
      <GuideHero crumbs={seasonCrumbs(season)} eyebrow="Pora roku" title={season.h1} lead={[season.intro]} />
      <div className="guide-wrap">
        <GuideSection title={`Cechy typu ${season.label.toLowerCase()}`}>
          <GuideList items={season.traits} />
          <p>{season.tips}</p>
        </GuideSection>

        <GuideSection title={`Trzy typy urody: ${season.label.toLowerCase()}`}>
          <div className="guide-grid">
            {season.types.map((slug) => {
              const type = typeBySlug(slug);
              return (
                <article key={slug} className="guide-card">
                  <h3>{type.label}</h3>
                  <ul className="chips">{type.chips.map((c) => <li key={c}>{c}</li>)}</ul>
                  <p>{type.description}</p>
                  <Dots colors={type.swatches.map((c) => c.hex)} />
                  <Link to="/typy-urody/$slug" params={{ slug }} className="guide-card__link">Poznaj typ {type.label} →</Link>
                </article>
              );
            })}
          </div>
        </GuideSection>

        <GuideSection title="Pozostałe pory roku">
          <nav className="guide-links" aria-label="Pozostałe pory roku">
            {others.map((s) => <Link key={s.slug} to="/typy-urody/$slug" params={{ slug: s.slug }}>{s.label}</Link>)}
            <Link to="/typy-urody">Wszystkie typy urody</Link>
          </nav>
        </GuideSection>

        <GuideCta title={`Czy Twoja pora roku to ${season.label.toLowerCase()}?`} text="Odpowiedz na kilka pytań, dodaj zdjęcie i w około 60 sekund poznaj swój typ urody oraz pełną paletę kolorów." />
      </div>
    </main>
  );
}

function TypePage({ type }: { type: TypeGuide }) {
  return (
    <main className="landing guide">
      <GuideHero crumbs={typeCrumbs(type)} eyebrow={`Typ urody · ${type.season.label}`} title={typeH1(type)} lead={[type.description]} />
      <div className="guide-wrap">
        <ul className="chips" style={{ marginTop: 20 }}>{type.chips.map((c) => <li key={c}>{c}</li>)}</ul>

        <GuideSection title={`Jak rozpoznać typ ${type.label}?`}>
          <GuideList items={type.traits} />
        </GuideSection>

        <GuideSection title="Najlepsze kolory">
          <Swatches colors={type.swatches} />
          <div className="guide-combo">
            <Dots colors={type.combo.colors} />
            <p>Pomysł na połączenie: {type.combo.text}</p>
          </div>
        </GuideSection>

        <GuideSection title="Kolory, z którymi warto uważać">
          <Swatches colors={type.avoid} avoid />
          <p>{type.avoidText}</p>
        </GuideSection>

        <GuideSection title="Makijaż, biżuteria i włosy">
          <h3 style={{ marginTop: 20 }}>Makijaż</h3>
          <dl className="guide-dl">
            <div><dt>Usta</dt><dd>{type.makeup.lips}</dd></div>
            <div><dt>Policzki</dt><dd>{type.makeup.cheeks}</dd></div>
            <div><dt>Oczy</dt><dd>{type.makeup.eyes}</dd></div>
          </dl>
          <h3 style={{ marginTop: 28 }}>Biżuteria</h3>
          <p>{type.jewelry}</p>
          <h3 style={{ marginTop: 28 }}>Kolor włosów</h3>
          <p>{type.hair}</p>
        </GuideSection>

        <GuideSection title={`Inne typy: ${type.season.label.toLowerCase()}`}>
          <nav className="guide-links" aria-label={`Inne typy: ${type.season.label}`}>
            {type.siblings.map((s) => <Link key={s.slug} to="/typy-urody/$slug" params={{ slug: s.slug }}>{s.label}</Link>)}
            <Link to="/typy-urody/$slug" params={{ slug: type.season.slug }}>Pora roku: {type.season.label.toLowerCase()}</Link>
            <Link to="/typy-urody">Wszystkie typy urody</Link>
          </nav>
        </GuideSection>

        <GuideCta title="Sprawdź, czy to Twój typ urody" text={`Analiza pokaże, czy Twój typ to ${type.label}, i da Ci pełną paletę 12–20 kolorów, neutrale, akcenty oraz wskazówki dotyczące makijażu i biżuterii.`} />
      </div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pl } from "@/content/pl";
import { privacyPolicy as p } from "@/content/privacy";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

const path = "/polityka-prywatnosci";

export const Route = createFileRoute("/polityka-prywatnosci")({
  head: () =>
    seo({
      title: "Polityka prywatności i ochrona danych",
      description: "Jak Twój Color przetwarza dane osobowe, w tym zdjęcia przesyłane do analizy kolorystycznej z użyciem AI (Google Gemini).",
      path,
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.privacy.title, path }])],
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-12 md:py-20">
      <Breadcrumbs crumbs={[homeCrumb, { name: pl.legal.privacy.title, path }]} />
      <h1 className="mt-10 font-display text-4xl font-semibold md:text-6xl">{pl.legal.privacy.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Ostatnia aktualizacja: {p.updated}</p>
      <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{p.intro}</p>

      <nav aria-label="Spis treści" className="mt-10 rounded-lg border border-border bg-card p-5">
        <ol className="grid gap-2 text-sm">
          {p.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-primary underline-offset-4 hover:underline">{s.title}</a></li>)}
        </ol>
      </nav>

      {p.sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-12 scroll-mt-28">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">{s.title}</h2>
          {s.body.map((block, i) =>
            typeof block === "string" ? (
              <p key={i} className="mt-4 leading-relaxed text-foreground/85">{block}</p>
            ) : (
              <ul key={i} className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed text-foreground/85 marker:text-primary">
                {block.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ),
          )}
        </section>
      ))}
    </main>
  );
}

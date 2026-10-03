import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

export const Route = createFileRoute("/polityka-prywatnosci")({
  head: () =>
    seo({
      title: "Polityka prywatności i ochrona danych",
      description: "Jak Twój Color przetwarza dane osobowe, w tym zdjęcia przesyłane do analizy kolorystycznej.",
      path: "/polityka-prywatnosci",
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.privacy.title, path: "/polityka-prywatnosci" }])],
    }),
  component: () => <LegalPage content={pl.legal.privacy} path="/polityka-prywatnosci" />,
});

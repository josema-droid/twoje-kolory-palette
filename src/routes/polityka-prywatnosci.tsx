import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { pl } from "@/content/pl";
import { privacyPolicy } from "@/content/privacy";
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
  component: () => <LegalDocument doc={{ ...privacyPolicy, title: pl.legal.privacy.title }} path={path} />,
});

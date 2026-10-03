import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

export const Route = createFileRoute("/polityka-cookies")({
  head: () =>
    seo({
      title: "Pliki cookies w serwisie",
      description: "Informacje o plikach cookies używanych w serwisie Twój Color i o tym, jak zarządzać zgodą.",
      path: "/polityka-cookies",
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.cookies.title, path: "/polityka-cookies" }])],
    }),
  component: () => <LegalPage content={pl.legal.cookies} path="/polityka-cookies" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

export const Route = createFileRoute("/regulamin")({
  head: () =>
    seo({
      title: "Regulamin serwisu",
      description: "Zasady korzystania z serwisu Twój Color i zakupu personalnej analizy kolorystycznej online.",
      path: "/regulamin",
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.terms.title, path: "/regulamin" }])],
    }),
  component: () => <LegalPage content={pl.legal.terms} path="/regulamin" />,
});

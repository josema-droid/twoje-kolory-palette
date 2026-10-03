import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

export const Route = createFileRoute("/odstapienie-umowy")({
  head: () =>
    seo({
      title: "Odstąpienie od umowy — informacje dla konsumentów",
      description: "Jak odstąpić od umowy zakupu analizy kolorystycznej w serwisie Twój Color.",
      path: "/odstapienie-umowy",
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.withdrawal.title, path: "/odstapienie-umowy" }])],
    }),
  component: () => <LegalPage content={pl.legal.withdrawal} path="/odstapienie-umowy" />,
});

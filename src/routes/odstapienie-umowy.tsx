import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { pl } from "@/content/pl";
import { termsDoc } from "@/content/terms";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

const path = "/odstapienie-umowy";
// Same text as § 3 of the Regulamin, so the two can never disagree.
const withdrawalDoc = { ...termsDoc, title: pl.legal.withdrawal.title, sections: termsDoc.sections.filter((s) => s.id === "odstapienie") };

export const Route = createFileRoute("/odstapienie-umowy")({
  head: () =>
    seo({
      title: "Odstąpienie od umowy — informacje dla konsumentów",
      description: "Jak odstąpić od umowy zakupu analizy kolorystycznej w serwisie Twój Color: termin, warunki i wzór formularza odstąpienia.",
      path,
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.withdrawal.title, path }])],
    }),
  component: () => <LegalDocument doc={withdrawalDoc} path={path} />,
});

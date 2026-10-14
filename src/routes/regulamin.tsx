import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { pl } from "@/content/pl";
import { termsDoc } from "@/content/terms";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

const path = "/regulamin";

export const Route = createFileRoute("/regulamin")({
  head: () =>
    seo({
      title: "Regulamin serwisu",
      description: "Zasady korzystania z serwisu Twój Color i zakupu personalnej analizy kolorystycznej online: cena, zamówienie, odstąpienie od umowy i reklamacje.",
      path,
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.terms.title, path }])],
    }),
  component: () => <LegalDocument doc={termsDoc} path={path} />,
});

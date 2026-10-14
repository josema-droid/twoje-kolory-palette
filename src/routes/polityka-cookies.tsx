import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/legal-document";
import { pl } from "@/content/pl";
import { cookiesDoc } from "@/content/cookies";
import { breadcrumbSchema, homeCrumb, seo } from "@/lib/seo";

const path = "/polityka-cookies";

export const Route = createFileRoute("/polityka-cookies")({
  head: () =>
    seo({
      title: "Pliki cookies w serwisie",
      description: "Jakie pliki cookies i dane przeglądarki zapisuje serwis Twój Color, w jakim celu i jak zmienić swój wybór.",
      path,
      schema: [breadcrumbSchema([homeCrumb, { name: pl.legal.cookies.title, path }])],
    }),
  component: () => <LegalDocument doc={cookiesDoc} path={path} />,
});

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/regulamin")({ head: () => ({ meta: [{ title: "Regulamin — Twoje Kolory" }, { name: "description", content: "Regulamin serwisu Twoje Kolory." }, { property: "og:title", content: "Regulamin — Twoje Kolory" }, { property: "og:description", content: "Regulamin serwisu Twoje Kolory." }] }), component: () => <LegalPage content={pl.legal.terms} /> });
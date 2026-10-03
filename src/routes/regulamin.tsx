import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/regulamin")({ head: () => ({ meta: [{ title: "Regulamin — Twój Color" }, { name: "description", content: "Regulamin serwisu Twój Color." }, { property: "og:title", content: "Regulamin — Twój Color" }, { property: "og:description", content: "Regulamin serwisu Twój Color." }] }), component: () => <LegalPage content={pl.legal.terms} /> });
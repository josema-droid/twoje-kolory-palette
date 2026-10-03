import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/polityka-cookies")({ head: () => ({ meta: [{ title: "Polityka cookies — Twój Color" }, { name: "description", content: "Polityka cookies serwisu Twój Color." }, { property: "og:title", content: "Polityka cookies — Twój Color" }, { property: "og:description", content: "Polityka cookies serwisu Twój Color." }] }), component: () => <LegalPage content={pl.legal.cookies} /> });
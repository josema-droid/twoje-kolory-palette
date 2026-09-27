import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/polityka-cookies")({ head: () => ({ meta: [{ title: "Polityka cookies — Twoje Kolory" }, { name: "description", content: "Polityka cookies serwisu Twoje Kolory." }, { property: "og:title", content: "Polityka cookies — Twoje Kolory" }, { property: "og:description", content: "Polityka cookies serwisu Twoje Kolory." }] }), component: () => <LegalPage content={pl.legal.cookies} /> });
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/polityka-prywatnosci")({ head: () => ({ meta: [{ title: "Polityka prywatności — Twoje Kolory" }, { name: "description", content: "Polityka prywatności serwisu Twoje Kolory." }, { property: "og:title", content: "Polityka prywatności — Twoje Kolory" }, { property: "og:description", content: "Polityka prywatności serwisu Twoje Kolory." }] }), component: () => <LegalPage content={pl.legal.privacy} /> });
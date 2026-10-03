import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pl } from "@/content/pl";
export const Route = createFileRoute("/polityka-prywatnosci")({ head: () => ({ meta: [{ title: "Polityka prywatności — Twój Color" }, { name: "description", content: "Polityka prywatności serwisu Twój Color." }, { property: "og:title", content: "Polityka prywatności — Twój Color" }, { property: "og:description", content: "Polityka prywatności serwisu Twój Color." }] }), component: () => <LegalPage content={pl.legal.privacy} /> });
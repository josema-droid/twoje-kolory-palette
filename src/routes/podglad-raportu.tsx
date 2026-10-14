import { createFileRoute } from "@tanstack/react-router";
import { buildColorReport } from "@/content/engine";
import { ResultDashboard } from "@/components/dashboard/result-dashboard";
import { NotFoundPage } from "@/components/not-found-page";
import { seo } from "@/lib/seo";

// Local-only preview of the paid dashboard with sample reports (payments can't
// complete on localhost). In production this address is a normal 404.
// /podglad-raportu → sample woman; /podglad-raportu?osoba=mezczyzna → sample man.

export const Route = createFileRoute("/podglad-raportu")({
  validateSearch: (search: Record<string, unknown>): { osoba?: string | undefined } => ({ osoba: typeof search["osoba"] === "string" ? search["osoba"] : undefined }),
  head: () => seo({ title: "Podgląd raportu", description: "Podgląd raportu (tylko lokalnie).", path: "/podglad-raportu", noindex: true }),
  component: PreviewPage,
});

const samples = {
  kobieta: () =>
    buildColorReport(
      { temperature: "ciepła", depth: "średnia", saturation: "umiarkowana", contrast: "średni", features: { eyes: { name: "zielono-piwne", hex: "#6f7a45" }, hair: { name: "kasztanowy brąz", hex: "#5a3a26" }, skin: { name: "ciepły beż", hex: "#d6a888" } } },
      { gender: "Dla kobiety", age: "25–35 lat", goal: ["Chcę poznać całą swoją paletę kolorystyczną"], naturalHair: "Średni brąz", eyes: "Zielono-piwny", outfit: "Codzienną" },
    ),
  mezczyzna: () =>
    buildColorReport(
      { temperature: "chłodna", depth: "głęboka", saturation: "czysta", contrast: "wysoki", features: { eyes: { name: "niebieskie", hex: "#4f78ad" }, hair: { name: "ciemny brąz", hex: "#2b211c" }, skin: { name: "jasna, chłodna", hex: "#e9c4b4" } } },
      { gender: "Dla mężczyzny", goal: "Ubrania do pracy", naturalHair: "Ciemny brąz", eyes: "Niebieski", beard: "Tak, krótki lub kilkudniowy zarost", beardColor: "Ciemny brąz", outfit: "Do pracy" },
    ),
};

function PreviewPage() {
  const { osoba } = Route.useSearch();
  if (!import.meta.env.DEV) return <NotFoundPage />;
  const report = (osoba === "mezczyzna" ? samples.mezczyzna : samples.kobieta)();
  return report.dashboard ? <ResultDashboard report={report} dashboard={report.dashboard} /> : <NotFoundPage />;
}

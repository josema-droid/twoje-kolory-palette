import { createFileRoute } from "@tanstack/react-router";
import { guidePillar, seasonGuides, typeGuides } from "@/lib/public-pages";
import { absoluteUrl, CONTACT_EMAIL } from "@/lib/seo";

// llms.txt (https://llmstxt.org): a plain-language map of the site for AI assistants.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const link = (name: string, path: string, note: string) => `- [${name}](${absoluteUrl(path)}): ${note}`;
        const body = [
          "# Twój Color",
          "",
          "> Personalna analiza kolorystyczna online po polsku. Dla kobiet i mężczyzn. Użytkownik odpowiada na pytania o swoją naturalną urodę i dodaje jedno zdjęcie, a w około 60 sekund otrzymuje swój typ urody (jeden z 12) i osobistą paletę kolorów. Płatność jednorazowa, bez subskrypcji; cena jest widoczna po odpowiedzi na pytania.",
          "",
          "Wynik obejmuje paletę 12–20 kolorów, 4 kolory neutralne, 3 kolory akcentowe, idealny odcień bieli i czerni (lub zamiennik), wybór między złotem a srebrem, 3–5 kolorów makijażu, rekomendacje koloru włosów, kolory, z którymi warto uważać, oraz przykładowy outfit.",
          "",
          "## Usługa",
          link("Strona główna", "/", "opis analizy, przykładowy wynik, porównanie kolorów i FAQ"),
          link("Test kolorystyczny", "/test", "początek analizy: pytania o naturalne cechy urody"),
          "",
          "## Przewodnik po typach urody",
          link(guidePillar.metaTitle, guidePillar.path, guidePillar.metaDescription),
          ...seasonGuides.map((s) => link(s.label, s.path, s.metaDescription)),
          ...typeGuides.map((t) => link(t.label, t.path, t.description)),
          "",
          "## Informacje prawne",
          link("Regulamin", "/regulamin", "zasady korzystania z serwisu"),
          link("Polityka prywatności", "/polityka-prywatnosci", "przetwarzanie danych osobowych i zdjęć"),
          link("Polityka cookies", "/polityka-cookies", "pliki cookies"),
          link("Odstąpienie od umowy", "/odstapienie-umowy", "prawo odstąpienia od umowy"),
          "",
          "## Kontakt",
          `- E-mail: ${CONTACT_EMAIL}`,
          "",
        ].join("\n");
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});

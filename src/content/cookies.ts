// Polityka cookies — DRAFT for review by a Polish-qualified lawyer.
// Fields in [SQUARE BRACKETS] must be filled in before relying on it.
import type { LegalDoc } from "@/components/legal-document";

export const cookiesDoc: LegalDoc = {
  title: "Polityka cookies",
  updated: "14 października 2026 r.",
  sections: [
    {
      id: "co-zapisujemy",
      title: "1. Co zapisuje serwis w Twojej przeglądarce",
      body: [
        "Serwis zapisuje tylko to, co niezbędne do jego działania. Statystyki Google Analytics włączamy wyłącznie za Twoją zgodą. Pliki cookies to małe pliki zapisywane na Twoim urządzeniu, a pamięć przeglądarki (localStorage i sessionStorage) działa podobnie. Ta polityka obejmuje oba rozwiązania.",
        {
          table: {
            head: ["Nazwa", "Cel", "Okres", "Zgoda"],
            rows: [
              ["`twoje-kolory-cookies` (pamięć przeglądarki)", "Zapamiętanie Twojego wyboru dotyczącego cookies", "Do czasu zmiany wyboru lub usunięcia danych przeglądarki", "Niepotrzebna"],
              ["`sb-uqdognojnokyznuirewm-auth-token` (pamięć przeglądarki)", "Utrzymanie Twojego zalogowania do konta", "Do wylogowania lub wygaśnięcia sesji", "Niepotrzebna"],
              ["`twoje-kolory-answers` (pamięć sesji przeglądarki)", "Zapamiętanie odpowiedzi z quizu do czasu dodania zdjęcia", "Do zamknięcia karty przeglądarki", "Niepotrzebna"],
              ["`twoje-kolory-results` (pamięć przeglądarki)", "Zapamiętanie wyników utworzonych bez konta, aby można je było przypisać do konta po zalogowaniu", "Do zalogowania lub usunięcia danych przeglądarki", "Niepotrzebna"],
              ["`_ga` (Google Analytics)", "Odróżnianie odwiedzających w statystykach", "Do 2 lat", "Wymagana"],
              ["`_ga_[identyfikator]` (Google Analytics)", "Utrzymanie stanu sesji w statystykach", "Do 2 lat", "Wymagana"],
            ],
          },
        },
        "Pliki Google Analytics pojawiają się dopiero po kliknięciu „Akceptuj wszystkie”. Statystyki pokazują nam, które strony są czytane i gdzie ludzie rezygnują z quizu. Nie używamy ich do reklam: zapis danych reklamowych i personalizację reklam wyłączyliśmy.",
      ],
    },
    {
      id: "wybor",
      title: "2. Twój wybór",
      body: [
        "Przy pierwszej wizycie pokazujemy baner z dwoma przyciskami. **Tylko niezbędne** zostawia wyłącznie pliki z tabeli oznaczone jako niepotrzebna zgoda. **Akceptuj wszystkie** dodatkowo włącza Google Analytics. Zgoda jest dobrowolna i nie wpływa na dostęp do analizy.",
        "Swój wybór zmienisz w każdej chwili przyciskiem **Ustawienia cookies** w stopce strony. Wycofanie zgody jest tak samo proste jak jej wyrażenie: gdy wybierzesz „Tylko niezbędne”, wyłączamy Google Analytics i usuwamy jego pliki `_ga`. Twój wybór pamiętamy do czasu, gdy go zmienisz lub usuniesz dane przeglądarki.",
        "Możesz też w każdej chwili usunąć lub zablokować pliki w ustawieniach przeglądarki. Zablokowanie niezbędnych plików może uniemożliwić logowanie.",
        "**Podstawa prawna.** Zapis i odczyt informacji na Twoim urządzeniu wymaga Twojej zgody, z wyjątkiem plików niezbędnych do świadczenia usługi, o którą prosisz (art. 399 ustawy Prawo komunikacji elektronicznej). Dane statystyczne z Google Analytics przetwarzamy na podstawie Twojej zgody, art. 6 ust. 1 lit. a RODO.",
      ],
    },
    {
      id: "uslugi-zewnetrzne",
      title: "3. Usługi zewnętrzne, zmiany i kontakt",
      body: [
        "**Google Analytics** dostarcza Google Ireland Limited. Dane mogą trafiać do Google LLC w USA, na podstawie unijno-amerykańskich Ram Prywatności Danych (EU-US Data Privacy Framework) dla certyfikowanych firm albo standardowych klauzul umownych. Dane analityczne przechowujemy [14 miesięcy — potwierdź w ustawieniach Google Analytics].",
        "**Konto i baza danych.** Logowanie i zapis wyników obsługuje Supabase [region: potwierdź]. Zapisuje ono w Twojej przeglądarce tylko wpis potrzebny do utrzymania sesji.",
        "**Czcionki** ładujemy z usługi Google Fonts. Wyświetlając stronę, Twoja przeglądarka łączy się z serwerami Google (fonts.googleapis.com i fonts.gstatic.com), które otrzymują przy tym Twój adres IP.",
        "**Zmiany.** Gdy zmienimy rodzaj plików, zaktualizujemy tę politykę i zapytamy o zgodę ponownie, jeśli zmiana tego wymaga.",
        "**Kontakt.** Pytania o cookies: **info@twojcolor.com**. Więcej o danych osobowych znajdziesz w Polityce prywatności. Administratorem jest [PEŁNA NAZWA FIRMY / imię i nazwisko przedsiębiorcy, CVR].",
      ],
    },
  ],
  footer: "Obowiązuje od: [DATA]. Wersja 1.0.",
};

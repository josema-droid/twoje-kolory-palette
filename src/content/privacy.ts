// Polityka prywatności — DRAFT do weryfikacji przez prawnika.
// Pola w [NAWIASACH KWADRATOWYCH] trzeba uzupełnić przed publikacją.

type Block = string | { list: string[] };
export type PrivacySection = { id: string; title: string; body: Block[] };

export const privacyPolicy = {
  updated: "6 października 2026 r.",
  intro:
    "Szanujemy Twoją prywatność. Poniżej wyjaśniamy prostym językiem, jakie dane zbieramy, po co, jak długo je przechowujemy, komu je powierzamy i jakie masz prawa. Szczególnie dokładnie opisujemy, co dzieje się ze zdjęciem, które dodajesz do analizy.",
  sections: [
    {
      id: "administrator",
      title: "1. Kto jest administratorem Twoich danych",
      body: [
        "Administratorem Twoich danych osobowych jest [NAZWA FIRMY / IMIĘ I NAZWISKO PRZEDSIĘBIORCY], [ADRES], NIP [NIP], REGON [REGON] (dalej: „Twój Color”, „my”).",
        "We wszystkich sprawach dotyczących danych osobowych możesz pisać na adres: info@twojcolor.com.",
      ],
    },
    {
      id: "dane",
      title: "2. Jakie dane przetwarzamy, w jakim celu i na jakiej podstawie",
      body: [
        {
          list: [
            "Odpowiedzi w teście kolorystycznym (np. kolor oczu i włosów, preferencje stylu) — aby przygotować Twoją analizę. Podstawa: wykonanie umowy lub działania na Twoje żądanie przed jej zawarciem (art. 6 ust. 1 lit. b RODO).",
            "Zdjęcie twarzy — wyłącznie aby przeprowadzić analizę kolorystyczną. Podstawa: Twoja zgoda (art. 6 ust. 1 lit. a RODO). Szczegóły w punkcie 3.",
            "Wynik analizy (paleta kolorów i rekomendacje) — aby pokazać Ci wynik i umożliwić powrót do niego. Podstawa: wykonanie umowy (art. 6 ust. 1 lit. b RODO).",
            "Adres e-mail i hasło (tylko jeśli zakładasz konto) — aby prowadzić Twoje konto i zapisywać wyniki. Hasło przechowujemy wyłącznie w postaci zaszyfrowanej (hash). Podstawa: wykonanie umowy (art. 6 ust. 1 lit. b RODO).",
            "Dane dotyczące płatności — aby przyjąć zapłatę i wystawić dokumenty księgowe. Danych karty ani danych logowania do banku nie widzimy — obsługuje je operator płatności Stripe. Podstawa: wykonanie umowy oraz obowiązki prawne, m.in. podatkowe (art. 6 ust. 1 lit. b i c RODO).",
            "Dane analityczne (sposób korzystania ze strony) — tylko jeśli wyrazisz zgodę w banerze cookies, aby ulepszać stronę. Podstawa: Twoja zgoda (art. 6 ust. 1 lit. a RODO).",
            "Skrót (hash) adresu IP — przez maksymalnie 2 dni, aby chronić usługę przed nadużyciami (np. automatycznym wysyłaniem wielu zdjęć). Podstawa: nasz prawnie uzasadniony interes, czyli bezpieczeństwo usługi (art. 6 ust. 1 lit. f RODO).",
            "Korespondencja z nami — aby odpowiedzieć na Twoje pytania. Podstawa: nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).",
          ],
        },
        "Podanie danych jest dobrowolne, ale bez odpowiedzi w teście i zdjęcia nie możemy przygotować analizy.",
      ],
    },
    {
      id: "zdjecie",
      title: "3. Twoje zdjęcie i analiza AI",
      body: [
        "Analiza kolorystyczna jest wspierana przez sztuczną inteligencję. Oto dokładnie, co dzieje się z Twoim zdjęciem:",
        {
          list: [
            "Przed wysłaniem zdjęcie jest zmniejszane w Twojej przeglądarce, a następnie przesyłane szyfrowanym połączeniem (HTTPS) do usługi Google Gemini API (dostawca: Google). Model AI ocenia wyłącznie cechy kolorystyczne: podton i jasność skóry, kolor oczu i włosów oraz kontrast.",
            "Nie zapisujemy Twojego zdjęcia w naszej bazie danych ani na naszych serwerach. Jest przetwarzane tylko na czas analizy (zwykle kilka sekund) i usuwane po jej zakończeniu — w każdym przypadku nie później niż w ciągu 24 godzin. Zapisujemy wyłącznie wynik analizy (np. „ciepła, średnia głębia”) i Twoją paletę.",
            "Korzystamy z płatnej wersji Gemini API. Zgodnie z warunkami Google, Google nie wykorzystuje przesyłanych w niej zdjęć ani wyników do trenowania ani ulepszania swoich modeli. Google może przez ograniczony czas przechowywać zapytania wyłącznie w celu wykrywania i zapobiegania nadużyciom, zgodnie z warunkami Google Cloud.",
            "Nie używamy zdjęcia do rozpoznawania ani identyfikacji osób (zdjęcie nie służy jako dane biometryczne w rozumieniu art. 9 RODO) i nie wnioskujemy z niego o pochodzeniu etnicznym, zdrowiu ani innych danych szczególnie chronionych.",
            "Wynik analizy jest automatyczną, orientacyjną rekomendacją estetyczną. Nie wywołuje wobec Ciebie skutków prawnych ani w podobny sposób na Ciebie nie wpływa (art. 22 RODO).",
            "Zgodę możesz cofnąć w każdej chwili, pisząc na info@twojcolor.com. Cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano przed jej cofnięciem.",
          ],
        },
      ],
    },
    {
      id: "odbiorcy",
      title: "4. Komu powierzamy dane",
      body: [
        "Korzystamy ze sprawdzonych dostawców, którzy przetwarzają dane w naszym imieniu i wyłącznie na nasze polecenie (podmioty przetwarzające):",
        {
          list: [
            "Google (Google Cloud / Gemini API) — analiza zdjęcia; Google Analytics — statystyki strony (tylko za Twoją zgodą).",
            "Vercel Inc. — hosting strony i serwerów aplikacji.",
            "Supabase Inc. — baza danych z wynikami analiz oraz obsługa kont.",
            "Resend — wysyłka wiadomości e-mail (np. kodów weryfikacyjnych).",
          ],
        },
        "Płatności obsługuje Stripe (Stripe Payments Europe, Ltd.), który w zakresie danych płatniczych działa jako odrębny administrator — zasady opisuje polityka prywatności Stripe.",
        "Dane możemy też udostępnić organom państwowym, jeśli wymaga tego prawo.",
      ],
    },
    {
      id: "poza-eog",
      title: "5. Przekazywanie danych poza Europejski Obszar Gospodarczy",
      body: [
        "Niektórzy z naszych dostawców (w tym Google) mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym, np. w Stanach Zjednoczonych. W takich przypadkach dane są chronione odpowiednimi zabezpieczeniami: decyzją Komisji Europejskiej stwierdzającą odpowiedni stopień ochrony (EU–US Data Privacy Framework) lub standardowymi klauzulami umownymi zatwierdzonymi przez Komisję Europejską.",
        "W przypadku Google przetwarzanie odbywa się zgodnie z umową powierzenia przetwarzania danych Google Cloud (Cloud Data Processing Addendum), która zawiera te zabezpieczenia. Kopię zabezpieczeń możesz uzyskać, pisząc do nas.",
      ],
    },
    {
      id: "okres",
      title: "6. Jak długo przechowujemy dane",
      body: [
        {
          list: [
            "Zdjęcie — nie zapisujemy go; jest usuwane po zakończeniu analizy, nie później niż w ciągu 24 godzin.",
            "Odpowiedzi w teście i wynik analizy — do czasu usunięcia konta lub Twojego żądania usunięcia; wyniki niezapisane na koncie — przez [OKRES, np. 24 miesiące] od ich utworzenia.",
            "Konto — do czasu jego usunięcia.",
            "Dokumenty związane z płatnościami — przez 5 lat od końca roku podatkowego, zgodnie z przepisami podatkowymi.",
            "Hash adresu IP (ochrona przed nadużyciami) — maksymalnie 2 dni.",
            "Dane analityczne Google Analytics — 14 miesięcy.",
            "Korespondencja — do czasu zakończenia sprawy, a następnie przez okres przedawnienia ewentualnych roszczeń.",
          ],
        },
      ],
    },
    {
      id: "prawa",
      title: "7. Twoje prawa",
      body: [
        "W związku z przetwarzaniem danych masz prawo do:",
        {
          list: [
            "dostępu do swoich danych i otrzymania ich kopii,",
            "sprostowania (poprawienia) danych,",
            "usunięcia danych („prawo do bycia zapomnianym”),",
            "ograniczenia przetwarzania,",
            "przenoszenia danych,",
            "sprzeciwu wobec przetwarzania opartego na naszym prawnie uzasadnionym interesie,",
            "cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem wcześniejszego przetwarzania),",
            "wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl).",
          ],
        },
        "Aby skorzystać z praw, napisz na info@twojcolor.com. Odpowiemy bez zbędnej zwłoki, nie później niż w ciągu miesiąca.",
      ],
    },
    {
      id: "cookies",
      title: "8. Pliki cookies i pamięć przeglądarki",
      body: [
        "Używamy niezbędnych mechanizmów przeglądarki: zapamiętania Twojego wyboru w banerze cookies, tymczasowego przechowania odpowiedzi z testu do czasu dodania zdjęcia oraz utrzymania sesji logowania.",
        "Pliki cookies Google Analytics zapisujemy wyłącznie po kliknięciu „Akceptuj wszystkie”. Zgodę możesz zmienić w każdej chwili w stopce strony („Ustawienia cookies”). Szczegóły znajdziesz w Polityce cookies.",
      ],
    },
    {
      id: "bezpieczenstwo",
      title: "9. Bezpieczeństwo",
      body: [
        "Cała komunikacja ze stroną jest szyfrowana (HTTPS). Dostęp do bazy danych jest ograniczony, a wynik analizy jest dostępny tylko pod unikalnym, trudnym do odgadnięcia linkiem lub na Twoim koncie. Stosujemy limity zapytań chroniące usługę przed nadużyciami.",
      ],
    },
    {
      id: "wiek",
      title: "10. Wiek",
      body: ["Usługa jest przeznaczona dla osób, które ukończyły 18 lat. Nie przetwarzamy świadomie danych osób niepełnoletnich."],
    },
    {
      id: "zmiany",
      title: "11. Zmiany polityki prywatności",
      body: ["Możemy aktualizować tę politykę, np. gdy zmienią się nasze usługi lub przepisy. Aktualna wersja jest zawsze dostępna na tej stronie, a o istotnych zmianach poinformujemy na stronie lub e-mailem."],
    },
  ] satisfies PrivacySection[],
};

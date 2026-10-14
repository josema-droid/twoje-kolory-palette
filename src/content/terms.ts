// Regulamin — DRAFT for review by a Polish-qualified lawyer.
// Fields in [SQUARE BRACKETS] must be filled in before relying on it.
import type { LegalDoc } from "@/components/legal-document";

export const termsDoc: LegalDoc = {
  title: "Regulamin",
  updated: "14 października 2026 r.",
  sections: [
    {
      id: "sprzedawca",
      title: "§ 1. Sprzedawca i zakres regulaminu",
      body: [
        {
          ordered: [
            "Serwis twojcolor.com prowadzi **[PEŁNA NAZWA FIRMY / imię i nazwisko przedsiębiorcy]**, [adres], [CVR / NIP], e-mail: **info@twojcolor.com** [telefon] (dalej: „Sprzedawca”).",
            "Regulamin określa zasady korzystania z serwisu i zawierania umowy o świadczenie usługi osobistej analizy kolorystycznej online (dalej: „Usługa”). Jest przeznaczony dla konsumentów w rozumieniu Kodeksu cywilnego.",
            "Usługa jest przeznaczona dla osób pełnoletnich.",
            "Do korzystania z Usługi potrzebujesz urządzenia z dostępem do internetu, aktualnej przeglądarki, adresu e-mail oraz własnego zdjęcia twarzy.",
            "Regulamin jest dostępny bezpłatnie w serwisie w formie, którą można pobrać, utrwalić i wydrukować.",
          ],
        },
      ],
    },
    {
      id: "usluga",
      title: "§ 2. Usługa, cena i zamówienie",
      body: [
        {
          ordered: [
            "**Co kupujesz.** Spersonalizowaną analizę kolorystyczną przygotowaną na podstawie Twoich odpowiedzi z quizu i zdjęcia. Obejmuje ona osobistą paletę 12–20 kolorów, 4 najlepsze neutralne kolory, 3 kolory akcentowe, idealną biel, idealną czerń lub jej zamiennik, rekomendację złoto lub srebro, 3–5 kolorów makijażu, rekomendacje koloru włosów, kolory, na które warto uważać, oraz przykładową stylizację. Wynik otrzymujesz online, jako treść cyfrową, pod unikalnym linkiem, a po założeniu konta — także w swoim koncie.",
            "**Cena.** 39 zł brutto [zawiera podatek VAT — lub: cena nie zawiera VAT, bo Sprzedawca nie jest płatnikiem VAT; potwierdź], jednorazowo, bez dodatkowych opłat. Płacisz w złotych.",
            "**Jak złożyć zamówienie:** (1) wypełniasz quiz; (2) przesyłasz swoje zdjęcie i zaznaczasz zgodę na jego analizę przez AI (zob. Polityka prywatności); (3) zaznaczasz, że prosisz o natychmiastowe rozpoczęcie świadczenia Usługi i przyjmujesz do wiadomości utratę prawa do odstąpienia od umowy (§ 3); (4) klikasz przycisk **„Zamawiam z obowiązkiem zapłaty”**; (5) płacisz przez Stripe.",
            "**Zawarcie umowy.** Umowa zostaje zawarta, gdy zamówisz Usługę i potwierdzimy otrzymanie płatności. Potwierdzenie z treścią umowy, Regulaminem i informacją o odstąpieniu wysyłamy e-mailem.",
            "**Płatności.** Obsługuje je Stripe (metody: BLIK, karta płatnicza oraz inne metody wyświetlane na stronie płatności). Sprzedawca nie widzi ani nie przechowuje danych Twojej karty.",
            "**Dostarczenie.** Wynik udostępniamy online zaraz po zakończeniu analizy, zwykle w ciągu kilku minut. Jeśli wynik nie dotrze, napisz na info@twojcolor.com.",
          ],
        },
      ],
    },
    {
      id: "odstapienie",
      title: "§ 3. Odstąpienie od umowy",
      body: [
        {
          ordered: [
            "**Prawo odstąpienia.** Jako konsument możesz odstąpić od umowy w ciągu 14 dni od jej zawarcia, bez podawania przyczyny.",
            "**Kiedy prawo wygasa.** Nie przysługuje Ci ono, gdy spełnione są wszystkie warunki: wyraźnie poprosiłeś lub poprosiłaś o rozpoczęcie świadczenia Usługi przed upływem 14 dni, zostałeś poinformowany lub poinformowana przed jej rozpoczęciem, że po dostarczeniu wyniku utracisz prawo odstąpienia, przyjąłeś to do wiadomości (pole zaznaczane przy zamówieniu, § 2 ust. 3), a my potwierdziliśmy umowę na trwałym nośniku (e-mailem). Dotyczy to Usługi i dostarczanej w jej ramach treści cyfrowej (art. 38 ust. 1 pkt 1 i 13 ustawy o prawach konsumenta).",
            "**Odstąpienie przed wykonaniem Usługi.** Jeśli odstąpisz od umowy po rozpoczęciu świadczenia, a przed dostarczeniem wyniku, zapłacisz za wykonaną do tej chwili część Usługi, proporcjonalnie do jej zakresu.",
            "**Jak odstąpić.** Wyślij jednoznaczne oświadczenie na info@twojcolor.com [lub adres pocztowy] przed upływem terminu. Możesz użyć wzoru poniżej, ale nie musisz. Potwierdzimy otrzymanie oświadczenia e-mailem.",
            "**Zwrot płatności.** Zwrócimy płatność niezwłocznie, nie później niż w ciągu 14 dni od otrzymania oświadczenia, tym samym sposobem płatności, chyba że zgodzisz się na inny.",
          ],
        },
        { sub: "Wzór formularza odstąpienia" },
        "(wypełnij i wyślij tylko, jeśli chcesz odstąpić od umowy)",
        {
          quote: [
            "Adresat: [PEŁNA NAZWA FIRMY / imię i nazwisko przedsiębiorcy], [adres], info@twojcolor.com",
            "Ja, niżej podpisany(-a), informuję o moim odstąpieniu od umowy o świadczenie Usługi osobistej analizy kolorystycznej online.",
            "Data zawarcia umowy: ______ · Imię i nazwisko konsumenta: ______ · Adres konsumenta (niewymagany): ______ · Data: ______ · Podpis (tylko, jeśli formularz jest przekazywany w wersji papierowej): ______",
          ],
        },
      ],
    },
    {
      id: "reklamacje",
      title: "§ 4. Reklamacje, wynik AI i odpowiedzialność",
      body: [
        {
          ordered: [
            "**Zgodność z umową.** Dostarczamy treść cyfrową zgodną z umową i opisem z § 2 ust. 1. Odpowiadamy za brak zgodności na zasadach określonych w ustawie o prawach konsumenta. Możesz żądać doprowadzenia treści do zgodności z umową, a w przypadkach przewidzianych prawem obniżenia ceny lub odstąpienia od umowy. Odpowiadamy przez okres wynikający z przepisów, przy jednorazowym dostarczeniu nie krótszy niż dwa lata od dostarczenia.",
            "**Jak złożyć reklamację.** Napisz na info@twojcolor.com [lub adres pocztowy]. Opisz problem, podaj adres e-mail użyty przy zamówieniu i wskaż, czego oczekujesz. Odpowiemy w ciągu 14 dni od otrzymania reklamacji. Brak odpowiedzi w tym terminie oznacza uznanie reklamacji.",
            "**Wynik AI.** Wynik jest rekomendacją stylistyczną przygotowaną z użyciem sztucznej inteligencji. Zależy od jakości i oświetlenia zdjęcia oraz od Twoich odpowiedzi w quizie, a ocena koloru jest z natury częściowo subiektywna. Nie gwarantujemy, że będzie zgodny z oceną stylisty ani z Twoimi gustami. Wynik nie jest poradą medyczną ani dermatologiczną.",
            "**Co jest reklamacją, a co nie.** Sama różnica gustu nie jest brakiem zgodności. Reklamacja przysługuje, gdy wynik nie został dostarczony, jest niepełny wobec opisu w § 2 ust. 1, nie otwiera się lub jest ewidentnie błędny. Zachęcamy też do napisania do nas, jeśli wynik wydaje Ci się nietrafny — sprawdzimy go.",
            "**Odpowiedzialność.** Odpowiadamy na zasadach ogólnych. Nic w Regulaminie nie wyłącza ani nie ogranicza praw konsumenta wynikających z bezwzględnie obowiązujących przepisów. Decyzje o zakupach i wyglądzie podejmujesz samodzielnie, a wynik jest wskazówką.",
            "**Dostępność.** Serwis może być czasowo niedostępny z powodów technicznych lub w trakcie konserwacji. Dokładamy starań, by skracać takie przerwy.",
          ],
        },
      ],
    },
    {
      id: "zasady",
      title: "§ 5. Zasady korzystania, prawa autorskie, spory i zmiany",
      body: [
        {
          ordered: [
            "**Zasady korzystania.** Przesyłasz wyłącznie własne zdjęcie. Nie przesyłaj zdjęć innych osób, dzieci ani treści bezprawnych. Nie obchodź zabezpieczeń serwisu, nie pobieraj jego treści automatycznie i nie odsprzedawaj wyniku.",
            "**Prawa autorskie.** Serwis, jego teksty, grafiki i rozwiązania są chronione prawem. Wynik Twojej analizy otrzymujesz na nieodpłatną, niewyłączną licencję bezterminową do użytku osobistego. Zdjęcie pozostaje Twoje, a my używamy go tylko do przeprowadzenia analizy, zgodnie z Polityką prywatności.",
            "**Dane osobowe.** Zasady przetwarzania danych opisują Polityka prywatności i Polityka cookies.",
            "**Spory.** Staramy się rozwiązywać sprawy polubownie, więc najpierw napisz do nas. Jako konsument możesz też skorzystać z pozasądowych sposobów rozwiązywania sporów, np. pomocy powiatowego (miejskiego) rzecznika konsumentów, wojewódzkiego inspektoratu Inspekcji Handlowej albo stałego polubownego sądu konsumenckiego (informacje: uokik.gov.pl). [Sprzedawca zgadza się / nie zgadza się na udział w pozasądowym rozwiązywaniu sporów — wybierz].",
            "**Prawo właściwe.** Umowa podlega prawu polskiemu [potwierdź]. Nie pozbawia Cię to ochrony wynikającej z bezwzględnie obowiązujących przepisów państwa Twojego zwykłego pobytu. Roszczenia możesz dochodzić przed sądem właściwym według przepisów ogólnych, w tym przed sądem w miejscu Twojego zamieszkania.",
            "**Zmiany Regulaminu.** Możemy zmienić Regulamin z ważnych powodów, np. zmiany prawa, usługi lub dostawców. Nowa wersja obowiązuje od daty publikacji w serwisie i nie zmienia umów już zawartych.",
          ],
        },
      ],
    },
  ],
  footer: "Obowiązuje od: [DATA]. Wersja 1.0.",
};

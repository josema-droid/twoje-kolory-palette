// Season guide ("Przewodnik"): pillar page /typy-urody, 4 season pages and
// 12 beauty-type pages. Palettes, chips and combos come from the landing data
// so both stay in sync; this file adds the long-form copy for each page.
import { pl } from "@/content/pl";

type Color = { name: string; hex: string };

export const guidePillar = {
  path: "/typy-urody",
  crumb: "Typy urody",
  metaTitle: "12 typów urody w analizie kolorystycznej — przewodnik",
  metaDescription: "Poznaj 12 typów urody: wiosnę, lato, jesień i zimę oraz ich podtypy. Sprawdź, jakie kolory, makijaż i biżuteria pasują do każdego z nich.",
  eyebrow: "Przewodnik po kolorach",
  h1: "Przewodnik po 12 typach urody",
  intro: [
    "Analiza kolorystyczna dzieli urodę na cztery pory roku — wiosnę, lato, jesień i zimę — a każdą z nich na trzy podtypy. Razem daje to 12 typów urody, z których każdy ma własną paletę kolorów.",
    "Twój typ zależy od naturalnego koloru skóry, oczu i włosów. Gdy go znasz, łatwiej wybierasz ubrania, makijaż, biżuterię i kolor włosów, które podkreślają Twoją urodę zamiast z nią konkurować.",
  ],
  howTitle: "Jak działa analiza kolorystyczna?",
  howIntro: "Każdy kolor można opisać trzema cechami. Te same trzy cechy opisują też Twoją urodę — a najlepiej wyglądasz w kolorach, które są z nią zgodne.",
  dimensions: [
    { title: "Podton: ciepły czy chłodny", text: "Ciepły podton ma w sobie złoto i brzoskwinię (wiosna, jesień). Chłodny podton ma w sobie róż i błękit (lato, zima). To najważniejsza cecha w analizie." },
    { title: "Jasność: jasna czy ciemna", text: "Określa, czy Twojej urodzie bliżej do jasnych pasteli, czy do głębokich, ciemnych barw. Jasne typy to m.in. Jasna Wiosna i Jasne Lato, ciemne — Głęboka Jesień i Głęboka Zima." },
    { title: "Nasycenie: czyste czy zgaszone", text: "Czyste kolory są żywe i klarowne (Czysta Wiosna, Czysta Zima). Zgaszone mają w sobie szarość i są miękkie (Zgaszone Lato, Zgaszona Jesień)." },
  ],
  seasonsTitle: "Cztery pory roku, dwanaście typów",
  seasonsIntro: "Wybierz porę roku, aby poznać jej cechy, albo przejdź od razu do konkretnego typu urody.",
  findTitle: "Jak poznać swój typ urody?",
  findText: "Najpewniej — porównując kolory przy twarzy w naturalnym świetle. Nasza analiza łączy pytania o Twoje naturalne cechy ze zdjęciem referencyjnym i wskazuje Twój typ wraz z pełną paletą.",
  faqTitle: "Najczęstsze pytania o typy urody",
  faq: [
    { q: "Ile jest typów urody?", a: "W analizie kolorystycznej wyróżnia się 12 typów urody: po trzy w każdej porze roku. Wiosna dzieli się na Jasną, Ciepłą i Czystą, lato na Jasne, Chłodne i Zgaszone, jesień na Zgaszoną, Ciepłą i Głęboką, a zima na Głęboką, Chłodną i Czystą." },
    { q: "Czy typ urody zmienia się z wiekiem?", a: "Podton skóry zwykle się nie zmienia, ale z wiekiem włosy jaśnieją lub siwieją, a kontrast urody maleje. Dlatego niektóre osoby z czasem lepiej wyglądają w sąsiednim, łagodniejszym typie z tej samej pory roku." },
    { q: "Czy farbowane włosy zmieniają typ urody?", a: "Nie. Typ urody określa się na podstawie naturalnych cech. Kolor włosów warto jednak dobrać do typu — wtedy cała uroda wygląda spójnie." },
    { q: "Czy mogę nosić kolory spoza swojej palety?", a: "Tak. Paleta to wskazówka, nie zakaz. Kolory spoza palety najlepiej nosić z dala od twarzy, np. w spodniach, butach czy torebce." },
  ],
};

type SeasonKey = "wiosna" | "lato" | "jesien" | "zima";

const seasonCopy: Record<SeasonKey, { metaDescription: string; h1: string; intro: string; traits: string[]; tips: string }> = {
  wiosna: {
    metaDescription: "Typ urody wiosna: ciepły podton i czyste, świeże kolory. Poznaj Jasną, Ciepłą i Czystą Wiosnę oraz ich najlepsze kolory.",
    h1: "Wiosna: ciepła i świeża paleta",
    intro: "Wiosna to typ urody o ciepłym podtonie i czystych, świeżych kolorach. Paleta wiosny jest jasna, klarowna i pełna energii — jak pierwsze kwiaty i młode liście.",
    traits: ["Podton skóry: ciepły — złocisty lub brzoskwiniowy", "Jasność: od jasnej do średniej", "Nasycenie: czyste, klarowne kolory"],
    tips: "Najlepiej wyglądasz w kolorach z odrobiną żółci: koralu, brzoskwini, turkusie i ciepłej zieleni. Zamiast czerni wybieraj ciepły brąz lub granat, a zamiast śnieżnej bieli — ecru i kość słoniową.",
  },
  lato: {
    metaDescription: "Typ urody lato: chłodny podton i miękkie, przydymione kolory. Poznaj Jasne, Chłodne i Zgaszone Lato oraz ich najlepsze kolory.",
    h1: "Lato: chłodna i delikatna paleta",
    intro: "Lato to chłodna, delikatna paleta o niebieskim podtonie. Kolory lata są miękkie, lekko przydymione i eleganckie — jak niebo przed burzą i lawendowe pola.",
    traits: ["Podton skóry: chłodny — różowy lub niebieskawy", "Jasność: od jasnej do średniej", "Nasycenie: miękkie, przygaszone kolory"],
    tips: "Szukaj kolorów z domieszką szarości i błękitu: pudrowego różu, szaroniebieskiego, lawendy i maliny. Zamiast czerni — grafit lub granat, zamiast bieli — perła i złamana biel.",
  },
  jesien: {
    metaDescription: "Typ urody jesień: ciepły podton i ziemiste, bogate kolory. Poznaj Zgaszoną, Ciepłą i Głęboką Jesień oraz ich najlepsze kolory.",
    h1: "Jesień: ciepła i ziemista paleta",
    intro: "Jesień to ciepła, ziemista paleta o złocistym podtonie. Jej kolory są bogate, głębokie i naturalne — jak przyprawy, mech i jesienne liście.",
    traits: ["Podton skóry: ciepły — złocisty lub oliwkowy", "Jasność: od średniej do ciemnej", "Nasycenie: ziemiste, przygaszone lub bogate kolory"],
    tips: "Wybieraj kolory natury: rdzę, oliwkę, musztardę, camel i butelkową zieleń. Zamiast czerni — czekolada lub espresso, zamiast bieli — krem i ecru.",
  },
  zima: {
    metaDescription: "Typ urody zima: chłodny podton i czyste, kontrastowe kolory. Poznaj Głęboką, Chłodną i Czystą Zimę oraz ich najlepsze kolory.",
    h1: "Zima: chłodna i kontrastowa paleta",
    intro: "Zima to chłodna, kontrastowa paleta o niebieskim podtonie. Jej kolory są czyste, intensywne i wyraziste — jak klejnoty na tle śniegu.",
    traits: ["Podton skóry: chłodny lub neutralny", "Jasność: od średniej do ciemnej, wysoki kontrast", "Nasycenie: czyste, intensywne kolory"],
    tips: "Postaw na kontrast: czerń z bielą, szmaragd, rubin, kobalt i fuksję. Zima to jedyna paleta, w której czysta czerń i śnieżna biel wyglądają naturalnie przy twarzy.",
  },
};

type TypeCopy = {
  traits: string[];
  avoid: Color[];
  avoidText: string;
  makeup: { lips: string; cheeks: string; eyes: string };
  jewelry: string;
  hair: string;
};

const black = { name: "Czerń", hex: "#1d1b1f" };
const white = { name: "Czysta biel", hex: "#ffffff" };
const fuchsia = { name: "Fuksja", hex: "#c4287a" };
const orange = { name: "Pomarańcz", hex: "#f28c28" };
const ashGrey = { name: "Popielaty szary", hex: "#9aa0a6" };
const mustard = { name: "Musztarda", hex: "#d6a12a" };
const camel = { name: "Camel", hex: "#c69866" };
const olive = { name: "Oliwka", hex: "#6f7a34" };
const khaki = { name: "Khaki", hex: "#a39a6d" };
const dustyPink = { name: "Brudny róż", hex: "#c99aa0" };
const taupe = { name: "Taupe", hex: "#9b8c84" };
const cobalt = { name: "Kobalt", hex: "#0047ab" };
const icyBlue = { name: "Lodowy błękit", hex: "#cfe6f5" };

const typeCopy: Record<string, TypeCopy> = {
  "jasna-wiosna": {
    traits: ["Jasna, delikatna cera z brzoskwiniowym lub kremowym podtonem", "Jasne oczy: niebieskie, turkusowe, jasnozielone lub jasnopiwne", "Włosy: jasny, złocisty lub truskawkowy blond", "Niski do średniego kontrast między włosami, oczami i cerą"],
    avoid: [black, { name: "Ciemne bordo", hex: "#5c1a2b" }, { name: "Ciemna oliwka", hex: "#4f5328" }, fuchsia],
    avoidText: "Ciężkie, ciemne i bardzo chłodne kolory dominują nad delikatną urodą — twarz wygląda na zmęczoną, a cienie pod oczami stają się wyraźniejsze.",
    makeup: { lips: "brzoskwiniowe, jasnokoralowe i ciepłe różowe szminki", cheeks: "róż w odcieniu brzoskwini lub moreli", eyes: "cienie szampańskie, jasny brąz i złocisty beż; brązowy tusz zamiast czarnego" },
    jewelry: "Jasne żółte złoto, różowe złoto i perły w kremowym odcieniu. Najlepiej sprawdzają się delikatne, lekkie formy.",
    hair: "Złocisty, miodowy i maślany blond. Unikaj popielatych i platynowych tonów.",
  },
  "ciepla-wiosna": {
    traits: ["Ciepła, złocista lub brzoskwiniowa cera, często z piegami", "Oczy: ciepły brąz, bursztyn, ciepła zieleń lub turkus", "Włosy: złocisty blond, miedziane, rude lub złocisty jasny brąz", "Słoneczne, ciepłe i promienne wrażenie"],
    avoid: [ashGrey, fuchsia, { name: "Granat", hex: "#1f2f5a" }, black],
    avoidText: "Chłodne, popielate i bardzo ciemne kolory odbierają cerze ciepło — może wyglądać na szarą lub ziemistą.",
    makeup: { lips: "koral, ciepła czerwień i brzoskwinia", cheeks: "brzoskwinia lub morela", eyes: "złoto, karmel, brąz z miedzianym połyskiem i oliwka" },
    jewelry: "Żółte i szampańskie złoto, mosiądz i bursztyn — z ciepłym, świetlistym wykończeniem.",
    hair: "Złoty blond, miodowy blond i jasna miedź. Unikaj chłodnych, popielatych tonów.",
  },
  "czysta-wiosna": {
    traits: ["Jasna lub średnia cera z neutralnym lub lekko ciepłym podtonem", "Jasne, wyraziste oczy: turkusowe, jasnoniebieskie lub zielone", "Włosy: od złocistego blondu po ciemny brąz, kontrastujące z cerą", "Wysoki kontrast i naturalny „blask” w urodzie"],
    avoid: [khaki, dustyPink, taupe, { name: "Szarobeżowy", hex: "#b5aa9a" }],
    avoidText: "Przygaszone, przydymione odcienie gaszą naturalny blask — uroda traci wyrazistość.",
    makeup: { lips: "maków czerwień, koral i żywy róż", cheeks: "czysty koralowy róż", eyes: "złoto i brąz, a jako akcent turkusowa lub kobaltowa kreska" },
    jewelry: "Błyszczące złoto i biżuteria z kolorowymi kamieniami. Sprawdza się też polerowane srebro.",
    hair: "Czyste, nasycone odcienie: złocisty brąz i czekolada z ciepłym refleksem. Unikaj matowych, popielatych tonów.",
  },
  "jasne-lato": {
    traits: ["Jasna, porcelanowa lub różowawa cera z chłodnym podtonem", "Oczy: jasnoniebieskie, szaroniebieskie lub szarozielone", "Włosy: popielaty lub jasny blond, czasem jasny brąz", "Delikatny, niski kontrast"],
    avoid: [black, orange, mustard, { name: "Rdza", hex: "#b5532c" }],
    avoidText: "Intensywne, ciepłe i ciemne kolory przytłaczają delikatną urodę i podkreślają zaczerwienienia.",
    makeup: { lips: "pudrowy róż, chłodny róż i malinowy błyszczyk", cheeks: "chłodny, delikatny róż", eyes: "szarości, taupe i lawenda; granatowy lub brązowo-szary tusz" },
    jewelry: "Srebro, białe złoto, platyna i perły — w matowym lub satynowym wykończeniu.",
    hair: "Popielaty, perłowy i beżowy blond. Unikaj miedzi i intensywnego złota.",
  },
  "chlodne-lato": {
    traits: ["Cera z wyraźnie chłodnym, różowym lub niebieskawym podtonem", "Oczy: niebieskie, szare, szaroniebieskie lub chłodne piwne", "Włosy: od popielatego blondu po popielaty brąz, często siwiejące na srebrno", "Średni kontrast i elegancka, chłodna tonacja"],
    avoid: [orange, camel, olive, black],
    avoidText: "Ciepłe, złociste i pomarańczowe barwy kłócą się z chłodnym podtonem — cera wydaje się żółtawa.",
    makeup: { lips: "malina, róż i chłodna czerwień z niebieską bazą", cheeks: "chłodny róż", eyes: "grafit, szaroniebieski i śliwka" },
    jewelry: "Srebro, białe złoto i platyna. Z kamieni: ametyst, akwamaryn i różowy kwarc.",
    hair: "Chłodny popielaty brąz i popielaty blond. Unikaj ciepłych, rudawych refleksów.",
  },
  "zgaszone-lato": {
    traits: ["Cera neutralna lub lekko chłodna, często beżowo-oliwkowa", "Oczy o miękkim, mieszanym kolorze: szarozielone, szaroniebieskie, orzechowe", "Włosy: ciemny blond lub popielaty jasny brąz", "Niski kontrast i miękka, przydymiona uroda"],
    avoid: [white, black, cobalt, fuchsia],
    avoidText: "Jaskrawe, czyste kolory i ostry kontrast czerni z bielą wyglądają przy miękkiej urodzie zbyt agresywnie.",
    makeup: { lips: "brudny róż, różane nude i przygaszona malina", cheeks: "zgaszony róż", eyes: "taupe, szarobrązowy, szałwia i mglisty fiolet" },
    jewelry: "Satynowe srebro, białe złoto, matowe różowe złoto i cyna. Unikaj mocnego połysku.",
    hair: "Popielaty jasny brąz i chłodny ciemny blond. Unikaj kontrastowych pasemek.",
  },
  "zgaszona-jesien": {
    traits: ["Cera neutralna lub ciepła, beżowa albo oliwkowa", "Oczy: piwne, orzechowe, szarobrązowe lub w zgaszonej zieleni", "Włosy: ciemny blond albo jasny lub średni brąz z ciepłym refleksem", "Niski do średniego kontrast, naturalna i stonowana uroda"],
    avoid: [white, black, fuchsia, cobalt],
    avoidText: "Jaskrawe i lodowate barwy wyglądają sztucznie i „odklejają się” od twarzy.",
    makeup: { lips: "ciepłe nude, łososiowy i terakota", cheeks: "brzoskwiniowo-beżowy róż", eyes: "khaki, brąz, miedź i mech" },
    jewelry: "Matowe złoto, brąz, mosiądz, drewno i kamienie naturalne.",
    hair: "Ciepły ciemny blond, karmelowy i orzechowy brąz.",
  },
  "ciepla-jesien": {
    traits: ["Złocista, ciepła cera, często z piegami", "Oczy: ciepły brąz, bursztyn, zielone lub piwne", "Włosy: rude, miedziane, kasztanowe lub złocisty brąz", "Ciepła, bogata i nasycona uroda"],
    avoid: [icyBlue, fuchsia, ashGrey, black],
    avoidText: "Chłodne, lodowe i popielate odcienie sprawiają, że cera wygląda na bladą i zmęczoną.",
    makeup: { lips: "terakota, rdza, ceglasta czerwień i ciepły brąz", cheeks: "brzoskwinia lub terakota", eyes: "miedź, brąz, oliwka i złoto" },
    jewelry: "Żółte złoto, antyczne złoto, miedź i bursztyn.",
    hair: "Miedziany, kasztanowy i złocisty brąz. Unikaj chłodnych, popielatych tonów.",
  },
  "gleboka-jesien": {
    traits: ["Cera ciepła lub neutralna — od beżowej po głęboką", "Oczy: ciemnobrązowe, ciemnoorzechowe lub ciemnozielone", "Włosy: ciemny brąz, czekoladowe lub prawie czarne z ciepłym refleksem", "Średni do wysokiego kontrast, wyrazista uroda"],
    avoid: [{ name: "Pudrowy róż", hex: "#f4c6d0" }, { name: "Lawenda", hex: "#c9bde6" }, icyBlue, fuchsia],
    avoidText: "Jasne pastele i lodowe kolory giną przy wyrazistej urodzie i wyglądają mdło.",
    makeup: { lips: "bordo, ciepła śliwka, cegła i ciemna czerwień", cheeks: "terakota lub ciepły róż", eyes: "bakłażan, brąz, miedź i butelkowa zieleń" },
    jewelry: "Żółte i antyczne złoto oraz miedź — także w ciężkich, wyrazistych formach.",
    hair: "Czekoladowy brąz, espresso i ciemny kasztan.",
  },
  "gleboka-zima": {
    traits: ["Cera neutralna lub chłodna — od jasnej po bardzo ciemną", "Oczy: ciemnobrązowe, prawie czarne lub głęboko zielone", "Włosy: od ciemnego brązu po czerń", "Wysoki kontrast, intensywna i mocna uroda"],
    avoid: [{ name: "Brzoskwinia", hex: "#fdcfae" }, mustard, camel, { name: "Łosoś", hex: "#d99a80" }],
    avoidText: "Jasne, ciepłe i przygaszone kolory gaszą wyrazistą urodę — twarz wygląda blado i bez energii.",
    makeup: { lips: "rubin, wiśnia, śliwka i chłodna czerwień", cheeks: "chłodny róż lub malina", eyes: "czerń, grafit, śliwka i szmaragd" },
    jewelry: "Srebro, białe złoto i platyna oraz kamienie szlachetne o głębokim kolorze.",
    hair: "Ciemny brąz, czerń i chłodna czekolada.",
  },
  "chlodna-zima": {
    traits: ["Cera wyraźnie chłodna — jasna lub oliwkowa z niebieskawym podtonem", "Oczy: niebieskie, szare lub ciemnobrązowe o chłodnym odcieniu", "Włosy: ciemny popielaty brąz lub czerń, często srebrzyście siwiejące", "Wysoki kontrast i chłodna, elegancka tonacja"],
    avoid: [orange, mustard, camel, olive],
    avoidText: "Ciepłe, ziemiste i złociste odcienie sprawiają, że cera wydaje się żółta lub szara.",
    makeup: { lips: "fuksja, chłodna czerwień, malina i śliwka", cheeks: "chłodny róż", eyes: "grafit, granat, srebro i chłodny fiolet" },
    jewelry: "Srebro, białe złoto, platyna, diamenty i kryształy.",
    hair: "Chłodny ciemny brąz, czerń i naturalne, srebrne siwienie.",
  },
  "czysta-zima": {
    traits: ["Jasna lub średnia cera z chłodnym lub neutralnym podtonem", "Jasne, błyszczące oczy: lodowo niebieskie, szmaragdowe lub ciemnobrązowe", "Włosy: od ciemnego brązu po czerń", "Bardzo wysoki kontrast między włosami, oczami i cerą"],
    avoid: [khaki, dustyPink, taupe, mustard],
    avoidText: "Przygaszone i ziemiste barwy zabierają urodzie kontrast — twarz wygląda na zmęczoną.",
    makeup: { lips: "karmazyn, czysta czerwień i fuksja", cheeks: "czysty, chłodny róż", eyes: "czarna kreska, srebro, kobalt i szmaragd" },
    jewelry: "Polerowane srebro, białe złoto i platyna; kryształy i kamienie w jaskrawych kolorach.",
    hair: "Głęboki brąz i czerń z chłodnym refleksem.",
  },
};

/* ---------- assembled guide data ---------- */

const list = pl.landing.seasons.list;

export const seasonGuides = list.map((season) => ({
  slug: season.key,
  label: season.label,
  path: `/typy-urody/${season.key}`,
  ...seasonCopy[season.key as SeasonKey],
  types: season.types.map((t) => t.key),
}));

export const typeGuides = list.flatMap((season) =>
  season.types.map((type) => ({
    ...type,
    ...typeCopy[type.key]!,
    slug: type.key,
    path: `/typy-urody/${type.key}`,
    season: { slug: season.key, label: season.label, path: `/typy-urody/${season.key}` },
    siblings: season.types.filter((t) => t.key !== type.key).map((t) => ({ slug: t.key, label: t.label, path: `/typy-urody/${t.key}` })),
    metaDescription: `${type.label}: ${type.description} Sprawdź najlepsze kolory, makijaż, biżuterię i kolor włosów dla tego typu urody.`,
  })),
);

export type SeasonGuide = (typeof seasonGuides)[number];
export type TypeGuide = (typeof typeGuides)[number];

export const findSeason = (slug: string) => seasonGuides.find((s) => s.slug === slug);
export const findType = (slug: string) => typeGuides.find((t) => t.slug === slug);
export const typeBySlug = (slug: string) => findType(slug)!;

/** Footer / nav links to the four season pages. */
export const seasonLinks = seasonGuides.map((s) => ({ slug: s.slug, label: s.label, path: s.path }));

/** Every valid /typy-urody/<slug>. */
export const guideSlugs = new Set([...seasonGuides.map((s) => s.slug), ...typeGuides.map((t) => t.slug)]);

/** Every indexable guide path, for the sitemap and llms.txt. */
export const guidePaths = [guidePillar.path, ...seasonGuides.map((s) => s.path), ...typeGuides.map((t) => t.path)];

export type Gender = "female" | "male";
export type AgeGroup = "25-35" | "36-55" | "56+";
export type AnswerValue = string | string[];

export type Answers = Record<string, AnswerValue>;

export type Question = {
  id: string;
  title: string;
  helper?: string;
  type: "single" | "multi";
  options: string[];
  max?: number;
  when?: (answers: Answers) => boolean;
};

const eyeColors = [
  "Jasnoniebieski",
  "Niebieski",
  "Szaroniebieski",
  "Szary",
  "Jasnozielony",
  "Zielony",
  "Zielono-piwny",
  "Piwny",
  "Jasnobrązowy",
  "Średni brąz",
  "Ciemnobrązowy",
  "Bardzo ciemny brąz",
  "Inny lub trudny do określenia",
];

const naturalHair = [
  "Bardzo jasny blond",
  "Jasny blond",
  "Ciemny blond",
  "Jasny brąz",
  "Średni brąz",
  "Ciemny brąz",
  "Czarny",
  "Rudy lub miedziany",
  "Trudno mi określić",
];

const jewelry = [
  "Żółte złoto",
  "Srebro",
  "Białe złoto",
  "Różowe złoto",
  "Łączę różne metale",
  "Wszystkie wyglądają podobnie",
  "Trudno mi ocenić",
  "Prawie nie noszę biżuterii",
];

const includesAny = (answers: Answers, id: string, needles: string[]) => {
  const value = answers[id];
  if (Array.isArray(value)) return value.some((v) => needles.includes(v));
  return typeof value === "string" && needles.includes(value);
};

export const GENDER_FEMALE = "Dla kobiety";
export const GENDER_MALE = "Dla mężczyzny";

// Everyone starts here. Women then branch by age; men have a single path
// (questionsMen) that branches by their main goal instead.
export const commonStart: Question[] = [
  {
    id: "gender",
    title: "Dla kogo przygotowujemy analizę?",
    type: "single",
    options: [GENDER_FEMALE, GENDER_MALE],
  },
  {
    id: "age",
    title: "W jakim jesteś wieku?",
    type: "single",
    options: ["25–35 lat", "36–55 lat", "56 lat lub więcej"],
    when: (a) => a["gender"] === GENDER_FEMALE,
  },
];

export const questions2535: Question[] = [
  {
    id: "goal",
    title: "Co najbardziej chcesz odkryć dzięki analizie kolorystycznej?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Jakie kolory ubrań wyglądają na mnie najlepiej",
      "Jakie odcienie makijażu najbardziej mi służą",
      "Jaki kolor włosów najlepiej współgra z moją urodą",
      "Jak przestać kupować ubrania, których później nie noszę",
      "Jak zbudować bardziej spójną garderobę",
      "Chcę poznać całą swoją paletę kolorystyczną",
    ],
  },
  {
    id: "style",
    title: "Jak najczęściej chcesz wyglądać?",
    type: "single",
    options: [
      "Minimalistycznie i świeżo",
      "Kobieco i miękko",
      "Klasycznie i elegancko",
      "Modowo i wyraziście",
      "Swobodnie i naturalnie",
      "Łączę różne style",
    ],
  },
  {
    id: "desiredEffect",
    title: "Jaki efekt najbardziej chciałabyś uzyskać dzięki dobrze dobranym kolorom?",
    type: "single",
    options: [
      "Bardziej promienną cerę",
      "Bardziej wyraziste oczy",
      "Mniej widoczne cienie pod oczami",
      "Mniej widoczne zaczerwienienia",
      "Większy kontrast i bardziej wyrazisty wygląd",
      "Bardziej miękki i harmonijny wygląd",
      "Nie wiem — chcę, żeby analiza mi to pokazała",
    ],
  },
  {
    id: "naturalHair",
    title: "Jaki jest Twój naturalny kolor włosów?",
    type: "single",
    options: naturalHair,
  },
  {
    id: "currentHair",
    title: "Czy obecnie masz farbowane włosy?",
    type: "single",
    options: [
      "Nie, mam naturalny kolor",
      "Tak, są jaśniejsze niż mój naturalny kolor",
      "Tak, są ciemniejsze niż mój naturalny kolor",
      "Tak, są farbowane na rudy lub miedziany odcień",
      "Tak, są farbowane na chłodny odcień",
      "Tak, są farbowane na ciepły odcień",
      "Tak, ale trudno mi określić ton koloru",
    ],
  },
  {
    id: "hairChange",
    title: "Czy myślisz o zmianie koloru włosów w najbliższym czasie?",
    type: "single",
    options: [
      "Tak, planuję zmianę",
      "Nie, chcę zostać przy obecnym kolorze",
      "Być może — jeśli analiza pokaże mi lepszy kierunek",
      "Jeszcze nie wiem",
    ],
    when: (a) => !!a["currentHair"] && a["currentHair"] !== "Nie, mam naturalny kolor",
  },
  {
    id: "eyes",
    title: "Jaki masz kolor oczu?",
    type: "single",
    options: eyeColors,
  },
  {
    id: "jewelry",
    title: "Która biżuteria zazwyczaj wygląda na Tobie lepiej?",
    type: "single",
    options: [
      "Złota",
      "Srebrna",
      "Różowe złoto",
      "Zarówno złota, jak i srebrna",
      "Nigdy nie potrafiłam tego ocenić",
      "Prawie nie noszę biżuterii",
    ],
  },
  {
    id: "white",
    title: "Gdy zakładasz jasny kolor blisko twarzy, lepiej czujesz się w jakim odcieniu bieli?",
    type: "single",
    options: [
      "Czystej, chłodnej bieli",
      "Kremie lub ecru",
      "Delikatnej złamanej bieli",
      "Wszystkie wyglądają na mnie podobnie",
      "Nie wiem",
      "Rzadko noszę jasne kolory",
    ],
  },
  {
    id: "black",
    title: "Jak wyglądasz w czerni noszonej blisko twarzy?",
    type: "single",
    options: [
      "Bardzo dobrze — czerń mnie podkreśla",
      "Dobrze, ale nie daje efektu „wow”",
      "Wyglądam dobrze głównie wtedy, kiedy mam makijaż",
      "Mam wrażenie, że czerń mnie przytłacza",
      "Cera wygląda przy niej na bardziej zmęczoną",
      "Prawie nie noszę czerni",
      "Nigdy się nad tym nie zastanawiałam",
    ],
  },
  {
    id: "wardrobeUse",
    title: "Gdzie najbardziej chcesz wykorzystać swoją paletę kolorystyczną?",
    type: "single",
    options: [
      "Na co dzień",
      "W pracy lub na uczelni",
      "Na randkach i wyjściach",
      "Podczas większych okazji i wydarzeń",
      "Podczas zakupów online",
      "Chcę, żeby paleta była uniwersalna i działała w każdej sytuacji",
    ],
    when: (a) =>
      includesAny(a, "goal", [
        "Jakie kolory ubrań wyglądają na mnie najlepiej",
        "Jak przestać kupować ubrania, których później nie noszę",
        "Jak zbudować bardziej spójną garderobę",
      ]),
  },
  {
    id: "makeupProblem",
    title: "Które kosmetyki najtrudniej jest Ci dobrać kolorystycznie?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Podkład",
      "Korektor",
      "Róż",
      "Bronzer",
      "Pomadka",
      "Konturówka do ust",
      "Cienie do powiek",
      "Kredka lub eyeliner",
      "Tak naprawdę większość makijażu",
    ],
    when: (a) =>
      includesAny(a, "goal", ["Jakie odcienie makijażu najbardziej mi służą"]),
  },
  {
    id: "hairEffect",
    title: "Jaki efekt najbardziej podoba Ci się w koloryzacji włosów?",
    type: "single",
    options: [
      "Bardzo naturalny i subtelny",
      "Jaśniejszy i rozświetlający twarz",
      "Głębszy i bardziej kontrastowy",
      "Ciepły i miękki",
      "Chłodny i elegancki",
      "Nie wiem — chcę zobaczyć rekomendację",
    ],
    when: (a) =>
      includesAny(a, "goal", ["Jaki kolor włosów najlepiej współgra z moją urodą"]),
  },
  {
    id: "outfit",
    title: "Jaką przykładową stylizację chciałabyś otrzymać w swojej analizie?",
    type: "single",
    options: [
      "Codzienną",
      "Do pracy lub na uczelnię",
      "Na randkę lub kolację",
      "Weekendową",
      "Elegancką",
      "Na większe wyjście lub wydarzenie",
    ],
  },
];

export const questions3655: Question[] = [
  {
    id: "goal",
    title: "Co najbardziej chciałabyś poprawić dzięki analizie kolorystycznej?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Chcę wyglądać bardziej promiennie",
      "Chcę lepiej dobierać ubrania",
      "Chcę znaleźć najlepsze kolory do pracy",
      "Chcę lepiej dobierać makijaż",
      "Chcę dobrać bardziej korzystny kolor włosów",
      "Chcę uporządkować swoją garderobę",
      "Chcę ograniczyć nietrafione zakupy",
      "Chcę poznać całą swoją paletę kolorystyczną",
    ],
  },
  {
    id: "situations",
    title: "W jakich sytuacjach najbardziej zależy Ci na dobrze dobranych kolorach?",
    type: "single",
    options: [
      "Na co dzień",
      "W pracy",
      "Podczas spotkań biznesowych",
      "Podczas wystąpień lub prezentacji",
      "Na rodzinnych i towarzyskich okazjach",
      "Na większych wydarzeniach",
      "W każdej z tych sytuacji",
    ],
  },
  {
    id: "badColorEffect",
    title: "Co najczęściej zauważasz, gdy kolor przy twarzy Ci nie służy?",
    type: "single",
    options: [
      "Twarz wygląda na zmęczoną",
      "Cienie pod oczami stają się bardziej widoczne",
      "Zaczerwienienia są mocniejsze",
      "Cera wygląda blado",
      "Cera wygląda na szarą lub ziemistą",
      "Niedoskonałości skóry są bardziej widoczne",
      "Kolor ubrania dominuje nad moją twarzą",
      "Trudno mi to ocenić",
    ],
  },
  { id: "naturalHair", title: "Jaki jest Twój naturalny kolor włosów?", type: "single", options: naturalHair },
  {
    id: "currentHair",
    title: "Jak wyglądają Twoje włosy obecnie?",
    type: "single",
    options: [
      "Mam naturalny kolor",
      "Są rozjaśniane",
      "Są przyciemniane",
      "Są farbowane na ciepły odcień",
      "Są farbowane na chłodny odcień",
      "Są częściowo siwe",
      "Są w większości siwe",
      "Są całkowicie siwe lub srebrne",
      "Trudno mi określić",
    ],
  },
  {
    id: "greyHairApproach",
    title: "Jak chcesz podejść do naturalnego siwienia włosów?",
    type: "single",
    options: [
      "Chcę je podkreślić i dobrać do nich najlepsze kolory",
      "Chcę, żeby moja garderoba lepiej współgrała z obecnym kolorem włosów",
      "Regularnie farbuję włosy i chcę skupić się na kolorze farbowanym",
      "Rozważam przejście na naturalny kolor",
      "Jeszcze nie wiem",
    ],
    when: (a) =>
      includesAny(a, "currentHair", [
        "Są częściowo siwe",
        "Są w większości siwe",
        "Są całkowicie siwe lub srebrne",
      ]),
  },
  { id: "eyes", title: "Jaki masz kolor oczu?", type: "single", options: eyeColors },
  { id: "jewelry", title: "W jakiej biżuterii najlepiej się czujesz?", type: "single", options: jewelry },
  {
    id: "white",
    title: "Który jasny kolor najlepiej wygląda przy Twojej twarzy?",
    type: "single",
    options: [
      "Czysta biel",
      "Chłodna złamana biel",
      "Kość słoniowa",
      "Krem",
      "Ecru",
      "Wszystkie wyglądają podobnie",
      "Trudno mi ocenić",
    ],
  },
  {
    id: "black",
    title: "Jak czujesz się w czerni noszonej blisko twarzy?",
    type: "single",
    options: [
      "Bardzo dobrze",
      "Dobrze, ale nie jest moim najlepszym kolorem",
      "Dobrze głównie wtedy, kiedy mam makijaż",
      "Mam wrażenie, że czerń podkreśla cienie pod oczami",
      "Mam wrażenie, że czerń mnie przytłacza",
      "Prawie nie noszę czerni",
      "Trudno mi ocenić",
    ],
  },
  {
    id: "colorOpenness",
    title: "Jak bardzo jesteś otwarta na kolor w swojej garderobie?",
    type: "single",
    options: [
      "Najlepiej czuję się głównie w neutralnych kolorach",
      "Lubię neutrale z kilkoma bezpiecznymi akcentami",
      "Lubię kolor, ale nie zawsze wiem, które odcienie wybierać",
      "Bardzo lubię kolor",
      "Lubię mocne i wyraziste połączenia",
      "Chcę eksperymentować bardziej niż do tej pory",
    ],
  },
  {
    id: "workStyle",
    title: "Jakiego stylu najczęściej potrzebujesz w pracy?",
    type: "single",
    options: [
      "Formalnego",
      "Biznesowego",
      "Eleganckiego, ale mniej formalnego",
      "Swobodnego stylu biznesowego",
      "Kreatywnego",
      "Codziennego",
      "Nie mam określonego sposobu ubierania się w pracy",
    ],
    when: (a) => includesAny(a, "goal", ["Chcę znaleźć najlepsze kolory do pracy"]),
  },
  {
    id: "wardrobeProblem",
    title: "Który element garderoby najtrudniej jest Ci dobrać kolorystycznie?",
    type: "single",
    options: [
      "Bluzki i koszule",
      "Marynarki i żakiety",
      "Sukienki",
      "Swetry",
      "Płaszcze i kurtki",
      "Dodatki",
      "Właściwie całą garderobę",
    ],
    when: (a) =>
      includesAny(a, "goal", [
        "Chcę lepiej dobierać ubrania",
        "Chcę uporządkować swoją garderobę",
        "Chcę ograniczyć nietrafione zakupy",
      ]),
  },
  {
    id: "makeupProblem",
    title: "Które elementy makijażu najtrudniej jest Ci dobrać?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Podkład",
      "Korektor",
      "Róż",
      "Bronzer",
      "Pomadka",
      "Konturówka do ust",
      "Cienie do powiek",
      "Kredka lub eyeliner",
      "Kolory makijażu dopasowane do obecnego koloru włosów",
      "Większość makijażu",
    ],
    when: (a) => includesAny(a, "goal", ["Chcę lepiej dobierać makijaż"]),
  },
  {
    id: "hairGoal",
    title: "Czego najbardziej oczekujesz od rekomendacji dotyczącej włosów?",
    type: "single",
    options: [
      "Chcę wiedzieć, czy lepiej wyglądam w cieplejszych czy chłodniejszych odcieniach",
      "Chcę znaleźć najlepszy odcień blondu",
      "Chcę znaleźć najlepszy odcień brązu",
      "Chcę wiedzieć, czy pasują mi ciemniejsze włosy",
      "Chcę lepiej dopasować kolor włosów do siwienia",
      "Chcę wiedzieć, jakich odcieni unikać",
      "Nie mam konkretnego pomysłu i chcę otrzymać rekomendację",
    ],
    when: (a) => includesAny(a, "goal", ["Chcę dobrać bardziej korzystny kolor włosów"]),
  },
  {
    id: "outfit",
    title: "Jaką przykładową stylizację chciałabyś otrzymać?",
    type: "single",
    options: [
      "Elegancką do pracy",
      "Swobodną do pracy",
      "Codzienną",
      "Na spotkanie lub kolację",
      "Na specjalną okazję",
      "Uniwersalną stylizację, którą łatwo wykorzystać na co dzień",
    ],
  },
];

export const questions56plus: Question[] = [
  {
    id: "goal",
    title: "Co najbardziej chciałabyś uzyskać dzięki analizie kolorystycznej?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Więcej światła przy twarzy",
      "Bardziej wyrazisty wygląd",
      "Więcej harmonii między włosami, cerą i ubraniami",
      "Bardziej spójną i elegancką garderobę",
      "Lepsze kolory makijażu",
      "Lepsze kolory ubrań",
      "Lepsze dopasowanie kolorów do siwych lub srebrnych włosów",
      "Chcę po prostu wiedzieć, które kolory naprawdę mi służą",
    ],
  },
  {
    id: "wardrobeState",
    title: "Które zdanie najlepiej opisuje Twoją obecną garderobę?",
    type: "single",
    options: [
      "Noszę głównie klasyczne i neutralne kolory",
      "Mam sporo kolorów",
      "Łączę klasyczne kolory z mocniejszymi akcentami",
      "Mam dużo rzeczy, ale trudno jest mi je ze sobą łączyć",
      "Mam poczucie, że kolory, które kiedyś mi służyły, dziś wyglądają inaczej",
      "Chciałabym trochę odświeżyć swoją garderobę",
      "Chciałabym mocniej ją uporządkować",
    ],
  },
  { id: "naturalHair", title: "Jaki jest Twój naturalny kolor włosów?", type: "single", options: naturalHair },
  {
    id: "currentHair",
    title: "Jak wyglądają Twoje włosy obecnie?",
    type: "single",
    options: [
      "Mam naturalny kolor",
      "Są farbowane na blond",
      "Są farbowane na brąz",
      "Są farbowane na ciemny kolor",
      "Są farbowane na ciepły odcień",
      "Są farbowane na chłodny odcień",
      "Są częściowo siwe",
      "Są w większości siwe",
      "Są srebrne lub białe",
    ],
  },
  {
    id: "greyHairApproach",
    title: "Jak chcesz podejść do obecnego koloru włosów?",
    type: "single",
    options: [
      "Chcę podkreślić naturalne siwienie",
      "Chcę lepiej dopasować garderobę do obecnego koloru włosów",
      "Nadal regularnie farbuję włosy",
      "Rozważam stopniowe przejście na naturalny kolor",
      "Jeszcze nie wiem",
    ],
    when: (a) =>
      includesAny(a, "currentHair", [
        "Są częściowo siwe",
        "Są w większości siwe",
        "Są srebrne lub białe",
      ]),
  },
  { id: "eyes", title: "Jaki masz kolor oczu?", type: "single", options: eyeColors },
  { id: "jewelry", title: "Która biżuteria zazwyczaj najlepiej współgra z Twoją twarzą?", type: "single", options: jewelry },
  {
    id: "black",
    title: "Jak wygląda na Tobie czerń noszona blisko twarzy?",
    type: "single",
    options: [
      "Bardzo dobrze",
      "Dobrze, ale nie jest już tak korzystna jak kiedyś",
      "Jest elegancka, ale trochę mnie przytłacza",
      "Podkreśla cienie pod oczami",
      "Sprawia, że twarz wygląda na zmęczoną",
      "Prawie jej nie noszę",
      "Trudno mi ocenić",
    ],
  },
  {
    id: "white",
    title: "Które jasne kolory najlepiej wyglądają przy Twojej twarzy?",
    type: "single",
    options: [
      "Czysta biel",
      "Złamana biel",
      "Kość słoniowa",
      "Krem",
      "Ecru",
      "Jasny beż",
      "Wszystkie wyglądają podobnie",
      "Trudno mi ocenić",
    ],
  },
  {
    id: "contrastPreference",
    title: "Wolisz, kiedy kolor przy twarzy delikatnie współgra z Twoją urodą czy daje wyraźniejszy kontrast?",
    type: "single",
    options: [
      "Delikatnie współgra z moją urodą",
      "Daje lekki kontrast",
      "Jest wyraźny i zdecydowany",
      "Jest mocny i bardzo wyrazisty",
      "Zależy od okazji",
      "Nie wiem — chcę, żeby analiza mi to pokazała",
    ],
  },
  {
    id: "makeupStyle",
    title: "Jak wygląda Twój codzienny makijaż?",
    type: "single",
    options: [
      "Prawie wcale się nie maluję",
      "Używam tylko kilku podstawowych kosmetyków",
      "Lubię bardzo naturalny makijaż",
      "Lubię klasyczny makijaż",
      "Lubię mocniejsze usta lub oczy",
      "Lubię eksperymentować z kolorem",
    ],
    when: (a) => includesAny(a, "goal", ["Lepsze kolory makijażu"]),
  },
  {
    id: "makeupProblem",
    title: "Które kosmetyki najtrudniej jest Ci dobrać kolorystycznie?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: [
      "Podkład",
      "Korektor",
      "Róż",
      "Bronzer",
      "Pomadka",
      "Konturówka do ust",
      "Cienie do powiek",
      "Kredka lub eyeliner",
      "Większość makijażu",
    ],
    when: (a) => includesAny(a, "goal", ["Lepsze kolory makijażu"]),
  },
  {
    id: "wardrobeRefresh",
    title: "Którą część garderoby najbardziej chciałabyś odświeżyć?",
    type: "single",
    options: [
      "Bluzki i koszule",
      "Swetry",
      "Marynarki i żakiety",
      "Sukienki",
      "Płaszcze i kurtki",
      "Szale i dodatki",
      "Całą garderobę",
    ],
    when: (a) =>
      includesAny(a, "goal", [
        "Bardziej spójną i elegancką garderobę",
        "Lepsze kolory ubrań",
      ]),
  },
  {
    id: "greyHairColorGoal",
    title: "Co jest dla Ciebie najważniejsze przy doborze kolorów do obecnego koloru włosów?",
    type: "single",
    options: [
      "Żeby twarz wyglądała na bardziej promienną",
      "Żeby włosy wyglądały bardziej elegancko",
      "Żeby uniknąć efektu szarej lub zmęczonej cery",
      "Żeby znaleźć nowe kolory, które zastąpią te noszone wcześniej",
      "Żeby wiedzieć, które kolory najlepiej nosić blisko twarzy",
      "Chcę pełnej rekomendacji",
    ],
    when: (a) =>
      includesAny(a, "goal", ["Lepsze dopasowanie kolorów do siwych lub srebrnych włosów"]),
  },
  {
    id: "outfit",
    title: "Jaką przykładową stylizację chciałabyś otrzymać?",
    type: "single",
    options: [
      "Codzienną",
      "Elegancką na co dzień",
      "Swobodną i wygodną",
      "Na spotkanie lub kolację",
      "Na specjalną okazję",
      "Uniwersalną stylizację, którą łatwo odtworzyć",
    ],
  },
];

/* ---------- MEN ---------- */

// Main goal (single choice) decides which block of three dynamic questions follows.
export const MEN_GOAL_DAILY = "Codzienna garderoba";
export const MEN_GOAL_WORK = "Ubrania do pracy";
export const MEN_GOAL_SUITS = "Garnitury i formalne okazje";
export const MEN_GOAL_DATES = "Randki i wyjścia";
export const MEN_GOAL_IMAGE = "Zdjęcia, wizerunek i marka osobista";
export const MEN_GOAL_ALL = "Chcę poznać całą swoją paletę";

const menGoal = (a: Answers, ...goals: string[]) => goals.includes(String(a["goal"] ?? ""));
const MEN_SHAVED_HEAD = "Ogolona głowa lub łysienie";
const MEN_NO_BEARD = "Nie, golę się na gładko";
const hasBeard = (a: Answers) => !!a["beard"] && a["beard"] !== MEN_NO_BEARD;
const dyesHair = (a: Answers) => !!a["dyedHair"] && a["dyedHair"] !== "Nie, mam naturalny kolor";
const isGreying = (a: Answers) =>
  String(a["naturalHair"] ?? "").includes("siw") ||
  String(a["beardColor"] ?? "").includes("siw") ||
  String(a["dyedHair"] ?? "").includes("siw");

export const questionsMen: Question[] = [
  {
    id: "goal",
    title: "Do czego najbardziej przyda Ci się analiza kolorystyczna?",
    type: "single",
    options: [MEN_GOAL_DAILY, MEN_GOAL_WORK, MEN_GOAL_SUITS, MEN_GOAL_DATES, MEN_GOAL_IMAGE, MEN_GOAL_ALL],
  },
  {
    id: "style",
    title: "Jak najczęściej się ubierasz?",
    type: "single",
    options: [
      "Swobodnie — jeansy, T-shirty, bluzy",
      "Smart casual — chinosy, koszule, swetry",
      "Klasycznie i elegancko",
      "Biznesowo — marynarki i garnitury",
      "Sportowo",
      "Minimalistycznie",
      "Modowo i wyraziście",
    ],
  },
  {
    id: "desiredEffect",
    title: "Jaki efekt najbardziej chciałbyś osiągnąć dzięki dobrze dobranym kolorom?",
    type: "single",
    options: [
      "Zdrowszy i bardziej wypoczęty wygląd",
      "Bardziej wyraziste oczy",
      "Mniej widoczne cienie pod oczami lub zaczerwienienia",
      "Bardziej profesjonalny wygląd i większy autorytet",
      "Większy kontrast i bardziej wyrazisty wygląd",
      "Spójną garderobę, którą łatwo łączyć",
      "Nie wiem — chcę, żeby analiza mi to pokazała",
    ],
  },
  {
    id: "naturalHair",
    title: "Jaki jest Twój naturalny kolor włosów?",
    type: "single",
    options: [...naturalHair.slice(0, -1), "Częściowo siwe", "Siwe lub srebrne", MEN_SHAVED_HEAD, "Trudno mi określić"],
  },
  { id: "eyes", title: "Jaki masz kolor oczu?", type: "single", options: eyeColors },
  {
    id: "beard",
    title: "Czy nosisz zarost?",
    type: "single",
    options: ["Tak, pełną brodę", "Tak, krótki lub kilkudniowy zarost", "Tak, wąsy lub kozią bródkę", MEN_NO_BEARD],
  },
  {
    id: "beardColor",
    title: "Jaki jest naturalny kolor Twojego zarostu?",
    type: "single",
    options: ["Jasny blond", "Ciemny blond", "Rudy lub miedziany", "Jasny brąz", "Ciemny brąz", "Czarny", "Częściowo siwy", "Siwy", "Trudno mi określić"],
    when: hasBeard,
  },
  {
    id: "beardContrast",
    title: "Czy kolor zarostu różni się wyraźnie od koloru włosów?",
    type: "single",
    options: ["Nie, jest podobny", "Tak, jest jaśniejszy", "Tak, jest ciemniejszy", "Tak, jest bardziej rudy lub ciepły", "Tak, jest bardziej siwy"],
    when: hasBeard,
  },
  {
    id: "white",
    title: "W którym jasnym kolorze wyglądasz lepiej: czystej bieli czy kremie / złamanej bieli?",
    type: "single",
    options: ["W czystej bieli", "W kremie lub złamanej bieli", "Obie wyglądają podobnie", "Nie wiem", "Rzadko noszę jasne kolory"],
  },
  {
    id: "black",
    title: "Jak wyglądasz w czerni noszonej blisko twarzy?",
    type: "single",
    options: [
      "Bardzo dobrze — czerń mnie podkreśla",
      "Dobrze, ale nie daje efektu „wow”",
      "Mam wrażenie, że czerń mnie przytłacza",
      "Twarz wygląda przy niej na bardziej zmęczoną",
      "Prawie nie noszę czerni",
      "Nigdy się nad tym nie zastanawiałem",
    ],
  },
  {
    id: "jewelry",
    title: "Jakie metalowe dodatki zazwyczaj wyglądają na Tobie najlepiej?",
    helper: "Na przykład zegarek, obrączka, spinki do mankietów czy oprawki okularów.",
    type: "single",
    options: ["Złote", "Srebrne lub stalowe", "Zarówno złote, jak i srebrne", "Nigdy nie potrafiłem tego ocenić", "Prawie nie noszę metalowych dodatków"],
  },
  {
    id: "colorOpenness",
    title: "Jak bardzo jesteś otwarty na kolor w swojej garderobie?",
    type: "single",
    options: [
      "Najlepiej czuję się głównie w neutralnych kolorach",
      "Lubię neutrale z kilkoma bezpiecznymi akcentami",
      "Lubię kolor, ale nie zawsze wiem, które odcienie wybierać",
      "Bardzo lubię kolor",
      "Chcę eksperymentować bardziej niż do tej pory",
    ],
  },

  // Codzienna garderoba (also used when he wants the whole palette)
  {
    id: "wardrobeBuy",
    title: "Których elementów garderoby kupujesz najwięcej?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: ["T-shirty i koszulki polo", "Koszule", "Swetry i bluzy", "Spodnie i jeansy", "Kurtki i płaszcze", "Buty i dodatki"],
    when: (a) => menGoal(a, MEN_GOAL_DAILY, MEN_GOAL_ALL),
  },
  {
    id: "wardrobeProblem",
    title: "Które ubrania najtrudniej jest Ci dobrać kolorystycznie?",
    type: "single",
    options: ["T-shirty i koszulki polo", "Koszule", "Swetry", "Kurtki i płaszcze", "Spodnie", "Dodatki — paski, szaliki, czapki", "Właściwie całą garderobę"],
    when: (a) => menGoal(a, MEN_GOAL_DAILY, MEN_GOAL_ALL),
  },
  {
    id: "situations",
    title: "W jakich sytuacjach najbardziej chcesz korzystać ze swojej palety kolorystycznej?",
    type: "single",
    options: ["Na co dzień", "W pracy", "Na spotkaniach ze znajomymi", "Na randkach", "Podczas zakupów", "W każdej sytuacji"],
    when: (a) => menGoal(a, MEN_GOAL_DAILY, MEN_GOAL_ALL),
  },

  // Praca
  {
    id: "workStyle",
    title: "Jakiego stylu najczęściej potrzebujesz w pracy?",
    type: "single",
    options: ["Formalnego — garnitur i krawat", "Biznesowego — marynarka bez krawata", "Smart casual", "Swobodnego", "Kreatywnego", "Nie mam określonego stylu w pracy"],
    when: (a) => menGoal(a, MEN_GOAL_WORK),
  },
  {
    id: "formalFrequency",
    title: "Jak często nosisz koszule, marynarki lub garnitury?",
    type: "single",
    options: ["Codziennie", "Kilka razy w tygodniu", "Tylko na ważne spotkania", "Rzadko"],
    when: (a) => menGoal(a, MEN_GOAL_WORK),
  },
  {
    id: "workProblem",
    title: "Które elementy garderoby zawodowej najtrudniej jest Ci dobrać kolorystycznie?",
    type: "single",
    options: ["Koszule", "Krawaty", "Marynarki", "Garnitury", "Swetry i kardigany", "Buty i paski", "Połączenie wszystkich elementów"],
    when: (a) => menGoal(a, MEN_GOAL_WORK),
  },

  // Garnitury / formalne okazje
  {
    id: "suitColors",
    title: "Jakie kolory garniturów najczęściej nosisz?",
    helper: "Możesz wybrać maksymalnie 2 odpowiedzi.",
    type: "multi",
    max: 2,
    options: ["Granatowy", "Grafitowy", "Jasnoszary", "Czarny", "Beżowy lub brązowy", "Niebieski", "Nie mam jeszcze garnituru"],
    when: (a) => menGoal(a, MEN_GOAL_SUITS),
  },
  {
    id: "formalProblem",
    title: "Które elementy formalnej garderoby najtrudniej jest Ci dobrać?",
    type: "single",
    options: ["Kolor garnituru", "Koszula", "Krawat lub mucha", "Poszetka", "Buty i pasek", "Dodatki — spinki, zegarek", "Całe zestawienie"],
    when: (a) => menGoal(a, MEN_GOAL_SUITS),
  },
  {
    id: "formalOccasions",
    title: "Na jakie okazje najczęściej potrzebujesz bardziej formalnego stroju?",
    type: "single",
    options: ["Spotkania biznesowe", "Wesela i uroczystości rodzinne", "Gale i wydarzenia wieczorowe", "Rozmowy o pracę", "Rzadko — ale chcę być przygotowany"],
    when: (a) => menGoal(a, MEN_GOAL_SUITS),
  },

  // Randki / wyjścia
  {
    id: "dateStyle",
    title: "Jak najczęściej ubierasz się na randkę lub wieczorne wyjście?",
    type: "single",
    options: ["Jeansy i T-shirt", "Jeansy i koszula", "Chinosy i sweter", "Marynarka do jeansów", "Elegancko — koszula i marynarka", "Różnie, zależy od okazji"],
    when: (a) => menGoal(a, MEN_GOAL_DATES),
  },
  {
    id: "contrastPreference",
    title: "Wolisz wyglądać bardziej klasycznie czy bardziej wyraziście?",
    type: "single",
    options: ["Klasycznie", "Klasycznie z jednym wyraźnym akcentem", "Wyraziście", "Zależy od okazji"],
    when: (a) => menGoal(a, MEN_GOAL_DATES),
  },
  {
    id: "accentFocus",
    title: "Czy chcesz, aby rekomendacje skupiały się bardziej na neutralach czy również na mocniejszych kolorach?",
    type: "single",
    options: ["Głównie na neutralach", "Na neutralach z kilkoma akcentami", "Również na mocniejszych kolorach"],
    when: (a) => menGoal(a, MEN_GOAL_DATES),
  },

  // Zdjęcia / wizerunek / marka osobista
  {
    id: "imageUse",
    title: "Gdzie najczęściej będziesz wykorzystywać te kolory?",
    type: "single",
    options: ["Zdjęcia profilowe — LinkedIn, media społecznościowe", "Nagrania wideo i wideorozmowy", "Wystąpienia i prezentacje", "Sesje zdjęciowe", "Telewizja i media"],
    when: (a) => menGoal(a, MEN_GOAL_IMAGE),
  },
  {
    id: "imageEffect",
    title: "Czy zależy Ci bardziej na profesjonalnym, naturalnym czy wyrazistym efekcie?",
    type: "single",
    options: ["Profesjonalnym", "Naturalnym", "Wyrazistym"],
    when: (a) => menGoal(a, MEN_GOAL_IMAGE),
  },
  {
    id: "cameraFrequency",
    title: "Czy często występujesz przed kamerą lub robisz profesjonalne zdjęcia?",
    type: "single",
    options: ["Tak, regularnie", "Od czasu do czasu", "Rzadko, ale mam ważne wydarzenie", "Nie, ale chcę dobrze wyglądać na zdjęciach"],
    when: (a) => menGoal(a, MEN_GOAL_IMAGE),
  },

  // Włosy
  {
    id: "dyedHair",
    title: "Czy obecnie masz farbowane włosy?",
    type: "single",
    options: ["Nie, mam naturalny kolor", "Tak, farbuję włosy", "Tak, tuszuję siwe włosy", "Tak, farbuję włosy i zarost"],
    when: (a) => a["naturalHair"] !== MEN_SHAVED_HEAD,
  },
  {
    id: "hairChange",
    title: "Czy chcesz utrzymać obecny kolor czy rozważasz zmianę?",
    type: "single",
    options: ["Nie, chcę zostać przy obecnym kolorze", "Tak, planuję zmianę", "Chcę wrócić do naturalnego koloru", "Jeszcze nie wiem"],
    when: dyesHair,
  },
  {
    id: "hairGoal",
    title: "Jakiego efektu najbardziej oczekujesz od rekomendacji dotyczącej włosów?",
    type: "single",
    options: ["Naturalnego wyglądu", "Odświeżenia i odmłodzenia", "Lepszego dopasowania do oczu i cery", "Dopasowania koloru zarostu do włosów", "Wiedzy, jakich odcieni unikać"],
    when: dyesHair,
  },

  // Siwienie
  {
    id: "greyHairApproach",
    title: "Czy chcesz podkreślić naturalne siwienie czy raczej je neutralizować?",
    type: "single",
    options: ["Chcę podkreślić naturalne siwienie", "Wolę je neutralizować", "Jeszcze nie wiem"],
    when: isGreying,
  },
  {
    id: "greyWardrobeMatch",
    title: "Czy zależy Ci na dopasowaniu garderoby do obecnego koloru włosów i zarostu?",
    type: "single",
    options: ["Tak, bardzo", "Trochę", "Nie, to dla mnie mniej ważne"],
    when: isGreying,
  },

  {
    id: "outfit",
    title: "Jaką przykładową stylizację chciałbyś otrzymać?",
    type: "single",
    options: ["Codzienną", "Do pracy", "Formalną z garniturem", "Na randkę lub wieczorne wyjście", "Weekendową", "Do zdjęć lub wystąpień"],
  },
];

export function getGender(answers: Answers): Gender | null {
  if (answers["gender"] === GENDER_FEMALE) return "female";
  if (answers["gender"] === GENDER_MALE) return "male";
  return null;
}

/** Questions after the common start for the current gender/age, or null until those are answered. */
export function getQuestionsForPath(answers: Answers): Question[] | null {
  const gender = getGender(answers);
  if (gender === "male") return questionsMen;
  if (gender !== "female") return null;
  const age = getAgeGroup(answers);
  return age ? getQuestionsForAge(age) : null;
}

export function getAgeGroup(answers: Answers): AgeGroup | null {
  if (answers["age"] === "25–35 lat") return "25-35";
  if (answers["age"] === "36–55 lat") return "36-55";
  if (answers["age"] === "56 lat lub więcej") return "56+";
  return null;
}

export function getQuestionsForAge(age: AgeGroup): Question[] {
  if (age === "25-35") return questions2535;
  if (age === "36-55") return questions3655;
  return questions56plus;
}

export function getVisibleQuestions(questions: Question[], answers: Answers) {
  return questions.filter((q) => !q.when || q.when(answers));
}

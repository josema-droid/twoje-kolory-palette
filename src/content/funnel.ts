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

// This app is women-only for now (no men's funnel has been built yet), so
// the original gender-selector step was dropped — the quiz starts at age.
export const commonStart: Question[] = [
  {
    id: "age",
    title: "W jakim jesteś wieku?",
    type: "single",
    options: ["25–35 lat", "36–55 lat", "56 lat lub więcej"],
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
    title: "Gdy zakładasz jasny kolor blisko twarzy, lepiej czujesz się w:",
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
    title: "Wolisz, kiedy kolor przy twarzy:",
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

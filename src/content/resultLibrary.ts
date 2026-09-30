export type Temperature = "ciepła" | "chłodna" | "neutralna" | "neutralno-ciepła" | "neutralno-chłodna";
export type Depth = "jasna" | "średnia" | "głęboka";
export type Saturation = "czysta" | "umiarkowana" | "miękka";
export type Contrast = "niski" | "średni" | "wysoki";

export type ColorRole = "neutral" | "accent" | "both";

export type ColorEntry = {
  name: string;
  hex: string;
  role: ColorRole;
  temperature: -2 | -1 | 0 | 1 | 2;
  depth: 1 | 2 | 3;
  saturation: 1 | 2 | 3;
  tags?: string[];
  eyeAffinity?: Array<"blue" | "green" | "hazel" | "brown" | "grey">;
};

/**
 * Biblioteka jest celowo większa niż pojedyncza paleta sezonowa.
 * Silnik punktuje każdy kolor względem parametrów zdjęcia i preferencji z quizu.
 */
export const COLOR_LIBRARY: ColorEntry[] = [
  // Jasne / bazowe
  { name: "śnieżna biel", hex: "#FFFFFF", role: "neutral", temperature: -2, depth: 1, saturation: 3, tags: ["clean", "classic"] },
  { name: "chłodna biel", hex: "#F7F8FA", role: "neutral", temperature: -1, depth: 1, saturation: 2, tags: ["classic", "minimal"] },
  { name: "neutralna biel", hex: "#F7F5F0", role: "neutral", temperature: 0, depth: 1, saturation: 2, tags: ["classic", "minimal"] },
  { name: "złamana biel", hex: "#F2EFE6", role: "neutral", temperature: 0, depth: 1, saturation: 1, tags: ["soft", "classic"] },
  { name: "kość słoniowa", hex: "#F4E8CF", role: "neutral", temperature: 1, depth: 1, saturation: 1, tags: ["soft", "feminine"] },
  { name: "krem", hex: "#F2DFC2", role: "neutral", temperature: 2, depth: 1, saturation: 1, tags: ["soft", "natural"] },
  { name: "waniliowy", hex: "#F0DDA6", role: "neutral", temperature: 2, depth: 1, saturation: 2, tags: ["fresh", "feminine"] },
  { name: "jasny beż", hex: "#DCC9AD", role: "neutral", temperature: 1, depth: 1, saturation: 1, tags: ["natural", "classic"] },
  { name: "greige", hex: "#B9ADA1", role: "neutral", temperature: 0, depth: 2, saturation: 1, tags: ["minimal", "classic"] },
  { name: "taupe", hex: "#9D8C80", role: "neutral", temperature: 0, depth: 2, saturation: 1, tags: ["minimal", "soft", "classic"] },
  { name: "ciepły taupe", hex: "#A28B74", role: "neutral", temperature: 1, depth: 2, saturation: 1, tags: ["natural", "classic"] },
  { name: "gołębia szarość", hex: "#AAAEB3", role: "neutral", temperature: -1, depth: 2, saturation: 1, tags: ["minimal", "soft"] },
  { name: "średnia szarość", hex: "#8C8F94", role: "neutral", temperature: -1, depth: 2, saturation: 1, tags: ["classic", "business"] },
  { name: "grafit", hex: "#4A4E53", role: "neutral", temperature: -1, depth: 3, saturation: 1, tags: ["classic", "business", "minimal"] },
  { name: "antracyt", hex: "#34383D", role: "neutral", temperature: -2, depth: 3, saturation: 1, tags: ["classic", "business"] },
  { name: "miękka czerń", hex: "#242322", role: "neutral", temperature: 0, depth: 3, saturation: 2, tags: ["fashion", "classic"] },
  { name: "czysta czerń", hex: "#111111", role: "neutral", temperature: -1, depth: 3, saturation: 3, tags: ["fashion", "classic", "bold"] },
  { name: "camel", hex: "#B88A57", role: "neutral", temperature: 2, depth: 2, saturation: 2, tags: ["classic", "natural"] },
  { name: "karmel", hex: "#A86F3F", role: "neutral", temperature: 2, depth: 2, saturation: 2, tags: ["natural", "feminine"] },
  { name: "koniak", hex: "#8B542F", role: "neutral", temperature: 2, depth: 2, saturation: 2, tags: ["classic", "fashion"] },
  { name: "kakao", hex: "#745E54", role: "neutral", temperature: 0, depth: 2, saturation: 1, tags: ["soft", "natural"] },
  { name: "czekoladowy brąz", hex: "#5B3B2E", role: "neutral", temperature: 1, depth: 3, saturation: 2, tags: ["classic", "natural"] },
  { name: "espresso", hex: "#34251F", role: "neutral", temperature: 1, depth: 3, saturation: 1, tags: ["classic", "business", "minimal"] },
  { name: "mahoń", hex: "#5A2D2C", role: "neutral", temperature: 1, depth: 3, saturation: 2, tags: ["classic", "fashion"] },
  { name: "ciepły granat", hex: "#27384A", role: "neutral", temperature: 1, depth: 3, saturation: 2, tags: ["classic", "business"] },
  { name: "neutralny granat", hex: "#26364B", role: "neutral", temperature: 0, depth: 3, saturation: 2, tags: ["classic", "business"] },
  { name: "atramentowy granat", hex: "#202B44", role: "neutral", temperature: -1, depth: 3, saturation: 2, tags: ["classic", "business", "fashion"] },
  { name: "denim", hex: "#5A718A", role: "both", temperature: -1, depth: 2, saturation: 1, tags: ["casual", "natural"] },
  { name: "jasny denim", hex: "#91A8BD", role: "both", temperature: -1, depth: 1, saturation: 1, tags: ["casual", "soft"], eyeAffinity: ["blue", "grey"] },

  // Zieleń / turkus
  { name: "szałwia", hex: "#98A48D", role: "accent", temperature: 0, depth: 2, saturation: 1, tags: ["soft", "natural"], eyeAffinity: ["green", "hazel"] },
  { name: "jasna oliwka", hex: "#A4A06F", role: "both", temperature: 2, depth: 1, saturation: 1, tags: ["natural", "soft"], eyeAffinity: ["green", "hazel"] },
  { name: "oliwkowy", hex: "#747640", role: "both", temperature: 2, depth: 2, saturation: 1, tags: ["natural", "fashion"], eyeAffinity: ["green", "hazel", "brown"] },
  { name: "ciemna oliwka", hex: "#454A2B", role: "both", temperature: 2, depth: 3, saturation: 1, tags: ["natural", "classic"], eyeAffinity: ["green", "hazel", "brown"] },
  { name: "leśna zieleń", hex: "#27513B", role: "accent", temperature: 0, depth: 3, saturation: 2, tags: ["classic", "fashion"], eyeAffinity: ["green", "hazel", "brown"] },
  { name: "szmaragd", hex: "#087F66", role: "accent", temperature: -1, depth: 2, saturation: 3, tags: ["bold", "fashion"], eyeAffinity: ["green", "brown"] },
  { name: "mięta", hex: "#A5D0BE", role: "accent", temperature: -1, depth: 1, saturation: 2, tags: ["fresh", "soft"], eyeAffinity: ["green", "grey"] },
  { name: "jasny turkus", hex: "#55B9B5", role: "accent", temperature: 1, depth: 1, saturation: 3, tags: ["fresh", "bold"], eyeAffinity: ["blue", "green", "brown"] },
  { name: "turkus", hex: "#149B9B", role: "accent", temperature: 0, depth: 2, saturation: 3, tags: ["bold", "fashion"], eyeAffinity: ["blue", "green", "brown"] },
  { name: "przygaszony morski", hex: "#4F7E7A", role: "accent", temperature: -1, depth: 2, saturation: 1, tags: ["soft", "classic"], eyeAffinity: ["blue", "green", "grey"] },
  { name: "petrol", hex: "#28636A", role: "accent", temperature: 0, depth: 2, saturation: 2, tags: ["classic", "fashion"], eyeAffinity: ["blue", "green", "hazel", "brown"] },
  { name: "głęboki petrol", hex: "#16464B", role: "accent", temperature: 0, depth: 3, saturation: 2, tags: ["classic", "fashion"], eyeAffinity: ["green", "hazel", "brown"] },

  // Niebieskie
  { name: "lodowy błękit", hex: "#C9DFEA", role: "accent", temperature: -2, depth: 1, saturation: 2, tags: ["fresh", "clean"], eyeAffinity: ["blue", "grey"] },
  { name: "przygaszony błękit", hex: "#7E9CAD", role: "accent", temperature: -1, depth: 2, saturation: 1, tags: ["soft", "classic"], eyeAffinity: ["blue", "grey"] },
  { name: "stalowoniebieski", hex: "#55738C", role: "accent", temperature: -2, depth: 2, saturation: 2, tags: ["classic", "business"], eyeAffinity: ["blue", "grey"] },
  { name: "kobalt", hex: "#2455C3", role: "accent", temperature: -2, depth: 2, saturation: 3, tags: ["bold", "fashion"], eyeAffinity: ["blue", "brown"] },
  { name: "królewski niebieski", hex: "#234CA4", role: "accent", temperature: -2, depth: 3, saturation: 3, tags: ["bold", "classic"], eyeAffinity: ["blue", "brown"] },

  // Róże / czerwienie / fiolety
  { name: "pudrowy róż", hex: "#D9B6B7", role: "accent", temperature: -1, depth: 1, saturation: 1, tags: ["soft", "feminine"] },
  { name: "dusty rose", hex: "#B47D86", role: "accent", temperature: -1, depth: 2, saturation: 1, tags: ["soft", "feminine"] },
  { name: "rosewood", hex: "#9B5B62", role: "accent", temperature: 0, depth: 2, saturation: 1, tags: ["soft", "classic", "feminine"] },
  { name: "ciepły róż", hex: "#D97979", role: "accent", temperature: 1, depth: 2, saturation: 2, tags: ["feminine", "fresh"] },
  { name: "brzoskwiniowy", hex: "#E7A17E", role: "accent", temperature: 2, depth: 1, saturation: 2, tags: ["fresh", "feminine"] },
  { name: "morelowy", hex: "#DD906A", role: "accent", temperature: 2, depth: 2, saturation: 2, tags: ["fresh", "feminine"] },
  { name: "łososiowy", hex: "#D97967", role: "accent", temperature: 2, depth: 2, saturation: 2, tags: ["feminine", "fresh"] },
  { name: "koral", hex: "#E35B4F", role: "accent", temperature: 2, depth: 2, saturation: 3, tags: ["bold", "feminine"] },
  { name: "ceglasty róż", hex: "#A95D55", role: "accent", temperature: 1, depth: 2, saturation: 2, tags: ["classic", "feminine"] },
  { name: "terakota", hex: "#B75E3E", role: "accent", temperature: 2, depth: 2, saturation: 2, tags: ["natural", "fashion"] },
  { name: "rdzawy", hex: "#9C4E2E", role: "accent", temperature: 2, depth: 3, saturation: 2, tags: ["natural", "fashion"] },
  { name: "pomidorowa czerwień", hex: "#D23B2F", role: "accent", temperature: 2, depth: 2, saturation: 3, tags: ["bold", "classic"] },
  { name: "neutralna czerwień", hex: "#B72F3C", role: "accent", temperature: 0, depth: 2, saturation: 3, tags: ["bold", "classic"] },
  { name: "chłodna czerwień", hex: "#B51F42", role: "accent", temperature: -2, depth: 2, saturation: 3, tags: ["bold", "classic"] },
  { name: "malinowy", hex: "#B93868", role: "accent", temperature: -2, depth: 2, saturation: 3, tags: ["bold", "feminine"] },
  { name: "wiśniowy", hex: "#8A1F3D", role: "accent", temperature: -2, depth: 3, saturation: 3, tags: ["classic", "bold"] },
  { name: "ciepły burgund", hex: "#71363A", role: "accent", temperature: 1, depth: 3, saturation: 2, tags: ["classic", "fashion"] },
  { name: "chłodny burgund", hex: "#632D49", role: "accent", temperature: -1, depth: 3, saturation: 2, tags: ["classic", "fashion"] },
  { name: "śliwkowy", hex: "#62465F", role: "accent", temperature: -1, depth: 3, saturation: 1, tags: ["soft", "classic"] },
  { name: "jagodowy", hex: "#70405F", role: "accent", temperature: -2, depth: 2, saturation: 2, tags: ["feminine", "fashion"] },
  { name: "lawendowy", hex: "#B5A2C9", role: "accent", temperature: -2, depth: 1, saturation: 1, tags: ["soft", "feminine"] },
  { name: "fuksja", hex: "#C52C78", role: "accent", temperature: -2, depth: 2, saturation: 3, tags: ["bold", "fashion"] },

  // Żółcie / metaliczne ciepło
  { name: "musztardowy", hex: "#B48A2B", role: "accent", temperature: 2, depth: 2, saturation: 2, tags: ["fashion", "natural"] },
  { name: "złocisty żółty", hex: "#D5A72E", role: "accent", temperature: 2, depth: 2, saturation: 3, tags: ["bold", "fashion"] },
];

export const WHITE_OPTIONS = [
  { name: "śnieżna biel", temperature: -2, contrast: 3, softness: 1 },
  { name: "chłodna biel", temperature: -1, contrast: 2, softness: 2 },
  { name: "neutralna biel", temperature: 0, contrast: 2, softness: 2 },
  { name: "złamana biel", temperature: 0, contrast: 1, softness: 3 },
  { name: "kość słoniowa", temperature: 1, contrast: 1, softness: 3 },
  { name: "kremowa biel", temperature: 2, contrast: 1, softness: 3 },
  { name: "ecru", temperature: 1, contrast: 1, softness: 3 },
  { name: "waniliowa biel", temperature: 2, contrast: 2, softness: 2 },
] as const;

export const BLACK_ALTERNATIVES = [
  { name: "czysta czerń", temperature: -1, depth: 3, contrast: 3 },
  { name: "miękka czerń", temperature: 0, depth: 3, contrast: 2 },
  { name: "antracyt", temperature: -2, depth: 3, contrast: 2 },
  { name: "grafit", temperature: -1, depth: 3, contrast: 2 },
  { name: "atramentowy granat", temperature: -1, depth: 3, contrast: 2 },
  { name: "neutralny granat", temperature: 0, depth: 3, contrast: 2 },
  { name: "ciepły granat", temperature: 1, depth: 3, contrast: 2 },
  { name: "espresso", temperature: 1, depth: 3, contrast: 1 },
  { name: "gorzka czekolada", temperature: 2, depth: 3, contrast: 1 },
  { name: "ciemne kakao", temperature: 0, depth: 3, contrast: 1 },
  { name: "głęboka oliwka", temperature: 2, depth: 3, contrast: 1 },
] as const;

export const MAKEUP_LIBRARY = {
  warmLight: {
    blush: ["brzoskwiniowy róż", "morelowy róż"],
    lips: ["ciepły nude", "łososiowy róż", "koral"],
    eyes: ["jasny taupe", "miodowy beż", "jasna oliwka"],
    bronzer: ["jasny neutralno-ciepły brąz"],
  },
  warmMedium: {
    blush: ["przygaszony brzoskwiniowy", "ceglasty róż"],
    lips: ["rosewood", "ciepły nude", "terakota"],
    eyes: ["taupe", "oliwka", "czekoladowy brąz"],
    bronzer: ["neutralno-ciepły brąz bez pomarańczowych tonów"],
  },
  warmDeep: {
    blush: ["ceglasty róż", "głęboka terakota"],
    lips: ["głęboki rosewood", "ceglasta czerwień", "ciepły burgund"],
    eyes: ["gorzka czekolada", "ciemna oliwka", "miedziany brąz"],
    bronzer: ["głęboki neutralno-ciepły brąz"],
  },
  neutralLight: {
    blush: ["neutralny jasny róż", "delikatna brzoskwinia"],
    lips: ["neutralny nude", "rosewood", "miękki róż"],
    eyes: ["greige", "jasny taupe", "miękki brąz"],
    bronzer: ["neutralny jasny brąz"],
  },
  neutralMedium: {
    blush: ["rosewood", "neutralny róż"],
    lips: ["rosewood", "neutralna czerwień", "przygaszony burgund"],
    eyes: ["taupe", "kakao", "przygaszona śliwka"],
    bronzer: ["neutralny taupe-brąz"],
  },
  neutralDeep: {
    blush: ["głęboki rosewood", "neutralny malinowy"],
    lips: ["burgund", "głęboki rosewood", "neutralna czerwień"],
    eyes: ["espresso", "grafitowy taupe", "śliwka"],
    bronzer: ["głęboki neutralny brąz"],
  },
  coolLight: {
    blush: ["chłodny jasny róż", "dusty rose"],
    lips: ["malinowy nude", "chłodny róż", "jasny rosewood"],
    eyes: ["gołębi taupe", "lawendowy", "chłodny beż"],
    bronzer: ["jasny neutralno-chłodny taupe"],
  },
  coolMedium: {
    blush: ["dusty rose", "chłodny róż"],
    lips: ["rosewood", "malinowy", "chłodna czerwień"],
    eyes: ["taupe", "grafit", "przygaszona śliwka"],
    bronzer: ["neutralny taupe-brąz bez pomarańczowych tonów"],
  },
  coolDeep: {
    blush: ["malinowy róż", "chłodny głęboki róż"],
    lips: ["wiśniowy", "chłodny burgund", "chłodna czerwień"],
    eyes: ["grafit", "głęboki chłodny brąz", "śliwka"],
    bronzer: ["głęboki neutralno-chłodny brąz"],
  },
} as const;

export const HAIR_LIBRARY = {
  warmLight: {
    recommended: ["miodowy blond", "beżowo-złoty blond", "jasny karmel", "truskawkowy blond"],
    avoid: ["lodowy blond", "bardzo srebrzysty blond", "bardzo ciemna czerń"],
  },
  warmMedium: {
    recommended: ["ciepły ciemny blond", "karmel", "kasztanowy brąz", "czekoladowy brąz", "delikatna miedź"],
    avoid: ["bardzo popielaty brąz", "niebieskawa czerń", "lodowy blond"],
  },
  warmDeep: {
    recommended: ["espresso o ciepłej bazie", "gorzka czekolada", "kasztan", "mahoń", "ciemny karmel"],
    avoid: ["bardzo jasny chłodny blond", "srebrzysty blond", "bardzo popielaty brąz"],
  },
  neutralLight: {
    recommended: ["neutralny beżowy blond", "jasny neutralny brąz", "piaskowy blond", "delikatny karmel"],
    avoid: ["skrajnie złoty blond", "skrajnie popielaty blond", "bardzo ciemna czerń"],
  },
  neutralMedium: {
    recommended: ["neutralny brąz", "beżowy ciemny blond", "mushroom brown", "miękka czekolada"],
    avoid: ["bardzo pomarańczowa miedź", "niebieskawa czerń"],
  },
  neutralDeep: {
    recommended: ["neutralne espresso", "głęboki neutralny brąz", "ciemna czekolada", "miękka czerń"],
    avoid: ["bardzo jasny złoty blond", "bardzo popielaty jasny blond"],
  },
  coolLight: {
    recommended: ["perłowy blond", "beżowo-chłodny blond", "popielaty blond", "neutralny ciemny blond"],
    avoid: ["bardzo żółty blond", "mocno miedziany", "bardzo ciemna czerń"],
  },
  coolMedium: {
    recommended: ["chłodny brąz", "mushroom brown", "popielaty ciemny blond", "beżowy blond"],
    avoid: ["pomarańczowe refleksy", "mocny karmel", "złocista miedź"],
  },
  coolDeep: {
    recommended: ["głęboki chłodny brąz", "espresso", "bardzo ciemny neutralny brąz", "naturalna chłodna czerń"],
    avoid: ["miodowy blond", "złoty blond", "intensywna miedź"],
  },
} as const;

export const CAUTION_LIBRARY = {
  warm: ["lodowy błękit", "chłodna fuksja", "srebrzysta szarość", "optyczna biel", "niebieskawy fiolet"],
  cool: ["musztardowy", "pomarańczowy", "bardzo ciepły camel", "złocisty beż", "rdzawy"],
  light: ["czysta czerń", "bardzo ciemny burgund", "gorzka czekolada", "bardzo głęboki granat"],
  deep: ["kredowy pastelowy róż", "bardzo blady beż", "rozwodniona mięta", "bardzo blade żółcie"],
  soft: ["neonowy róż", "elektryczny kobalt", "bardzo czysta czerwień", "neonowy turkus"],
  clear: ["szarawy taupe", "bardzo przygaszona oliwka", "brudne pastele", "przykurzony brąz"],
} as const;

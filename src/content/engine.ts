import type { Answers } from "./funnel";
import {
  BLACK_ALTERNATIVES,
  CAUTION_LIBRARY,
  COLOR_LIBRARY,
  HAIR_LIBRARY,
  MAKEUP_LIBRARY,
  WHITE_OPTIONS,
  type ColorEntry,
  type Contrast,
  type Depth,
  type Saturation,
  type Temperature,
} from "./resultLibrary";

export type PhotoAnalysis = {
  temperature: Temperature;
  depth: Depth;
  saturation: Saturation;
  contrast: Contrast;
};

export type ColorRecommendation = {
  name: string;
  hex: string;
};

export type ColorReport = {
  profile: string;
  profileDetails: string[];
  palette: ColorRecommendation[];
  baseColors: ColorRecommendation[];
  accents: ColorRecommendation[];
  bestWhite: { name: string; reason: string };
  blackAlternative: { name: string; reason: string };
  metal: { primary: string; secondary: string; avoid?: string; reason: string };
  makeup: {
    colors: string[];
    blush: string[];
    lips: string[];
    eyes: string[];
    bronzer: string[];
    priorityAdvice?: string | undefined;
  };
  hair: {
    recommended: string[];
    avoid: string[];
    personalizedAdvice: string;
  };
  cautionColors: string[];
  cautionNote: string;
  outfit: string;
  personalizationNotes: string[];
};

type NumericTemperature = -2 | -1 | 0 | 1 | 2;

const temperatureValue: Record<Temperature, NumericTemperature> = {
  chłodna: -2,
  "neutralno-chłodna": -1,
  neutralna: 0,
  "neutralno-ciepła": 1,
  ciepła: 2,
};

const depthValue: Record<Depth, 1 | 2 | 3> = {
  jasna: 1,
  średnia: 2,
  głęboka: 3,
};

const saturationValue: Record<Saturation, 1 | 2 | 3> = {
  miękka: 1,
  umiarkowana: 2,
  czysta: 3,
};

const contrastValue: Record<Contrast, 1 | 2 | 3> = {
  niski: 1,
  średni: 2,
  wysoki: 3,
};

function str(answers: Answers, id: string): string {
  const value = answers[id];
  return typeof value === "string" ? value : "";
}

function list(answers: Answers, id: string): string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : value ? [String(value)] : [];
}

function has(answers: Answers, id: string, phrase: string) {
  return list(answers, id).some((v) => v.includes(phrase));
}

function ageGroup(answers: Answers) {
  const age = str(answers, "age");
  if (age.includes("25–35")) return "25-35";
  if (age.includes("36–55")) return "36-55";
  return "56+";
}

function eyeFamily(eye: string): "blue" | "green" | "hazel" | "brown" | "grey" | null {
  const lower = eye.toLowerCase();
  if (lower.includes("zielono-piwn") || lower.includes("piwn")) return "hazel";
  if (lower.includes("zielon")) return "green";
  if (lower.includes("niebies")) return "blue";
  if (lower.includes("szar")) return "grey";
  if (lower.includes("brąz")) return "brown";
  return null;
}

function styleTags(answers: Answers): string[] {
  const style = `${str(answers, "style")} ${str(answers, "workStyle")} ${str(answers, "wardrobeState")}`.toLowerCase();
  const tags: string[] = [];
  if (style.includes("minimal")) tags.push("minimal", "clean");
  if (style.includes("kobiec") || style.includes("mięk")) tags.push("feminine", "soft");
  if (style.includes("klasy") || style.includes("elegan") || style.includes("formal") || style.includes("biznes")) tags.push("classic", "business");
  if (style.includes("modow") || style.includes("kreatyw")) tags.push("fashion", "bold");
  if (style.includes("swobod") || style.includes("natural") || style.includes("codzien")) tags.push("natural", "casual");
  return tags;
}

function opennessMode(answers: Answers): "neutral" | "balanced" | "colorful" {
  const raw = `${str(answers, "colorOpenness")} ${str(answers, "wardrobeState")}`.toLowerCase();
  if (raw.includes("głównie w neutral") || raw.includes("klasyczne i neutralne")) return "neutral";
  if (raw.includes("mocne") || raw.includes("bardzo lubię kolor") || raw.includes("sporo kolorów") || raw.includes("eksperyment")) return "colorful";
  return "balanced";
}

function desiredContrastBias(answers: Answers): number {
  const raw = `${str(answers, "desiredEffect")} ${str(answers, "contrastPreference")}`.toLowerCase();
  if (raw.includes("większy kontrast") || raw.includes("mocny i bardzo wyrazisty") || raw.includes("wyraźny i zdecydowany")) return 0.5;
  if (raw.includes("miękki") || raw.includes("delikatnie współgra")) return -0.5;
  return 0;
}

function colorScore(color: ColorEntry, photo: PhotoAnalysis, answers: Answers, role: "palette" | "base" | "accent") {
  const t = temperatureValue[photo.temperature];
  const d = depthValue[photo.depth];
  const s = saturationValue[photo.saturation];
  const c = contrastValue[photo.contrast] + desiredContrastBias(answers);

  let score = 100;
  score -= Math.abs(color.temperature - t) * 17;
  score -= Math.abs(color.depth - d) * 11;
  score -= Math.abs(color.saturation - s) * (role === "base" ? 5 : 10);

  if (role === "base") {
    if (color.role === "accent") score -= 35;
    if (color.role === "neutral") score += 12;
    if (color.saturation === 3) score -= 7;
    if (color.depth === d) score += 6;
  }

  if (role === "accent") {
    if (color.role === "neutral") score -= 28;
    if (color.role === "accent") score += 10;
    if (c >= 2.5 && color.saturation === 3) score += 8;
    if (c <= 1.5 && color.saturation === 1) score += 8;
  }

  const tags = styleTags(answers);
  const matches = color.tags?.filter((tag) => tags.includes(tag)).length ?? 0;
  score += matches * 4;

  const eye = eyeFamily(str(answers, "eyes"));
  if (role === "accent" && eye && color.eyeAffinity?.includes(eye)) score += 10;

  const openness = opennessMode(answers);
  if (openness === "neutral") {
    if (color.role === "neutral") score += 9;
    if (color.saturation === 3) score -= 10;
  }
  if (openness === "colorful" && role !== "base") {
    if (color.role === "accent") score += 8;
    if (color.saturation === 3) score += 5;
  }

  // Cele deklarowane w quizie wpływają na ranking, ale nie zmieniają diagnozy ze zdjęcia.
  const desired = str(answers, "desiredEffect").toLowerCase();
  if (desired.includes("wyraziste oczy") && eye && color.eyeAffinity?.includes(eye)) score += 8;
  if (desired.includes("promienną") && color.depth <= d && color.saturation <= Math.max(2, s)) score += 3;
  if ((desired.includes("cienie") || desired.includes("zaczerwien")) && color.saturation === 1) score += 3;

  return score;
}

function topColors(photo: PhotoAnalysis, answers: Answers, role: "palette" | "base" | "accent", count: number) {
  const sorted = COLOR_LIBRARY
    .map((color) => ({ color, score: colorScore(color, photo, answers, role) }))
    .sort((a, b) => b.score - a.score);

  const chosen: ColorEntry[] = [];
  for (const { color } of sorted) {
    if (role === "base" && color.role === "accent") continue;
    if (role === "accent" && color.role === "neutral") continue;
    if (!chosen.some((x) => x.name === color.name)) chosen.push(color);
    if (chosen.length >= count) break;
  }
  return chosen;
}

function mergePalette(base: ColorEntry[], accents: ColorEntry[], general: ColorEntry[], count = 16) {
  const all = [...base, ...accents, ...general];
  const unique: ColorEntry[] = [];
  for (const item of all) {
    if (!unique.some((x) => x.name === item.name)) unique.push(item);
    if (unique.length >= count) break;
  }
  return unique;
}

function userWhiteBias(answers: Answers): number {
  const white = str(answers, "white").toLowerCase();
  if (white.includes("czysta") || white.includes("chłodna")) return -0.6;
  if (white.includes("krem") || white.includes("ecru") || white.includes("kość słoniowa")) return 0.6;
  return 0;
}

function chooseWhite(photo: PhotoAnalysis, answers: Answers) {
  const t = temperatureValue[photo.temperature] + userWhiteBias(answers);
  const contrast = contrastValue[photo.contrast];
  const softTarget = photo.saturation === "miękka" ? 3 : photo.saturation === "czysta" ? 1 : 2;

  const best = [...WHITE_OPTIONS]
    .map((w) => ({
      ...w,
      score:
        100 -
        Math.abs(w.temperature - t) * 18 -
        Math.abs(w.contrast - contrast) * 7 -
        Math.abs(w.softness - softTarget) * 9,
    }))
    .sort((a, b) => b.score - a.score)[0]!;

  const reason = photo.saturation === "miękka"
    ? `${best.name} rozświetla twarz bez tworzenia zbyt ostrego kontrastu. Twoje nasycenie jest miękkie, więc łagodniejsza biel zwykle wygląda bardziej harmonijnie.`
    : `${best.name} najlepiej równoważy temperaturę (${photo.temperature}) i naturalny kontrast (${photo.contrast}).`;

  return { name: best.name, reason };
}

function blackSelfReportPenalty(name: string, answers: Answers) {
  const black = str(answers, "black").toLowerCase();
  if (!black) return 0;
  const isBlack = name.includes("czerń");
  if (black.includes("bardzo dobrze") && isBlack) return 12;
  if ((black.includes("przytłacza") || black.includes("zmęcz") || black.includes("cienie") || black.includes("głównie wtedy, kiedy mam makijaż")) && isBlack) return -22;
  return 0;
}

function chooseBlackAlternative(photo: PhotoAnalysis, answers: Answers) {
  const t = temperatureValue[photo.temperature];
  const d = depthValue[photo.depth];
  const c = contrastValue[photo.contrast];

  const best = [...BLACK_ALTERNATIVES]
    .map((x) => ({
      ...x,
      score:
        100 -
        Math.abs(x.temperature - t) * 14 -
        Math.abs(x.depth - Math.max(2, d)) * 10 -
        Math.abs(x.contrast - c) * 11 +
        blackSelfReportPenalty(x.name, answers),
    }))
    .sort((a, b) => b.score - a.score)[0]!;

  const reason = best.name.includes("czerń")
    ? `Czerń jest spójna z Twoją głębią (${photo.depth}) i naturalnym kontrastem (${photo.contrast}).`
    : `${best.name} daje podobną elegancję i głębię jak czerń, ale lepiej współgra z temperaturą (${photo.temperature}) i naturalnym kontrastem (${photo.contrast}).`;

  return { name: best.name, reason };
}

function chooseMetal(photo: PhotoAnalysis, answers: Answers) {
  const t = temperatureValue[photo.temperature];
  const declared = str(answers, "jewelry").toLowerCase();

  if (t >= 2) {
    return {
      primary: "żółte złoto",
      secondary: "szampańskie lub różowe złoto",
      avoid: "bardzo jasne, chłodne srebro",
      reason: "Ciepły metal podkreśla naturalne ciepło Twojej kolorystyki.",
    };
  }
  if (t <= -2) {
    return {
      primary: "srebro lub białe złoto",
      secondary: "platyna lub chłodne różowe złoto",
      avoid: "bardzo intensywne żółte złoto",
      reason: "Chłodne metale najlepiej harmonizują z temperaturą Twojej skóry i kontrastem twarzy.",
    };
  }

  if (t === 1) {
    return {
      primary: declared.includes("srebr") ? "neutralne, mniej błyszczące złoto" : "delikatne żółte złoto",
      secondary: "różowe złoto lub mieszane metale",
      reason: "Masz neutralno-ciepłą bazę, więc najlepiej działają metale ciepłe, ale niezbyt żółte.",
    };
  }
  if (t === -1) {
    return {
      primary: declared.includes("złot") ? "chłodne różowe złoto" : "srebro lub białe złoto",
      secondary: "mieszane metale o chłodniejszym wykończeniu",
      reason: "Masz neutralno-chłodną bazę, więc najlepiej sprawdzają się metale chłodne lub neutralne.",
    };
  }

  // Neutralny typ: własna obserwacja użytkowniczki może rozstrzygnąć remis.
  if (declared.includes("złot") && !declared.includes("srebr")) {
    return {
      primary: "neutralne żółte złoto",
      secondary: "srebro lub różowe złoto",
      reason: "Twoja baza jest neutralna; deklarowana dobra relacja ze złotem może być praktycznym tie-breakerem.",
    };
  }
  if (declared.includes("srebr") || declared.includes("białym złocie")) {
    return {
      primary: "srebro lub białe złoto",
      secondary: "neutralne złoto",
      reason: "Twoja baza jest neutralna, więc możesz nosić oba metale; srebro będzie najbezpieczniejszym pierwszym wyborem.",
    };
  }
  return {
    primary: "zarówno złoto, jak i srebro",
    secondary: "różowe złoto i mieszane metale",
    reason: "Neutralna temperatura pozwala Ci swobodnie łączyć metale; ważniejsza jest ich intensywność niż sam kolor.",
  };
}

function makeupKey(photo: PhotoAnalysis) {
  const temp = temperatureValue[photo.temperature];
  const t = temp > 0 ? "warm" : temp < 0 ? "cool" : "neutral";
  const d = photo.depth === "jasna" ? "Light" : photo.depth === "głęboka" ? "Deep" : "Medium";
  return `${t}${d}` as keyof typeof MAKEUP_LIBRARY;
}

function makeupPriorityAdvice(answers: Answers, makeup: (typeof MAKEUP_LIBRARY)[keyof typeof MAKEUP_LIBRARY]) {
  const problems = list(answers, "makeupProblem");
  const makeupStyle = str(answers, "makeupStyle");
  const notes: string[] = [];

  if (problems.some((x) => x.includes("Pomadka") || x.includes("Konturówka"))) {
    notes.push(`Jeśli chcesz zacząć od jednego produktu do ust, wybierz ${makeup.lips[0]}; mocniejszą opcją będzie ${makeup.lips[2] ?? makeup.lips[1]}.`);
  }
  if (problems.some((x) => x.includes("Róż"))) {
    notes.push(`Najbezpieczniejszy róż dla Ciebie to ${makeup.blush[0]}.`);
  }
  if (problems.some((x) => x.includes("Cienie") || x.includes("Kredka") || x.includes("eyeliner"))) {
    notes.push(`Przy oczach zacznij od odcieni: ${makeup.eyes[0]} i ${makeup.eyes[1] ?? makeup.eyes[0]}.`);
  }
  if (problems.some((x) => x.includes("Bronzer"))) {
    notes.push(`W bronzerze szukaj odcienia: ${makeup.bronzer[0]}.`);
  }
  if (problems.some((x) => x.includes("Podkład") || x.includes("Korektor"))) {
    notes.push("Przy podkładzie i korektorze kieruj się przede wszystkim zgodnością z naturalnym odcieniem skóry na szyi; paleta kolorystyczna nie zastępuje doboru odcienia produktu do cery.");
  }
  if (makeupStyle.includes("Prawie wcale") || makeupStyle.includes("kilku podstawowych")) {
    notes.push(`Minimalny zestaw: ${makeup.blush[0]} + ${makeup.lips[0]} + ${makeup.eyes[0]}.`);
  }
  return notes.join(" ") || undefined;
}

function buildMakeup(photo: PhotoAnalysis, answers: Answers) {
  const makeup = MAKEUP_LIBRARY[makeupKey(photo)];
  const colors = [...new Set([makeup.blush[0], makeup.lips[0], makeup.lips[1], makeup.eyes[0], makeup.bronzer[0]].filter(Boolean))].slice(0, 5);
  return {
    colors,
    blush: [...makeup.blush],
    lips: [...makeup.lips],
    eyes: [...makeup.eyes],
    bronzer: [...makeup.bronzer],
    priorityAdvice: makeupPriorityAdvice(answers, makeup),
  };
}

function hairKey(photo: PhotoAnalysis) {
  const temp = temperatureValue[photo.temperature];
  const t = temp > 0 ? "warm" : temp < 0 ? "cool" : "neutral";
  const d = photo.depth === "jasna" ? "Light" : photo.depth === "głęboka" ? "Deep" : "Medium";
  return `${t}${d}` as keyof typeof HAIR_LIBRARY;
}

function buildHair(photo: PhotoAnalysis, answers: Answers) {
  const base = HAIR_LIBRARY[hairKey(photo)];
  let recommended = [...base.recommended];
  let avoid = [...base.avoid];
  const natural = str(answers, "naturalHair");
  const current = str(answers, "currentHair");
  const change = str(answers, "hairChange");
  const effect = str(answers, "hairEffect");
  const goal = str(answers, "hairGoal");
  const greyApproach = str(answers, "greyHairApproach");
  const greyGoal = str(answers, "greyHairColorGoal");
  const notes: string[] = [];

  if (effect.includes("Jaśniejszy") || goal.includes("blondu")) {
    recommended = recommended.sort((a, b) => Number(b.includes("blond") || b.includes("karmel")) - Number(a.includes("blond") || a.includes("karmel")));
    notes.push(`Ponieważ zależy Ci na jaśniejszym efekcie, pierwszeństwo mają ${recommended.slice(0, 2).join(" i ")}.`);
  }
  if (effect.includes("Głębszy") || goal.includes("ciemniejsze")) {
    recommended = recommended.sort((a, b) => Number(b.includes("ciem") || b.includes("espresso") || b.includes("brąz")) - Number(a.includes("ciem") || a.includes("espresso") || a.includes("brąz")));
    notes.push(`Przy głębszym efekcie najlepszym kierunkiem będą ${recommended.slice(0, 2).join(" i ")}.`);
  }
  if (effect.includes("Ciepły")) notes.push("Jeśli wybierzesz cieplejszą koloryzację, trzymaj ją w granicach rekomendowanej temperatury i unikaj bardzo pomarańczowych refleksów.");
  if (effect.includes("Chłodny")) notes.push("Jeśli chcesz chłodniejszego efektu, wybieraj odcienie beżowe lub popielate zgodne z rekomendowaną temperaturą, nie skrajnie srebrne.");

  const isGrey = current.toLowerCase().includes("siwe") || current.toLowerCase().includes("srebrne") || current.toLowerCase().includes("białe");
  if (isGrey) {
    if (temperatureValue[photo.temperature] <= 0) {
      notes.push("Naturalne srebrne i chłodne siwe tony mogą bardzo dobrze współgrać z Twoją kolorystyką; wspieraj je chłodnymi neutralami przy twarzy.");
    } else {
      notes.push("Jeśli siwizna jest chłodniejsza od Twojej naturalnej kolorystyki, równoważ ją cieplejszymi neutralami, metalem i makijażem przy twarzy.");
    }
    if (greyApproach.includes("podkreślić") || greyGoal) notes.push("W garderobie szczególnie ważne będą kolory przy twarzy, które nie tworzą efektu szarości skóry.");
    if (greyGoal.includes("promienną")) notes.push("Przy siwych włosach priorytetem będą jaśniejsze, harmonijne kolory blisko twarzy, które dodają cerze światła.");
    if (greyGoal.includes("elegancko")) notes.push("Dla bardziej eleganckiego efektu stawiaj na spójne, średnio nasycone kolory i metal zgodny z temperaturą urody.");
    if (greyGoal.includes("szarej lub zmęczonej")) notes.push("Unikaj przy twarzy odcieni, które są jednocześnie zbyt szare i zbyt zbliżone do tonu włosów, jeśli gaszą cerę.");
    if (greyGoal.includes("zastąpią")) notes.push("W raporcie potraktuj nowe kolory bazowe jako zamienniki tych odcieni, które sprawdzały się przed zmianą koloru włosów.");
    if (greyGoal.includes("najlepiej nosić blisko twarzy")) notes.push("Największy priorytet mają kolory z palety i akcenty przeznaczone na bluzki, koszule, szale oraz oprawki okularów.");
  }

  if (change.includes("Nie, chcę zostać")) {
    notes.push("Nie musisz zmieniać koloru włosów — potraktuj rekomendacje jako wskazówki przy kolejnej koloryzacji lub doborze refleksów.");
  } else if (change.includes("Być może") || change.includes("Tak, planuję")) {
    notes.push(`Jeśli zdecydujesz się na zmianę, zacznij od jednego z dwóch kierunków: ${recommended.slice(0, 2).join(" lub ")}.`);
  }

  if (natural && natural !== "Trudno mi określić") notes.push(`Twój naturalny kolor (${natural.toLowerCase()}) traktujemy jako ważny punkt odniesienia dla głębi i kontrastu.`);

  return {
    recommended: recommended.slice(0, 5),
    avoid: avoid.slice(0, 3),
    personalizedAdvice: notes.join(" ") || "Trzymaj się temperatury i głębi zgodnej z Twoim profilem; największą różnicę robi odcień przy twarzy, nie sama nazwa koloru na opakowaniu.",
  };
}

function buildCautionColors(photo: PhotoAnalysis, answers: Answers) {
  const groups: string[][] = [];
  const t = temperatureValue[photo.temperature];
  if (t > 0) groups.push([...CAUTION_LIBRARY.warm]);
  if (t < 0) groups.push([...CAUTION_LIBRARY.cool]);
  if (photo.depth === "jasna") groups.push([...CAUTION_LIBRARY.light]);
  if (photo.depth === "głęboka") groups.push([...CAUTION_LIBRARY.deep]);
  if (photo.saturation === "miękka") groups.push([...CAUTION_LIBRARY.soft]);
  if (photo.saturation === "czysta") groups.push([...CAUTION_LIBRARY.clear]);

  const flat = groups.flat();
  const unique = [...new Set(flat)].slice(0, 6);
  const badEffect = str(answers, "badColorEffect");
  const desired = str(answers, "desiredEffect");

  let note = "Nie są to kolory zakazane. Jeśli je lubisz, noś je dalej od twarzy — np. w spodniach, butach, torebkach lub małych dodatkach.";
  if (badEffect.includes("cienie") || desired.includes("cienie")) note = `Szczególnie obserwuj, czy te odcienie nie wzmacniają cieni pod oczami. ${note}`;
  if (badEffect.includes("zaczerwien") || desired.includes("zaczerwien")) note = `Szczególnie obserwuj, czy te odcienie nie wzmacniają zaczerwienień skóry. ${note}`;
  if (badEffect.includes("szar") || badEffect.includes("zmęcz")) note = `Największym sygnałem ostrzegawczym będzie efekt szarej lub zmęczonej cery. ${note}`;
  return { colors: unique, note };
}

function outfitGarments(answers: Answers) {
  const requested = `${str(answers, "outfit")} ${str(answers, "wardrobeUse")} ${str(answers, "situations")}`.toLowerCase();
  const wardrobeProblem = str(answers, "wardrobeProblem").toLowerCase();
  const refresh = str(answers, "wardrobeRefresh").toLowerCase();
  const combined = `${requested} ${wardrobeProblem} ${refresh}`;

  if (combined.includes("pracy") || combined.includes("biznes") || combined.includes("spotkań biznesowych") || combined.includes("prezentacji")) {
    return ["spodnie o prostym kroju", "koszula", "marynarka", "torebka lub buty"];
  }
  if (combined.includes("randkę") || combined.includes("kolację")) {
    return ["spódnica lub eleganckie spodnie", "top", "lekka marynarka", "torebka"];
  }
  if (combined.includes("specjal") || combined.includes("większe") || combined.includes("elegan")) {
    return ["sukienka lub garnitur", "lekka warstwa", "buty", "biżuteria"];
  }
  if (combined.includes("swetry")) return ["spodnie", "sweter", "lekki płaszcz", "torebka"];
  if (combined.includes("sukienki")) return ["sukienka", "marynarka lub kardigan", "buty", "biżuteria"];
  if (combined.includes("płaszcze") || combined.includes("kurtki")) return ["spodnie", "top", "płaszcz lub kurtka", "szal"];
  return ["spodnie lub jeansy", "top", "dodatkowa warstwa", "torebka lub buty"];
}

function buildOutfit(base: ColorEntry[], accents: ColorEntry[], white: { name: string }, metal: ColorReport["metal"], answers: Answers) {
  const garments = outfitGarments(answers);
  const style = str(answers, "style").toLowerCase();
  const openness = opennessMode(answers);
  const occasion = `${str(answers, "outfit")} ${str(answers, "wardrobeUse")} ${str(answers, "situations")}`.toLowerCase();
  const accent = accents[0]?.name ?? "kolor akcentowy z Twojej palety";
  const secondAccent = accents[1]?.name ?? accent;
  const b1 = base[0]?.name ?? "głęboki neutral";
  const b2 = base[1]?.name ?? "drugi neutral";

  if (occasion.includes("specjal") || occasion.includes("większe wyjście") || occasion.includes("większych wydarzeń")) {
    return `Sukienka lub garnitur w kolorze: ${accent}; lekka warstwa albo dodatki w kolorze: ${b1}; buty w kolorze: ${b2}; biżuteria: ${metal.primary}.`;
  }
  if (occasion.includes("randkę") || occasion.includes("kolację")) {
    return `${garments[0]} w kolorze: ${b1}; ${garments[1]} w odcieniu: ${white.name}; ${garments[2]} w kolorze: ${accent}; ${garments[3]} w kolorze: ${secondAccent}; biżuteria: ${metal.primary}.`;
  }
  if (style.includes("modowo") || openness === "colorful") {
    return `${garments[0]} w kolorze: ${b1}; ${garments[1]} w odcieniu: ${white.name}; ${garments[2]} w kolorze: ${accent}; ${garments[3]} jako drugi akcent: ${secondAccent}; biżuteria: ${metal.primary}.`;
  }
  if (style.includes("kobiec") || style.includes("mięk")) {
    return `${garments[0]} w kolorze: ${b1}; ${garments[1]} w odcieniu: ${white.name}; ${garments[2]} w kolorze: ${b2}; subtelny akcent: ${accent}; biżuteria: ${metal.primary}.`;
  }
  return `${garments[0]} w kolorze: ${b1}; ${garments[1]} w odcieniu: ${white.name}; ${garments[2]} w kolorze: ${b2}; akcent: ${accent}; biżuteria: ${metal.primary}.`;
}

function profileDetails(photo: PhotoAnalysis, answers: Answers) {
  const details = [
    `Temperatura: ${photo.temperature}.`,
    `Głębia: ${photo.depth}.`,
    `Nasycenie: ${photo.saturation}.`,
    `Naturalny kontrast: ${photo.contrast}.`,
  ];
  const black = str(answers, "black");
  const white = str(answers, "white");
  if (black) details.push(`Twoja obserwacja czerni („${black}”) została użyta jako sygnał pomocniczy przy wyborze najciemniejszego neutrala.`);
  if (white) details.push(`Twoja obserwacja jasnych kolorów („${white}”) została użyta jako sygnał pomocniczy przy wyborze bieli.`);
  return details;
}

function personalizationNotes(answers: Answers) {
  const notes: string[] = [];
  const goals = list(answers, "goal");
  if (goals.length) notes.push(`Priorytety analizy: ${goals.join(" + ")}.`);
  if (str(answers, "style")) notes.push(`Styl: ${str(answers, "style")}.`);
  if (str(answers, "colorOpenness")) notes.push(`Otwartość na kolor: ${str(answers, "colorOpenness")}.`);
  if (str(answers, "wardrobeUse")) notes.push(`Główne zastosowanie palety: ${str(answers, "wardrobeUse")}.`);
  if (str(answers, "workStyle")) notes.push(`Kontekst zawodowy: ${str(answers, "workStyle")}.`);
  if (list(answers, "makeupProblem").length) notes.push(`Priorytet makijażowy: ${list(answers, "makeupProblem").join(", ")}.`);
  if (str(answers, "hairGoal") || str(answers, "hairEffect")) notes.push(`Cel dotyczący włosów: ${str(answers, "hairGoal") || str(answers, "hairEffect")}.`);
  if (str(answers, "greyHairApproach")) notes.push(`Podejście do siwienia: ${str(answers, "greyHairApproach")}.`);
  return notes;
}

export function buildColorReport(photo: PhotoAnalysis, answers: Answers): ColorReport {
  const base = topColors(photo, answers, "base", 4);
  const accents = topColors(photo, answers, "accent", 3);
  const general = topColors(photo, answers, "palette", 20);
  const palette = mergePalette(base, accents, general, 16);
  const bestWhite = chooseWhite(photo, answers);
  const blackAlternative = chooseBlackAlternative(photo, answers);
  const metal = chooseMetal(photo, answers);
  const makeup = buildMakeup(photo, answers);
  const hair = buildHair(photo, answers);
  const caution = buildCautionColors(photo, answers);

  const age = ageGroup(answers);
  const ageContext = age === "25-35" ? "Twoje odpowiedzi zostały wykorzystane głównie do personalizacji stylu, zakupów, makijażu i włosów."
    : age === "36-55" ? "Twoje odpowiedzi zostały wykorzystane do połączenia kolorystyki z garderobą, pracą, makijażem i włosami."
    : "Twoje odpowiedzi zostały wykorzystane do dopasowania kolorów do obecnego kontrastu, garderoby, makijażu i ewentualnego siwienia włosów.";

  return {
    profile: `Twoja temperatura kolorystyczna jest ${photo.temperature}; głębia: ${photo.depth}; nasycenie: ${photo.saturation}; naturalny kontrast: ${photo.contrast}.`,
    profileDetails: [...profileDetails(photo, answers), ageContext],
    palette: palette.map(({ name, hex }) => ({ name, hex })),
    baseColors: base.map(({ name, hex }) => ({ name, hex })),
    accents: accents.map(({ name, hex }) => ({ name, hex })),
    bestWhite,
    blackAlternative,
    metal,
    makeup,
    hair,
    cautionColors: caution.colors,
    cautionNote: caution.note,
    outfit: buildOutfit(base, accents, bestWhite, metal, answers),
    personalizationNotes: personalizationNotes(answers),
  };
}

/*
PRODUKCJA:
PhotoAnalysis musi pochodzić z backendu / warstwy analizy obrazu.
Quiz NIE powinien sam diagnozować temperatury, głębi, nasycenia i kontrastu.
Odpowiedzi użytkowniczki są sygnałami pomocniczymi i personalizują raport.
*/

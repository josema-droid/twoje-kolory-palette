// Builds the paid-report dashboard: beauty type, eyes/hair/skin analysis with
// harmonising and enhancing colours, face depth, overall harmony, jewellery and
// makeup with explanations. Pure data in → data out; stored in the report.
import { pl } from "@/content/pl";
import { CELEBRITIES, type Celebrity } from "@/content/celebrities";
import { deltaE, hexToLch, hueDistance, isHex, shade } from "@/lib/color";
import type { ColorEntry, Contrast, Depth, Saturation, Temperature } from "@/content/resultLibrary";
import type { Answers } from "@/content/funnel";

export type Swatch = { name: string; hex: string };
export type FeatureAnalysis = { hex: string; name: string; source: "photo" | "quiz"; harmony: Swatch[]; enhance: Swatch[]; note: string };
export type PhotoFeatures = { eyes?: Swatch | undefined; hair?: Swatch | undefined; skin?: Swatch | undefined };

export type DashboardData = {
  type: { key: string; label: string; seasonKey: string; seasonLabel: string; chips: string[]; description: string; neighbour: { key: string; label: string } };
  /** 0…1 positions for the four profile meters. */
  scales: { temperature: number; depth: number; saturation: number; contrast: number };
  summary: string[];
  features: { eyes: FeatureAnalysis; hair: FeatureAnalysis; skin: FeatureAnalysis };
  depth: { level: Depth; contrast: Contrast; best: Swatch[]; note: string };
  harmony: { principle: string; combos: { title: string; colors: Swatch[]; tip: string }[] };
  jewelry: { metals: { key: "gold" | "silver" | "rose"; label: string; score: number; verdict: string; reason: string }[]; finish: string };
  makeup?: { groups: { key: string; label: string; colors: Swatch[]; why: string }[] } | undefined;
  celebrities: Celebrity[];
  /** Fabrics and finishes that suit the person. Missing on reports saved before it existed. */
  materials?: { best: string[]; avoid: string[]; note: string } | undefined;
};

type Photo = { temperature: Temperature; depth: Depth; saturation: Saturation; contrast: Contrast };

const T: Record<Temperature, number> = { chłodna: -2, "neutralno-chłodna": -1, neutralna: 0, "neutralno-ciepła": 1, ciepła: 2 };
const D: Record<Depth, number> = { jasna: 1, średnia: 2, głęboka: 3 };
const S: Record<Saturation, number> = { miękka: 1, umiarkowana: 2, czysta: 3 };
const C: Record<Contrast, number> = { niski: 1, średni: 2, wysoki: 3 };

const sw = (c: { name: string; hex: string }): Swatch => ({ name: c.name, hex: c.hex });
const list = (items: Swatch[]) => items.map((c) => c.name).join(", ");

/* ---------- 12 beauty types ---------- */

// Typical position of each type on temperature (-2…2), depth, saturation and contrast (1…3).
const TYPE_PROFILES: Record<string, [number, number, number, number]> = {
  "jasna-wiosna": [1, 1, 2.3, 1.5],
  "ciepla-wiosna": [2, 1.8, 2.5, 2],
  "czysta-wiosna": [0.7, 1.8, 3, 2.8],
  "jasne-lato": [-1, 1, 1.7, 1.3],
  "chlodne-lato": [-2, 2, 1.8, 2],
  "zgaszone-lato": [-0.7, 2, 1, 1.5],
  "zgaszona-jesien": [0.7, 2, 1, 1.5],
  "ciepla-jesien": [2, 2.3, 1.8, 2],
  "gleboka-jesien": [1, 3, 2, 2.5],
  "gleboka-zima": [-1, 3, 2.4, 3],
  "chlodna-zima": [-2, 2.4, 2.8, 3],
  "czysta-zima": [-0.7, 2, 3, 3],
};

export function matchBeautyType(photo: Photo) {
  const p = [T[photo.temperature], D[photo.depth], S[photo.saturation], C[photo.contrast]];
  const weights = [1.1, 1.4, 1.2, 0.8];
  const ranked = Object.entries(TYPE_PROFILES)
    .map(([key, prof]) => ({ key, dist: Math.hypot(...prof.map((v, i) => ((v - p[i]!) * weights[i]!) / (i === 0 ? 2 : 1))) }))
    .sort((a, b) => a.dist - b.dist);
  return { best: ranked[0]!.key, neighbour: ranked[1]!.key };
}

function typeInfo(key: string) {
  for (const season of pl.landing.seasons.list) {
    const type = season.types.find((t) => t.key === key);
    if (type) return { type, season };
  }
  throw new Error(`Unknown beauty type ${key}`);
}

/* ---------- natural colours: photo first, quiz answers as fallback ---------- */

export const EYE_HEX: Record<string, string> = {
  Jasnoniebieski: "#8fb3d9", Niebieski: "#5b83b5", Szaroniebieski: "#7d90a3", Szary: "#8a9095", Jasnozielony: "#8fae7c",
  Zielony: "#5e8150", "Zielono-piwny": "#7c7a45", Piwny: "#8a6232", Jasnobrązowy: "#8b5e3c", "Średni brąz": "#6b4428",
  Ciemnobrązowy: "#4a2f1f", "Bardzo ciemny brąz": "#2e1d14",
};
export const HAIR_HEX: Record<string, string> = {
  "Bardzo jasny blond": "#e6d2a8", "Jasny blond": "#d4b57e", "Ciemny blond": "#a98657", "Jasny brąz": "#8a6440", "Średni brąz": "#64462e",
  "Ciemny brąz": "#3f2a1d", Czarny: "#1e1a18", "Rudy lub miedziany": "#a9522a", "Częściowo siwe": "#8e8a86", "Siwe lub srebrne": "#c9c7c4",
};
export const SKIN_HEX: Record<"warm" | "neutral" | "cool", Record<Depth, string>> = {
  warm: { jasna: "#f2d3b6", średnia: "#d9a882", głęboka: "#8e5a3a" },
  neutral: { jasna: "#efd0bd", średnia: "#cfa088", głęboka: "#85573f" },
  cool: { jasna: "#f1d1c7", średnia: "#cc9c8f", głęboka: "#7a4f45" },
};

function naturalColours(photo: Photo, answers: Answers, features: PhotoFeatures | undefined) {
  const answer = (id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");
  const t = T[photo.temperature];
  const family = t > 0 ? "warm" : t < 0 ? "cool" : "neutral";
  const fallbackHair = photo.depth === "jasna" ? "#b8955f" : photo.depth === "głęboka" ? "#2c211b" : "#5e4330";
  const pick = (feature: Swatch | undefined, quizHex: string | undefined, quizName: string, fallbackHex: string, fallbackName: string) =>
    feature && isHex(feature.hex)
      ? { hex: feature.hex.toLowerCase(), name: feature.name || fallbackName, source: "photo" as const }
      : { hex: quizHex ?? fallbackHex, name: quizHex ? quizName.toLowerCase() : fallbackName, source: "quiz" as const };
  return {
    eyes: pick(features?.eyes, EYE_HEX[answer("eyes")], answer("eyes"), "#6b4428", "brązowe"),
    hair: pick(features?.hair, HAIR_HEX[answer("naturalHair")], answer("naturalHair"), fallbackHair, "naturalny odcień"),
    skin: pick(features?.skin, undefined, "", SKIN_HEX[family][photo.depth], `${photo.depth} karnacja o ${t > 0 ? "ciepłym" : t < 0 ? "chłodnym" : "neutralnym"} podtonie`),
  };
}

/* ---------- feature analysis ---------- */

type Candidate = ColorEntry & { L: number; C: number; h: number };

function withLch(colors: ColorEntry[]): Candidate[] {
  return colors.map((c) => ({ ...c, ...hexToLch(c.hex) }));
}

function pickBy(cands: Candidate[], score: (c: Candidate) => number, n: number, exclude: Swatch[] = [], filter: (c: Candidate) => boolean = () => true) {
  return cands
    .filter((c) => filter(c) && !exclude.some((e) => e.name === c.name))
    .sort((a, b) => score(a) - score(b))
    .slice(0, n)
    .map(sw);
}

type EyeFamily = "blue" | "green" | "hazel" | "brown" | "grey";

function eyeFamily(hex: string): EyeFamily {
  const { L, C: ch, h } = hexToLch(hex);
  if (ch < 8) return L < 38 ? "brown" : "grey";
  if (h >= 200 && h <= 300) return "blue";
  if (h >= 100 && h < 200) return "green";
  if (h >= 75 && h < 100) return "hazel";
  return "brown";
}

// Lab hue targets that make each eye colour look more intense (roughly opposite on the colour wheel).
const EYE_TARGETS: Record<EyeFamily, number[]> = { blue: [55], green: [355], hazel: [150, 320], brown: [235, 300], grey: [300, 250] };
const EYE_NOTES: Record<EyeFamily, string> = {
  blue: "Odcienie miedzi, koralu i ciepłego brązu leżą naprzeciw błękitu na kole barw — dlatego przy twarzy sprawiają, że niebieskie oczy wydają się jaśniejsze i bardziej intensywne.",
  green: "Śliwka, wino i burgund to barwy przeciwne zieleni — wzmacniają ją i wydobywają z oczu złote i zielone refleksy.",
  hazel: "Orzechowe oczy mają w sobie zieleń i złoto: zielenie i oliwki podkreślają zielone refleksy, a fiolety i śliwki — złote.",
  brown: "Brązowe oczy pięknie ożywiają błękity, morskie zielenie i śliwki — kontrast temperatur sprawia, że brąz wydaje się cieplejszy i głębszy.",
  grey: "Szare oczy przejmują kolor otoczenia: śliwki i chłodne błękity wydobywają z nich niebieskie i srebrzyste tony.",
};

function analyseEyes(eye: { hex: string; name: string; source: "photo" | "quiz" }, cands: Candidate[]): FeatureAnalysis {
  const e = hexToLch(eye.hex);
  const family = eyeFamily(eye.hex);
  const harmony = pickBy(cands, (c) => hueDistance(e.h, c.h) * (e.C > 10 ? 1 : 0.2) + Math.abs(e.L - c.L) * 0.8 + (c.C < 8 && e.C > 15 ? 25 : 0), 5);
  const targets = EYE_TARGETS[family];
  const enhance: Swatch[] = [];
  targets.forEach((target, i) => {
    const n = targets.length === 1 ? 3 : i === 0 ? 2 : 1;
    enhance.push(...pickBy(cands, (c) => hueDistance(target, c.h) - c.C * 0.15, n, [...harmony, ...enhance], (c) => c.C > 18));
  });
  return { ...eye, harmony, enhance, note: `${EYE_NOTES[family]} Z Twojej palety najlepiej działają: ${list(enhance)}.` };
}

type HairKind = "silver" | "dark" | "red" | "blond" | "brown";

function hairKind(hex: string): HairKind {
  const { L, C: ch, h } = hexToLch(hex);
  if (ch < 8 && L > 55) return "silver";
  if (L < 20 || ch < 8) return "dark"; // near-black only; chestnut/dark brown stays "brown"
  if (h >= 25 && h <= 62 && ch > 28 && L < 62) return "red";
  if (L > 62) return "blond";
  return "brown";
}

const HAIR_NOTES: Record<HairKind, string> = {
  silver: "Srebrne i siwe włosy najpiękniej wyglądają przy czystych, nasyconych kolorach — wtedy siwizna wydaje się zamierzona i elegancka, a nie „szara”.",
  dark: "Ciemne włosy tworzą mocną ramę twarzy, więc najlepiej równoważą je kolory o wyraźnym nasyceniu — klejnotowe odcienie dodają im połysku.",
  red: "Rude i miedziane włosy ożywają przy zieleniach i morskich odcieniach — to ich barwy dopełniające, które wydobywają głębię miedzi.",
  blond: "Blond potrzebuje kolorów o średniej głębi: dają ramę, przy której jasne włosy wyglądają na pełniejsze i bardziej świetliste, zamiast zlewać się z ubraniem.",
  brown: "Brązowe włosy podkreślą kolory, które kontrastują z nimi temperaturą — chłodniejsze błękity i zielenie wydobywają ciepłe refleksy brązu.",
};

function analyseHair(hair: { hex: string; name: string; source: "photo" | "quiz" }, cands: Candidate[]): FeatureAnalysis {
  const hc = hexToLch(hair.hex);
  const kind = hairKind(hair.hex);
  const harmony = pickBy(cands, (c) => deltaE(hair.hex, c.hex) + (c.role === "accent" ? 12 : 0), 5);
  const enhance =
    kind === "red" ? pickBy(cands, (c) => hueDistance(185, c.h) - c.C * 0.1, 3, harmony, (c) => c.C > 15)
    : kind === "blond" ? pickBy(cands, (c) => hueDistance(260, c.h) * 0.6 + Math.abs(c.L - 48), 3, harmony, (c) => c.C > 15 && c.L > 30 && c.L < 65)
    : kind === "brown" ? pickBy(cands, (c) => hueDistance((hc.h + 180) % 360, c.h) - c.C * 0.1, 3, harmony, (c) => c.C > 15 && c.L > 25 && c.L < 70 && hueDistance(hc.h, c.h) > 60)
    : pickBy(cands, (c) => -c.C, 3, harmony, (c) => c.L > 28 && c.L < 70);
  return { ...hair, harmony, enhance, note: `${HAIR_NOTES[kind]} U Ciebie najlepiej sprawdzą się: ${list(enhance)}.` };
}

function analyseSkin(skin: { hex: string; name: string; source: "photo" | "quiz" }, cands: Candidate[], photo: Photo): FeatureAnalysis {
  const s = hexToLch(skin.hex);
  const t = T[photo.temperature];
  const harmony = pickBy(cands, (c) => cands.indexOf(c), 5, [], (c) => c.role !== "accent" && deltaE(skin.hex, c.hex) > 14);
  let enhance = pickBy(cands, (c) => hueDistance(s.h, c.h) + Math.abs(c.C - 38) * 0.4, 3, harmony, (c) => hueDistance(s.h, c.h) < 40 && c.C > 18 && c.L > s.L - 40);
  if (enhance.length < 3) enhance = [...enhance, ...pickBy(cands, (c) => hueDistance(s.h, c.h), 3 - enhance.length, [...harmony, ...enhance], (c) => c.C > 15)];
  const undertone = t > 0 ? "Twoja skóra ma ciepły, złocisty podton — rozświetlają ją odcienie z tą samą ciepłą bazą: brzoskwinie, korale i ciepłe róże."
    : t < 0 ? "Twoja skóra ma chłodny, różowawy podton — rozświetlają ją odcienie z niebieską bazą: róże, maliny i chłodne czerwienie."
    : "Twoja skóra ma neutralny podton, więc służą jej odcienie zrównoważone — ani bardzo złote, ani bardzo niebieskie, np. rosewood i miękkie róże.";
  return { ...skin, harmony, enhance, note: `${undertone} Przy twarzy noś je w ilości, która odbija światło na cerę: ${list(enhance)}. Unikaj kolorów niemal identycznych z kolorem skóry — zlewają się z nią i „gaszą” twarz.` };
}

/* ---------- face depth, harmony, jewellery ---------- */

function analyseDepth(photo: Photo, cands: Candidate[]) {
  const d = D[photo.depth];
  const best = pickBy(cands, (c) => Math.abs(c.depth - d) * 10 + cands.indexOf(c) * 0.2, 5);
  const depthText = photo.depth === "jasna" ? "Twoja uroda jest jasna: najlepiej wyglądasz w kolorach jasnych i średnich — ciemne, ciężkie barwy łatwo ją przytłaczają."
    : photo.depth === "głęboka" ? "Twoja uroda ma dużą głębię: głębokie, nasycone kolory równoważą ją i wyglądają naturalnie, a bardzo blade pastele mogą ją „spłaszczać”."
    : "Twoja uroda ma średnią głębię: najlepiej wyglądasz w kolorach średnich, ani bardzo bladych, ani bardzo ciemnych.";
  const contrastText = photo.contrast === "wysoki" ? "Wysoki kontrast między włosami, oczami i cerą oznacza, że dobrze znosisz zestawienia jasnego z ciemnym."
    : photo.contrast === "niski" ? "Niski kontrast oznacza, że najlepiej wyglądasz w zestawieniach ton w ton, bez ostrych przejść."
    : "Średni kontrast pozwala łączyć kolory o umiarkowanej różnicy jasności.";
  return { level: photo.depth, contrast: photo.contrast, best, note: `${depthText} ${contrastText}` };
}

const WHITE_HEX: Record<string, string> = {
  "śnieżna biel": "#ffffff", "chłodna biel": "#f7f8fa", "neutralna biel": "#f7f5f0", "złamana biel": "#f2efe6", "kość słoniowa": "#f4e8cf",
  "kremowa biel": "#f2dfc2", ecru: "#efe4cf", "waniliowa biel": "#f6ebcb",
};

function analyseHarmony(photo: Photo, base: ColorEntry[], accents: ColorEntry[], white: string) {
  const w: Swatch = { name: white, hex: WHITE_HEX[white] ?? "#f5f1e8" };
  const [b0, b1, b2] = [base[0], base[1] ?? base[0], base[2] ?? base[1] ?? base[0]].map((c) => sw(c!));
  const [a0, a1] = [accents[0] ?? base[0], accents[1] ?? accents[0] ?? base[1]].map((c) => sw(c!));
  const principle = photo.contrast === "niski"
    ? "Twoja harmonia to zestawienia ton w ton: kolory o podobnej jasności, połączone płynnie. Zasada 60–30–10: 60% neutralu bazowego, 30% drugiego neutralu, 10% delikatnego akcentu."
    : photo.contrast === "wysoki"
      ? "Twoja harmonia opiera się na kontraście: jasne zestawiaj z ciemnym i dodawaj wyraźny akcent. Zasada 60–30–10: 60% głębokiego neutralu, 30% jasnego, 10% mocnego akcentu."
      : "Twoja harmonia to umiarkowany kontrast: neutral bazowy, jaśniejsze tło i jeden akcent. Zasada 60–30–10: 60% neutralu, 30% jaśniejszego koloru, 10% akcentu.";
  const darkest = sw([...base].sort((x, y) => hexToLch(x.hex).L - hexToLch(y.hex).L)[0] ?? base[0]!);
  const third = photo.contrast === "niski"
    ? { title: "Ton w ton", colors: [b0!, b1!, b2!], tip: "Połącz trzy neutrale o podobnej jasności — wygląda spójnie i drogo." }
    : { title: "Wyraziście", colors: [darkest, w, a1!], tip: `Najgłębszy neutral (${darkest.name}), jasne tło i mocny akcent przy twarzy.` };
  return {
    principle,
    combos: [
      { title: "Na co dzień", colors: [b0!, w, a0!], tip: `Spodnie lub spódnica w kolorze ${b0!.name}, góra w odcieniu ${w.name}, akcent ${a0!.name} w szalu lub torebce.` },
      { title: "Elegancko", colors: [b1!, b2!, a1!], tip: `Dwa neutrale (${b1!.name}, ${b2!.name}) i jeden szlachetny akcent: ${a1!.name}.` },
      third,
    ],
  };
}

function analyseJewelry(photo: Photo, male: boolean) {
  const t = T[photo.temperature];
  const clamp = (v: number) => Math.round(Math.max(12, Math.min(96, v)));
  const verdict = (s: number) => (s >= 75 ? "Twój najlepszy wybór" : s >= 55 ? "Dobrze współgra" : s >= 35 ? "Z umiarem, w mieszanych zestawach" : "Ostrożnie przy twarzy");
  const warmth = t > 0 ? "ciepły podton Twojej skóry" : t < 0 ? "chłodny podton Twojej skóry" : "neutralny podton Twojej skóry";
  const metals = [
    { key: "gold" as const, label: "Złoto", score: clamp(52 + t * 21), reason: t > 0 ? `Żółte złoto powtarza ${warmth} i dodaje twarzy ciepłego blasku.` : t < 0 ? "Intensywne żółte złoto może kłócić się z chłodnym podtonem i podkreślać zaczerwienienia." : "Neutralne, niezbyt żółte złoto pasuje do Ciebie bez ryzyka." },
    { key: "silver" as const, label: "Srebro", score: clamp(52 - t * 21), reason: t < 0 ? `Srebro, białe złoto i platyna współgrają z ${warmth.replace("Twojej skóry", "skóry")} i dodają świeżości.` : t > 0 ? "Bardzo chłodne srebro może wyglądać przy Twojej cerze nieco szaro — lepiej w połączeniu ze złotem." : "Srebro sprawdzi się, zwłaszcza w satynowym wykończeniu." },
    { key: "rose" as const, label: "Różowe złoto", score: clamp(74 - Math.abs(t - 0.5) * 14), reason: "Różowe złoto łączy ciepło złota i chłód miedzi z różem — to najbardziej uniwersalny metal, szczególnie dla neutralnych i lekko ciepłych typów." },
  ].map((m) => ({ ...m, verdict: verdict(m.score) })).sort((a, b) => b.score - a.score);
  const finish = photo.saturation === "miękka" ? "Wybieraj wykończenia satynowe i matowe — mocny połysk konkuruje z miękką urodą."
    : photo.saturation === "czysta" ? "Pasują Ci polerowane, błyszczące wykończenia i kamienie o czystych kolorach."
    : "Najlepiej sprawdzi się delikatny połysk.";
  const scale = photo.depth === "głęboka" || photo.contrast === "wysoki" ? (male ? " Możesz nosić wyraziste dodatki — masywniejszy zegarek czy sygnet." : " Możesz nosić większe, wyraziste formy.") : photo.depth === "jasna" ? (male ? " Najlepiej wyglądają subtelne, smukłe dodatki." : " Najlepiej wyglądają delikatne, lekkie formy.") : "";
  return { metals, finish: finish + scale };
}

/* ---------- makeup (women) ---------- */

const MAKEUP_HEX: Record<string, string> = {
  "brzoskwiniowy róż": "#f2a08a", "morelowy róż": "#f0a274", "ciepły nude": "#c98f74", "łososiowy róż": "#e98c7e", koral: "#f26b5b",
  "jasny taupe": "#b9a595", "miodowy beż": "#d2a86e", "jasna oliwka": "#a5a26b", "jasny neutralno-ciepły brąz": "#c29270",
  "przygaszony brzoskwiniowy": "#d9967e", "ceglasty róż": "#c46a55", rosewood: "#b5646b", terakota: "#b9583e", taupe: "#8f7b6d",
  oliwka: "#6f7a34", "czekoladowy brąz": "#5b3b2e", "neutralno-ciepły brąz bez pomarańczowych tonów": "#9c6e50",
  "głęboka terakota": "#9c4a35", "głęboki rosewood": "#8e4550", "ceglasta czerwień": "#a8382d", "ciepły burgund": "#6e2a2e",
  "gorzka czekolada": "#3f2a22", "ciemna oliwka": "#4f5328", "miedziany brąz": "#9a5a33", "głęboki neutralno-ciepły brąz": "#6b4430",
  "neutralny jasny róż": "#eaa5a5", "delikatna brzoskwinia": "#f4bfa3", "neutralny nude": "#c9998a", "miękki róż": "#e3a1a8",
  greige: "#b9ada1", "miękki brąz": "#8c6a57", "neutralny jasny brąz": "#b48c72", "neutralny róż": "#d88a90",
  "neutralna czerwień": "#b72f3c", "przygaszony burgund": "#7a3a45", kakao: "#6b4a3e", "przygaszona śliwka": "#7a5468",
  "neutralny taupe-brąz": "#8a7466", "neutralny malinowy": "#b5446a", burgund: "#6e2335", espresso: "#3d2a22",
  "grafitowy taupe": "#5e5650", śliwka: "#5a2e4e", "głęboki neutralny brąz": "#5c4033", "chłodny jasny róż": "#f2b3c4",
  "dusty rose": "#c98b95", "malinowy nude": "#c77b88", "chłodny róż": "#e07a9c", "jasny rosewood": "#c98b93", "gołębi taupe": "#9c9298",
  lawendowy: "#b5a2c9", "chłodny beż": "#cfc2b8", "jasny neutralno-chłodny taupe": "#a89a92", malinowy: "#b03a64",
  "chłodna czerwień": "#b21f3f", grafit: "#4a4e53", "neutralny taupe-brąz bez pomarańczowych tonów": "#85756c", "malinowy róż": "#c2476f",
  "chłodny głęboki róż": "#a23b63", wiśniowy: "#8e1f35", "chłodny burgund": "#5e1f38", "głęboki chłodny brąz": "#4a3632",
  "głęboki neutralno-chłodny brąz": "#5a463f",
};
const mk = (names: readonly string[]) => names.map((name) => ({ name, hex: MAKEUP_HEX[name] ?? "#b08878" }));

function analyseMakeup(
  photo: Photo,
  shades: { blush: readonly string[]; lips: readonly string[]; eyes: readonly string[]; bronzer: readonly string[] },
  eyes: FeatureAnalysis,
  hair: FeatureAnalysis,
) {
  const t = T[photo.temperature];
  const base = t > 0 ? "ciepłą, brzoskwiniowo-koralową bazę, która powtarza złocisty podton Twojej skóry" : t < 0 ? "chłodną, różowo-malinową bazę, która współgra z różowym podtonem Twojej skóry" : "neutralną bazę (ani pomarańczową, ani niebieską), dopasowaną do neutralnego podtonu Twojej skóry";
  const depth = photo.depth === "jasna" ? "Twoja uroda jest jasna, więc wybieramy lekkie, przejrzyste odcienie — mocne kolory zdominowałyby twarz."
    : photo.depth === "głęboka" ? "Twoja uroda ma dużą głębię, więc głębsze odcienie ją równoważą — zbyt blade wyglądałyby kredowo."
    : "Średnia głębia urody pozwala na odcienie średnie: widoczne, ale nie ciężkie.";
  const hairL = hexToLch(hair.hex).L;
  const brow = { name: "brwi", hex: hairL > 60 ? shade(hair.hex, -0.25) : hairL < 28 ? shade(hair.hex, 0.12) : shade(hair.hex, 0.04) };
  const mascara = photo.contrast === "wysoki" || hairL < 30 ? { name: "czarny tusz", hex: "#1a1a1a" } : hairL > 60 || photo.contrast === "niski" ? { name: "brązowy tusz", hex: "#4b3426" } : { name: "brązowo-czarny tusz", hex: "#2e2420" };
  const eyeExtra = eyes.enhance[0];
  return {
    groups: [
      { key: "lips", label: "Usta", colors: mk(shades.lips), why: `Pomadki mają ${base}. ${depth}` },
      { key: "blush", label: "Róż", colors: mk(shades.blush), why: `Róż ma ten sam podton co Twoja skóra, dlatego wygląda jak naturalny rumieniec, a nie plama koloru. ${photo.saturation === "miękka" ? "Wybieraj formuły satynowe — przy miękkiej urodzie mocny połysk i neon wyglądają sztucznie." : ""}`.trim() },
      { key: "eyes", label: "Oczy", colors: [...mk(shades.eyes), ...(eyeExtra ? [eyeExtra] : [])], why: `Neutralne cienie (${shades.eyes.join(", ")}) budują głębię bez konkurowania z kolorem oczu. ${eyeExtra ? `Jako akcent — np. w kresce przy linii rzęs — użyj odcienia ${eyeExtra.name}: ${EYE_NOTES[eyeFamily(eyes.hex)].charAt(0).toLowerCase()}${EYE_NOTES[eyeFamily(eyes.hex)].slice(1)}` : ""}`.trim() },
      { key: "brows", label: "Brwi i rzęsy", colors: [brow, mascara], why: `Kolor brwi dobieramy do Twoich włosów (${hair.name}): ${hairL > 60 ? "przy jasnych włosach brwi o ton ciemniejsze dają twarzy ramę" : hairL < 28 ? "przy ciemnych włosach brwi o ton jaśniejsze łagodzą rysy" : "brwi w kolorze włosów wyglądają najbardziej naturalnie"}. ${mascara.name.charAt(0).toUpperCase()}${mascara.name.slice(1)} pasuje do Twojego kontrastu (${photo.contrast}).` },
      { key: "bronzer", label: "Bronzer i konturowanie", colors: mk(shades.bronzer), why: `Bronzer dobieramy do głębi i podtonu skóry — ${t > 0 ? "lekko ciepły, ale bez pomarańczowych tonów" : t < 0 ? "chłodny, szarobrązowy, bo ciepłe bronzery wyglądają na chłodnej cerze jak plama" : "neutralny"}.` },
    ],
  };
}

/* ---------- Polish grammar: the enum values are nominative; sentences need other cases ---------- */

const accFem = (word: string) => word.replace(/a$/, "ą"); // "ciepła temperatura" → "ciepłą temperaturę"
const neuter = (word: string) => word.replace(/ka$/, "kie").replace(/a$/, "e"); // "miękka" → "miękkie", "czysta" → "czyste"

/* ---------- assemble ---------- */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Where to put a meter dot. Each category (e.g. depth "średnia") owns a band of
// the bar; inside it the dot moves with the measured eye/hair/skin colours and
// with how typical the person is for their beauty type. So the dot never sits
// exactly at an end or dead centre, and two people of the same category differ.
function meterPosition(level: number, levels: number, typeValue: number | undefined, measured: number | undefined): number {
  const step = 1 / levels;
  const lo = (level - 1) * step + step * 0.12;
  const hi = level * step - step * 0.12;
  const typical = typeValue === undefined ? 0.5 : clamp01(0.5 + (typeValue - level));
  const within = measured === undefined ? typical : (typical + measured) / 2;
  // Squeeze into 8–92% of the bar so a dot never touches an end.
  const v = 0.08 + (lo + within * (hi - lo)) * 0.84;
  // Keep clear of the exact middle (it reads as "no result").
  const off = v - 0.5;
  if (Math.abs(off) < 0.08) return 0.5 + (off > 0 || (off === 0 && within >= 0.5) ? 1 : -1) * (0.08 + Math.abs(off) * 0.5);
  return v;
}

function meterPositions(photo: Photo, typeKey: string, natural: { eyes: Swatch; hair: Swatch; skin: Swatch }) {
  const prof = TYPE_PROFILES[typeKey];
  const lch = (hex: string) => (isHex(hex) ? hexToLch(hex) : undefined);
  const eyes = lch(natural.eyes.hex), hair = lch(natural.hair.hex), skin = lch(natural.skin.hex);
  // Measured signals, each 0…1 from the left end of the bar to the right.
  const warmth = skin ? clamp01((skin.h - 40) / 30) : undefined; // pinkish → golden skin
  const depth = eyes && hair && skin ? clamp01((75 - (2 * hair.L + eyes.L + skin.L) / 4) / 45) : undefined;
  const chroma = eyes && skin ? clamp01(((eyes.C + skin.C) / 2 - 10) / 25) : undefined;
  const contrast = hair && skin ? clamp01((Math.abs(skin.L - hair.L) - 5) / 60) : undefined;
  return {
    temperature: meterPosition(T[photo.temperature] + 3, 5, prof && prof[0] + 3, warmth),
    depth: meterPosition(D[photo.depth], 3, prof?.[1], depth),
    saturation: meterPosition(S[photo.saturation], 3, prof?.[2], chroma),
    contrast: meterPosition(C[photo.contrast], 3, prof?.[3], contrast),
  };
}

/* ---------- materials ---------- */

function analyseMaterials(photo: Photo, skinName: string, male: boolean): NonNullable<DashboardData["materials"]> {
  const best: string[] = [];
  const avoid: string[] = [];
  const t = T[photo.temperature];
  let finish: string;
  if (photo.saturation === "miękka" || photo.contrast === "niski") {
    best.push("kaszmir", "wełna merino", "zamsz", "len", "miękka dzianina");
    avoid.push("lakierowana skóra", "błyszcząca satyna", "sztywne, lśniące syntetyki");
    finish = "matowe, miękkie faktury, które rozpraszają światło i nie przytłaczają delikatnych rysów";
  } else if (photo.saturation === "czysta" || photo.contrast === "wysoki") {
    best.push("jedwab", male ? "gładka popelina" : "satyna", "wełna czesankowa", "skóra licowa", "gładka bawełna");
    avoid.push("sprany, wyblakły denim", "mocno melanżowe dzianiny", "zmechacone, matowe tkaniny");
    finish = "gładkie, wyraźne tkaniny z lekkim połyskiem, które dorównują intensywności Twoich rysów";
  } else {
    best.push("bawełna", "matowy jedwab", "cienka dzianina", "denim", "wełna");
    avoid.push("bardzo błyszczące tkaniny", "mocno sprane materiały");
    finish = "tkaniny o umiarkowanej fakturze — ani bardzo błyszczące, ani całkiem matowe";
  }
  if (t > 0) best.push("tweed", "sztruks");
  else if (t < 0) best.push(male ? "wełna z delikatnym połyskiem" : "szyfon", "popelina");
  if (photo.depth === "głęboka") best.push("aksamit", "gruba dzianina");
  else if (photo.depth === "jasna") best.push(male ? "lekka bawełna oxford" : "batyst", "cienki len");
  const temp = t > 0 ? "Ciepły, złocisty odcień cery dobrze wygląda przy naturalnych, organicznych fakturach." : t < 0 ? "Chłodny odcień cery dobrze współgra z gładkimi tkaninami o chłodnym, perłowym połysku." : "Neutralny odcień cery pozwala łączyć faktury naturalne i gładkie.";
  return {
    best: [...new Set(best)].slice(0, 7),
    avoid,
    note: `Twojej cerze (${skinName}) i ${photo.contrast}emu kontrastowi najlepiej służą ${finish}. ${temp}`,
  };
}

export function buildDashboard(args: {
  photo: Photo;
  features: PhotoFeatures | undefined;
  answers: Answers;
  ranked: ColorEntry[];
  base: ColorEntry[];
  accents: ColorEntry[];
  white: string;
  male: boolean;
  makeupShades: { blush: readonly string[]; lips: readonly string[]; eyes: readonly string[]; bronzer: readonly string[] } | undefined;
}): DashboardData {
  const { photo, answers, ranked, base, accents, white, male } = args;
  const match = matchBeautyType(photo);
  const { type, season } = typeInfo(match.best);
  const neighbour = typeInfo(match.neighbour).type;
  const cands = withLch(ranked.slice(0, 45));
  const natural = naturalColours(photo, answers, args.features);
  const eyes = analyseEyes(natural.eyes, cands);
  const hair = analyseHair(natural.hair, cands);
  const skin = analyseSkin(natural.skin, cands, photo);
  const celebrities = CELEBRITIES[type.key]?.[male ? "men" : "women"] ?? [];

  const summary = [
    `Twój typ urody to ${type.label} (${season.label.toLowerCase()}). ${type.description}`,
    `Masz ${accFem(photo.temperature)} temperaturę urody, ${accFem(photo.depth)} głębię, ${neuter(photo.saturation)} nasycenie i ${photo.contrast} kontrast. Oczy (${eyes.name}), włosy (${hair.name}) i cera (${skin.name}) tworzą razem spójny obraz — dlatego kolory w Twojej palecie mają tę samą temperaturę i podobną intensywność.`,
    `Najważniejsza zasada dla Ciebie: przy twarzy noś kolory z palety, a ${photo.contrast === "niski" ? "zestawienia buduj ton w ton" : photo.contrast === "wysoki" ? "zestawienia buduj na wyraźnym kontraście jasnego i ciemnego" : "zestawienia buduj z umiarkowanym kontrastem i jednym akcentem"}. Blisko Twojego typu jest też ${neighbour.label} — część jego kolorów również może Ci służyć.`,
  ];

  return {
    type: { key: type.key, label: type.label, seasonKey: season.key, seasonLabel: season.label, chips: [...type.chips], description: type.description, neighbour: { key: neighbour.key, label: neighbour.label } },
    scales: meterPositions(photo, type.key, natural),
    summary,
    features: { eyes, hair, skin },
    depth: analyseDepth(photo, cands),
    harmony: analyseHarmony(photo, base, accents, white),
    jewelry: analyseJewelry(photo, male),
    makeup: !male && args.makeupShades ? analyseMakeup(photo, args.makeupShades, eyes, hair) : undefined,
    celebrities,
    materials: analyseMaterials(photo, skin.name, male),
  };
}

// Free "hook" before payment: 4 colours picked from the quiz answers alone
// (eye colour, natural hair colour, and the jewellery answer as the skin
// undertone signal), using the same colour-theory rules as the paid dashboard:
// one that makes the eyes stand out, one that lights up the skin, one that
// sets off the hair, and a personal neutral.
//
// Every possible combination is precomputed into the Supabase table
// teaser_palettes (scripts/generate-teaser-palettes.ts → migration 0009),
// so it can be looked up — and edited — there. buildTeaser() is also the
// fallback when the table can't be reached.
import { buildColorReport, type PhotoAnalysis } from "@/content/engine";
import { EYE_HEX, HAIR_HEX, SKIN_HEX } from "@/content/dashboard";
import { eyeColors, naturalHair, MEN_SHAVED_HEAD, GENDER_FEMALE, type Answers } from "@/content/funnel";
import type { Contrast, Depth, Saturation, Temperature } from "@/content/resultLibrary";
import { hexToLch } from "@/lib/color";

export type Undertone = "ciepły" | "chłodny" | "neutralny";
export type TeaserColor = { name: string; hex: string; role: string; why: string };
export type Teaser = { summary: string; colors: TeaserColor[] };

const UNKNOWN_EYES = "Inny lub trudny do określenia";
const UNKNOWN_HAIR = "Trudno mi określić";

export const TEASER_EYES: readonly string[] = eyeColors;
export const TEASER_HAIR: readonly string[] = [...naturalHair.slice(0, -1), "Częściowo siwe", "Siwe lub srebrne", MEN_SHAVED_HEAD, UNKNOWN_HAIR];
export const TEASER_UNDERTONES: readonly Undertone[] = ["ciepły", "chłodny", "neutralny"];

const str = (answers: Answers, id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");

/** Gold vs silver is the classic at-home undertone test. */
export function undertoneFromJewelry(answer: string): Undertone {
  const a = answer.toLowerCase();
  if (a.includes("różow") || a.includes("łączę") || a.includes("zarówno")) return "neutralny";
  if (a.includes("złot")) return "ciepły";
  if (a.includes("srebr") || a.includes("stal") || a.includes("białe")) return "chłodny";
  return "neutralny";
}

/** The lookup key for teaser_palettes; unknown answers fall back to "hard to say". */
export function teaserKey(answers: Answers) {
  const eyes = str(answers, "eyes");
  const hair = str(answers, "naturalHair");
  return {
    eyes: TEASER_EYES.includes(eyes) ? eyes : UNKNOWN_EYES,
    hair: TEASER_HAIR.includes(hair) ? hair : UNKNOWN_HAIR,
    undertone: undertoneFromJewelry(str(answers, "jewelry")),
  };
}

const L = (hex: string) => hexToLch(hex).L;
const C = (hex: string) => hexToLch(hex).C;

/** A rough colouring estimate from the answers (the paid analysis uses the photo instead). */
function estimate(eyes: string, hair: string, undertone: Undertone): PhotoAnalysis {
  const eyeHex = EYE_HEX[eyes] ?? EYE_HEX["Średni brąz"]!;
  const hairHex = HAIR_HEX[hair] ?? HAIR_HEX["Średni brąz"]!;
  let t = undertone === "ciepły" ? 1.5 : undertone === "chłodny" ? -1.5 : 0;
  if (hair === "Rudy lub miedziany") t += 1;
  if (hair === "Czarny" || hair.includes("siwe") || hair.includes("Siwe")) t -= 0.5;
  if (["Piwny", "Zielono-piwny", "Jasnobrązowy"].includes(eyes)) t += 0.5;
  if (["Jasnoniebieski", "Szaroniebieski", "Szary"].includes(eyes)) t -= 0.5;
  const temperature: Temperature = t >= 1.75 ? "ciepła" : t >= 0.75 ? "neutralno-ciepła" : t > -0.75 ? "neutralna" : t > -1.75 ? "neutralno-chłodna" : "chłodna";
  const lightness = (2 * L(hairHex) + L(eyeHex)) / 3;
  const depth: Depth = lightness > 58 ? "jasna" : lightness < 33 ? "głęboka" : "średnia";
  const family = undertone === "ciepły" ? "warm" : undertone === "chłodny" ? "cool" : "neutral";
  const gap = Math.abs(L(SKIN_HEX[family][depth]) - L(hairHex));
  const contrast: Contrast = gap > 48 ? "wysoki" : gap < 22 ? "niski" : "średni";
  const saturation: Saturation = C(eyeHex) > 30 && contrast !== "niski" ? "czysta" : C(eyeHex) < 14 || contrast === "niski" ? "miękka" : "umiarkowana";
  return { temperature, depth, saturation, contrast };
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function eyesWhy(eyes: string) {
  const e = eyes === UNKNOWN_EYES ? "Twoich oczu" : `Twoich oczu (${lower(eyes)})`;
  return `Leży po przeciwnej stronie koła barw niż kolor ${e}. Noszony przy twarzy sprawia, że tęczówki wydają się jaśniejsze i bardziej wyraziste.`;
}

function skinWhy(undertone: Undertone) {
  return undertone === "ciepły" ? "Ma tę samą ciepłą, złocistą bazę co Twoja skóra, więc odbija na twarz ciepłe światło i ożywia cerę."
    : undertone === "chłodny" ? "Ma tę samą chłodną, niebieskawą bazę co Twoja skóra, więc rozświetla cerę zamiast ją ziemistować."
    : "Jest zrównoważony — ani zbyt złoty, ani zbyt niebieski — tak jak neutralny podton Twojej skóry, więc ją wyrównuje.";
}

function hairWhy(hair: string) {
  if (hair === MEN_SHAVED_HEAD || hair === UNKNOWN_HAIR) return "Dobrany do głębi Twojej urody — daje twarzy wyraźną ramę i nie zlewa się z karnacją.";
  return `Tworzy przemyślany kontrast z Twoimi włosami (${lower(hair)}), dzięki czemu ich kolor wygląda na głębszy i bardziej szlachetny.`;
}

function neutralWhy(p: PhotoAnalysis) {
  const temp = p.temperature.includes("ciepła") ? "ciepłej" : p.temperature.includes("chłodna") ? "chłodnej" : "neutralnej";
  return `Twój neutral o ${temp} temperaturze — lepsza baza niż czerń czy szarość na płaszcz, marynarkę i spodnie.`;
}

export function buildTeaser(eyes: string, hair: string, undertone: Undertone): Teaser {
  const photo = estimate(eyes, hair, undertone);
  const answers: Answers = { gender: GENDER_FEMALE, eyes, naturalHair: hair };
  const report = buildColorReport(photo, answers);
  const d = report.dashboard;
  const used = new Set<string>();
  const first = (list: { name: string; hex: string }[] | undefined) => {
    const c = list?.find((x) => !used.has(x.name));
    if (c) used.add(c.name);
    return c;
  };
  const picks: [ReturnType<typeof first>, string, string][] = [
    [first(d?.features.eyes.enhance), "Podkreśla oczy", eyesWhy(eyes)],
    [first(d?.features.skin.enhance), "Rozświetla cerę", skinWhy(undertone)],
    [first(d?.features.hair.enhance), "Oprawa dla włosów", hairWhy(hair)],
    // Skip whites: a white is a weak "wow" colour for a teaser.
    [first(report.baseColors.filter((c) => L(c.hex) < 88)) ?? first(report.baseColors), "Twój neutral", neutralWhy(photo)],
  ];
  const colors = picks.flatMap(([c, role, why]) => (c ? [{ name: c.name, hex: c.hex, role, why }] : []));
  const temp = photo.temperature.includes("ciepła") ? "ciepłą" : photo.temperature.includes("chłodna") ? "chłodną" : "neutralną";
  const summary = `Twoje odpowiedzi wskazują na ${temp} temperaturę urody i ${photo.depth === "średnia" ? "średni" : photo.depth === "jasna" ? "jasny" : "głęboki"} koloryt. Te 4 kolory to dopiero początek — pełna analiza ze zdjęcia pokazuje całą paletę.`;
  return { summary, colors };
}

/** Rough palette from the answers, used only as the blurred "locked" preview before payment. */
export function previewPalette(answers: Answers) {
  const { eyes, hair, undertone } = teaserKey(answers);
  return buildColorReport(estimate(eyes, hair, undertone), { gender: GENDER_FEMALE, eyes, naturalHair: hair }).palette;
}

/** Every combination, for seeding teaser_palettes. */
export function allTeasers() {
  return TEASER_EYES.flatMap((eyes) => TEASER_HAIR.flatMap((hair) => TEASER_UNDERTONES.map((undertone) => ({ eyes, hair, undertone, ...buildTeaser(eyes, hair, undertone) }))));
}

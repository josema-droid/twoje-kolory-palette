import { pl } from "@/content/pl";
import type { Result } from "@/types/result";

const STORAGE_KEY = "twoje-kolory-results";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readResults(): Record<string, Result> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveResult(result: Result) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readResults(), [result.id]: result }));
}

export async function analyzePhoto(quizAnswers: string[], photoFile: File): Promise<Result> {
  await delay(500);
  const key = quizAnswers[3] === pl.quiz.questions[3]?.answers[0]
    ? (quizAnswers[5] === pl.quiz.questions[5]?.answers[2] ? "autumn" : "spring")
    : (quizAnswers[5] === pl.quiz.questions[5]?.answers[3] ? "winter" : "summer");
  const season = pl.mock.seasons[key];
  const palette = pl.mock.palettes[key];
  const result: Result = {
    id: crypto.randomUUID(), ...season,
    best_colors: palette.best, avoid_colors: palette.avoid, best_neutrals: palette.neutrals,
    confidence: photoFile.size < 30000 ? 0.48 : 0.87,
    isPaid: false,
  };
  saveResult(result);
  return result;
}

export async function getResult(id: string): Promise<Result | null> {
  await delay(250);
  return readResults()[id] ?? null;
}

export async function startCheckout(resultId: string): Promise<Result | null> {
  await delay(400);
  const result = readResults()[resultId];
  if (!result) return null;
  const paid = { ...result, isPaid: true };
  saveResult(paid);
  return paid;
}
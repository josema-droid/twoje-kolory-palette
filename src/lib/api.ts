import { pl } from "@/content/pl";
import { supabase } from "@/lib/supabase";
import type { Result } from "@/types/result";

type ResultRow = {
  id: string;
  season_pl: string;
  season_en: string;
  family: Result["family"];
  description: string;
  best_colors: Result["best_colors"];
  avoid_colors: Result["avoid_colors"];
  best_neutrals: Result["best_neutrals"];
  confidence: number;
  is_paid: boolean;
};

function fromRow(row: ResultRow): Result {
  const { is_paid, ...rest } = row;
  return { ...rest, isPaid: is_paid };
}

export async function analyzePhoto(quizAnswers: string[], photoFile: File): Promise<Result> {
  const key = quizAnswers[3] === pl.quiz.questions[3]?.answers[0]
    ? (quizAnswers[5] === pl.quiz.questions[5]?.answers[2] ? "autumn" : "spring")
    : (quizAnswers[5] === pl.quiz.questions[5]?.answers[3] ? "winter" : "summer");
  const season = pl.mock.seasons[key];
  const palette = pl.mock.palettes[key];
  const { data, error } = await supabase
    .from("results")
    .insert({
      ...season,
      best_colors: palette.best,
      avoid_colors: palette.avoid,
      best_neutrals: palette.neutrals,
      confidence: photoFile.size < 30000 ? 0.48 : 0.87,
      is_paid: false,
    })
    .select()
    .single<ResultRow>();
  if (error || !data) throw error ?? new Error("Failed to save result");
  return fromRow(data);
}

export async function getResult(id: string): Promise<Result | null> {
  const { data, error } = await supabase.from("results").select().eq("id", id).maybeSingle<ResultRow>();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function startCheckout(resultId: string): Promise<Result | null> {
  const { data, error } = await supabase
    .from("results")
    .update({ is_paid: true })
    .eq("id", resultId)
    .select()
    .maybeSingle<ResultRow>();
  if (error) throw error;
  return data ? fromRow(data) : null;
}
export type Color = { name: string; hex: string };

export type Result = {
  id: string;
  season_pl: string;
  season_en: string;
  family: "Wiosna" | "Lato" | "Jesień" | "Zima";
  description: string;
  best_colors: Color[];
  avoid_colors: Color[];
  best_neutrals: Color[];
  confidence: number;
  isPaid: boolean;
  userId: string | null;
};
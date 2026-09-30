import type { Answers } from "@/content/funnel";
import type { ColorReport } from "@/content/engine";

export type Result = {
  id: string;
  isPaid: boolean;
  userId: string | null;
  answers: Answers;
  report: ColorReport;
};

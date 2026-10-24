// Funnel steps, sent to both Meta Pixel (custom events) and Google Analytics 4,
// so drop-off can be seen step by step (GA4: Explore → Funnel exploration;
// Meta: event counts in Events Manager / custom conversions in Ads Manager).
// Each tool only receives them with its own consent; otherwise nothing is sent.
// The main conversions (Lead, sign-up, checkout view, purchase) live in conversions.ts.
// Never send personal data, answers, photos or result ids here.
import { gaEvent } from "@/lib/analytics";
import { pixelCustom } from "@/lib/meta-pixel";

// Meta event name → GA4 event name and its position in the funnel.
const FUNNEL: Record<string, { ga: string; step?: number }> = {
  QuizStart: { ga: "quiz_intro_view", step: 1 },
  QuizCheckpoint1: { ga: "quiz_checkpoint_1", step: 3 },
  QuizCheckpoint2: { ga: "quiz_checkpoint_2", step: 4 },
  QuizCheckpoint3: { ga: "quiz_checkpoint_3", step: 5 },
  QuizComplete: { ga: "quiz_complete", step: 6 },
  PhotoUploaded: { ga: "photo_selected", step: 7 },
  PhotoSaved: { ga: "photo_submitted", step: 8 },
  PhotoSkipped: { ga: "photo_skipped", step: 8 },
  AnalysisReadyShown: { ga: "analysis_ready_view", step: 9 },
  EmailCodeSent: { ga: "email_code_sent", step: 10 },
  AnalysisUnlocked: { ga: "result_view", step: 12 },
  CheckoutClicked: { ga: "checkout_click", step: 14 },
  PhotoAnalyzed: { ga: "report_ready", step: 16 },
  ReportFromAnswers: { ga: "report_ready", step: 16 },
  PhotoRejected: { ga: "photo_rejected" },
  PdfDownloaded: { ga: "pdf_download" },
};

/** Only small, non-personal details are forwarded (e.g. which photo problem). */
const SAFE_PARAMS = ["problem", "with_photo"];

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  const event = FUNNEL[name];
  if (!event) return; // PageView is sent by each tool itself; unknown names are ignored
  const params: Record<string, unknown> = {};
  for (const key of SAFE_PARAMS) if (data?.[key] !== undefined) params[key] = data[key];
  pixelCustom(name, params);
  gaEvent(event.ga, event.step ? { ...params, funnel_step: event.step } : params);
}

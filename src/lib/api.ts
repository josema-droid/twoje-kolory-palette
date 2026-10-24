import type { AuthError, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { buildColorReport, type ColorReport, type PhotoAnalysis } from "@/content/engine";
import { analyzePaidPhoto, analyzePaidWithoutPhoto, type PhotoProblem } from "@/lib/photo-analysis";
import { deletePhoto, loadPhoto, savePhoto } from "@/lib/photo-store";
import type { Answers } from "@/content/funnel";
import type { Result } from "@/types/result";
import { buildTeaser, teaserKey, type Teaser } from "@/content/teaser";

type ResultRow = {
  id: string;
  is_paid: boolean;
  answers: Answers;
  report: ColorReport;
  /** Gemini's reading of the photo. Missing on results saved before migration 0008. */
  photo_analysis?: PhotoAnalysis | null;
  // Missing until migration 0002 is applied.
  user_id?: string | null;
  created_at: string;
};

const TEMPERATURES = ["chłodna", "neutralno-chłodna", "neutralna", "neutralno-ciepła", "ciepła"] as const;
const DEPTHS = ["jasna", "średnia", "głęboka"] as const;
const SATURATIONS = ["miękka", "umiarkowana", "czysta"] as const;
const CONTRASTS = ["niski", "średni", "wysoki"] as const;
const oneOf = <T extends string>(list: readonly T[], v: string | undefined): v is T => list.includes(v as T);

/**
 * Reports made before photo_analysis was saved (before Oct 2026) still carry the
 * four values in their profile sentence (engine.ts buildColorReport): read them
 * back so the report can be rebuilt as a dashboard from the same inputs.
 */
function analysisFromProfile(profile: unknown): PhotoAnalysis | null {
  if (typeof profile !== "string") return null;
  const m = /jest ([^;]+); głębia: ([^;]+); nasycenie: ([^;]+); naturalny kontrast: ([^.]+)\./.exec(profile);
  const [, t, d, s, c] = m ?? [];
  return oneOf(TEMPERATURES, t) && oneOf(DEPTHS, d) && oneOf(SATURATIONS, s) && oneOf(CONTRASTS, c) ? { temperature: t, depth: d, saturation: s, contrast: c } : null;
}

function fromRow({ id, is_paid, user_id, answers, report, photo_analysis }: ResultRow): Result {
  // Reports saved before the dashboard existed lack it; rebuild them from the saved
  // photo analysis, or for the oldest ones from the values in their profile sentence.
  if (!report.dashboard && Array.isArray(report.palette)) {
    const analysis = photo_analysis ?? analysisFromProfile(report.profile);
    if (analysis) report = buildColorReport(analysis, answers);
  }
  return { id, answers, report, isPaid: is_paid, userId: user_id ?? null };
}

/** Gemini could not use the photo (no face, too dark, …) or the analysis is down. */
export class PhotoRejected extends Error {
  constructor(public problem: PhotoProblem | "unavailable" | "unreadable" | "rate_limited" | "daily_limit" | "too_many_attempts" | "not_paid") {
    super(problem);
  }
}

/** Downscale to max 1024 px and re-encode as JPEG: enough for colour analysis, fast to upload. */
async function decodeImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // Safari can't always decode iPhone HEIC photos with createImageBitmap, but an <img> can.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) };
  }
}

async function photoToBase64Jpeg(file: File): Promise<string> {
  const image = await decodeImage(file);
  const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")!.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  image.release();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

// The finished quiz (and optional photo) waits here until the visitor verifies
// their email on /analiza; only then is the result created, owned by the account.
// localStorage, so it survives closing the tab while fetching the code.
const PENDING_KEY = "twoje-kolory-pending";
type Pending = { answers: Answers; photo: string | null };

/** End of the funnel: keeps the answers and the downscaled photo (if any) in this browser. */
export async function savePendingAnalysis(answers: Answers, photoFile: File | null): Promise<void> {
  let photo: string | null = null;
  if (photoFile) {
    try {
      photo = await photoToBase64Jpeg(photoFile);
    } catch {
      throw new PhotoRejected("unreadable");
    }
  }
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ answers, photo } satisfies Pending));
  } catch {
    // Storage full (large photo) or blocked: keep the answers; the photo can be added after paying.
    localStorage.setItem(PENDING_KEY, JSON.stringify({ answers, photo: null } satisfies Pending));
  }
}

export function hasPendingAnalysis(): boolean {
  try {
    return localStorage.getItem(PENDING_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * After email verification: creates the (unpaid, not yet analysed) result for
 * the logged-in user and moves the photo next to it. No AI call happens here —
 * the photo is analysed only after payment (analyzePaidResult).
 */
export async function createResultFromPending(): Promise<string> {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null") as Pending | null;
  if (!pending) throw new Error("No pending analysis");
  // The id is generated here so the row needn't be read back after insert; the
  // result is then fetched via getResult. Only id and answers may be sent
  // (migration 0010); user_id defaults to the logged-in user, is_paid to false.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("results").insert({ id, answers: pending.answers });
  if (error) throw error;
  if (pending.photo) savePhoto(id, pending.photo);
  localStorage.removeItem(PENDING_KEY);
  return id;
}

/** After payment, without a photo: the report is built from the quiz answers only. */
export async function analyzePaidFromAnswers(resultId: string): Promise<Result> {
  const response = await analyzePaidWithoutPhoto({ data: { resultId } });
  if (!response.ok) throw new PhotoRejected(response.problem);
  const result = await getResult(resultId);
  if (!result) throw new Error("Failed to load analysed result");
  return result;
}

/** True once the paid analysis has produced the full report. */
export const isAnalysed = (result: Result) => Array.isArray(result.report.palette);

/** The photo saved in this browser before payment, if it's still there. */
export const storedPhoto = (resultId: string) => loadPhoto(resultId);

/**
 * After payment: sends the photo (the one saved before payment, or a newly
 * chosen file) for analysis. The server checks the result is paid, then
 * builds and saves the full report.
 */
export async function analyzePaidResult(resultId: string, photo: string | File): Promise<Result> {
  let image: string;
  try {
    image = typeof photo === "string" ? photo : await photoToBase64Jpeg(photo);
  } catch {
    throw new PhotoRejected("unreadable");
  }
  const response = await analyzePaidPhoto({ data: { resultId, image } });
  if (!response.ok) throw new PhotoRejected(response.problem);
  deletePhoto(resultId);
  const result = await getResult(resultId);
  if (!result) throw new Error("Failed to load analysed result");
  return result;
}

// PostgREST's "function not found" code. TEMPORARY fallback so this build
// keeps working until migration 0003 is applied; remove once it is.
const MISSING_FUNCTION = "PGRST202";
// PostgREST's "column not found" code.
const MISSING_COLUMN = "PGRST204";

export async function getResult(id: string): Promise<Result | null> {
  const { data, error } = await supabase.rpc("get_result", { result_id: id }).maybeSingle<ResultRow>();
  if (error?.code === MISSING_FUNCTION) {
    const legacy = await supabase.from("results").select("id, is_paid, answers, report").eq("id", id).maybeSingle<ResultRow>();
    if (legacy.error) throw legacy.error;
    return legacy.data ? fromRow(legacy.data) : null;
  }
  if (error) throw error;
  return data ? fromRow(data) : null;
}

/** The free 4-colour teaser for these quiz answers (table teaser_palettes, migration 0009). */
export async function getTeaser(answers: Answers): Promise<Teaser> {
  const key = teaserKey(answers);
  const { data } = await supabase
    .from("teaser_palettes")
    .select("summary, colors")
    .match(key)
    .maybeSingle<Teaser>();
  // Table missing, row not found, or text garbled by a bad copy-paste (e.g. "ł" shown as "≈Ç"):
  // compute it here instead.
  const garbled = data && /[√≈∂ÄÃ]/.test(JSON.stringify(data));
  return data?.colors?.length && !garbled ? data : buildTeaser(key.eyes, key.hair, key.undertone);
}

export type ResultSummary = Pick<Result, "id" | "isPaid"> & { createdAt: string };

export async function listMyResults(): Promise<ResultSummary[]> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from("results")
    .select("id, is_paid, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<Pick<ResultRow, "id" | "is_paid" | "created_at">[]>();
  if (error) throw error;
  return data.map((row) => ({ id: row.id, isPaid: row.is_paid, createdAt: row.created_at }));
}

/**
 * Attaches results bought before login was required (anonymous rows) to this
 * account — only those paid with this account's verified email (migration 0011).
 * Safe to call repeatedly; failures are ignored (the list still loads).
 */
export async function claimMyPaidResults(): Promise<void> {
  const { error } = await supabase.rpc("claim_my_paid_results");
  // PGRST202 = function missing until migration 0011 is applied.
  if (error && error.code !== "PGRST202") console.error("Could not attach earlier paid results", error.message);
}

// --- Auth -----------------------------------------------------------------
// Email + password accounts via Supabase Auth. "Confirm email" must be ON in
// the Supabase dashboard, so a new account gets no session until it proves it
// owns the address with the 6-digit code emailed to it (sent through Resend
// SMTP — see README "Accounts & email").

export type AuthUser = { id: string; email: string };

export type AuthErrorCode =
  | "invalid_email"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "weak_password"
  | "same_password"
  | "invalid_code"
  | "rate_limited"
  | "unknown";

export class AuthFailure extends Error {
  readonly code: AuthErrorCode;
  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

function toAuthFailure(error: AuthError): AuthFailure {
  switch (error.code) {
    case "invalid_credentials":
      return new AuthFailure("invalid_credentials");
    case "email_not_confirmed":
      return new AuthFailure("email_not_confirmed");
    case "weak_password":
      return new AuthFailure("weak_password");
    case "same_password":
      return new AuthFailure("same_password");
    case "email_address_invalid":
    case "validation_failed":
      return new AuthFailure("invalid_email");
    case "otp_expired":
      return new AuthFailure("invalid_code");
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return new AuthFailure("rate_limited");
    default:
      return new AuthFailure("unknown");
  }
}

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email ?? "" };
}

// "exists" = the address already has a verified account (Supabase returns a
// user with no identities and sends no email). "signed_in" only happens if
// email confirmation is turned off in the dashboard.
export type SignUpOutcome = "verify" | "exists" | "signed_in";

export async function signUp(email: string, password: string): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw toAuthFailure(error);
  if (data.session) return "signed_in";
  if (data.user?.identities?.length === 0) return "exists";
  return "verify";
}

// Both flows email a 6-digit code: "signup" confirms a new address,
// "recovery" proves ownership before choosing a new password.
// "login" = passwordless sign-in with an emailed code; it also creates the
// account on first use (the "your analysis is ready" step and the login page).
export type CodePurpose = "signup" | "recovery" | "login";

/** isNew: the account was created by this sign-up (used for the sign-up conversion event). */
export async function verifyEmailCode(email: string, code: string, purpose: CodePurpose): Promise<AuthUser & { isNew: boolean }> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: purpose === "login" ? "email" : purpose });
  if (error) throw toAuthFailure(error);
  if (!data.user) throw new AuthFailure("unknown");
  // A code login also creates the account on first use: "new" = created in the last 30 min.
  const isNew = purpose === "signup" || (purpose === "login" && Date.now() - new Date(data.user.created_at).getTime() < 30 * 60_000);
  return { ...toAuthUser(data.user), isNew };
}

export async function sendEmailCode(email: string, purpose: CodePurpose): Promise<void> {
  const { error } = purpose === "signup" ? await supabase.auth.resend({ type: "signup", email })
    : purpose === "recovery" ? await supabase.auth.resetPasswordForEmail(email)
    : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw toAuthFailure(error);
}

// Requires the session created by verifyEmailCode(…, "recovery").
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAuthFailure(error);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAuthFailure(error);
  return toAuthUser(data.user);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthFailure(error);
}

export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}

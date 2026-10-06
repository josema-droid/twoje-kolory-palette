import type { AuthError, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { buildColorReport, type ColorReport } from "@/content/engine";
import { analyzeFacePhoto, type PhotoProblem } from "@/lib/photo-analysis";
import type { Answers } from "@/content/funnel";
import type { Result } from "@/types/result";

type ResultRow = {
  id: string;
  is_paid: boolean;
  answers: Answers;
  report: ColorReport;
  // Missing until migration 0002 is applied.
  user_id?: string | null;
  created_at: string;
};

function fromRow({ is_paid, user_id, created_at: _created_at, ...rest }: ResultRow): Result {
  return { ...rest, isPaid: is_paid, userId: user_id ?? null };
}

// Ids of results this browser created anonymously, so they can be attached to
// the account once the user logs in (claimLocalResults).
const LOCAL_RESULTS_KEY = "twoje-kolory-results";

function readLocalResultIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalResultIds(ids: string[]): void {
  try {
    if (ids.length) localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(ids));
    else localStorage.removeItem(LOCAL_RESULTS_KEY);
  } catch {
    // Storage unavailable (private mode): the result just won't be auto-claimed.
  }
}

/** Gemini could not use the photo (no face, too dark, …) or the analysis is down. */
export class PhotoRejected extends Error {
  constructor(public problem: PhotoProblem | "unavailable" | "unreadable" | "rate_limited" | "daily_limit") {
    super(problem);
  }
}

/** Downscale to max 1024 px and re-encode as JPEG: enough for colour analysis, fast to upload. */
async function photoToBase64Jpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

export async function analyzePhoto(answers: Answers, photoFile: File): Promise<Result> {
  let image: string;
  try {
    image = await photoToBase64Jpeg(photoFile);
  } catch {
    throw new PhotoRejected("unreadable");
  }
  const text = (id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");
  const response = await analyzeFacePhoto({
    data: { image, context: { gender: text("gender"), naturalHair: text("naturalHair"), eyes: text("eyes"), currentHair: text("currentHair") || text("dyedHair") } },
  });
  if (!response.ok) throw new PhotoRejected(response.problem);
  const photo = response.analysis;
  const report = buildColorReport(photo, answers);
  // The id is generated here because anonymous visitors can't read rows back
  // from the table (migration 0003); the result is then fetched via getResult.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("results").insert({ id, answers, report, is_paid: false });
  if (error) throw error;
  const result = await getResult(id);
  if (!result) throw new Error("Failed to save result");
  if (!result.userId) writeLocalResultIds([...readLocalResultIds(), result.id]);
  return result;
}

// PostgREST's "function not found" code. TEMPORARY fallback so this build
// keeps working until migration 0003 is applied; remove once it is.
const MISSING_FUNCTION = "PGRST202";

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

// Attaches results created on this device before logging in to the current
// account. Safe to call repeatedly; failures keep the ids for the next try.
export async function claimLocalResults(): Promise<void> {
  const ids = readLocalResultIds();
  if (!ids.length) return;
  const { error } = await supabase.rpc("claim_results", { result_ids: ids });
  if (!error) writeLocalResultIds([]);
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
export type CodePurpose = "signup" | "recovery";

export async function verifyEmailCode(email: string, code: string, purpose: CodePurpose): Promise<AuthUser> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: purpose });
  if (error) throw toAuthFailure(error);
  if (!data.user) throw new AuthFailure("unknown");
  return toAuthUser(data.user);
}

export async function sendEmailCode(email: string, purpose: CodePurpose): Promise<void> {
  const { error } = purpose === "signup"
    ? await supabase.auth.resend({ type: "signup", email })
    : await supabase.auth.resetPasswordForEmail(email);
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

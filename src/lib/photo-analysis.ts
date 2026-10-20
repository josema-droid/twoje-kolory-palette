import { createServerFn } from "@tanstack/react-start";
import { buildColorReport, type PhotoAnalysis } from "@/content/engine";
import type { Answers } from "@/content/funnel";
import { isHex } from "@/lib/color";

// Photo → the four colour parameters the report engine needs, using Gemini.
// Runs only AFTER payment, on the server: it checks the result is paid, sends
// the photo to Google for this one request (never stored by us), then builds
// and saves the full report. Before payment visitors only see the free teaser
// from their quiz answers (src/content/teaser.ts) — no Gemini call.

const TEMPERATURES = ["chłodna", "neutralno-chłodna", "neutralna", "neutralno-ciepła", "ciepła"] as const;
const DEPTHS = ["jasna", "średnia", "głęboka"] as const;
const SATURATIONS = ["miękka", "umiarkowana", "czysta"] as const;
const CONTRASTS = ["niski", "średni", "wysoki"] as const;
const PROBLEMS = ["no_face", "multiple_faces", "too_dark", "heavy_filter", "face_hidden"] as const;

export type PhotoProblem = (typeof PROBLEMS)[number];
type LimitProblem = "unavailable" | "rate_limited" | "daily_limit" | "too_many_attempts";
export type PhotoAnalysisResponse = { ok: true } | { ok: false; problem: PhotoProblem | LimitProblem | "not_paid" };

type Input = {
  resultId: string;
  /** Base64 JPEG, already downscaled in the browser. */
  image: string;
};

type Context = { gender: string; naturalHair: string; eyes: string; currentHair: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_BASE64_LENGTH = 3_000_000; // ~2.2 MB image; the browser sends ~150–400 KB

const responseSchema = {
  type: "OBJECT",
  properties: {
    usable: { type: "BOOLEAN", description: "true if exactly one face is clearly visible and colours can be judged" },
    problem: { type: "STRING", enum: [...PROBLEMS, "none"], description: "main reason the photo is not usable, or none" },
    temperature: { type: "STRING", enum: [...TEMPERATURES] },
    depth: { type: "STRING", enum: [...DEPTHS] },
    saturation: { type: "STRING", enum: [...SATURATIONS] },
    contrast: { type: "STRING", enum: [...CONTRASTS] },
    eyeHex: { type: "STRING", description: "average iris colour as #rrggbb (not pupil, not eye whites)" },
    eyeName: { type: "STRING", description: "eye colour in Polish, 1-3 words, e.g. 'szaroniebieskie'" },
    hairHex: { type: "STRING", description: "dominant natural hair colour as #rrggbb (mid-lengths, not highlights or shadows)" },
    hairName: { type: "STRING", description: "hair colour in Polish, 1-3 words, e.g. 'ciemny blond'" },
    skinHex: { type: "STRING", description: "skin colour as #rrggbb, sampled from forehead/jaw in even light, without blush" },
    skinName: { type: "STRING", description: "skin tone in Polish, 1-4 words, e.g. 'jasna, ciepła beżowa'" },
  },
  required: ["usable", "problem", "temperature", "depth", "saturation", "contrast", "eyeHex", "eyeName", "hairHex", "hairName", "skinHex", "skinName"],
  propertyOrdering: ["usable", "problem", "temperature", "depth", "saturation", "contrast", "eyeHex", "eyeName", "hairHex", "hairName", "skinHex", "skinName"],
};

function prompt(ctx: Context) {
  return `You are an expert personal colour analyst (12-season system). Analyse the person in the photo.

Judge only natural colouring: skin undertone, skin depth, eye colour and the natural hair and brow colour. Ignore clothing, background, makeup and the colour cast of the light as much as possible.

Return:
- temperature (skin undertone): chłodna (clearly cool, pink/blue), neutralno-chłodna, neutralna, neutralno-ciepła, ciepła (clearly warm, golden/peach).
- depth (overall value of skin + hair + eyes together): jasna (light), średnia (medium), głęboka (deep).
- saturation (chroma of the natural colouring): miękka (soft, muted, greyed), umiarkowana (moderate), czysta (clear, bright).
- contrast (difference in value between hair/brows, eyes and skin): niski, średni, wysoki.
- eyeHex/hairHex/skinHex: the colours as they would look in neutral daylight (correct for the light's colour cast), with short Polish names.

Self-reported context from the quiz (use as a hint; the photo has priority, and dyed hair must not decide the result):
- analysis for: ${ctx.gender || "unknown"}
- natural hair colour: ${ctx.naturalHair || "unknown"}
- current hair: ${ctx.currentHair || "unknown"}
- eye colour: ${ctx.eyes || "unknown"}

If no single face is clearly visible (no face, several faces, far too dark, heavy filter, face covered), set usable=false and the matching problem; still fill the other fields with your best guess.`;
}

function demoAnalysis(image: string): PhotoAnalysis {
  // Local development without GEMINI_API_KEY only: a stable fake profile per photo.
  let hash = 0;
  for (let i = 0; i < image.length; i += 997) hash = (hash * 31 + image.charCodeAt(i)) >>> 0;
  return {
    temperature: TEMPERATURES[hash % 5]!,
    depth: DEPTHS[(hash >> 3) % 3]!,
    saturation: SATURATIONS[(hash >> 6) % 3]!,
    contrast: CONTRASTS[(hash >> 9) % 3]!,
  };
}

const oneOf = <T extends string>(list: readonly T[], value: unknown): value is T => list.includes(value as T);

export const analyzePaidPhoto = createServerFn({ method: "POST" })
  .validator((data: Input) => {
    if (typeof data?.resultId !== "string" || !UUID.test(data.resultId)) throw new Error("Invalid result id");
    if (typeof data?.image !== "string" || data.image.length === 0 || data.image.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/=]+$/.test(data.image.slice(0, 200))) {
      throw new Error("Invalid image");
    }
    return { resultId: data.resultId, image: data.image };
  })
  .handler(async ({ data }): Promise<PhotoAnalysisResponse> => {
    const url = process.env["SUPABASE_URL"];
    const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !serviceKey) {
      console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
      return { ok: false, problem: "unavailable" };
    }
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Only paid results are analysed; an already analysed one is left as it is.
    const { data: row, error } = await admin.from("results").select("is_paid, stripe_session_id, answers, report").eq("id", data.resultId).maybeSingle<{ is_paid: boolean; stripe_session_id: string | null; answers: Answers; report: { palette?: unknown } }>();
    if (error || !row) {
      console.error("Could not load result for analysis", data.resultId, error);
      return { ok: false, problem: "unavailable" };
    }
    if (Array.isArray(row.report?.palette)) return { ok: true };
    // Paid means: marked paid by the signed Stripe webhook, which also stores the session id.
    if (!row.is_paid || !row.stripe_session_id) return { ok: false, problem: "not_paid" };

    const text = (id: string) => (typeof row.answers[id] === "string" ? (row.answers[id] as string).slice(0, 80) : "");
    const context: Context = { gender: text("gender"), naturalHair: text("naturalHair"), eyes: text("eyes"), currentHair: text("currentHair") || text("dyedHair") };

    const result = await runGemini(data.image, context, data.resultId);
    if (!result.ok) return result;
    const report = buildColorReport(result.analysis, row.answers);
    let { error: saveError } = await admin.from("results").update({ report, photo_analysis: result.analysis }).eq("id", data.resultId);
    // TEMPORARY: photo_analysis column missing until migration 0008 is applied.
    if (saveError?.code === "PGRST204") ({ error: saveError } = await admin.from("results").update({ report }).eq("id", data.resultId));
    if (saveError) {
      console.error("Could not save analysed report", data.resultId, saveError);
      return { ok: false, problem: "unavailable" };
    }
    return { ok: true };
  });

/**
 * After payment, for buyers who don't want to share a photo: builds the full
 * report from the quiz answers alone (no photo, no Gemini call, no cost).
 */
export const analyzePaidWithoutPhoto = createServerFn({ method: "POST" })
  .validator((data: { resultId: string }) => {
    if (typeof data?.resultId !== "string" || !UUID.test(data.resultId)) throw new Error("Invalid result id");
    return { resultId: data.resultId };
  })
  .handler(async ({ data }): Promise<PhotoAnalysisResponse> => {
    const url = process.env["SUPABASE_URL"];
    const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !serviceKey) return { ok: false, problem: "unavailable" };
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: row, error } = await admin.from("results").select("is_paid, stripe_session_id, answers, report").eq("id", data.resultId).maybeSingle<{ is_paid: boolean; stripe_session_id: string | null; answers: Answers; report: { palette?: unknown } }>();
    if (error || !row) return { ok: false, problem: "unavailable" };
    if (Array.isArray(row.report?.palette)) return { ok: true };
    if (!row.is_paid || !row.stripe_session_id) return { ok: false, problem: "not_paid" };
    const { estimateFromAnswers } = await import("@/content/teaser");
    const report = buildColorReport(estimateFromAnswers(row.answers), row.answers);
    const { error: saveError } = await admin.from("results").update({ report }).eq("id", data.resultId);
    if (saveError) {
      console.error("Could not save answers-only report", data.resultId, saveError);
      return { ok: false, problem: "unavailable" };
    }
    return { ok: true };
  });

/** The visitor's IP as set by the hosting platform (not the spoofable leftmost X-Forwarded-For). */
async function clientIp(): Promise<string | undefined> {
  const { getRequestHeader, getRequestIP } = await import("@tanstack/react-start/server");
  return getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-real-ip") ?? getRequestHeader("x-vercel-forwarded-for") ?? getRequestIP({ xForwardedFor: true });
}

async function runGemini(image: string, context: Context, resultId: string): Promise<{ ok: true; analysis: PhotoAnalysis } | { ok: false; problem: PhotoProblem | LimitProblem }> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    if (import.meta.env.DEV) {
      console.warn("GEMINI_API_KEY is not set — using a fake photo analysis (development only).");
      return { ok: true, analysis: demoAnalysis(image) };
    }
    console.error("GEMINI_API_KEY is not set");
    return { ok: false, problem: "unavailable" };
  }

  // Cost protection before the paid call: attempts per paid result, per visitor and site-wide.
  const { checkAndRecordAnalysis } = await import("@/lib/rate-limit");
  const limit = await checkAndRecordAnalysis(await clientIp(), resultId);
  if (limit !== "ok") return { ok: false, problem: limit };

  // Primary model, then fallbacks if Google is overloaded (503/429), errors or is slow.
  // Benchmarked Oct 2026: gemini-3.5-flash ~4 s and matches the newest model; 3.8-flash took 45-60 s.
  const models = [
    process.env["GEMINI_MODEL"] || "gemini-3.5-flash",
    process.env["GEMINI_FALLBACK_MODEL"] || "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
  ];
  // Overload errors come back in under a second, so a short pause + retry is cheap.
  const attempts = models.flatMap((model) => [{ model, wait: 0 }, { model, wait: 1200 }]);
  const deadline = Date.now() + 40_000;
  // Gemini 2.x sets thinking with a token budget, 3.x with a level; keep it low for speed.
  const body = (model: string) =>
    JSON.stringify({
      contents: [{ role: "user", parts: [{ inline_data: { mime_type: "image/jpeg", data: image } }, { text: prompt(context) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
        thinkingConfig: model.startsWith("gemini-2") ? { thinkingBudget: 512 } : { thinkingLevel: "low" },
      },
    });

  for (const { model, wait } of attempts) {
    if (Date.now() + wait > deadline) break;
    if (wait) await new Promise((r) => setTimeout(r, wait));
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: body(model),
        signal: AbortSignal.timeout(Math.max(3_000, Math.min(20_000, deadline - Date.now()))),
      });
    } catch (error) {
      console.error(`Gemini request failed (${model})`, error);
      continue;
    }

    if (!response.ok) {
      console.error(`Gemini error (${model})`, response.status, (await response.text()).slice(0, 300));
      continue; // 503/429 (overloaded) and 5xx: retry/fall back; 4xx config errors fail the same way on every attempt
    }

    try {
      const json = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const out = JSON.parse(text) as Record<string, unknown>;
      if (out["usable"] === false) {
        return { ok: false, problem: oneOf(PROBLEMS, out["problem"]) ? out["problem"] : "no_face" };
      }
      if (oneOf(TEMPERATURES, out["temperature"]) && oneOf(DEPTHS, out["depth"]) && oneOf(SATURATIONS, out["saturation"]) && oneOf(CONTRASTS, out["contrast"])) {
        // Feature colours are optional extras: invalid ones are dropped and the quiz answers fill in.
        const feature = (hex: unknown, name: unknown) =>
          isHex(hex) ? { hex: hex.toLowerCase(), name: typeof name === "string" ? name.slice(0, 40).toLowerCase() : "" } : undefined;
        const features = {
          eyes: feature(out["eyeHex"], out["eyeName"]),
          hair: feature(out["hairHex"], out["hairName"]),
          skin: feature(out["skinHex"], out["skinName"]),
        };
        return { ok: true, analysis: { temperature: out["temperature"], depth: out["depth"], saturation: out["saturation"], contrast: out["contrast"], features } };
      }
      console.error(`Gemini returned unexpected values (${model})`, text.slice(0, 300));
    } catch (error) {
      console.error(`Could not parse Gemini response (${model})`, error);
    }
  }
  return { ok: false, problem: "unavailable" };
}

import { createServerFn } from "@tanstack/react-start";
import type { PhotoAnalysis } from "@/content/engine";

// Photo → the four colour parameters the report engine needs, using Gemini.
// Runs on the server only: the API key never reaches the browser, and the photo
// is sent to Google for this one request and not stored by us.

const TEMPERATURES = ["chłodna", "neutralno-chłodna", "neutralna", "neutralno-ciepła", "ciepła"] as const;
const DEPTHS = ["jasna", "średnia", "głęboka"] as const;
const SATURATIONS = ["miękka", "umiarkowana", "czysta"] as const;
const CONTRASTS = ["niski", "średni", "wysoki"] as const;
const PROBLEMS = ["no_face", "multiple_faces", "too_dark", "heavy_filter", "face_hidden"] as const;

export type PhotoProblem = (typeof PROBLEMS)[number];
export type PhotoAnalysisResponse = { ok: true; analysis: PhotoAnalysis } | { ok: false; problem: PhotoProblem | "unavailable" | "rate_limited" | "daily_limit" };

type Input = {
  /** Base64 JPEG, already downscaled in the browser. */
  image: string;
  context: { gender: string; naturalHair: string; eyes: string; currentHair: string };
};

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
  },
  required: ["usable", "problem", "temperature", "depth", "saturation", "contrast"],
  propertyOrdering: ["usable", "problem", "temperature", "depth", "saturation", "contrast"],
};

function prompt(ctx: Input["context"]) {
  return `You are an expert personal colour analyst (12-season system). Analyse the person in the photo.

Judge only natural colouring: skin undertone, skin depth, eye colour and the natural hair and brow colour. Ignore clothing, background, makeup and the colour cast of the light as much as possible.

Return:
- temperature (skin undertone): chłodna (clearly cool, pink/blue), neutralno-chłodna, neutralna, neutralno-ciepła, ciepła (clearly warm, golden/peach).
- depth (overall value of skin + hair + eyes together): jasna (light), średnia (medium), głęboka (deep).
- saturation (chroma of the natural colouring): miękka (soft, muted, greyed), umiarkowana (moderate), czysta (clear, bright).
- contrast (difference in value between hair/brows, eyes and skin): niski, średni, wysoki.

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

export const analyzeFacePhoto = createServerFn({ method: "POST" })
  .validator((data: Input) => {
    if (typeof data?.image !== "string" || data.image.length === 0 || data.image.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/=]+$/.test(data.image.slice(0, 200))) {
      throw new Error("Invalid image");
    }
    const c = data.context ?? {};
    const clip = (v: unknown) => (typeof v === "string" ? v.slice(0, 80) : "");
    return { image: data.image, context: { gender: clip(c.gender), naturalHair: clip(c.naturalHair), eyes: clip(c.eyes), currentHair: clip(c.currentHair) } };
  })
  .handler(async ({ data }): Promise<PhotoAnalysisResponse> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      if (import.meta.env.DEV) {
        console.warn("GEMINI_API_KEY is not set — using a fake photo analysis (development only).");
        return { ok: true, analysis: demoAnalysis(data.image) };
      }
      console.error("GEMINI_API_KEY is not set");
      return { ok: false, problem: "unavailable" };
    }

    // Cost protection before the paid call: per-visitor and site-wide daily limits.
    const { checkAndRecordAnalysis } = await import("@/lib/rate-limit");
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const limit = await checkAndRecordAnalysis(getRequestIP({ xForwardedFor: true }));
    if (limit !== "ok") return { ok: false, problem: limit };

    const model = process.env["GEMINI_MODEL"] || "gemini-3.8-flash";
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ inline_data: { mime_type: "image/jpeg", data: data.image } }, { text: prompt(data.context) }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      console.error("Gemini request failed", error);
      return { ok: false, problem: "unavailable" };
    }

    if (!response.ok) {
      console.error("Gemini error", response.status, (await response.text()).slice(0, 500));
      return { ok: false, problem: "unavailable" };
    }

    try {
      const body = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      const out = JSON.parse(text) as Record<string, unknown>;
      if (out["usable"] === false) {
        return { ok: false, problem: oneOf(PROBLEMS, out["problem"]) ? out["problem"] : "no_face" };
      }
      if (oneOf(TEMPERATURES, out["temperature"]) && oneOf(DEPTHS, out["depth"]) && oneOf(SATURATIONS, out["saturation"]) && oneOf(CONTRASTS, out["contrast"])) {
        return { ok: true, analysis: { temperature: out["temperature"], depth: out["depth"], saturation: out["saturation"], contrast: out["contrast"] } };
      }
      console.error("Gemini returned unexpected values", text.slice(0, 300));
    } catch (error) {
      console.error("Could not parse Gemini response", error);
    }
    return { ok: false, problem: "unavailable" };
  });

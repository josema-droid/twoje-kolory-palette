// Server-only limits for the paid Gemini call, so bots or a viral spike can't run up
// the bill. Counts live in Supabase (migration 0007); IPs are stored only as hashes.
import { createHash } from "node:crypto";

const num = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

// Defaults can be changed in Vercel → Environment Variables without a code change.
const LIMITS = {
  perIpHour: () => num("ANALYSIS_LIMIT_PER_IP_HOUR", 5),
  perIpDay: () => num("ANALYSIS_LIMIT_PER_IP_DAY", 10),
  globalDay: () => num("ANALYSIS_LIMIT_PER_DAY", 1000),
};

export type LimitResult = "ok" | "rate_limited" | "daily_limit";

function hashIp(ip: string) {
  // Salted so the stored hash can't be reversed with a lookup table of all IPs.
  const salt = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "twoj-color";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function admin() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Checks the limits and, when allowed, records this analysis. */
export async function checkAndRecordAnalysis(ip: string | undefined): Promise<LimitResult> {
  const db = await admin();
  if (!db) {
    console.error("Rate limit skipped: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
    return "ok";
  }
  const ipHash = hashIp(ip || "unknown");
  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [hour, day, global] = await Promise.all([
    db.from("photo_analyses").select("id", { count: "exact" }).eq("ip_hash", ipHash).gte("created_at", since(3_600_000)).limit(1),
    db.from("photo_analyses").select("id", { count: "exact" }).eq("ip_hash", ipHash).gte("created_at", since(86_400_000)).limit(1),
    db.from("photo_analyses").select("id", { count: "exact" }).gte("created_at", since(86_400_000)).limit(1),
  ]);

  const error = hour.error ?? day.error ?? global.error;
  if (error) {
    // Most likely migration 0007 isn't applied yet. Don't block customers; Google's
    // own monthly spend cap remains the backstop.
    console.error("Rate limit check failed (is migration 0007 applied?)", error.message);
    return "ok";
  }
  if ((global.count ?? 0) >= LIMITS.globalDay()) {
    console.error(`Daily analysis limit reached (${LIMITS.globalDay()})`);
    return "daily_limit";
  }
  if ((hour.count ?? 0) >= LIMITS.perIpHour() || (day.count ?? 0) >= LIMITS.perIpDay()) return "rate_limited";

  const { error: insertError } = await db.from("photo_analyses").insert({ ip_hash: ipHash });
  if (insertError) console.error("Could not record photo analysis for rate limiting", insertError.message);
  // Housekeeping: occasionally drop rows older than 2 days (only the last 24 h are needed).
  if (Math.random() < 0.02) await db.from("photo_analyses").delete().lt("created_at", since(2 * 86_400_000));
  return "ok";
}

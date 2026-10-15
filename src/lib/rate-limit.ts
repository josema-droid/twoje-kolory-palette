// Server-only limits for the paid Gemini call, so bots or a viral spike can't run up
// the bill. Counts live in Supabase (migrations 0007 + 0010); IPs are stored only as
// hashes. Each paid result gets a fixed number of attempts, checked atomically.
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
  // Covers a few retries with a better photo; beyond that, write to support.
  perResult: () => num("ANALYSIS_LIMIT_PER_RESULT", 5),
};

export type LimitResult = "ok" | "rate_limited" | "daily_limit" | "too_many_attempts" | "unavailable";

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

/** Checks the limits and, when allowed, records this attempt for the paid result. */
export async function checkAndRecordAnalysis(ip: string | undefined, resultId: string): Promise<LimitResult> {
  const db = await admin();
  if (!db) {
    console.error("Rate limit: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
    return "unavailable";
  }
  const ipHash = hashIp(ip || "unknown");
  const { data, error } = await db.rpc("record_analysis_attempt", {
    p_result_id: resultId,
    p_ip_hash: ipHash,
    p_per_result: LIMITS.perResult(),
    p_per_ip_hour: LIMITS.perIpHour(),
    p_per_ip_day: LIMITS.perIpDay(),
    p_global_day: LIMITS.globalDay(),
  });
  // TEMPORARY: function missing until migration 0010 is applied — use the older check.
  if (error?.code === "PGRST202") return legacyCheck(db, ipHash);
  if (error) {
    // Fail closed: without a working limit, nothing protects the Gemini bill.
    console.error("Rate limit check failed", error.message);
    return "unavailable";
  }
  // Housekeeping: occasionally drop old rows (per-result attempts stay counted for 30 days).
  if (Math.random() < 0.02) await db.from("photo_analyses").delete().lt("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
  return data === "ok" || data === "rate_limited" || data === "daily_limit" || data === "too_many_attempts" ? data : "unavailable";
}

type Db = NonNullable<Awaited<ReturnType<typeof admin>>>;

// Pre-0010 check (not atomic, per IP only). Remove once 0010 is applied.
async function legacyCheck(db: Db, ipHash: string): Promise<LimitResult> {
  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [hour, day, global] = await Promise.all([
    db.from("photo_analyses").select("id", { count: "exact" }).eq("ip_hash", ipHash).gte("created_at", since(3_600_000)).limit(1),
    db.from("photo_analyses").select("id", { count: "exact" }).eq("ip_hash", ipHash).gte("created_at", since(86_400_000)).limit(1),
    db.from("photo_analyses").select("id", { count: "exact" }).gte("created_at", since(86_400_000)).limit(1),
  ]);
  const error = hour.error ?? day.error ?? global.error;
  if (error) {
    console.error("Rate limit check failed", error.message);
    return "unavailable";
  }
  if ((global.count ?? 0) >= LIMITS.globalDay()) return "daily_limit";
  if ((hour.count ?? 0) >= LIMITS.perIpHour() || (day.count ?? 0) >= LIMITS.perIpDay()) return "rate_limited";
  await db.from("photo_analyses").insert({ ip_hash: ipHash });
  return "ok";
}

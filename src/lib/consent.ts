// Cookie consent per category. Analytics = Google Analytics, marketing = Meta Pixel.
// Stored in this browser only; changed any time via "Ustawienia cookies" in the footer.

export type Consent = { analytics: boolean; marketing: boolean };

const KEY = "twoje-kolory-consent";
// Before Meta Pixel existed the banner stored "all" / "necessary" here and its
// "all" covered Google Analytics only — so marketing must be asked again.
const OLD_KEY = "twoje-kolory-cookies";

/** The saved choice, or null when the visitor hasn't chosen yet (banner shown). */
export function readConsent(): Consent | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Consent> | null;
    if (saved && typeof saved.analytics === "boolean" && typeof saved.marketing === "boolean") {
      return { analytics: saved.analytics, marketing: saved.marketing };
    }
  } catch {
    // Unreadable or blocked storage: treat as not chosen.
  }
  return null;
}

/** Earlier "Akceptuj wszystkie" (analytics only): keep GA on until the visitor answers again. */
export function legacyAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(OLD_KEY) === "all";
  } catch {
    return false;
  }
}

export function saveConsent(consent: Consent): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(consent));
    localStorage.removeItem(OLD_KEY);
  } catch {
    // Storage blocked: the choice applies to this visit only.
  }
}

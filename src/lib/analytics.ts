// Google Analytics 4. Loaded only after the visitor accepts all cookies in the
// banner (GDPR/ePrivacy): nothing is requested from Google before that.
// Page views: GA's own page_view on load, plus "page changes based on browser
// history events" (Enhanced measurement, on by default) for in-app navigation.

const GA_ID = "G-LGGB646JRG";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let loaded = false;

export function enableAnalytics(): void {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  if (loaded) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself, exactly like Google's snippet.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // Consent Mode v2: analytics only; no advertising storage or personalization.
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Consent withdrawn: stop sending data and remove GA's cookies. */
export function disableAnalytics(): void {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const domain = location.hostname.replace(/^www\./, "");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]!.trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const d of ["", `; domain=${domain}`, `; domain=.${domain}`]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
      }
    }
  }
}

/** Custom events (only sent once analytics is enabled). */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.("event", name, params);
}

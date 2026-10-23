// Meta (Facebook/Instagram) Pixel. Loaded only after the visitor accepts
// MARKETING cookies; before that nothing is requested from Meta and every event
// call below is a no-op. The Pixel ID comes from VITE_META_PIXEL_ID (public by
// nature — it is visible in every page that runs the Pixel).

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const PIXEL_ID = import.meta.env["VITE_META_PIXEL_ID"] as string | undefined;
let loaded = false;

export function enablePixel(): void {
  if (typeof window === "undefined" || !PIXEL_ID) return;
  if (loaded) {
    window.fbq?.("consent", "grant");
    return;
  }
  loaded = true;
  // Meta's standard base code, as a function instead of an inline <script>.
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("consent", "grant");
  fbq("init", PIXEL_ID);
  fbq("track", "PageView");
}

/** Marketing consent withdrawn: stop sending and remove Meta's first-party cookie. */
export function disablePixel(): void {
  if (typeof window === "undefined") return;
  window.fbq?.("consent", "revoke");
  const domain = location.hostname.replace(/^www\./, "");
  for (const name of ["_fbp", "_fbc"]) {
    for (const d of ["", `; domain=${domain}`, `; domain=.${domain}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}

/** In-app navigation (the first PageView is sent when the Pixel loads). */
export function pixelPageView(): void {
  if (loaded) window.fbq?.("track", "PageView");
}

/**
 * A standard event, e.g. Lead, InitiateCheckout, Purchase. `eventId` lets Meta
 * de-duplicate if the same event is ever also sent server-side (Conversions API).
 */
export function pixelEvent(name: "Lead" | "InitiateCheckout" | "Purchase", params?: Record<string, unknown>, eventId?: string): void {
  if (!loaded) return;
  window.fbq?.("track", name, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

/** Fires an event at most once per key in this browser (e.g. Purchase per result). */
export function pixelEventOnce(key: string, name: "Lead" | "InitiateCheckout" | "Purchase", params?: Record<string, unknown>, eventId?: string): void {
  if (!loaded) return;
  try {
    const storageKey = `twoje-kolory-px:${key}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch {
    // Storage blocked: may fire again on reload, which Meta de-duplicates by eventID.
  }
  pixelEvent(name, params, eventId);
}

// The funnel's conversion events, sent to both Meta Pixel and Google Analytics 4.
// Each tool only receives them with its own consent (marketing / analytics);
// without consent these calls do nothing.
import { gaEventOnce } from "@/lib/analytics";
import { pixelEventOnce } from "@/lib/meta-pixel";
import { CURRENCY, PRICE_PLN } from "@/lib/price";

const ITEM = { item_id: "pelny-raport", item_name: "Pełny raport — Twój Color", price: PRICE_PLN, quantity: 1 };

/** "Zaczynamy test" tapped. */
export function trackTestStart(): void {
  pixelEventOnce(`lead:${Date.now()}`, "Lead");
  gaEventOnce(`lead:${Date.now()}`, "generate_lead");
}

/** A new account verified its email (code login on /analiza or password sign-up). */
export function trackSignUp(userId: string): void {
  pixelEventOnce(`signup:${userId}`, "CompleteRegistration");
  gaEventOnce(`signup:${userId}`, "sign_up", { method: "email_code" });
}

/** The price / payment box is shown for this result. */
export function trackCheckoutView(resultId: string): void {
  pixelEventOnce(`checkout:${resultId}`, "InitiateCheckout");
  gaEventOnce(`checkout:${resultId}`, "begin_checkout", { currency: CURRENCY, value: PRICE_PLN, items: [ITEM] });
}

/** The order is paid. orderId = Stripe checkout session id (cs_…). */
export function trackPurchase(orderId: string): void {
  pixelEventOnce(`purchase:${orderId}`, "Purchase", { value: PRICE_PLN, currency: CURRENCY }, orderId);
  gaEventOnce(`purchase:${orderId}`, "purchase", { transaction_id: orderId, currency: CURRENCY, value: PRICE_PLN, items: [ITEM] });
}

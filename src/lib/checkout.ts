import { createServerFn } from "@tanstack/react-start";
import { SITE_URL } from "@/lib/seo";

type CheckoutInput = { resultId: string; origin: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Where Stripe may send buyers back to. Anything else (a tampered request) falls back to the main site.
const ALLOWED_ORIGINS = [SITE_URL, "https://www.twojcolor.com", "https://twoje-kolory-palette.vercel.app", "http://localhost:8080"];

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: CheckoutInput) => {
    if (typeof data?.resultId !== "string" || !UUID.test(data.resultId)) throw new Error("Invalid result id");
    const origin = ALLOWED_ORIGINS.includes(data.origin) ? data.origin : SITE_URL;
    return { resultId: data.resultId, origin };
  })
  .handler(async ({ data: { resultId, origin } }) => {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // This Stripe account has Managed Payments (Stripe's automatic tax
      // calculation) on by default, which requires a tax_code per product.
      // Disabled here to keep launch simple — revisit once ready to handle
      // VAT deliberately, not as a side effect of a checkout param.
      managed_payments: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: "pln",
            unit_amount: 3900,
            product_data: { name: "Pełny wynik — Twój Color" },
          },
          quantity: 1,
        },
      ],
      metadata: { resultId },
      locale: "pl",
      success_url: `${origin}/wynik/${resultId}?paid=1`,
      cancel_url: `${origin}/wynik/${resultId}`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

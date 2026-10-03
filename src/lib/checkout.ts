import { createServerFn } from "@tanstack/react-start";

type CheckoutInput = { resultId: string; origin: string };

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: CheckoutInput) => data)
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
      success_url: `${origin}/wynik/${resultId}?paid=1`,
      cancel_url: `${origin}/wynik/${resultId}`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

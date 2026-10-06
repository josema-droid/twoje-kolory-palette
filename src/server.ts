import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Stripe posts here directly (not through the app's router/server functions),
// so it's handled as a plain HTTP route ahead of the TanStack Start handler.
async function handleStripeWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature header", { status: 400 });

  const rawBody = await request.text();
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env["STRIPE_WEBHOOK_SECRET"]!);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  // "completed" fires for every finished checkout, but delayed methods (e.g. bank
  // transfers, sometimes Przelewy24) are still "unpaid" at that point and confirm
  // later with async_payment_succeeded. Only unlock once the money is actually paid.
  let session: import("stripe").Stripe.Checkout.Session | null = null;
  if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") session = event.data.object;
  if (event.type === "checkout.session.async_payment_succeeded") session = event.data.object;
  if (event.type === "checkout.session.async_payment_failed") {
    console.error("Stripe async payment failed", event.data.object.id, event.data.object.metadata?.["resultId"]);
  }
  if (session) {
    const resultId = session.metadata?.["resultId"];
    if (resultId) {
      const { createClient } = await import("@supabase/supabase-js");
      const admin = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!);
      const { error } = await admin.from("results").update({ is_paid: true }).eq("id", resultId);
      if (error) {
        // Non-2xx makes Stripe retry the webhook (for up to 3 days), so a paid result is never left locked.
        console.error("Failed to mark result as paid", resultId, error);
        return new Response("Could not mark result as paid", { status: 500 });
      }
    } else {
      console.error("Paid Stripe checkout session missing resultId metadata", session.id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/stripe-webhook") {
      try {
        return await handleStripeWebhook(request);
      } catch (error) {
        console.error(error);
        return new Response("Webhook handler error", { status: 500 });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

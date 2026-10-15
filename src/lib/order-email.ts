// Order confirmation email, sent from the Stripe webhook (src/server.ts) via
// the Resend API once a payment is confirmed.
//
// Legally this is the "confirmation on a durable medium": it carries the order,
// the buyer's consent to immediate delivery (which ends the 14-day withdrawal
// right) and the full Regulamin text — so it must be sent for every paid order.
import type { LegalBlock } from "@/components/legal-document";
import { termsDoc } from "@/content/terms";
import { pl } from "@/content/pl";
import { SITE_URL } from "@/lib/seo";

export type OrderEmail = {
  to: string;
  resultId: string;
  stripeSessionId: string;
  paidAt: Date;
  consentAt: Date | null;
  termsVersion: string | null;
  amount: number | null; // in grosze
};

const INK = "#2b2226";
const MUTED = "#6b5e63";
const ROSE = "#a94a5a";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "$1");
const plain = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");

const when = (d: Date) =>
  `${new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeZone: "Europe/Warsaw" }).format(d)}, godz. ${new Intl.DateTimeFormat("pl-PL", { timeStyle: "short", timeZone: "Europe/Warsaw" }).format(d)}`;
const price = (grosze: number | null) => `${((grosze ?? 3900) / 100).toFixed(2).replace(".", ",")} zł`;

function blockHtml(b: LegalBlock): string {
  const p = `margin:10px 0 0;font-size:13px;line-height:1.6;color:${MUTED};`;
  if (typeof b === "string") return `<p style="${p}">${fmt(b)}</p>`;
  if ("sub" in b) return `<p style="margin:16px 0 0;font-size:14px;font-weight:bold;color:${INK};">${fmt(b.sub)}</p>`;
  if ("list" in b) return `<ul style="${p}padding-left:20px;">${b.list.map((i) => `<li style="margin-top:6px;">${fmt(i)}</li>`).join("")}</ul>`;
  if ("ordered" in b) return `<ol style="${p}padding-left:20px;">${b.ordered.map((i) => `<li style="margin-top:6px;">${fmt(i)}</li>`).join("")}</ol>`;
  if ("quote" in b) return `<div style="${p}border-left:3px solid #e6cfd3;padding-left:12px;">${b.quote.map((l) => `<p style="margin:6px 0 0;">${fmt(l)}</p>`).join("")}</div>`;
  return b.table.rows.map((r) => `<p style="${p}">${r.map(fmt).join(" · ")}</p>`).join("");
}

function blockText(b: LegalBlock): string {
  if (typeof b === "string") return plain(b);
  if ("sub" in b) return plain(b.sub).toUpperCase();
  if ("list" in b) return b.list.map((i) => `- ${plain(i)}`).join("\n");
  if ("ordered" in b) return b.ordered.map((i, n) => `${n + 1}. ${plain(i)}`).join("\n");
  if ("quote" in b) return b.quote.map((l) => `> ${plain(l)}`).join("\n");
  return b.table.rows.map((r) => r.map(plain).join(" · ")).join("\n");
}

export function renderOrderEmail(o: OrderEmail) {
  const link = `${SITE_URL}/wynik/${o.resultId}`;
  const orderNo = o.resultId.slice(0, 8).toUpperCase();
  const version = o.termsVersion ?? "1.0";
  const consentLine = o.consentAt
    ? `W dniu ${when(o.consentAt)}, przed zapłatą, zaznaczono w serwisie oświadczenie: „${pl.result.legalConsent}” oraz akceptację Regulaminu (wersja ${version}).`
    : `Przed zapłatą zaznaczono w serwisie oświadczenie: „${pl.result.legalConsent}” oraz akceptację Regulaminu (wersja ${version}).`;
  const waiver = "Na Twoją wyraźną prośbę rozpoczęliśmy świadczenie Usługi przed upływem 14 dni, a wynik został dostarczony. W związku z tym prawo odstąpienia od umowy nie przysługuje (art. 38 ust. 1 pkt 1 i 13 ustawy o prawach konsumenta). Twoje prawa w razie niezgodności Usługi z umową (reklamacja) pozostają bez zmian.";
  const rows: [string, string][] = [
    ["Numer zamówienia", orderNo],
    ["Data zapłaty", when(o.paidAt)],
    ["Usługa", "Osobista analiza kolorystyczna online — pełny wynik (treść cyfrowa)"],
    ["Cena", `${price(o.amount)} brutto, jednorazowo`],
    ["Płatność", "Stripe"],
  ];

  const subject = `Potwierdzenie zamówienia ${orderNo} — Twój Color`;

  const html = `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:0;background:#faf6f2;font-family:Helvetica,Arial,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f2;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:36px 28px;">
          <tr><td style="font-family:Georgia,serif;font-size:22px;">Twój Color<span style="color:${ROSE};">.</span></td></tr>
          <tr><td style="padding-top:28px;font-family:Georgia,serif;font-size:28px;line-height:1.2;">Dziękujemy za zamówienie</td></tr>
          <tr><td style="padding-top:14px;font-size:15px;line-height:1.6;color:${MUTED};">Płatność została przyjęta. Twój pełny wynik analizy kolorystycznej jest już dostępny pod linkiem poniżej. Zachowaj tę wiadomość — to potwierdzenie zawarcia umowy.</td></tr>
          <tr><td align="center" style="padding:28px 0;">
            <a href="${link}" style="display:inline-block;background:${ROSE};color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:15px;font-weight:bold;">Zobacz swój wynik</a>
          </td></tr>
          <tr><td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;">
              ${rows.map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #f0e6e2;color:${MUTED};white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:8px 0;border-top:1px solid #f0e6e2;">${esc(v)}</td></tr>`).join("")}
            </table>
          </td></tr>
          <tr><td style="padding-top:28px;font-family:Georgia,serif;font-size:19px;">Twoja zgoda i prawo odstąpienia</td></tr>
          <tr><td style="padding-top:10px;font-size:14px;line-height:1.6;color:${MUTED};">${esc(consentLine)}</td></tr>
          <tr><td style="padding-top:10px;font-size:14px;line-height:1.6;color:${MUTED};">${esc(waiver)}</td></tr>
          <tr><td style="padding-top:24px;font-size:14px;line-height:1.6;color:${MUTED};">Pytania lub reklamacje: <a href="mailto:info@twojcolor.com" style="color:${ROSE};">info@twojcolor.com</a> — wystarczy odpowiedzieć na tę wiadomość.</td></tr>
          <tr><td style="padding-top:32px;border-bottom:1px solid #f0e6e2;"></td></tr>
          <tr><td style="padding-top:24px;font-family:Georgia,serif;font-size:19px;">${esc(termsDoc.title)} (wersja ${esc(version)})</td></tr>
          <tr><td style="padding-top:4px;font-size:12px;color:${MUTED};">Treść obowiązująca w chwili zamówienia. Aktualna wersja: <a href="${SITE_URL}/regulamin" style="color:${ROSE};">${SITE_URL.replace("https://", "")}/regulamin</a></td></tr>
          ${termsDoc.sections.map((s) => `<tr><td style="padding-top:18px;"><p style="margin:0;font-size:14px;font-weight:bold;color:${INK};">${esc(s.title)}</p>${s.body.map(blockHtml).join("")}</td></tr>`).join("")}
          ${termsDoc.footer ? `<tr><td style="padding-top:18px;font-size:12px;font-style:italic;color:${MUTED};">${esc(termsDoc.footer)}</td></tr>` : ""}
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    "Twój Color — Dziękujemy za zamówienie",
    "",
    "Płatność została przyjęta. Twój pełny wynik jest dostępny tutaj:",
    link,
    "Zachowaj tę wiadomość — to potwierdzenie zawarcia umowy.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "TWOJA ZGODA I PRAWO ODSTĄPIENIA",
    consentLine,
    waiver,
    "",
    "Pytania lub reklamacje: info@twojcolor.com",
    "",
    "----------------------------------------",
    `${termsDoc.title.toUpperCase()} (wersja ${version})`,
    ...termsDoc.sections.flatMap((s) => ["", s.title, ...s.body.map(blockText)]),
    "",
    termsDoc.footer ?? "",
  ].join("\n");

  return { subject, html, text };
}

/**
 * Sends the confirmation. Resend's Idempotency-Key makes repeated webhook
 * deliveries for the same Stripe session send only one email.
 * Returns false when it could not be sent (the caller makes Stripe retry).
 */
export async function sendOrderEmail(o: OrderEmail): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) {
    console.error("RESEND_API_KEY is not set — order confirmation not sent", o.resultId);
    return true; // nothing a retry would fix; don't make Stripe retry for days
  }
  const { subject, html, text } = renderOrderEmail(o);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-confirmation/${o.stripeSessionId}`,
    },
    body: JSON.stringify({
      from: process.env["ORDER_EMAIL_FROM"] ?? "Twój Color <info@twojcolor.com>",
      to: [o.to],
      reply_to: "info@twojcolor.com",
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    console.error("Resend failed to send order confirmation", o.resultId, response.status, await response.text());
    return false;
  }
  return true;
}

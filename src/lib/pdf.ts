// "Download as PDF" for the paid report. Each block (header + every report
// section) is captured separately — one tall capture would exceed the canvas
// size limit on iPhones — and laid out on A4 pages:
// - a block that fits on the current page goes there; one that fits on a page
//   but not in the remaining space starts a new page (sections are never cut
//   when they don't have to be);
// - a block taller than a page is split only between elements (rows, cards,
//   paragraphs), never right after a heading and preferably not inside a card.
// The libraries are loaded only when the button is pressed.

const PAGE_W = 210; // A4, mm
const PAGE_H = 297;
const MARGIN = 12;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const CONTENT_H = PAGE_H - 2 * MARGIN;
const GAP = 6;
const MAX_CANVAS_WIDTH = 1600; // px; keeps memory and file size reasonable
const MIN_SLICE = 0.35; // a split must use at least this share of the space it fills
// Every PDF uses the desktop layout, also when downloaded on a phone (a phone's
// narrow layout stretched to A4 gives huge text and dozens of pages).
const LAYOUT_WIDTH = 1100;

/** Any CSS colour (the site uses oklch, which jsPDF can't read) as #rrggbb, via a 1-px canvas. */
function toHex(color: string): string {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => (v ?? 255).toString(16).padStart(2, "0")).join("")}`;
}

const HEADING = "h1, h2, h3, h4, .dash-eyebrow, .dash-label";
const UNBREAKABLE = ".dash-card, li, tr, figure, .dash-celeb";

/**
 * Safe split points (CSS px from the block's top): where an element starts,
 * so a split never falls inside a line of text. `strong` points are also
 * outside cards and list items.
 */
function breakPoints(block: HTMLElement) {
  const top = block.getBoundingClientRect().top;
  const strong = new Set<number>();
  const weak = new Set<number>();
  for (const el of Array.from(block.querySelectorAll<HTMLElement>("*"))) {
    const display = (el.ownerDocument.defaultView ?? window).getComputedStyle(el).display;
    if (display.startsWith("inline") || display === "contents" || display === "none" || el.offsetHeight === 0) continue;
    if (el.previousElementSibling?.matches(HEADING)) continue; // keep headings with what follows
    const y = Math.round(el.getBoundingClientRect().top - top);
    if (y <= 0) continue;
    weak.add(y);
    if (!el.parentElement?.closest(UNBREAKABLE) || el.parentElement === block) strong.add(y);
  }
  const sort = (s: Set<number>) => [...s].sort((a, b) => a - b);
  return { strong: sort(strong), weak: sort(weak) };
}

/** Largest split point in (from + min, from + max]; falls back to a hard cut at from + max. */
function pickCut(points: { strong: number[]; weak: number[] }, from: number, max: number) {
  const pick = (list: number[]) => {
    let best = -1;
    for (const p of list) if (p > from + max * MIN_SLICE && p <= from + max) best = p;
    return best;
  };
  const strong = pick(points.strong);
  if (strong > 0) return strong;
  const weak = pick(points.weak);
  return weak > 0 ? weak : from + max;
}

type Options = { skipExternalImages: boolean };

/**
 * Photos from other sites (Wikimedia) as data: URLs, so the capture can draw
 * them without a cross-origin request (Safari otherwise leaves them blank).
 */
async function inlineExternalImages(root: HTMLElement): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const sources = new Set(
    Array.from(root.querySelectorAll("img"))
      .map((img) => img.currentSrc || img.src)
      .filter((src) => src && new URL(src, location.href).origin !== location.origin),
  );
  await Promise.all([...sources].map(async (src) => {
    try {
      const blob = await (await fetch(src, { mode: "cors", referrerPolicy: "no-referrer" })).blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      map.set(src, dataUrl);
    } catch {
      // Left out of the PDF if it can't be fetched.
    }
  }));
  return map;
}

async function buildPdf(root: HTMLElement, { skipExternalImages }: Options) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-block]"));
  if (!blocks.length) throw new Error("Nothing to export");
  const background = toHex(getComputedStyle(document.body).backgroundColor);
  const inlined = skipExternalImages ? new Map<string, string>() : await inlineExternalImages(root);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  let y = MARGIN;
  let first = true;
  const newPage = () => {
    if (!first) pdf.addPage();
    first = false;
    pdf.setFillColor(background);
    pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = MARGIN;
  };
  const bottom = MARGIN + CONTENT_H;
  newPage();

  for (const [index, block] of blocks.entries()) {
    // Measured on html2canvas's copy of the page, laid out at LAYOUT_WIDTH.
    block.dataset["pdfIndex"] = String(index);
    let cssHeight = 0;
    let cssWidth = 1;
    let points: ReturnType<typeof breakPoints> = { strong: [], weak: [] };
    const canvas = await html2canvas(block, {
      scale: MAX_CANVAS_WIDTH / LAYOUT_WIDTH,
      windowWidth: LAYOUT_WIDTH,
      windowHeight: 1400,
      useCORS: true, // celebrity photos come from Wikimedia, which allows CORS
      backgroundColor: background,
      onclone: (doc) => {
        const copy = doc.querySelector<HTMLElement>(`[data-pdf-index="${index}"]`);
        if (!copy) return;
        for (const img of Array.from(copy.querySelectorAll("img"))) {
          img.loading = "eager";
          const data = inlined.get(img.currentSrc || img.src) ?? inlined.get(img.getAttribute("src") ?? "");
          if (data) { img.removeAttribute("srcset"); img.src = data; }
        }
        const rect = copy.getBoundingClientRect();
        cssHeight = rect.height;
        cssWidth = rect.width;
        points = breakPoints(copy);
      },
      ignoreElements: (el) =>
        (el instanceof HTMLElement && el.dataset["pdfIgnore"] !== undefined) ||
        (skipExternalImages && el instanceof HTMLImageElement && new URL(el.src, location.href).origin !== location.origin),
    });
    delete block.dataset["pdfIndex"];
    if (!cssHeight) throw new Error("PDF block was not laid out");
    const mmPerCss = CONTENT_W / cssWidth;
    const pxPerCss = canvas.height / cssHeight;
    const heightMm = cssHeight * mmPerCss;

    const place = (fromCss: number, toCss: number) => {
      const sy = Math.round(fromCss * pxPerCss);
      const sh = Math.min(canvas.height - sy, Math.round((toCss - fromCss) * pxPerCss));
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sh;
      slice.getContext("2d")!.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
      const h = (toCss - fromCss) * mmPerCss;
      pdf.addImage(slice.toDataURL("image/jpeg", 0.9), "JPEG", MARGIN, y, CONTENT_W, h);
      y += h + GAP;
    };

    if (heightMm <= bottom - y) { place(0, cssHeight); continue; }
    if (heightMm <= CONTENT_H) { newPage(); place(0, cssHeight); continue; }

    // Taller than a page: split between elements. Start on this page only if a good chunk fits.
    if (bottom - y < CONTENT_H * 0.4) newPage();
    let from = 0;
    while (from < cssHeight - 1) {
      const room = (bottom - y) / mmPerCss;
      const to = cssHeight - from <= room ? cssHeight : pickCut(points, from, room);
      place(from, to);
      from = to;
      if (from < cssHeight - 1) newPage();
    }
  }
  return pdf;
}

/** Elements marked with data-pdf-block are captured; data-pdf-ignore elements (buttons) are left out. */
export async function downloadPdf(root: HTMLElement, filename: string): Promise<void> {
  let pdf;
  try {
    pdf = await buildPdf(root, { skipExternalImages: false });
  } catch (error) {
    // Most likely a photo from another site blocked the capture: retry without those photos.
    console.warn("PDF capture failed, retrying without external photos", error);
    pdf = await buildPdf(root, { skipExternalImages: true });
  }
  pdf.save(filename);
}

/** In-app browsers (Instagram, Facebook, TikTok) block file downloads. */
export function isInAppBrowser(): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance|Line\//i.test(navigator.userAgent);
}

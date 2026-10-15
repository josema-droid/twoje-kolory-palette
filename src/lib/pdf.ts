// "Download as PDF" for the paid report. Each block (header + every report
// section) is captured separately — one tall capture would exceed the canvas
// size limit on iPhones — and the blocks are laid out on A4 pages.
// The libraries are loaded only when the button is pressed.

const PAGE_W = 210; // A4, mm
const PAGE_H = 297;
const MARGIN = 10;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const CONTENT_H = PAGE_H - 2 * MARGIN;
const GAP = 4;
const MAX_CANVAS_WIDTH = 1600; // px; keeps memory and file size reasonable

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

/** Elements marked with data-pdf-block are captured; data-pdf-ignore elements (buttons) are left out. */
export async function downloadPdf(root: HTMLElement, filename: string): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-block]"));
  if (!blocks.length) throw new Error("Nothing to export");
  const background = toHex(getComputedStyle(document.body).backgroundColor);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.setFillColor(background);
  let y = MARGIN;
  let first = true;
  const newPage = () => {
    if (!first) pdf.addPage();
    first = false;
    pdf.setFillColor(background);
    pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = MARGIN;
  };
  newPage();

  for (const block of blocks) {
    const scale = Math.min(2, MAX_CANVAS_WIDTH / Math.max(1, block.offsetWidth));
    const canvas = await html2canvas(block, {
      scale,
      useCORS: true, // celebrity photos come from Wikimedia, which allows CORS
      backgroundColor: background,
      ignoreElements: (el) => el instanceof HTMLElement && el.dataset["pdfIgnore"] !== undefined,
    });
    const mmPerPx = CONTENT_W / canvas.width;
    const heightMm = canvas.height * mmPerPx;

    if (heightMm <= CONTENT_H) {
      if (y + heightMm > MARGIN + CONTENT_H) newPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.88), "JPEG", MARGIN, y, CONTENT_W, heightMm);
      y += heightMm + GAP;
      continue;
    }
    // Taller than a page: cut it into page-sized slices.
    const slicePx = Math.floor(CONTENT_H / mmPerPx);
    for (let top = 0; top < canvas.height; top += slicePx) {
      newPage();
      const h = Math.min(slicePx, canvas.height - top);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = h;
      slice.getContext("2d")!.drawImage(canvas, 0, top, canvas.width, h, 0, 0, canvas.width, h);
      pdf.addImage(slice.toDataURL("image/jpeg", 0.88), "JPEG", MARGIN, MARGIN, CONTENT_W, h * mmPerPx);
      y = MARGIN + h * mmPerPx + GAP;
    }
  }
  pdf.save(filename);
}

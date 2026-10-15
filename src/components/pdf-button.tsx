import { useState } from "react";
import { Download } from "lucide-react";
import { pl } from "@/content/pl";

/** Downloads the report inside #targetId as a PDF (blocks marked with data-pdf-block). */
export function PdfButton({ targetId, className = "" }: { targetId: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const t = pl.dashboard;

  async function download() {
    const root = document.getElementById(targetId);
    if (!root || busy) return;
    setBusy(true);
    try {
      const { downloadPdf } = await import("@/lib/pdf");
      await downloadPdf(root, "twoj-color-raport.pdf");
    } catch (error) {
      // Fallback: the browser's own "Save as PDF" print dialog.
      console.error("PDF export failed", error);
      window.print();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      data-pdf-ignore
      disabled={busy}
      onClick={() => void download()}
      className={`inline-flex h-10 items-center gap-2 rounded-full border border-[#cdb6a7] bg-[#fffdfb] px-4 text-sm font-medium text-[#38241f] transition-colors hover:border-[#5a3322] disabled:opacity-60 ${className}`}
    >
      <Download size={15} aria-hidden="true" />
      {busy ? t.pdfBusy : t.pdf}
    </button>
  );
}

import { useState } from "react";
import { Download } from "lucide-react";
import { pl } from "@/content/pl";

/** Downloads the report inside #targetId as a PDF (blocks marked with data-pdf-block). */
export function PdfButton({ targetId, className = "" }: { targetId: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const t = pl.dashboard;

  async function download() {
    const root = document.getElementById(targetId);
    if (!root || busy) return;
    setMessage(null);
    const { downloadPdf, isInAppBrowser } = await import("@/lib/pdf");
    if (isInAppBrowser()) {
      setMessage(t.pdfInApp);
      return;
    }
    setBusy(true);
    try {
      await downloadPdf(root, "twoj-color-raport.pdf");
    } catch (error) {
      console.error("PDF export failed", error);
      setMessage(t.pdfFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1" data-pdf-ignore>
      <button
        type="button"
        disabled={busy}
        onClick={() => void download()}
        className={`inline-flex h-10 items-center gap-2 rounded-full border border-[#cdb6a7] bg-[#fffdfb] px-4 text-sm font-medium text-[#38241f] transition-colors hover:border-[#5a3322] disabled:opacity-60 ${className}`}
      >
        <Download size={15} aria-hidden="true" />
        {busy ? t.pdfBusy : t.pdf}
      </button>
      {message && <span role="status" className="max-w-xs text-xs leading-5 text-[#8a4b3a]">{message}</span>}
    </span>
  );
}

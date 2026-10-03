import { useState } from "react";
import { Share2 } from "lucide-react";
import { pl } from "@/content/pl";

/**
 * Shares the current page with the native share sheet (phones), or copies the
 * link elsewhere. Private pages (noindex: account, funnel, personal results)
 * share the home page instead of their own address.
 */
export function ShareButton({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
    const url = robots.includes("noindex") ? `${location.origin}/` : `${location.origin}${location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // Share sheet dismissed: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <button
      type="button"
      data-share
      onClick={() => void share()}
      className={`inline-flex h-10 items-center gap-2 rounded-full border border-[#cdb6a7] bg-[#fffdfb] px-4 text-sm font-medium text-[#38241f] transition-colors hover:border-[#5a3322] ${className}`}
    >
      <Share2 size={15} aria-hidden="true" />
      <span aria-live="polite">{status === "copied" ? pl.share.copied : status === "failed" ? pl.share.copyFailed : pl.share.label}</span>
    </button>
  );
}

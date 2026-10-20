import face from "@/assets/loader-face.webp";

// Colour-analysis "reel": fabric drapes slide under the face one by one and get
// a ✓ (suits) or ✗ (doesn't). Pure CSS animation (styles in src/styles.css, .cl).

const DRAPES = [
  { color: "#f26b1d", ok: false },
  { color: "#647a45", ok: true, still: true }, // the frame shown with reduced motion
  { color: "#c8a070", ok: true },
  { color: "#e8468a", ok: false },
  { color: "#c8745a", ok: true },
  { color: "#5c3d31", ok: true },
];

export function DrapeLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`cl ${className}`} role="img" aria-label="Analiza kolorów w toku">
      <img className="cl__face" src={face} alt="" width={720} height={640} decoding="async" />
      {DRAPES.map((d, i) => (
        <div key={d.color} className={`cl__drape${d.still ? " cl__drape--still" : ""}`} style={{ "--i": i, "--c": d.color } as React.CSSProperties}>
          <div className={`cl__mark ${d.ok ? "cl__mark--yes" : "cl__mark--no"}`}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              {d.ok ? <path pathLength={1} d="M26 53L43 69L75 33" /> : <><path pathLength={1} d="M32 32L68 68" /><path pathLength={1} d="M68 32L32 68" /></>}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

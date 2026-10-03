import type { CSSProperties } from "react";
import hero from "@/assets/landing/kobieta-analiza-kolorystyczna.webp";
import heroSmall from "@/assets/landing/kobieta-analiza-kolorystyczna-1200.webp";

/** Feeds a hex colour into the CSS `--c` variable used by swatches. */
export function swatch(hex: string) {
  return { "--c": hex } as CSSProperties;
}

/** Hero photo, shared by the <img> and the route's preload link. */
export const heroImage = { src: hero, srcSet: `${heroSmall} 1200w, ${hero} 2400w`, sizes: "100vw" };

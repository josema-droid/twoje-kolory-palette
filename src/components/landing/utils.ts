import type { CSSProperties } from "react";
import hero from "@/assets/landing/hero.webp";
import heroSmall from "@/assets/landing/hero-small.webp";

/** Feeds a hex colour into the CSS `--c` variable used by swatches. */
export function swatch(hex: string) {
  return { "--c": hex } as CSSProperties;
}

/** Hero photo, shared by the <img> and the route's preload link. */
export const heroImage = { src: hero, srcSet: `${heroSmall} 1200w, ${hero} 2400w`, sizes: "100vw" };

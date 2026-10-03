import { createFileRoute } from "@tanstack/react-router";
import { pl } from "@/content/pl";
import { HeroSection } from "@/components/landing/hero-section";
import { heroImage } from "@/components/landing/utils";
import { IncludesSection } from "@/components/landing/includes-section";
import { ProcessSection } from "@/components/landing/process-section";
import { ResultSection } from "@/components/landing/result-section";
import { CompareSection } from "@/components/landing/compare-section";
import { SeasonsSection } from "@/components/landing/seasons-section";
import { FaqSection } from "@/components/landing/faq-section";

const meta = pl.landing.meta;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.ogTitle },
      { property: "og:description", content: meta.ogDescription },
      { property: "og:locale", content: "pl_PL" },
    ],
    links: [
      // Start fetching the hero photo before the CSS/JS finish, it's the largest element on screen.
      { rel: "preload", as: "image", href: heroImage.src, imageSrcSet: heroImage.srcSet, imageSizes: heroImage.sizes, fetchPriority: "high" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="landing">
      <HeroSection />
      <IncludesSection />
      <ProcessSection />
      <ResultSection />
      <CompareSection />
      <SeasonsSection />
      <FaqSection />
    </main>
  );
}

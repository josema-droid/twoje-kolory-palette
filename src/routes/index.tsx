import { createFileRoute } from "@tanstack/react-router";
import { pl } from "@/content/pl";
import { HeroSection } from "@/components/landing/hero-section";
import { heroImage } from "@/components/landing/utils";
import { faqSchema, organizationSchema, seo, serviceSchema, websiteSchema } from "@/lib/seo";
import { IncludesSection } from "@/components/landing/includes-section";
import { ProcessSection } from "@/components/landing/process-section";
import { ResultSection } from "@/components/landing/result-section";
import { CompareSection } from "@/components/landing/compare-section";
import { SeasonsSection } from "@/components/landing/seasons-section";
import { FaqSection } from "@/components/landing/faq-section";

const meta = pl.landing.meta;

export const Route = createFileRoute("/")({
  head: () => {
    const base = seo({
      title: meta.title,
      description: meta.description,
      path: "/",
      brandSuffix: false,
      schema: [organizationSchema, websiteSchema, serviceSchema(meta.description), faqSchema(pl.landing.faq.items)],
    });
    return {
      ...base,
      links: [
        ...base.links,
        // Start fetching the hero photo before the CSS/JS finish, it's the largest element on screen.
        { rel: "preload", as: "image", href: heroImage.src, imageSrcSet: heroImage.srcSet, imageSizes: heroImage.sizes, fetchPriority: "high" },
      ],
    };
  },
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

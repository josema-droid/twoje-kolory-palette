/** Public site address. Canonical tags, sitemap, share links and structured data are built from it. */
export const SITE_URL = "https://twojcolor.com";
export const SITE_NAME = "Twój Color";
export const CONTACT_EMAIL = "info@twojcolor.com";
export const PRICE_PLN = "39.00";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

// Lives in public/ so its URL never changes between deploys (social networks cache it).
const defaultImage = { src: "/og/twoj-color-analiza-kolorystyczna.jpg", width: 1200, height: 630, alt: "Twój Color — personalna analiza kolorystyczna online" };

type LdJson = Record<string, unknown>;

type SeoInput = {
  /** Page title without the brand suffix. */
  title: string;
  description: string;
  /** Path of the page, e.g. "/regulamin". Used for the canonical tag and og:url. */
  path: string;
  /** Keep the page out of search results (account pages, funnel steps, personal results). */
  noindex?: boolean;
  type?: "website" | "article";
  image?: { src: string; width: number; height: number; alt: string };
  /** Structured data (schema.org) objects for this page. */
  schema?: LdJson[];
  /** Set to false for the home page, whose title already contains the brand. */
  brandSuffix?: boolean;
};

/**
 * Everything a route's `head()` needs for SEO: unique title + description,
 * canonical, Open Graph / X cards, robots and JSON-LD.
 */
export function seo({ title, description, path, noindex, type = "website", image = defaultImage, schema = [], brandSuffix = true }: SeoInput) {
  const fullTitle = brandSuffix ? `${title} — ${SITE_NAME}` : title;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.src);
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, follow" : "index, follow, max-image-preview:large" },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pl_PL" },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: String(image.width) },
      { property: "og:image:height", content: String(image.height) },
      { property: "og:image:alt", content: image.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: image.alt },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: schema.map((s) => ({
      type: "application/ld+json",
      // "<" escaped so the JSON can never close the <script> tag early.
      children: JSON.stringify({ "@context": "https://schema.org", ...s }).replace(/</g, "\\u003c"),
    })),
  };
}

/* ---------- schema.org builders ---------- */

export const organizationSchema: LdJson = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon-512.png"),
  email: CONTACT_EMAIL,
  areaServed: { "@type": "Country", name: "Polska" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: "pl" },
};

/** Compact reference to the organization, so each page's JSON-LD stands on its own. */
const orgRef = { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL };

export const websiteSchema: LdJson = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pl-PL",
  publisher: orgRef,
};

export function serviceSchema(description: string): LdJson {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}/#analiza`,
    name: "Personalna analiza kolorystyczna online",
    serviceType: "Analiza kolorystyczna",
    description,
    provider: orgRef,
    areaServed: { "@type": "Country", name: "Polska" },
    availableChannel: { "@type": "ServiceChannel", serviceUrl: absoluteUrl("/test") },
    offers: { "@type": "Offer", price: PRICE_PLN, priceCurrency: "PLN", url: absoluteUrl("/test"), availability: "https://schema.org/InStock" },
  };
}

export function faqSchema(items: readonly { q: string; a: string }[]): LdJson {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}

export type Crumb = { name: string; path: string };

/** First crumb of every breadcrumb trail. */
export const homeCrumb: Crumb = { name: "Strona główna", path: "/" };

export function breadcrumbSchema(crumbs: readonly Crumb[]): LdJson {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export function articleSchema({ headline, description, path, image }: { headline: string; description: string; path: string; image?: string }): LdJson {
  return {
    "@type": "Article",
    headline,
    description,
    inLanguage: "pl-PL",
    mainEntityOfPage: absoluteUrl(path),
    image: absoluteUrl(image ?? defaultImage.src),
    author: orgRef,
    publisher: orgRef,
  };
}

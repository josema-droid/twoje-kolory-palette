import { guidePaths, guidePillar, seasonGuides, typeGuides } from "@/content/guide";

/** Indexable pages for sitemap.xml and llms.txt. Private / funnel pages are deliberately absent. */
export const publicPages: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/test", priority: "0.9", changefreq: "monthly" },
  ...guidePaths.map((path) => ({ path, priority: path === guidePillar.path ? "0.9" : "0.7", changefreq: "monthly" })),
  ...["/regulamin", "/polityka-prywatnosci", "/polityka-cookies", "/odstapienie-umowy"].map((path) => ({ path, priority: "0.3", changefreq: "yearly" })),
];

export { guidePillar, seasonGuides, typeGuides };

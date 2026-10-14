import { Breadcrumbs } from "@/components/breadcrumbs";
import { homeCrumb } from "@/lib/seo";

export function LegalPage({ content, path }: { content: { title: string; text: string }; path: string }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-12 md:py-20">
      <Breadcrumbs crumbs={[homeCrumb, { name: content.title, path }]} />
      <h1 className="mt-10 font-display text-4xl font-semibold md:text-6xl">{content.title}</h1>
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{content.text}</p>
    </main>
  );
}

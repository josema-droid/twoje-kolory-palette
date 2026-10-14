import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { homeCrumb } from "@/lib/seo";

/** Content blocks for legal pages (privacy policy, terms, cookie policy). */
export type LegalBlock =
  | string
  | { sub: string }
  | { list: string[] }
  | { ordered: string[] }
  | { quote: string[] }
  | { table: { head: string[]; rows: string[][] } };

export type LegalSection = { id: string; title: string; body: LegalBlock[] };
export type LegalDoc = { title: string; updated: string; intro?: string; sections: LegalSection[]; footer?: string };

/** Minimal inline formatting: **bold** and `code`. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    : part.startsWith("`") ? <code key={i} className="rounded bg-secondary px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>
    : part,
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p className="mt-4 leading-relaxed text-foreground/85">{inline(block)}</p>;
  if ("sub" in block) return <h3 className="mt-7 font-display text-xl font-semibold">{block.sub}</h3>;
  if ("list" in block) return <ul className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed text-foreground/85 marker:text-primary">{block.list.map((i) => <li key={i}>{inline(i)}</li>)}</ul>;
  if ("ordered" in block) return <ol className="mt-4 list-decimal space-y-2.5 pl-5 leading-relaxed text-foreground/85 marker:text-primary">{block.ordered.map((i) => <li key={i}>{inline(i)}</li>)}</ol>;
  if ("quote" in block) return <blockquote className="mt-4 space-y-2 border-l-4 border-primary/40 bg-card px-5 py-4 text-sm leading-relaxed text-foreground/85">{block.quote.map((l) => <p key={l}>{inline(l)}</p>)}</blockquote>;
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-secondary/60"><tr>{block.table.head.map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{block.table.rows.map((row) => <tr key={row.join("|")} className="border-t border-border align-top">{row.map((c, i) => <td key={i} className="px-3 py-2.5 text-foreground/85">{inline(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function LegalDocument({ doc, path }: { doc: LegalDoc; path: string }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-12 md:py-20">
      <Breadcrumbs crumbs={[homeCrumb, { name: doc.title, path }]} />
      <h1 className="mt-10 font-display text-4xl font-semibold md:text-6xl">{doc.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Ostatnia aktualizacja: {doc.updated}</p>
      {doc.intro && <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{doc.intro}</p>}

      <nav aria-label="Spis treści" className="mt-10 rounded-lg border border-border bg-card p-5">
        <ol className="grid gap-2 text-sm">
          {doc.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-primary underline-offset-4 hover:underline">{s.title}</a></li>)}
        </ol>
      </nav>

      {doc.sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-12 scroll-mt-28">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">{s.title}</h2>
          {s.body.map((block, i) => <Block key={i} block={block} />)}
        </section>
      ))}
      {doc.footer && <p className="mt-14 border-t border-border pt-5 text-sm italic text-muted-foreground">{doc.footer}</p>}
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { pl } from "@/content/pl";
import type { Crumb } from "@/lib/seo";

/** Visible breadcrumb trail. Pair it with breadcrumbSchema(crumbs) in the route's head. */
export function Breadcrumbs({ crumbs, className = "" }: { crumbs: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label={pl.breadcrumbsLabel} data-breadcrumbs className={`text-sm text-[#6b5d55] ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-[#38241f]">{c.name}</span>
              ) : (
                <>
                  <Link to={c.path} className="underline-offset-4 hover:text-[#5a3322] hover:underline">{c.name}</Link>
                  <ChevronRight size={14} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

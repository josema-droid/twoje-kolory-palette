import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteChrome } from "@/components/site-chrome";
import { NotFoundPage } from "@/components/not-found-page";
import { pl } from "@/content/pl";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const t = pl.errorPage;
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="landing not-found">
      <title>{t.metaTitle}</title>
      <meta name="robots" content="noindex, follow" />
      <div>
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <h1 className="lp-display">{t.title}</h1>
        <p>{t.text}</p>
        <div className="not-found__actions">
          <button
            type="button"
            className="lp-btn lp-btn--dark"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            {t.retry}
          </button>
          <Link to="/" className="lp-btn lp-btn--outline">{t.home}</Link>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#38241f" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Figtree:wght@400;500;600&family=Libre+Bodoni:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@300;400;500;600;700&family=Noto+Serif+Display:ital,wght@0,400;0,500;0,600;1,400&family=Spectral:wght@300;400&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SiteChrome><Outlet /></SiteChrome>
    </QueryClientProvider>
  );
}

import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { guideSlugs } from "./content/guide";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Pagination pages (any URL with a /page/ segment, e.g. /typy-urody/page/2) must stay
// out of search results while their links are still followed. This is done with an
// X-Robots-Tag header, not robots.txt: a robots.txt block would stop Google from
// crawling the page and ever seeing the noindex.
const PAGINATION = /(^|\/)page(\/|$)/;
const paginationNoindexMiddleware = createMiddleware().server(async ({ next, request }) => {
  const result = await next();
  if (!PAGINATION.test(new URL(request.url).pathname)) return result;
  const headers = new Headers(result.response.headers);
  headers.set("X-Robots-Tag", "noindex, follow");
  const { body, status, statusText } = result.response;
  return { ...result, response: new Response(body, { status, statusText, headers }) };
});

// Unknown guide pages (/typy-urody/<slug>) render the 404 screen; give them the 404 status too.
const GUIDE_PAGE = /^\/typy-urody\/([^/]+)\/?$/;
const guideNotFoundMiddleware = createMiddleware().server(async ({ next, request }) => {
  const result = await next();
  const slug = GUIDE_PAGE.exec(new URL(request.url).pathname)?.[1];
  if (!slug || guideSlugs.has(decodeURIComponent(slug)) || result.response.status !== 200) return result;
  const { body, statusText, headers } = result.response;
  return { ...result, response: new Response(body, { status: 404, statusText, headers }) };
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [paginationNoindexMiddleware, guideNotFoundMiddleware, errorMiddleware, csrfMiddleware],
}));

// Last-resort HTML for server errors, rendered without React (see src/start.ts).
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <title>Coś poszło nie tak — Twój Color</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.ico" />
    <style>
      body { font: 16px/1.6 Georgia, "Times New Roman", serif; background: #fffbf8; color: #4a3a2e; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 32rem; width: 100%; text-align: center; }
      h1 { font-size: 2rem; line-height: 1.2; font-weight: 600; color: #3a1a14; margin: 0 0 .75rem; }
      p { margin: 0 0 1.75rem; font-family: system-ui, -apple-system, sans-serif; }
      .actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: .8rem 1.5rem; border-radius: 999px; font: 600 15px system-ui, -apple-system, sans-serif; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #38241f; color: #fffcf2; }
      .secondary { background: #fffdfb; color: #2f1a14; border-color: #cdb6a7; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ta strona się nie wczytała.</h1>
      <p>Wystąpił błąd po naszej stronie. Spróbuj odświeżyć stronę albo wróć na stronę główną.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Spróbuj ponownie</button>
        <a class="secondary" href="/">Strona główna</a>
      </div>
    </div>
  </body>
</html>`;
}

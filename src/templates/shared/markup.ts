import { getFrontendGlobalStyles, getFrontendAppStyles } from './styles.js';

export function getStaticFrontendMarkup(options: {
  framework: string;
  runtime: string;
  styling: string;
  build: string;
  detail: string;
  editPath: string;
  actionHref: string;
  actionLabel: string;
}): string {
  return `<div class="stackmint-shell">
  <header class="topbar">
    <a class="brand-mark" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
      <span class="brand-glyph">S</span>
      <span class="brand-name">
        <strong>stackmint</strong>
        <span>TypeScript starter</span>
      </span>
    </a>
    <a class="topbar-link" href="https://github.com/senapati484/stackmint" target="_blank" rel="noreferrer">
      GitHub
    </a>
  </header>

  <main class="hero">
    <section class="hero-copy" aria-labelledby="hero-title">
      <span class="eyebrow"><span class="pulse"></span> Prebuilt frontend template</span>
      <h1 id="hero-title">
        Shape your <span class="accent">${options.framework}</span> launch surface.
      </h1>
      <p class="hero-lede">
        A polished stackmint canvas with the real brand artwork, responsive panels,
        and a consistent layout ready to mirror across every frontend framework.
      </p>

      <div class="actions">
        <a class="button button-primary" href="${options.actionHref}">
          ${options.actionLabel}
        </a>
        <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </div>

      <div class="signal-grid" aria-label="Template highlights">
        <article class="signal-card">
          <span>Runtime</span>
          <strong>${options.runtime}</strong>
          <p>${options.detail}</p>
        </article>
        <article class="signal-card">
          <span>Styling</span>
          <strong>${options.styling}</strong>
          <p>Shared stackmint design language</p>
        </article>
        <article class="signal-card">
          <span>Build</span>
          <strong>${options.build}</strong>
          <p>Ready for the framework workflow</p>
        </article>
      </div>
    </section>

    <section class="hero-visual" aria-label="stackmint preview">
      <div class="logo-stage">
        <img class="logo-image" src="/logo.png" alt="stackmint" />
      </div>
      <aside class="framework-card">
        <span>Framework section</span>
        <strong>${options.framework}</strong>
        <p>${options.detail}</p>
      </aside>

      <div class="status-row">
        <div class="mini-panel">
          <span>Edit surface</span>
          <strong><code>${options.editPath}</code></strong>
        </div>
        <div class="mini-panel">
          <span>Dev server</span>
          <strong><code>npm run dev</code></strong>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer-note">
    Built with stackmint. Keep this layout and swap the framework section as new templates come online.
  </footer>
</div>`;
}

export function getStaticFrontendHTML(options: {
  framework: string;
  runtime: string;
  styling: string;
  build: string;
  detail: string;
  editPath: string;
  actionHref: string;
  actionLabel: string;
}): string {
  const markup = getStaticFrontendMarkup(options);
  const globalStyles = getFrontendGlobalStyles();
  const appStyles = getFrontendAppStyles();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>stackmint | ${options.framework}</title>
  <link rel="icon" type="image/svg+xml" href="/logo.png">
  <style>
${globalStyles}
${appStyles}
  </style>
</head>
<body>
  ${markup}
</body>
</html>`;
}

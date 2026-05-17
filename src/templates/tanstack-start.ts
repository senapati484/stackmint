import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('tanstack-start', {

  id: 'tanstack-start',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'app/routes/index.tsx',
      content: `import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '../lib/stackmint-config';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [launches, setLaunches] = useState(1);
  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);

  return (
    <div className="stackmint-shell">
      <header className="topbar">
        <a className="brand-mark" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          <span className="brand-glyph">S</span>
          <span className="brand-name">
            <strong>stackmint</strong>
            <span>TypeScript starter</span>
          </span>
        </a>
        <a className="topbar-link" href="https://github.com/senapati484/stackmint" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <main className="hero">
        <section className="hero-copy" aria-labelledby="hero-title">
          <span className="eyebrow"><span className="pulse" /> Prebuilt frontend template</span>
          <h1 id="hero-title">
            Shape your <span className="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div className="signal-grid" aria-label="Template highlights">
            {signals.map((signal) => (
              <article className="signal-card" key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hero-visual" aria-label="stackmint preview">
          <div className="logo-stage">
            <img className="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside className="framework-card">
            <span>Framework section</span>
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>

          <div className="status-row">
            <div className="mini-panel">
              <span>Edit surface</span>
              <strong><code>app/routes/index.tsx</code></strong>
            </div>
            <div className="mini-panel">
              <span>Dev server</span>
              <strong><code>npm run dev</code></strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-note">
        Built with stackmint. Keep this layout and swap the framework section as new templates come online.
      </footer>
    </div>
  );
}
`,
    },
    {
      path: 'app/server/public/health.ts',
      content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'tanstack-start',
    timestamp: new Date().toISOString(),
  };
}
`,
    },
    {
      path: 'app/routes/api/health.ts',
      content: `import { createFileRoute } from '@tanstack/react-router';
import { getHealthPayload } from '../../server/public/health';

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getHealthPayload());
      },
    },
  },
});
`,
    },
    {
      path: 'app/root.tsx',
      content: `import { Outlet, createRootRoute } from '@tanstack/react-router';
import './root.css';

export const Route = createRootRoute({
  component: () => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TanStack Start App</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
`,
    },
    {
      path: 'app/root.css',
      content: `@import "tailwindcss";

:root {
  --sm-bg: #05070c;
  --sm-bg-soft: #0b1018;
  --sm-panel: rgba(14, 20, 31, 0.86);
  --sm-panel-strong: #111827;
  --sm-line: rgba(255, 255, 255, 0.12);
  --sm-line-strong: rgba(55, 255, 205, 0.36);
  --sm-text: #f8fafc;
  --sm-muted: #a3adbd;
  --sm-mint: #36f0bd;
  --sm-cyan: #55c7ff;
}

body {
  background: var(--sm-bg);
  color: var(--sm-text);
  font-family: Inter, ui-sans-serif, system-ui;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  padding: 2rem;
  gap: 2rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.button-primary {
  background: linear-gradient(135deg, var(--sm-mint), var(--sm-cyan));
  color: #03110d;
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
`,
    },
    {
      path: 'app/routeTree.gen.ts',
      content: `import { Route as RootRoute } from './root';
import { Route as IndexRoute } from './routes/index';
import { Route as ApiHealthRoute } from './routes/api/health';

export const routeTree = RootRoute.addChildren([IndexRoute, ApiHealthRoute]);
`,
    },
    {
      path: 'app/router.tsx',
      content: `import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function createRouter() {
  return createTanStackRouter({ routeTree });
}
`,
    },
    {
      path: 'entry.client.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { createRouter } from './app/router';

const router = createRouter();

ReactDOM.hydrateRoot(
  document.getElementById('app')!,
  <StartClient router={router} />
);
`,
    },
    {
      path: 'entry.server.tsx',
      content: `import { StartServer, transformStreamWithRouter } from '@tanstack/react-start/server';
import { createRouter } from './app/router';

export async function renderToStream(request: Request) {
  const router = createRouter();

  return transformStreamWithRouter(router, request);
}
`,
    },
    getStackmintLogoFile(),
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          allowImportingTsExtensions: true,
        },
        include: ['app'],
        exclude: ['node_modules', '.output', 'dist', 'build']
      }, null, 2),
    },
    {
      path: 'app.config.ts',
      content: `import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  routers: {
    web: { entry: 'entry.client.tsx' },
    ssr: { entry: 'entry.server.tsx' },
  },
});
`,
    },
  ],
  scripts: {
    dev: 'vinxi dev',
    build: 'vinxi build',
    start: 'vinxi start',
  },
});

import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── root.tsx ────────────────────────────────────────────────────────────────

function buildRootContent(config: StackConfig): string {
  return `import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Meta, Links, Scripts } from '@tanstack/react-start';
import './root.css';

export const Route = createRootRoute({
  head: () => (
    <>
      <Meta />
      <Links />
    </>
  ),
  component: () => (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
`;
}

// ─── app/routes/index.tsx ───────────────────────────────────────────────────

const PAGE_CONTENT = `import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '@/lib/stackmint-config';

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
        <a className="brand-mark" href="/">
          <span className="brand-glyph">S</span>
          <span className="brand-name">
            <strong>stackmint</strong>
            <span>TypeScript starter</span>
          </span>
        </a>
        <nav className="flex items-center gap-4">
          <a className="topbar-link" href="https://github.com/senapati484/stackmint" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <main className="hero">
        <section className="hero-copy">
          <span className="eyebrow">
            <span class="pulse" /> Built with stackmint
          </span>
          <h1>
            Shape your <span className="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p className="hero-lede">
            A production-ready TanStack Start template with optimized configuration, 
            type-safe integrations, and a modern architecture.
          </p>

          <div className="actions">
            <button
              className="button button-primary"
              onClick={() => setLaunches((v) => v + 1)}
            >
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div className="signal-grid">
            {signals.map((s) => (
              <article className="signal-card" key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
                <p>{s.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hero-visual">
          <div className="logo-stage">
            <img className="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside className="framework-card">
            <span>Stack overview</span>
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>
        </section>
      </main>

      <footer className="footer-note">
        Built with stackmint · The Ultimate TypeScript Starter
      </footer>
    </div>
  );
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('tanstack-start', {
  id: 'tanstack-start',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'app/root.tsx', content: buildRootContent(config) },
      { path: 'app/routes/index.tsx', content: PAGE_CONTENT },
      {
        path: 'app/root.css',
        content: `@import "tailwindcss";
${getFrontendGlobalStyles().replace('@import "tailwindcss";\n\n', '')}
${getFrontendAppStyles()}`,
      },
      {
        path: 'app/routes/api/health.ts',
        content: `import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: 'ok',
          framework: 'tanstack-start',
          app: '${appName}',
          timestamp: new Date().toISOString(),
        });
      },
    },
  },
});
`,
      },
      { path: 'app/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      {
        path: 'app.config.ts',
        content: `import { defineConfig } from '@tanstack/react-start/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [tsconfigPaths()],
  },
});
`,
      },
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
            paths: {
              '@/*': ['./app/*'],
            },
          },
          include: ['app'],
          exclude: ['node_modules', '.output', 'dist', 'build'],
        }, null, 2),
      },
    ];

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['app/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
});
`,
        },
      );
    }

    if (useDocker) {
      files.push({
        path: 'Dockerfile',
        content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
`,
      });
    }

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'vinxi dev',
      build: 'vinxi build',
      start: 'vinxi start',
    };

    if (config.testing?.includes('vitest')) {
      scripts.test = 'vitest run';
    }

    if (config.testing?.includes('playwright')) {
      scripts['test:e2e'] = 'playwright test';
    }

    return scripts;
  },

  dependencies: (config: StackConfig): AdapterDependency[] => {
    const deps: AdapterDependency[] = [
      { name: 'react', version: '^19.0.0' },
      { name: 'react-dom', version: '^19.0.0' },
      { name: '@tanstack/react-router', version: '^1.58.0' },
      { name: '@tanstack/react-start', version: '^1.58.0' },
    ];

    return deps;
  },
});

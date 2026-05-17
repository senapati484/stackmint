import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── root.tsx ────────────────────────────────────────────────────────────────

function buildRootContent(config: StackConfig): string {
  return `import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import './root.css';

export default function App() {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
`;
}

// ─── app/routes/_index.tsx ──────────────────────────────────────────────────

const PAGE_CONTENT = `import { useState } from 'react';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '@/lib/stackmint-config';

export default function Index() {
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
            A production-ready React Router v7 template with optimized configuration, 
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

TEMPLATE_REGISTRY.set('react-router-v7', {
  id: 'react-router-v7',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'app/root.tsx', content: buildRootContent(config) },
      { path: 'app/routes/_index.tsx', content: PAGE_CONTENT },
      {
        path: 'app/root.css',
        content: `@import "tailwindcss";
${getFrontendGlobalStyles().replace('@import "tailwindcss";\n\n', '')}
${getFrontendAppStyles()}`,
      },
      {
        path: 'app/routes/api.health.ts',
        content: `export function loader() {
  return Response.json({
    status: 'ok',
    framework: 'react-router-v7',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  });
}
`,
      },
      { path: 'app/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      { path: 'public/.gitkeep', content: '' },
      {
        path: 'react-router.config.ts',
        content: `import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
} satisfies Config;
`,
      },
      {
        path: 'vite.config.ts',
        content: `import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [reactRouter(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
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
          include: ['app', 'public'],
          exclude: ['node_modules', 'build', 'dist'],
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
COPY --from=builder /app/build ./build
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
      dev: 'react-router dev',
      build: 'react-router build',
      start: 'react-router-serve ./build/server/index.js',
      'type-check': 'tsc',
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
      { name: 'react-router', version: '^7.0.0' },
    ];

    if (config.auth === 'clerk') {
      deps.push({ name: '@clerk/react-router', version: '^0.1.0' });
    }

    return deps;
  },
});

import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── src/routes/index.tsx ────────────────────────────────────────────────────

const PAGE_CONTENT = `import { component$, useSignal } from '@builder.io/qwik';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '../lib/stackmint-config';

export default component$(() => {
  const launches = useSignal(1);
  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);

  return (
    <div class="stackmint-shell">
      <header class="topbar">
        <a class="brand-mark" href="/">
          <span class="brand-glyph">S</span>
          <span class="brand-name">
            <strong>stackmint</strong>
            <span>TypeScript starter</span>
          </span>
        </a>
        <nav class="flex items-center gap-4">
          <a class="topbar-link" href="https://github.com/senapati484/stackmint" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <main class="hero">
        <section class="hero-copy">
          <span class="eyebrow">
            <span class="pulse" /> Built with stackmint
          </span>
          <h1>
            Shape your <span class="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p class="hero-lede">
            A production-ready Qwik template with optimized configuration, 
            type-safe integrations, and a modern architecture.
          </p>

          <div class="actions">
            <button
              class="button button-primary"
              onClick$={() => launches.value++}
            >
              Launch pulse {launches.value}
            </button>
            <a class="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div class="signal-grid">
            {signals.map((s) => (
              <article class="signal-card" key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
                <p>{s.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section class="hero-visual">
          <div class="logo-stage">
            <img class="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside class="framework-card">
            <span>Stack overview</span>
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>
        </section>
      </main>

      <footer class="footer-note">
        Built with stackmint · The Ultimate TypeScript Starter
      </footer>
    </div>
  );
});
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('qwik', {
  id: 'qwik',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'src/routes/index.tsx', content: PAGE_CONTENT },
      {
        path: 'src/routes/app.css',
        content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
      },
      {
        path: 'src/routes/layout.tsx',
        content: `import { component$, Slot } from '@builder.io/qwik';
import './app.css';

export default component$(() => {
  return <Slot />;
});
`,
      },
      {
        path: 'src/routes/api/health/index.ts',
        content: `import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    framework: 'qwik',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  });
};
`,
      },
      { path: 'src/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      { path: 'public/.gitkeep', content: '' },
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [qwikCity(), qwikVite(), tsconfigPaths(), tailwindcss()],
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
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            jsxImportSource: '@builder.io/qwik',
            strict: true,
            skipLibCheck: true,
            paths: {
              '@/*': ['./src/*'],
              '~/*': ['./src/*'],
            },
          },
          include: ['src'],
        }, null, 2),
      },
    ];

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [qwikVite(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
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
COPY --from=builder /app/dist ./dist
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
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
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
      { name: '@builder.io/qwik', version: '^1.9.0' },
      { name: '@builder.io/qwik-city', version: '^1.9.0' },
    ];

    return deps;
  },
});

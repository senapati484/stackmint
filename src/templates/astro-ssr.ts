import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── Layout.astro ────────────────────────────────────────────────────────────

function buildLayoutContent(config: StackConfig): string {
  const appName = config.projectName || 'my-app';
  return `---
import '../styles/global.css';

interface Props {
  title?: string;
}

const { title = '${appName}' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body class="min-h-screen bg-background antialiased">
    <slot />
  </body>
</html>
`;
}

// ─── middleware.ts ───────────────────────────────────────────────────────────

function buildAstroMiddleware(config: StackConfig): string | null {
  if (config.auth === 'clerk') return null; // Clerk uses its own middleware

  if (config.baas === 'supabase') {
    return `import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options) => context.cookies.set(key, value, options),
        remove: (key, options) => context.cookies.delete(key, options),
      },
    }
  );

  return next();
});
`;
  }

  return null;
}

// ─── src/pages/index.astro ──────────────────────────────────────────────────

const PAGE_CONTENT = `---
import Layout from '../layouts/Layout.astro';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '../lib/stackmint-config';

const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);

let launches = 1;
---

<Layout title={\`\${frameworkLabel} | Built with stackmint\`}>
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
          A production-ready Astro SSR template with optimized configuration, 
          type-safe integrations, and a modern architecture.
        </p>

        <div class="actions">
          <button
            id="launch-button"
            class="button button-primary"
          >
            Launch pulse {launches}
          </button>
          <a class="button button-secondary" href="/api/health">
            Check API health
          </a>
        </div>

        <div class="signal-grid">
          {signals.map((s) => (
            <article class="signal-card">
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
</Layout>

<script>
  let count = 1;
  const btn = document.getElementById('launch-button');
  if (btn) {
    btn.addEventListener('click', () => {
      count++;
      btn.textContent = \`Launch pulse \${count}\`;
    });
  }
</script>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('astro-ssr', {
  id: 'astro-ssr',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'src/layouts/Layout.astro', content: buildLayoutContent(config) },
      { path: 'src/pages/index.astro', content: PAGE_CONTENT },
      {
        path: 'src/styles/global.css',
        content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
      },
      {
        path: 'src/pages/api/health.ts',
        content: `export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    framework: 'astro-ssr',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'content-type': 'application/json' },
  });
}
`,
      },
      { path: 'src/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      { path: 'public/.gitkeep', content: '' },
      {
        path: 'astro.config.mjs',
        content: `import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          extends: 'astro/tsconfigs/strictest',
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@/*': ['./src/*'],
            },
          },
        }, null, 2),
      },
    ];

    const middlewareContent = buildAstroMiddleware(config);
    if (middlewareContent) {
      files.push({ path: 'src/middleware.ts', content: middlewareContent });
    }

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default getViteConfig({
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
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
`,
      });
    }

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      astro: 'astro',
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
      { name: 'astro', version: '^4.15.0' },
      { name: '@astrojs/node', version: '^8.3.0' },
    ];

    if (config.auth === 'clerk') {
      deps.push({ name: '@clerk/astro', version: '^0.1.0' });
    }

    if (config.baas === 'supabase') {
      deps.push({ name: '@supabase/ssr', version: '^0.5.0' }, { name: '@supabase/supabase-js', version: '^2.45.0' });
    }

    return deps;
  },
});


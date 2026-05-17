import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── layout.svelte ───────────────────────────────────────────────────────────

function buildLayoutContent(config: StackConfig): string {
  return `<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<div class="min-h-screen bg-background antialiased">
  {@render children()}
</div>
`;
}

// ─── hooks.server.ts ─────────────────────────────────────────────────────────

function buildSvelteKitHooks(config: StackConfig): string | null {
  if (config.auth === 'clerk') return null; // Clerk uses its own hooks

  if (config.auth === 'next-auth') {
    return `import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle } = SvelteKitAuth({
  providers: [GitHub],
});
`;
  }

  if (config.baas === 'supabase') {
    return `import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, { path: '/', ...options });
        },
        remove: (key, options) => {
          event.cookies.delete(key, { path: '/', ...options });
        },
      },
    }
  );

  return resolve(event);
};
`;
  }

  return null;
}

// ─── src/routes/+page.svelte ────────────────────────────────────────────────

const PAGE_CONTENT = `<script lang="ts">
  import {
    getStackMintConfig,
    getSignals,
    getFrameworkLabel,
    getFrameworkDescription,
  } from '$lib/stackmint-config';

  let launches = $state(1);
  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);
</script>

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
        A production-ready SvelteKit template with optimized configuration, 
        type-safe integrations, and a modern architecture.
      </p>

      <div class="actions">
        <button
          class="button button-primary"
          onclick={() => launches++}
        >
          Launch pulse {launches}
        </button>
        <a class="button button-secondary" href="/api/health">
          Check API health
        </a>
      </div>

      <div class="signal-grid">
        {#each signals as s}
          <article class="signal-card">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <p>{s.detail}</p>
          </article>
        {/each}
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
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('sveltekit', {
  id: 'sveltekit',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'src/routes/+layout.svelte', content: buildLayoutContent(config) },
      { path: 'src/routes/+page.svelte', content: PAGE_CONTENT },
      {
        path: 'src/app.css',
        content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
      },
      {
        path: 'src/routes/(public)/api/health/+server.ts',
        content: `import { json } from '@sveltejs/kit';

export function GET() {
  return json({
    status: 'ok',
    framework: 'sveltekit',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  });
}
`,
      },
      { path: 'src/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      { path: 'static/.gitkeep', content: '' },
      {
        path: 'svelte.config.js',
        content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '@/*': './src/*',
    },
  },
};

export default config;
`,
      },
      {
        path: 'vite.config.ts',
        content: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  server: {
    port: 3000,
  },
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          extends: './.svelte-kit/tsconfig.json',
          compilerOptions: {
            allowJs: true,
            checkJs: true,
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            skipLibCheck: true,
            sourceMap: true,
            strict: true,
            moduleResolution: 'bundler',
            paths: {
              '@/*': ['./src/*'],
            },
          },
        }, null, 2),
      },
      {
        path: 'src/app.html',
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body class="bg-background text-foreground" data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`,
      },
    ];

    const hooksContent = buildSvelteKitHooks(config);
    if (hooksContent) {
      files.push({ path: 'src/hooks.server.ts', content: hooksContent });
    }

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
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
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "build"]
`,
      });
    }

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'vite dev',
      build: 'vite build',
      preview: 'vite preview',
      check: 'svelte-check --tsconfig ./tsconfig.json',
      'check:watch': 'svelte-check --tsconfig ./tsconfig.json --watch',
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
      { name: 'svelte', version: '^5.0.0' },
      { name: '@sveltejs/kit', version: '^2.5.0' },
    ];

    if (config.auth === 'clerk') {
      deps.push({ name: '@clerk/sveltekit', version: '^0.1.0' });
    }

    if (config.baas === 'supabase') {
      deps.push({ name: '@supabase/ssr', version: '^0.5.0' }, { name: '@supabase/supabase-js', version: '^2.45.0' });
    }

    return deps;
  },
});


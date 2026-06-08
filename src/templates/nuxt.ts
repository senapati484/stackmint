import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── Pages ───────────────────────────────────────────────────────────────────


function buildAppVue(_config: StackConfig): string {
  return `<script setup lang="ts">
// Layout and provider logic can be added here
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
`;
}

function buildDefaultLayout(_config: StackConfig): string {
  return `<template>
  <div class="min-h-screen bg-background antialiased">
    <slot />
    <!-- Toaster or other global components can go here -->
  </div>
</template>
`;
}

// ─── Middleware ─────────────────────────────────────────────────────────────

function buildNuxtMiddleware(config: Partial<StackConfig>): string | null {
  if (config.auth === 'clerk') return null; // Clerk has its own module

  if (config.auth === 'next-auth') {
    return `export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session && !event.path.startsWith('/api/auth') && event.path !== '/') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
`;
  }

  if (config.baas === 'supabase') {
    return `import { serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  // Custom logic
});
`;
  }

  return null;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

const PAGE_CONTENT = `<script setup lang="ts">
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '~/lib/stackmint-config';

const launches = ref(1);
const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);
</script>

<template>
  <div class="stackmint-shell">
    <header class="topbar">
      <NuxtLink class="brand-mark" to="/">
        <span class="brand-glyph">S</span>
        <span class="brand-name">
          <strong>stackmint</strong>
          <span>TypeScript starter</span>
        </span>
      </NuxtLink>
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
          Shape your <span class="accent">{{ frameworkLabel }}</span> launch surface.
        </h1>
        <p class="hero-lede">
          A production-ready Nuxt 3 template with optimized configuration, 
          type-safe integrations, and a modern architecture.
        </p>

        <div class="actions">
          <button
            class="button button-primary"
            @click="launches++"
          >
            Launch pulse {{ launches }}
          </button>
          <a class="button button-secondary" href="/api/health">
            Check API health
          </a>
        </div>

        <div class="signal-grid">
          <article v-for="s in signals" :key="s.label" class="signal-card">
            <span>{{ s.label }}</span>
            <strong>{{ s.value }}</strong>
            <p>{{ s.detail }}</p>
          </article>
        </div>
      </section>

      <section class="hero-visual">
        <div class="logo-stage">
          <img class="logo-image" src="/logo.png" alt="stackmint" />
        </div>
        <aside class="framework-card">
          <span>Stack overview</span>
          <strong>{{ frameworkLabel }}</strong>
          <p>{{ frameworkDescription }}</p>
        </aside>
      </section>
    </main>

    <footer class="footer-note">
      Built with stackmint · The Ultimate TypeScript Starter
    </footer>
  </div>
</template>
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('nuxt', {
  id: 'nuxt',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      { path: 'app.vue', content: buildAppVue(config) },
      { path: 'layouts/default.vue', content: buildDefaultLayout(config) },
      { path: 'pages/index.vue', content: PAGE_CONTENT },
      {
        path: 'assets/css/main.css',
        content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
      },
      {
        path: 'server/api/health.get.ts',
        content: `export default defineEventHandler(() => {
  return {
    status: 'ok',
    framework: 'nuxt',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  };
});
`,
      },
      { path: 'lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      { path: 'public/.gitkeep', content: '' },
      {
        path: 'nuxt.config.ts',
        content: `import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [${config.auth === 'clerk' ? "'@clerk/nuxt', " : ""}${config.baas === 'supabase' ? "'@nuxtjs/supabase', " : ""}],
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'node-server',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          extends: './.nuxt/tsconfig.json'
        }, null, 2),
      },
    ];

    const middlewareContent = buildNuxtMiddleware(config);
    if (middlewareContent) {
      files.push({ path: 'server/middleware/auth.ts', content: middlewareContent });
    }

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx,js,jsx}'],
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
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
`,
      });
    }

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'nuxt dev',
      build: 'nuxt build',
      start: 'node .output/server/index.mjs',
      generate: 'nuxt generate',
      'type-check': 'nuxt typecheck',
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
      { name: 'vue', version: '^3.5.0' },
      { name: 'nuxt', version: '^3.13.0' },
    ];

    if (config.auth === 'clerk') {
      deps.push({ name: '@clerk/nuxt', version: '^0.2.0' });
    }

    if (config.baas === 'supabase') {
      deps.push({ name: '@nuxtjs/supabase', version: '^1.4.0' });
    }

    return deps;
  },
});


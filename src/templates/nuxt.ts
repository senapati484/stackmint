import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildProviderComponents, buildUtilsFile } from './shared/providers.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';
import { buildMiddleware } from './shared/middleware.js';
import { buildAuthFiles } from './shared/auth.js';

TEMPLATE_REGISTRY.set('nuxt', {

  id: 'nuxt',
  files: (config: StackConfig): AdapterFile[] => {
    const providerFiles = buildProviderComponents(config);
    const utilsFile = buildUtilsFile();
    const testingFiles = buildTestingSetup(config);
    const dockerfile = buildDockerfile(config);
    const middleware = buildMiddleware(config);
    const authFiles = buildAuthFiles(config);

    const files: AdapterFile[] = [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'app.vue',
      content: `<template>
  <NuxtPage />
</template>
`,
    },
    getStackmintLogoFile(),
    {
      path: 'pages/index.vue',
      content: `<script setup lang="ts">
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '~/lib/stackmint-config';

const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);

const launches = ref(1);
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
`,
    },
    {
      path: 'server/public/health.ts',
      content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'nuxt',
    timestamp: new Date().toISOString(),
  };
}
`,
    },
    {
      path: 'server/api/health.get.ts',
      content: `import { getHealthPayload } from '../public/health';

export default defineEventHandler(() => getHealthPayload());
`,
    },
    {
      path: 'lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
    },
    getStackmintLogoFile(),
    {
      path: 'assets/css/main.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'composables/.gitkeep',
      content: '',
    },
    {
      path: 'components/.gitkeep',
      content: '',
    },
    {
      path: 'nuxt.config.ts',
      content: `import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: true,
    css: ['~/assets/css/main.css'],
    modules: [],
    devServer: {
        port: 3000
    },
    vite: {
        plugins: [
            tailwindcss(),
            {
                name: 'stackmint-port-logger',
                configureServer(server) {
                    server.httpServer?.once('listening', () => {
                        const address = server.httpServer?.address();
                        const port = typeof address === 'object' ? address?.port : null;
                        if (port) {
                            console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
                        }
                    });
                }
            }
        ]
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
    ...providerFiles,
    utilsFile,
    ...testingFiles,
    ...(dockerfile ? [dockerfile] : []),
    ...(middleware ? [middleware] : []),
    ...(config.testing?.includes('playwright') ? [buildPlaywrightConfig()] : []),
    ...authFiles,
    ];

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'nuxt dev',
      build: 'nuxt build',
      start: 'node .output/server/index.mjs',
      generate: 'nuxt generate',
    };

    if (config.testing?.includes('vitest')) {
      scripts.test = 'vitest run';
      scripts['test:watch'] = 'vitest';
    }

    if (config.testing?.includes('playwright')) {
      scripts['test:e2e'] = 'playwright test';
    }

    return scripts;
  },

  dependencies: (config: StackConfig): AdapterDependency[] => {
    const deps: AdapterDependency[] = [];

    if (config.styling === 'tailwind' || config.uiLibrary === 'shadcn') {
      deps.push({ name: 'next-themes', version: '^0.4.3' });
    }

    if (config.uiLibrary === 'shadcn') {
      deps.push({ name: 'sonner', version: '^1.7.0' });
    }

    if (config.testing?.includes('vitest')) {
      deps.push(
        { name: '@nuxt/test-utils', version: '^3.14.0', dev: true },
        { name: 'vitest', version: '^2.0.0', dev: true },
      );
    }

    return deps;
  },
});

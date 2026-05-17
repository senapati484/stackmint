import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildUtilsFile } from './shared/providers.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';

TEMPLATE_REGISTRY.set('vue-vite', {

  id: 'vue-vite',
  files: (config: StackConfig): AdapterFile[] => {
    const utilsFile = buildUtilsFile();
    const testingFiles = buildTestingSetup(config);
    const dockerfile = buildDockerfile(config);

    return [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'src/App.vue',
      content: `<script setup lang="ts">
import { ref } from 'vue';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from './lib/stackmint-config';

const launches = ref(1);
const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);
</script>

<template>
  <div class="stackmint-shell">
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
          Shape your <span class="accent">{{ frameworkLabel }}</span> launch surface.
        </h1>
        <p class="hero-lede">
          A polished stackmint canvas with the real brand artwork, responsive panels,
          and a consistent layout ready to mirror across every frontend framework.
        </p>

        <div class="actions">
          <button class="button button-primary" type="button" @click="launches += 1">
            Launch pulse {{ launches }}
          </button>
          <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
            Open docs
          </a>
        </div>

        <div class="signal-grid" aria-label="Template highlights">
          <article v-for="signal in signals" :key="signal.label" class="signal-card">
            <span>{{ signal.label }}</span>
            <strong>{{ signal.value }}</strong>
            <p>{{ signal.detail }}</p>
          </article>
        </div>
      </section>

      <section class="hero-visual" aria-label="stackmint preview">
        <div class="logo-stage">
          <img class="logo-image" src="/logo.png" alt="stackmint" />
        </div>
        <aside class="framework-card">
          <span>Framework section</span>
          <strong>{{ frameworkLabel }}</strong>
          <p>{{ frameworkDescription }}</p>
        </aside>

        <div class="status-row">
          <div class="mini-panel">
            <span>Edit surface</span>
            <strong><code>src/App.vue</code></strong>
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
  </div>
</template>
`,
    },
    {
      path: 'src/main.ts',
      content: `import { createApp } from 'vue';
import App from './App.vue';
import './styles/globals.css';
import './styles/app.css';

const app = createApp(App);
app.mount('#app');
`,
    },
    {
      path: 'src/styles/globals.css',
      content: `${getFrontendGlobalStyles()}`,
    },
    {
      path: 'src/styles/app.css',
      content: `${getFrontendAppStyles()}`,
    },
    {
      path: 'src/lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
    },
    getStackmintLogoFile(),
    {
      path: 'src/vite-env.d.ts',
      content: `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Built with stackmint - scaffold any TypeScript stack in seconds" />
    <title>Vue + Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    vue(),
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
  ],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
`,
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          strict: true
        },
        include: ['src/**/*.ts', 'src/**/*.vue']
      }, null, 2),
    },
    utilsFile,
    ...testingFiles,
    ...(dockerfile ? [dockerfile] : []),
    ...(config.testing?.includes('playwright') ? [buildPlaywrightConfig()] : []),
    ];
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'vite',
      build: 'vue-tsc --noEmit && vite build',
      preview: 'vite preview',
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
        { name: '@vue/test-utils', version: '^2.4.0', dev: true },
        { name: 'vitest', version: '^2.0.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});
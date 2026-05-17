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

TEMPLATE_REGISTRY.set('sveltekit', {

  id: 'sveltekit',
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
      path: 'src/routes/+layout.svelte',
      content: `<script lang="ts">
  import '../app.css';
</script>

<slot />
`,
    },
    {
      path: 'src/routes/+page.svelte',
      content: `<script lang="ts">
  import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '$lib/stackmint-config';

  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);

  let launches = 1;
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
          on:click={() => launches += 1}
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
`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
    },
    {
      path: 'src/routes/+layout.ts',
      content: `export const load = () => {
    return {};
};
`,
    },
    {
      path: 'src/routes/(public)/api/health/+server.ts',
      content: `import { json } from '@sveltejs/kit';

export function GET() {
    return json({
        status: 'ok',
        framework: 'sveltekit',
        timestamp: new Date().toISOString()
    });
}
`,
    },
    {
      path: 'src/lib/index.ts',
      content: '',
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
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`,
    },
    {
      path: 'src/app.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'svelte.config.js',
      content: `import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter()
    }
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
  plugins: [
    sveltekit(), 
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
          moduleResolution: 'bundler'
        }
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
      dev: 'vite dev',
      build: 'svelte-kit sync && vite build',
      preview: 'vite preview',
      check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
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
        { name: '@testing-library/svelte', version: '^5.0.0', dev: true },
        { name: 'vitest', version: '^2.0.0', dev: true },
        { name: '@vitejs/plugin-vite', version: '^5.4.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});

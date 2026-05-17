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

TEMPLATE_REGISTRY.set('qwik', {

  id: 'qwik',
  files: (config: StackConfig): AdapterFile[] => {
    const utilsFile = buildUtilsFile();
    const testingFiles = buildTestingSetup(config);
    const dockerfile = buildDockerfile(config);

    const files: AdapterFile[] = [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'src/routes/index.tsx',
      content: `import { component$, useSignal } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '../lib/stackmint-config';
import './styles/app.css';

const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);

export default component$(() => {
  const launches = useSignal(1);

  return (
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
          <span class="eyebrow"><span class="pulse" /> Prebuilt frontend template</span>
          <h1 id="hero-title">
            Shape your <span class="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p class="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div class="actions">
            <button class="button button-primary" type="button" onClick$={() => launches.value++}>
              Launch pulse {launches.value}
            </button>
            <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
              Open docs
            </a>
          </div>

          <div class="signal-grid" aria-label="Template highlights">
            {signals.map((signal) => (
              <article class="signal-card" key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section class="hero-visual" aria-label="stackmint preview">
          <div class="logo-stage">
            <img class="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside class="framework-card">
            <span>Framework section</span>
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>

          <div class="status-row">
            <div class="mini-panel">
              <span>Edit surface</span>
              <strong><code>src/routes/index.tsx</code></strong>
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
  );
});

export const head: DocumentHead = {
  title: 'Qwik App',
  meta: [
    { name: 'description', content: 'Built with stackmint - scaffold any TypeScript stack in seconds' },
  ],
};
`,
    },
    {
      path: 'src/routes/styles/app.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'public/logo.png',
      content: getStackmintLogoFile().content,
      encoding: 'base64',
      overwrite: true,
    },
    {
      path: 'src/lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
    },
    {
      path: 'src/routes/layout.tsx',
      content: `import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return <Slot />;
});
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    qwikCity(), 
    qwikVite(), 
    tsconfigPaths(), 
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
    utilsFile,
    ...testingFiles,
    ...(dockerfile ? [dockerfile] : []),
    ...(config.testing?.includes('playwright') ? [buildPlaywrightConfig()] : []),
    ];

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'qwik dev',
      build: 'qwik build',
      preview: 'qwik preview',
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
        { name: '@builder.io/qwik-testing', version: '^1.9.0', dev: true },
        { name: 'vitest', version: '^2.0.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});

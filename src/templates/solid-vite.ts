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

TEMPLATE_REGISTRY.set('solid-vite', {

  id: 'solid-vite',
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
      path: 'src/main.tsx',
      content: `import { render } from 'solid-js/web';
import App from './App';
import './styles/globals.css';
import './styles/app.css';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}
`,
    },
    {
      path: 'src/App.tsx',
      content: `import { For, createSignal } from 'solid-js';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from './lib/stackmint-config';

const config = getStackMintConfig();
const signals = getSignals(config);
const frameworkLabel = getFrameworkLabel(config.framework);
const frameworkDescription = getFrameworkDescription(config);

function App() {
  const [launches, setLaunches] = createSignal(1);

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
            <button class="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches()}
            </button>
            <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
              Open docs
            </a>
          </div>

          <div class="signal-grid" aria-label="Template highlights">
            <For each={signals}>
              {(signal) => (
                <article class="signal-card">
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                  <p>{signal.detail}</p>
                </article>
              )}
            </For>
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
              <strong><code>src/App.tsx</code></strong>
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
}

export default App;
`,
    },
    {
      path: 'src/lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
    },
    {
      path: 'src/styles/globals.css',
      content: `${getFrontendGlobalStyles()}`,
    },
    {
      path: 'src/styles/app.css',
      content: `${getFrontendAppStyles()}`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/vite-env.d.ts',
      content: `/// <reference types="vite/client" />
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
    <title>SolidJS + Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solid(), tsconfigPaths(), tailwindcss()],
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
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'preserve',
          jsxImportSource: 'solid-js',
          strict: true
        },
        include: ['src']
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
      build: 'tsc && vite build',
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
        { name: '@solidjs/testing-library', version: '^0.8.0', dev: true },
        { name: 'vitest', version: '^2.0.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});
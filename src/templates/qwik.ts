import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('qwik', {

  id: 'qwik',
  files: (): AdapterFile[] => [
    {
      path: 'src/routes/index.tsx',
      content: `import { component$, useSignal } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import './styles/app.css';

const signals = [
  { label: 'Runtime', value: 'Qwik', detail: 'Resumability-first framework' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Utility-first CSS framework' },
  { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
];

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
            Shape your <span class="accent">Qwik</span> launch surface.
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
            <strong>Qwik</strong>
            <p>Qwik, TypeScript, and Tailwind v4 are configured and ready.</p>
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
  ],
  scripts: { 
    dev: 'qwik dev', 
    build: 'qwik build',
    preview: 'qwik preview',
  },
});
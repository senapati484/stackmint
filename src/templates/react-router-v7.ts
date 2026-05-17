import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('react-router-v7', {

  id: 'react-router-v7',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'app/routes/_index.tsx',
      content: `import { useState } from 'react';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '../lib/stackmint-config';

export default function Index() {
  const [launches, setLaunches] = useState(1);
  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);

  return (
    <div className="stackmint-shell">
      <header className="topbar">
        <a className="brand-mark" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          <span className="brand-glyph">S</span>
          <span className="brand-name">
            <strong>stackmint</strong>
            <span>TypeScript starter</span>
          </span>
        </a>
        <a className="topbar-link" href="https://github.com/senapati484/stackmint" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <main className="hero">
        <section className="hero-copy" aria-labelledby="hero-title">
          <span className="eyebrow"><span className="pulse" /> Prebuilt frontend template</span>
          <h1 id="hero-title">
            Shape your <span className="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div className="signal-grid" aria-label="Template highlights">
            {signals.map((signal) => (
              <article className="signal-card" key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hero-visual" aria-label="stackmint preview">
          <div className="logo-stage">
            <img className="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside className="framework-card">
            <span>Framework section</span>
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>

          <div className="status-row">
            <div className="mini-panel">
              <span>Edit surface</span>
              <strong><code>app/routes/_index.tsx</code></strong>
            </div>
            <div className="mini-panel">
              <span>Dev server</span>
              <strong><code>npm run dev</code></strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-note">
        Built with stackmint. Keep this layout and swap the framework section as new templates come online.
      </footer>
    </div>
  );
}
`,
    },
    {
      path: 'app/server/public/health.ts',
      content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'react-router-v7',
    timestamp: new Date().toISOString(),
  };
}
`,
    },
    {
      path: 'app/routes/api.health.ts',
      content: `import { getHealthPayload } from '../server/public/health';

export function loader() {
  return Response.json(getHealthPayload());
}
`,
    },
    {
      path: 'app/root.tsx',
      content: `import { Outlet } from '@react-router/dom';
import './root.css';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React Router App</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
`,
    },
    {
      path: 'app/root.css',
      content: `@import "tailwindcss";

${getFrontendGlobalStyles().replace('@import "tailwindcss";\\n\\n', '')}
${getFrontendAppStyles()}`,
    },
    getStackmintLogoFile(),
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          allowImportingTsExtensions: true,
        },
        include: ['app', 'public'],
        exclude: ['node_modules', 'build', 'dist']
      }, null, 2),
    },
    {
      path: 'react-router.config.ts',
      content: `import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  // Configure for proper development and production
} satisfies Config;
`,
    },
  ],
  scripts: {
    dev: 'react-router dev',
    build: 'react-router build',
    start: 'react-router-serve ./build/server/index.js',
  },
});

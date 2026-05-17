import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('analog', {

  id: 'analog',
  files: (): AdapterFile[] => [
    {
      path: 'src/main.ts',
      content: `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
`,
    },
    {
      path: 'src/main.server.ts',
      content: `import { ssr } from '@analogjs/platform';
import { bootstrap } from './main';

export default ssr(bootstrap);
`,
    },
    {
      path: 'src/app/app.component.ts',
      content: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`<div class="stackmint-shell">
  <header class="topbar">
    <a class="brand-mark" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
      <span class="brand-glyph">A</span>
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
        Shape your <span class="accent">Analog</span> launch surface.
      </h1>
      <p class="hero-lede">
        A polished stackmint canvas with real brand artwork, responsive panels,
        and a consistent layout ready to mirror across Angular projects.
      </p>

      <div class="actions">
        <button class="button button-primary" (click)="launches = launches + 1">
          Launch pulse {{ launches }}
        </button>
        <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </div>

      <div class="signal-grid" aria-label="Template highlights">
        <article class="signal-card">
          <span>Runtime</span>
          <strong>Analog</strong>
          <p>Angular + Vite full-stack framework</p>
        </article>
        <article class="signal-card">
          <span>Styling</span>
          <strong>Tailwind v4</strong>
          <p>Utility-first CSS framework</p>
        </article>
        <article class="signal-card">
          <span>Build</span>
          <strong>SSR Ready</strong>
          <p>Server-side rendering included</p>
        </article>
      </div>
    </section>

    <section class="hero-visual" aria-label="stackmint preview">
      <div class="logo-stage">
        <img class="logo-image" src="/logo.png" alt="stackmint" />
      </div>
      <aside class="framework-card">
        <span>Framework</span>
        <strong>Analog</strong>
        <p>Angular full-stack with Vite and SSR</p>
      </aside>

      <div class="status-row">
        <div class="mini-panel">
          <span>Edit surface</span>
          <strong><code>src/app/app.component.ts</code></strong>
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
</div>\`,
  styles: \`@import "tailwindcss";

:root {
  --sm-bg: #05070c;
  --sm-bg-soft: #0b1018;
  --sm-panel: rgba(14, 20, 31, 0.86);
  --sm-panel-strong: #111827;
  --sm-line: rgba(255, 255, 255, 0.12);
  --sm-line-strong: rgba(55, 255, 205, 0.36);
  --sm-text: #f8fafc;
  --sm-muted: #a3adbd;
  --sm-mint: #36f0bd;
  --sm-cyan: #55c7ff;
  --sm-amber: #ffd166;
  --sm-violet: #a78bfa;
}

.stackmint-shell {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 32px));
  min-height: 76px;
  margin: 0 auto;
  gap: 1rem;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  width: min(1180px, calc(100% - 32px));
  min-height: calc(100vh - 76px);
  margin: 0 auto;
  padding: 48px 0 56px;
  gap: 3rem;
  align-items: center;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.signal-card {
  border: 1px solid var(--sm-line);
  border-radius: 8px;
  background: var(--sm-panel);
  padding: 1rem;
  min-height: 126px;
}

.button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  padding: 0 1.05rem;
  cursor: pointer;
  font-weight: 800;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.button-primary {
  background: linear-gradient(135deg, var(--sm-mint), var(--sm-cyan));
  color: #03110d;
}

.button-secondary {
  border: 1px solid var(--sm-line);
  background: rgba(255, 255, 255, 0.06);
  color: var(--sm-text);
}

.button:hover {
  transform: translateY(-2px);
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 28px;
  }
}\`
})
export class AppComponent {
  launches = 1;
}
`,
    },
    {
      path: 'src/app/app.config.ts',
      content: `import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
`,
    },
    {
      path: 'src/app/app.routes.ts',
      content: `import { Routes } from '@angular/router';

export const routes: Routes = [];
`,
    },
    {
      path: 'src/index.html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Analog - stackmint</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import angular from '@analogjs/platform';

export default defineConfig({
  plugins: [
    angular(),
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
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: false,
          forceConsistentCasingInFileNames: true,
          strict: true,
          noImplicitOverride: true,
          noPropertyAccessFromIndexSignature: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          esModuleInterop: true,
          sourceMap: true,
          declaration: false,
          downlevelIteration: true,
          experimentalDecorators: true,
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          lib: ['ES2022', 'dom'],
        },
        angularCompilerOptions: {
          enableI18nLegacyMessageIdFormat: false,
          strictInjectionParameters: true,
          strictInputAccessModifiers: true,
          strictTemplates: true,
        },
      }, null, 2),
    },
    getStackmintLogoFile(),
    {
      path: 'public/favicon.ico',
      content: '',
    },
  ],
  scripts: { dev: 'vite', build: 'vite build' },
});
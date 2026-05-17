import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildStackmintConfigLib } from './shared/config.js';
import { buildAuthFiles } from './shared/auth.js';

// ─── AppComponent ────────────────────────────────────────────────────────────

function buildAppComponent(config: StackConfig): string {
  return `import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '../lib/stackmint-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor],
  template: \`
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
            Shape your <span class="accent">{{ frameworkLabel }}</span> launch surface.
          </h1>
          <p class="hero-lede">
            A production-ready Analog (Angular) template with optimized configuration, 
            type-safe integrations, and a modern architecture.
          </p>

          <div class="actions">
            <button
              class="button button-primary"
              (click)="incrementLaunches()"
            >
              Launch pulse {{ launches() }}
            </button>
            <a class="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div class="signal-grid">
            <article class="signal-card" *ngFor="let s of signals">
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
  \`,
})
export class AppComponent {
  launches = signal(1);
  config = getStackMintConfig();
  signals = getSignals(this.config);
  frameworkLabel = getFrameworkLabel(this.config.framework);
  frameworkDescription = getFrameworkDescription(this.config);

  incrementLaunches() {
    this.launches.update(v => v + 1);
  }
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('analog', {
  id: 'analog',

  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
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
      { path: 'src/app/app.component.ts', content: buildAppComponent(config) },
      {
        path: 'src/app/app.config.ts',
        content: `import { ApplicationConfig } from '@angular/core';
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
        path: 'src/styles.css',
        content: `@import "tailwindcss";
${getFrontendGlobalStyles().replace('@import "tailwindcss";\n\n', '')}
${getFrontendAppStyles()}`,
      },
      {
        path: 'src/server/routes/api/health.ts',
        content: `import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  return {
    status: 'ok',
    framework: 'analog',
    app: '${appName}',
    timestamp: new Date().toISOString(),
  };
});
`,
      },
      { path: 'src/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      getStackmintLogoFile(),
      ...buildAuthFiles(config),
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';
import angular from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [angular(), tailwindcss()],
  server: {
    port: 3000,
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
            paths: {
              '@/*': ['./src/*'],
            },
          },
          angularCompilerOptions: {
            enableI18nLegacyMessageIdFormat: false,
            strictInjectionParameters: true,
            strictInputAccessModifiers: true,
            strictTemplates: true,
          },
        }, null, 2),
      },
    ];

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';
import angular from '@analogjs/platform';

export default defineConfig({
  plugins: [angular()],
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
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
`,
      });
    }

    return files;
  },

  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'vite',
      build: 'vite build',
      start: 'node dist/server/index.mjs',
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
      { name: '@analogjs/platform', version: '^1.0.0' },
      { name: '@angular/core', version: '^19.0.0' },
      { name: '@angular/platform-browser', version: '^19.0.0' },
    ];

    return deps;
  },
});

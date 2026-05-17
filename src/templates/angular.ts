import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('angular', {

  id: 'angular',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'src/app/app.component.ts',
      content: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig, type Signal } from '../lib/stackmint-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  launches = signal(1);
  private readonly config = getStackMintConfig();
  frameworkLabel = getFrameworkLabel(this.config.framework);
  frameworkDescription = getFrameworkDescription(this.config);
  signals: Signal[] = getSignals(this.config);

  incrementLaunches() {
    this.launches.set(this.launches() + 1);
  }
}
`,
    },
    {
      path: 'src/app/app.component.html',
      content: `<div class="stackmint-shell">
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
        <button class="button button-primary" type="button" (click)="incrementLaunches()">
          Launch pulse {{ launches() }}
        </button>
        <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </div>

      <div class="signal-grid" aria-label="Template highlights">
        <article *ngFor="let signal of signals" class="signal-card">
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
</div>
`,
    },
    {
      path: 'src/app/app.component.css',
      content: `@import "tailwindcss";

${getFrontendGlobalStyles().replace('@import "tailwindcss";\\n\\n', '')}
${getFrontendAppStyles()}`,
    },
    {
      path: 'src/main.ts',
      content: `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent);
`,
    },
  ],
  scripts: { 
    dev: 'ng serve', 
    build: 'ng build',
    start: 'ng serve --open',
  },
});

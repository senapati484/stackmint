import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { StackConfig } from '../cli/types.js';
import { STACKMINT_LOGO_BASE64 } from '../generated/logo-base64.js';

export interface FrameworkTemplate {
  id: string;
  files: (config: StackConfig) => AdapterFile[];
  scripts: Record<string, string> | ((config: StackConfig) => Record<string, string>);
  dependencies?: AdapterDependency[] | ((config: StackConfig) => AdapterDependency[]);
}

export const TEMPLATE_REGISTRY = new Map<string, FrameworkTemplate>();


function getStackmintLogoFile(): AdapterFile {
  return {
    path: 'public/logo.png',
    content: STACKMINT_LOGO_BASE64,
    encoding: 'base64',
    overwrite: true,
  };
}

function getFrontendGlobalStyles(): string {
  return `@import "tailwindcss";

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

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--sm-bg);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    linear-gradient(115deg, rgba(54, 240, 189, 0.11), transparent 36%),
    linear-gradient(245deg, rgba(85, 199, 255, 0.1), transparent 42%),
    var(--sm-bg);
  color: var(--sm-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

button,
a {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

code {
  border: 1px solid var(--sm-line);
  border-radius: 6px;
  padding: 0.15rem 0.42rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--sm-mint);
}
`;
}

function getFrontendAppStyles(): string {
  return `.stackmint-shell {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.stackmint-shell::before {
  position: fixed;
  inset: 0;
  z-index: -2;
  content: "";
  background:
    linear-gradient(115deg, rgba(54, 240, 189, 0.11), transparent 36%),
    linear-gradient(245deg, rgba(85, 199, 255, 0.1), transparent 42%),
    var(--sm-bg);
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.stackmint-shell::after {
  position: fixed;
  inset: auto 0 0;
  z-index: -1;
  height: 34vh;
  content: "";
  background: linear-gradient(to top, rgba(54, 240, 189, 0.12), transparent);
}

.stackmint-shell::after {
  pointer-events: none;
}

.logo-stage {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  padding: 1.2rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.08), transparent 42%),
    rgba(6, 10, 18, 0.92);
}

.logo-stage::before,
.logo-stage::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(54, 240, 189, 0.28);
  transform: rotate(-10deg);
}

.logo-stage::before {
  right: -60px;
  bottom: 42px;
  width: 220px;
  height: 70px;
}

.logo-stage::after {
  right: 36px;
  bottom: 22px;
  width: 190px;
  height: 56px;
  border-color: rgba(255, 209, 102, 0.24);
}

.logo-image {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, 680px);
  margin: 38px auto 0;
  filter: drop-shadow(0 28px 58px rgba(54, 240, 189, 0.14));
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

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.brand-glyph {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--sm-line-strong);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(54, 240, 189, 0.2), rgba(85, 199, 255, 0.12));
  color: var(--sm-mint);
  font-weight: 900;
}

.brand-name {
  display: grid;
  gap: 0.1rem;
}

.brand-name strong {
  font-size: 1rem;
}

.brand-name span,
.topbar-link {
  color: var(--sm-muted);
  font-size: 0.86rem;
}

.topbar-link {
  border: 1px solid var(--sm-line);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: rgba(255, 255, 255, 0.04);
}

.topbar-link:hover {
  border-color: var(--sm-line-strong);
  color: var(--sm-text);
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

.hero-copy {
  display: grid;
  gap: 1.45rem;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--sm-line);
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--sm-muted);
  font-size: 0.82rem;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--sm-mint);
  box-shadow: 0 0 22px var(--sm-mint);
}

.hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--sm-text);
  font-size: 4.5rem;
  line-height: 0.96;
  letter-spacing: 0;
}

.accent {
  color: var(--sm-mint);
}

.hero-lede {
  max-width: 640px;
  margin: 0;
  color: var(--sm-muted);
  font-size: 1.14rem;
  line-height: 1.75;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
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

.button:hover {
  transform: translateY(-2px);
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

.button-secondary:hover {
  border-color: var(--sm-line-strong);
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.signal-card,
.framework-card,
.logo-stage,
.mini-panel {
  border: 1px solid var(--sm-line);
  border-radius: 8px;
  background: var(--sm-panel);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.signal-card {
  min-height: 126px;
  padding: 1rem;
}

.signal-card span {
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.signal-card strong {
  display: block;
  margin-top: 0.9rem;
  font-size: 1.45rem;
}

.signal-card p {
  margin: 0.35rem 0 0;
  color: var(--sm-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.hero-visual {
  display: grid;
  gap: 1rem;
}

.logo-stage {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  padding: 1.2rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.08), transparent 42%),
    rgba(6, 10, 18, 0.92);
}

.logo-stage::before,
.logo-stage::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(54, 240, 189, 0.28);
  transform: rotate(-10deg);
}

.logo-stage::before {
  right: -60px;
  bottom: 42px;
  width: 220px;
  height: 70px;
}

.logo-stage::after {
  right: 36px;
  bottom: 22px;
  width: 190px;
  height: 56px;
  border-color: rgba(255, 209, 102, 0.24);
}

.logo-image {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, 680px);
  margin: 38px auto 0;
  filter: drop-shadow(0 28px 58px rgba(54, 240, 189, 0.14));
}

.framework-card {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(360px, calc(100% - 32px));
  margin: -82px 0 0 auto;
  padding: 1rem;
  gap: 0.7rem;
}

.framework-card span {
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.framework-card strong {
  font-size: 1.75rem;
}

.status-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mini-panel {
  padding: 1rem;
}

.mini-panel span {
  display: block;
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.mini-panel strong {
  display: block;
  margin-top: 0.55rem;
}

.footer-note {
  width: min(1180px, calc(100% - 32px));
  margin: -34px auto 0;
  padding-bottom: 28px;
  color: var(--sm-muted);
  font-size: 0.9rem;
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 28px;
  }

  .hero h1 {
    font-size: 3rem;
    line-height: 1.03;
  }

  .signal-grid,
  .status-row {
    grid-template-columns: 1fr;
  }

  .logo-stage {
    min-height: 260px;
  }

  .framework-card {
    margin-top: -54px;
  }

  .footer-note {
    margin-top: 0;
  }
}

@media (max-width: 560px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 0;
  }

  .hero h1 {
    font-size: 2.35rem;
  }

  .hero-lede {
    font-size: 1rem;
  }
}
`;
}

function getStaticFrontendMarkup(options: {
  framework: string;
  runtime: string;
  styling: string;
  build: string;
  detail: string;
  editPath: string;
  actionHref: string;
  actionLabel: string;
}): string {
  return `<div class="stackmint-shell">
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
        Shape your <span class="accent">${options.framework}</span> launch surface.
      </h1>
      <p class="hero-lede">
        A polished stackmint canvas with the real brand artwork, responsive panels,
        and a consistent layout ready to mirror across every frontend framework.
      </p>

      <div class="actions">
        <a class="button button-primary" href="${options.actionHref}">
          ${options.actionLabel}
        </a>
        <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </div>

      <div class="signal-grid" aria-label="Template highlights">
        <article class="signal-card">
          <span>Runtime</span>
          <strong>${options.runtime}</strong>
          <p>${options.detail}</p>
        </article>
        <article class="signal-card">
          <span>Styling</span>
          <strong>${options.styling}</strong>
          <p>Shared stackmint design language</p>
        </article>
        <article class="signal-card">
          <span>Build</span>
          <strong>${options.build}</strong>
          <p>Ready for the framework workflow</p>
        </article>
      </div>
    </section>

    <section class="hero-visual" aria-label="stackmint preview">
      <div class="logo-stage">
        <img class="logo-image" src="/logo.png" alt="stackmint" />
      </div>
      <aside class="framework-card">
        <span>Framework section</span>
        <strong>${options.framework}</strong>
        <p>${options.detail}</p>
      </aside>

      <div class="status-row">
        <div class="mini-panel">
          <span>Edit surface</span>
          <strong><code>${options.editPath}</code></strong>
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
</div>`;
}

export function getFrameworkTemplate(id: string, config: StackConfig): AdapterFile[] {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template) {
    return [];
  }
  return template.files(config);
}

export function getTemplateScripts(id: string, config: StackConfig): Record<string, string> {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template) {
    return {};
  }
  const scripts = template.scripts;
  if (typeof scripts === 'function') {
    return scripts(config);
  }
  return scripts;
}

export function getTemplateDependencies(id: string, config: StackConfig): AdapterDependency[] {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template || !template.dependencies) {
    return [];
  }
  const deps = template.dependencies;
  if (typeof deps === 'function') {
    return deps(config);
  }
  return deps;
}

function registerTemplate(template: FrameworkTemplate): void {
  TEMPLATE_REGISTRY.set(template.id, template);
}

// Next.js 15 App Router Template
registerTemplate({
  id: 'nextjs',
  files: (config: StackConfig): AdapterFile[] => {
    const files: AdapterFile[] = [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify({
          projectName: config.projectName,
          framework: config.framework,
          category: config.category,
          deployTarget: config.deployTarget,
          database: config.database,
          auth: config.auth,
          apiLayer: config.apiLayer,
          validation: config.validation,
          styling: config.styling,
          uiLibrary: config.uiLibrary,
          forms: config.forms,
          stateManagement: config.stateManagement,
          dataFetching: config.dataFetching,
          ai: config.ai,
          jobs: config.jobs,
          cache: config.cache,
          email: config.email,
          payments: config.payments,
          testing: config.testing,
          docker: config.docker,
          githubActions: config.githubActions,
          husky: config.husky,
          changesets: config.changesets,
          turborepo: config.turborepo,
          baas: config.baas,
          orm: config.orm,
          packageManager: config.packageManager,
          runtime: config.runtime,
        }, null, 2),
      },
      {
        path: 'src/app/layout.tsx',
        content: `import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${config.projectName || 'my-app'} | Built with stackmint',
  description: 'A creative Next.js starter generated by stackmint.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`,
      },
      {
        path: 'src/app/page.tsx',
        content: `'use client';

import { useState } from 'react';
import { getStackMintConfig, getFrameworkLabel, getSignals, getFrameworkDescription } from '../lib/stackmint-config';

export default function HomePage() {
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
            A polished stackmint canvas with real brand artwork, responsive panels,
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
              <strong><code>src/app/page.tsx</code></strong>
            </div>
            <div className="mini-panel">
              <span>Health route</span>
              <strong><code>/api/health</code></strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-note">
        Built with stackmint. Keep this layout and swap framework section as new templates come online.
      </footer>
    </div>
  );
}
`,
      },
      {
        path: 'src/app/globals.css',
        content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
      },
      {
        path: 'src/app/api/health/route.ts',
        content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'nextjs',
    app: '${config.projectName || 'my-app'}',
    timestamp: new Date().toISOString(),
  });
}
`,
      },
      getStackmintLogoFile(),
      {
        path: 'src/components/.gitkeep',
        content: '',
      },
      {
        path: 'src/lib/.gitkeep',
        content: '',
      },
      {
        path: 'src/lib/stackmint-config.ts',
        content: `export interface StackMintConfig {
  projectName: string;
  framework: string;
  category: string;
  deployTarget: string;
  database: string;
  auth: string;
  apiLayer: string;
  validation: string;
  styling: string;
  uiLibrary: string;
  forms: string;
  stateManagement: string;
  dataFetching: string;
  ai: string;
  jobs: string;
  cache: string;
  email: string;
  payments: string;
  testing: string;
  docker: boolean;
  githubActions: boolean;
  husky: boolean;
  changesets: boolean;
  turborepo: boolean;
  baas: string;
  orm: string;
  packageManager: string;
  runtime: string;
}

export function getStackMintConfig(): StackMintConfig {
  return ${JSON.stringify({
    projectName: config.projectName || 'my-app',
    framework: config.framework || 'nextjs',
    category: config.category || 'fullstack',
    deployTarget: config.deployTarget || 'none',
    database: config.database || 'none',
    auth: config.auth || 'none',
    apiLayer: config.apiLayer || 'none',
    validation: config.validation || 'none',
    styling: config.styling || 'none',
    uiLibrary: config.uiLibrary || 'none',
    forms: config.forms || 'none',
    stateManagement: config.stateManagement || 'none',
    dataFetching: config.dataFetching || 'none',
    ai: config.ai || 'none',
    jobs: config.jobs || 'none',
    cache: config.cache || 'none',
    email: config.email || 'none',
    payments: config.payments || 'none',
    testing: config.testing || 'none',
    docker: !!config.docker,
    githubActions: !!config.githubActions,
    husky: !!config.husky,
    changesets: !!config.changesets,
    turborepo: !!config.turborepo,
    baas: config.baas || 'none',
    orm: config.orm || 'none',
    packageManager: config.packageManager || 'npm',
    runtime: config.runtime || 'node',
  }, null, 4)};
}


export function getFrameworkLabel(frameworkId: string): string {
  const labels: Record<string, string> = {
    'nextjs': 'Next.js 15 (App Router)',
    'sveltekit': 'SvelteKit',
    'nuxt': 'Nuxt 3',
    'react-router-v7': 'React Router v7 (Remix)',
    'analog': 'Analog (Angular)',
    'tanstack-start': 'TanStack Start',
    'astro-ssr': 'Astro (SSR mode)',
    'astro-ssg': 'Astro (SSG mode)',
    'react-vite': 'React + Vite',
    'vue-vite': 'Vue + Vite',
    'solid-vite': 'Solid + Vite',
    'svelte-vite': 'Svelte + Vite',
    'qwik': 'Qwik',
    'angular': 'Angular',
    'hono': 'Hono',
    'elysia': 'Elysia',
    'fastify': 'Fastify',
    'nestjs': 'NestJS',
    'express': 'Express',
    'nitro': 'Nitro',
    'h3': 'H3',
    'bun-native': 'Bun Native',
    'expo': 'Expo SDK 53',
    'react-native': 'React Native CLI',
    'vitepress': 'VitePress',
    'docusaurus': 'Docusaurus',
    'eleventy': 'Eleventy',
    'gatsby': 'Gatsby',
  };
  return labels[frameworkId] || frameworkId;
}

export function getSignals(config: StackMintConfig) {
  const signals = [];
  
  // Runtime signal
  signals.push({
    label: 'Runtime',
    value: getFrameworkLabel(config.framework),
    detail: getConfigDetail(config.framework, 'runtime')
  });
  
  // Styling signal
  if (config.styling && config.styling !== 'none') {
    signals.push({
      label: 'Styling',
      value: getStylingLabel(config.styling),
      detail: getConfigDetail(config.styling, 'styling')
    });
  }
  
  // Database signal
  if (config.database && config.database !== 'none') {
    signals.push({
      label: 'Database',
      value: getDatabaseLabel(config.database),
      detail: getConfigDetail(config.database, 'database')
    });
  }
  
  // Auth signal
  if (config.auth && config.auth !== 'none') {
    signals.push({
      label: 'Authentication',
      value: getAuthLabel(config.auth),
      detail: getConfigDetail(config.auth, 'auth')
    });
  }
  
  // API Layer signal
  if (config.apiLayer && config.apiLayer !== 'none') {
    signals.push({
      label: 'API Layer',
      value: getApiLayerLabel(config.apiLayer),
      detail: getConfigDetail(config.apiLayer, 'api')
    });
  }
  
  // Deploy signal
  signals.push({
    label: 'Deploy',
    value: getDeployLabel(config.deployTarget),
    detail: getConfigDetail(config.deployTarget, 'deploy')
  });
  
  return signals;
}

function getStylingLabel(styling: string): string {
  const labels: Record<string, string> = {
    'tailwind': 'Tailwind v4',
    'panda-css': 'Panda CSS',
    'stylex': 'StyleX',
    'css-modules': 'CSS Modules',
    'styled-components': 'Styled Components',
  };
  return labels[styling] || styling;
}

function getDatabaseLabel(database: string): string {
  const labels: Record<string, string> = {
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'sqlite': 'SQLite',
    'mongodb': 'MongoDB',
    'turso': 'Turso',
    'neon': 'Neon',
  };
  return labels[database] || database;
}

function getAuthLabel(auth: string): string {
  const labels: Record<string, string> = {
    'better-auth': 'Better Auth',
    'clerk': 'Clerk',
    'next-auth': 'NextAuth.js',
    'lucia': 'Lucia Auth',
  };
  return labels[auth] || auth;
}

function getApiLayerLabel(apiLayer: string): string {
  const labels: Record<string, string> = {
    'trpc': 'tRPC',
    'orpc': 'ORPC',
    'ts-rest': 'ts-rest',
    'graphql': 'GraphQL',
    'rest': 'REST API',
  };
  return labels[apiLayer] || apiLayer;
}

function getDeployLabel(deployTarget: string): string {
  const labels: Record<string, string> = {
    'vercel': 'Vercel',
    'cloudflare-workers': 'Cloudflare Workers',
    'flyio': 'Fly.io',
    'railway': 'Railway',
    'self-hosted': 'Self-hosted',
  };
  return labels[deployTarget] || deployTarget;
}

function getConfigDetail(option: string, category: string): string {
  const details: Record<string, Record<string, string>> = {
    runtime: {
      'nextjs': 'App Router ready',
      'sveltekit': 'Full-stack Svelte',
      'nuxt': 'Vue 3 with SSR',
      'react-router-v7': 'Remix-style routing',
      'hono': 'Fast web framework',
    },
    styling: {
      'tailwind': 'Modern import pipeline',
      'panda-css': 'Atomic CSS with type safety',
      'stylex': 'Facebook\\'s CSS-in-JS',
      'css-modules': 'Scoped CSS modules',
    },
    database: {
      'postgres': 'Robust relational database',
      'mysql': 'Popular relational database',
      'sqlite': 'Lightweight file-based DB',
      'mongodb': 'NoSQL document store',
    },
    auth: {
      'better-auth': 'Modern auth solution',
      'clerk': 'Complete auth platform',
      'next-auth': 'OAuth and session management',
      'lucia': 'Flexible auth library',
    },
    api: {
      'trpc': 'End-to-end type safety',
      'orpc': 'OpenAPI-first RPC',
      'ts-rest': 'Type-safe REST clients',
      'graphql': 'Query language and runtime',
    },
    deploy: {
      'vercel': 'Serverless deployment',
      'cloudflare-workers': 'Edge computing platform',
      'flyio': 'App deployment platform',
      'railway': 'Cloud infrastructure',
    },
  };
  
  return details[category]?.[option] || 'Integrated feature';
}

export function getFrameworkDescription(config: StackMintConfig): string {
  const features = [];
  
  if (config.category === 'fullstack') {
    features.push('full-stack capabilities');
  }
  
  if (config.database && config.database !== 'none') {
    features.push('database integration');
  }
  
  if (config.auth && config.auth !== 'none') {
    features.push('authentication system');
  }
  
  if (config.apiLayer && config.apiLayer !== 'none') {
    features.push('type-safe API layer');
  }
  
  if (features.length === 0) {
    return 'Clean Next.js setup with modern tooling.';
  }
  
  return \`Next.js with \${features.join(', ')}.\`;
}
`,
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      {
        path: 'next.config.ts',
        content: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silences the workspace-root warning when multiple lockfiles are detected
  outputFileTracingRoot: process.cwd(),
  ${config.deployTarget === 'cloudflare-workers' ? "output: 'export'," : ''}
};

export default nextConfig;
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2017',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./src/*'] },
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        }, null, 2),
      },
    ];

    if (config.styling === 'tailwind' || config.styling === 'none') {
      files.push({
        path: 'postcss.config.mjs',
        content: `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
      });
    }

    return files;
  },
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'echo "No lint configured"',
  },
});

// Hono Template
registerTemplate({
  id: 'hono',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendMarkup({
      framework: 'Hono',
      runtime: 'Hono',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Lightweight, multi-runtime framework',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    const files: AdapterFile[] = [
      {
        path: 'src/index.ts',
        content: config.runtime === 'bun'
          ? `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => c.html('${landingHTML.replace(/'/g, "\\'")}'));
app.get('/api/health', (c) => c.json({ 
  status: 'ok',
  framework: 'hono',
  runtime: 'bun',
  timestamp: new Date().toISOString() 
}));

Bun.serve({ fetch: app.fetch, port: 3000 });
console.log('Server running on http://localhost:3000');
`
          : `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => c.html('${landingHTML.replace(/'/g, "\\'")}'));
app.get('/api/health', (c) => c.json({ 
  status: 'ok',
  framework: 'hono',
  timestamp: new Date().toISOString()
}));

export default app;
`,
      },
      getStackmintLogoFile(),
      {
        path: 'src/routes/index.ts',
        content: '// Add your routes here',
      },
      {
        path: 'src/middleware/index.ts',
        content: '// Add your middleware here',
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            outDir: 'dist',
            paths: { '@/*': ['./src/*'] },
          },
          include: ['src/**/*'],
        }, null, 2),
      },
    ];

    if (config.validation === 'zod') {
      files.push({
        path: 'src/lib/schemas/index.ts',
        content: `import { z } from 'zod';

export const healthSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});`,
      });
    }

    return files;
  },
  scripts: (config) => ({
    dev: config.runtime === 'bun' ? 'bun run --hot src/index.ts' : 'tsx watch src/index.ts',
    build: 'tsup src/index.ts --format esm --dts',
    start: config.runtime === 'bun' ? 'bun src/index.ts' : 'node dist/index.js',
  }),
});

// SvelteKit Template
registerTemplate({
  id: 'sveltekit',
  files: (): AdapterFile[] => [
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
      content: `${getStaticFrontendMarkup({
        framework: 'SvelteKit',
        runtime: 'SvelteKit',
        styling: 'Tailwind v4',
        build: 'SSR',
        detail: 'SvelteKit routing, server endpoints, and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'src/routes/+page.svelte',
        actionHref: '/api/health',
        actionLabel: 'Check API health',
      })}
`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/routes/+layout.ts',
      content: `export const load = () => {
    return {};
};
`,
    },
    {
      path: 'src/routes/api/health/+server.ts',
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
    plugins: [sveltekit(), tailwindcss()]
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
  ],
  scripts: {
    dev: 'vite dev',
    build: 'svelte-kit sync && vite build',
    preview: 'vite preview',
    check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
  },
});

// Nuxt Template
registerTemplate({
  id: 'nuxt',
  files: (): AdapterFile[] => [
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
      content: `<template>
  ${getStaticFrontendMarkup({
        framework: 'Nuxt',
        runtime: 'Nuxt 3',
        styling: 'Tailwind v4',
        build: 'SSR',
        detail: 'Nuxt pages, server API routes, and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'pages/index.vue',
        actionHref: '/api/health',
        actionLabel: 'Check API health',
      })}
</template>
`,
    },
    {
      path: 'server/api/health.get.ts',
      content: `export default defineEventHandler(() => {
    return {
        status: 'ok',
        framework: 'nuxt',
        timestamp: new Date().toISOString()
    };
});
`,
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
    vite: {
        plugins: [tailwindcss()]
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
  ],
  scripts: {
    dev: 'nuxt dev',
    build: 'nuxt build',
    start: 'node .output/server/index.mjs',
    generate: 'nuxt generate',
  },
});

// Astro SSG Template
registerTemplate({
  id: 'astro-ssg',
  files: (): AdapterFile[] => [
    getStackmintLogoFile(),
    {
      path: 'src/pages/index.astro',
      content: `---
import '../styles/global.css';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Astro | Built with stackmint</title>
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content="A creative Astro starter generated by stackmint." />
  </head>
  <body>
    <Fragment set:html={\`${getStaticFrontendMarkup({
        framework: 'Astro',
        runtime: 'Astro SSG',
        styling: 'Tailwind v4',
        build: 'Static',
        detail: 'Astro content pages and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'src/pages/index.astro',
        actionHref: 'https://stackmint-docs.vercel.app',
        actionLabel: 'Open docs',
      })}\`} />
  </body>
</html>
`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/styles/global.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'src/layouts/Layout.astro',
      content: `---
const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
    <meta name="viewport" content="width=device-width" />
  </head>
  <body>
    <slot />
  </body>
</html>
`,
    },
    {
      path: 'astro.config.mjs',
      content: `import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'static',
    vite: {
        plugins: [tailwindcss()]
    },
});
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: 'astro/tsconfigs/base'
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'astro dev',
    build: 'astro build',
    preview: 'astro preview',
  },
});

// Astro SSR Template
registerTemplate({
  id: 'astro-ssr',
  files: (): AdapterFile[] => [
    getStackmintLogoFile(),
    {
      path: 'src/pages/index.astro',
      content: `---
import '../styles/global.css';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Astro SSR | Built with stackmint</title>
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content="A creative Astro SSR starter generated by stackmint." />
  </head>
  <body>
    <Fragment set:html={\`${getStaticFrontendMarkup({
        framework: 'Astro SSR',
        runtime: 'Astro SSR',
        styling: 'Tailwind v4',
        build: 'Server',
        detail: 'Astro server rendering, API routes, and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'src/pages/index.astro',
        actionHref: '/api/health',
        actionLabel: 'Check API health',
      })}\`} />
  </body>
</html>
`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/styles/global.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'src/pages/api/health.ts',
      content: `export const prerender = false;

export async function GET() {
    return new Response(JSON.stringify({
        status: 'ok',
        framework: 'astro-ssr',
        timestamp: new Date().toISOString()
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
`,
    },
    {
      path: 'astro.config.mjs',
      content: `import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
    vite: {
        plugins: [tailwindcss()]
    },
});
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: 'astro/tsconfigs/base'
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'astro dev',
    build: 'astro build',
    start: 'node ./dist/server/entry.mjs',
  },
});

// VitePress Template
registerTemplate({
  id: 'vitepress',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'docs/.vitepress/config.ts',
      content: `import { defineConfig } from 'vitepress';

export default defineConfig({
    title: '${config.projectName || 'Docs'}',
    description: 'Documentation for ${config.projectName || 'my-project'}',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/' },
            { text: 'API', link: '/api' },
        ],
        sidebar: [
            { text: 'Getting Started', link: '/' },
            { text: 'Configuration', link: '/config' },
        ],
    },
});
`,
    },
    {
      path: 'docs/index.md',
      content: `# Getting Started

Welcome to the documentation!

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
console.log('Hello World');
\`\`\`

---

*Scaffolded with [stackmint](https://stackmint-docs.vercel.app) — scaffold any TypeScript stack in seconds.*
`,
    },
    {
      path: 'docs/getting-started.md',
      content: `# Getting Started

This guide will help you get started with ${config.projectName || 'your project'}.
`,
    },
  ],
  scripts: {
    dev: 'vitepress dev docs',
    build: 'vitepress build docs',
    preview: 'vitepress preview docs',
  },
});

// Vue + Vite Template
registerTemplate({
  id: 'vue-vite',
  files: (config) => [
    {
      path: 'src/App.vue',
      content: `<script setup lang=\"ts\">
import { ref } from 'vue';

const launches = ref(1);
const signals = [
  { label: 'Runtime', value: 'Vue 3', detail: 'Composition API ready' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Loaded through the Vite plugin' },
  { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
];
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
          Shape your <span class="accent">Vue</span> launch surface.
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
          <strong>Vue + Vite</strong>
          <p>Vue, Vite, TypeScript, and Tailwind v4 are wired together.</p>
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
  plugins: [vue(), tailwindcss()],
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
  ],
scripts: {
  dev: 'vite',
    build: 'vue-tsc --noEmit && vite build',
      preview: 'vite preview',
  },
});

// Svelte + Vite Template
registerTemplate({
  id: 'svelte-vite',
  files: (): AdapterFile[] => [
    {
      path: 'src/main.ts',
      content: `import App from './App.svelte';
import './styles/globals.css';
import './styles/app.css';

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
`,
    },
    {
      path: 'src/App.svelte',
      content: `<script lang="ts">
  let launches = 1;
  const signals = [
    { label: 'Runtime', value: 'Svelte', detail: 'Compiled UI ready' },
    { label: 'Styling', value: 'Tailwind v4', detail: 'Loaded through the Vite plugin' },
    { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
  ];
</script>

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
        Shape your <span class="accent">Svelte</span> launch surface.
      </h1>
      <p class="hero-lede">
        A polished stackmint canvas with the real brand artwork, responsive panels,
        and a consistent layout ready to mirror across every frontend framework.
      </p>

      <div class="actions">
        <button class="button button-primary" type="button" on:click={() => launches += 1}>
          Launch pulse {launches}
        </button>
        <a class="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </div>

      <div class="signal-grid" aria-label="Template highlights">
        {#each signals as signal}
          <article class="signal-card">
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>{signal.detail}</p>
          </article>
        {/each}
      </div>
    </section>

    <section class="hero-visual" aria-label="stackmint preview">
      <div class="logo-stage">
        <img class="logo-image" src="/logo.png" alt="stackmint" />
      </div>
      <aside class="framework-card">
        <span>Framework section</span>
        <strong>Svelte + Vite</strong>
        <p>Svelte, Vite, TypeScript, and Tailwind v4 are wired together.</p>
      </aside>

      <div class="status-row">
        <div class="mini-panel">
          <span>Edit surface</span>
          <strong><code>src/App.svelte</code></strong>
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
      content: `/// <reference types="svelte" />
/// <reference types="vite/client" />
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
    <title>Svelte + Vite App</title>
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
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
});
`,
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: '@tsconfig/svelte/tsconfig.json',
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          strict: true
        },
        include: ['src/**/*.ts', 'src/**/*.svelte']
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
  },
});

// Solid + Vite Template
registerTemplate({
  id: 'solid-vite',
  files: (): AdapterFile[] => [
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

const signals = [
  { label: 'Runtime', value: 'Solid', detail: 'Fine-grained reactivity ready' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Loaded through the Vite plugin' },
  { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
];

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
            Shape your <span class="accent">Solid</span> launch surface.
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
            <strong>Solid + Vite</strong>
            <p>Solid, Vite, TypeScript, and Tailwind v4 are wired together.</p>
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
    <title>Solid + Vite App</title>
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
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
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
  ],
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview',
  },
});

// React + Vite Template
registerTemplate({
  id: 'react-vite',
  files: (): AdapterFile[] => [
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: 'src/App.tsx',
      content: `import { useState } from 'react';
import './styles/app.css';

const signals = [
  { label: 'Runtime', value: 'React 18', detail: 'Vite-powered HMR' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Loaded through the Vite plugin' },
  { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
];

function App() {
  const [launches, setLaunches] = useState(1);

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
            Shape your <span className="accent">React</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
              Open docs
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
            <strong>React + Vite</strong>
            <p>React, Vite, TypeScript, and Tailwind v4 are wired together.</p>
          </aside>

          <div className="status-row">
            <div className="mini-panel">
              <span>Edit surface</span>
              <strong><code>src/App.tsx</code></strong>
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

export default App;
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
    <title>React + Vite App</title>
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
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
`,
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: '#1ee0c6',
        'mint-light': '#2ef5d6',
      },
    },
  },
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
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      }, null, 2),
    },
    {
      path: 'tsconfig.node.json',
      content: JSON.stringify({
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true
        },
        include: ['vite.config.ts']
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview',
  },
});

// Expo Template
registerTemplate({
  id: 'expo',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'app/(tabs)/index.tsx',
      content: `import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expo</Text>
      <Text style={styles.subtitle}>Get started by editing app/(tabs)/index.tsx</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Scaffolded with stackmint (https://stackmint-docs.vercel.app)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
`,
    },
    {
      path: 'app/_layout.tsx',
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
`,
    },
    {
      path: 'app.json',
      content: JSON.stringify({
        expo: {
          name: config.projectName || 'my-app',
          slug: config.projectName || 'my-app',
          version: '1.0.0',
          scheme: config.projectName || 'my-app',
        },
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        ios: {
          supportsTablet: true
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
          }
        },
        plugins: [
          'expo-router'
        ]
      }, null, 2),
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: 'expo/tsconfig.base'
      }, null, 2),
    },
  ],
  scripts: {
    start: 'expo start',
    android: 'expo start --android',
    ios: 'expo start --ios',
  },
});

// Express Template
registerTemplate({
  id: 'express',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendMarkup({
      framework: 'Express',
      runtime: 'Express.js',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Production-grade Node.js framework',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'src/index.ts',
        content: `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send('${landingHTML.replace(/'/g, "\\'")}');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    framework: 'express',
    timestamp: new Date().toISOString(),
    app: '${config.projectName || 'my-api'}'
  });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ES2022',
            moduleResolution: 'bundler',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            outDir: 'dist',
            rootDir: 'src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }, null, 2),
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      getStackmintLogoFile(),
    ];
  },
  scripts: {
    dev: 'tsx watch src/index.ts',
    build: 'tsup src/index.ts --format esm --outDir dist',
    start: 'node dist/index.js',
  },
});

// React Router v7 Template
registerTemplate({
  id: 'react-router-v7',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'app/routes/_index.tsx',
      content: `import { useState } from 'react';

const signals = [
  { label: 'Runtime', value: 'React Router v7', detail: 'File-based routing with React' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Utility-first CSS framework' },
  { label: 'Build', value: 'SSR Ready', detail: 'Server-side rendering capable' },
];

export default function Index() {
  const [launches, setLaunches] = useState(1);

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
            Shape your <span className="accent">React Router</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
              Open docs
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
            <strong>React Router v7</strong>
            <p>React, React Router v7, TypeScript, and Tailwind v4 are ready.</p>
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

// TanStack Start Template
registerTemplate({
  id: 'tanstack-start',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'app/routes/index.tsx',
      content: `import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const signals = [
  { label: 'Runtime', value: 'TanStack Start', detail: 'Full-stack React framework' },
  { label: 'Styling', value: 'Tailwind v4', detail: 'Utility-first CSS framework' },
  { label: 'Build', value: 'SSR Ready', detail: 'Server-side rendering included' },
];

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [launches, setLaunches] = useState(1);

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
            Shape your <span className="accent">TanStack Start</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with the real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => setLaunches((value) => value + 1)}>
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
              Open docs
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
            <strong>TanStack Start</strong>
            <p>TanStack Start with React, TypeScript, and Tailwind v4 configured.</p>
          </aside>

          <div className="status-row">
            <div className="mini-panel">
              <span>Edit surface</span>
              <strong><code>app/routes/index.tsx</code></strong>
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
      path: 'app/root.tsx',
      content: `import { Outlet, createRootRoute } from '@tanstack/react-router';
import './root.css';

export const Route = createRootRoute({
  component: () => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TanStack Start App</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
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
        include: ['app'],
        exclude: ['node_modules', '.output', 'dist', 'build']
      }, null, 2),
    },
    {
      path: 'app.config.ts',
      content: `import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  // Configuration for TanStack Start
  routers: {
    web: {
      entry: 'entry.client.tsx',
    },
    ssr: {
      entry: 'entry.server.tsx',
    },
  },
});
`,
    },
  ],
  scripts: {
    dev: 'vinxi dev',
    build: 'vinxi build',
    start: 'vinxi start',
  },
});

// Nitro Template
registerTemplate({
  id: 'nitro',
  files: (config: StackConfig): AdapterFile[] => {
    let preset = 'node-server';
    if (config.deployTarget === 'vercel') preset = 'vercel';
    if (config.deployTarget === 'cloudflare-workers') preset = 'cloudflare';

    return [
      {
        path: 'nitro.config.ts',
        content: `export default defineNitroConfig({
    preset: '${preset}',
    routeRules: {
        '/**': { cors: true }
    }
});
`,
      },
      {
        path: 'routes/index.ts',
        content: `export default defineEventHandler(() => {
    return { message: 'Hello from Nitro' };
});
`,
      },
      {
        path: 'routes/api/health.ts',
        content: `export default defineEventHandler(() => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString()
    };
});
`,
      },
      {
        path: 'middleware/logger.ts',
        content: `export default defineEventHandler(async (event) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(\`\${event.method} \${event.path} - \${duration}ms\`);
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          extends: './.nuxt/tsconfig.json'
        }, null, 2),
      },
    ];
  },
  scripts: {
    dev: 'nitro dev',
    build: 'nitro build',
    preview: 'nitro preview',
  },
});



// Qwik Template
registerTemplate({
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
  ],
  scripts: { 
    dev: 'qwik dev', 
    build: 'qwik build',
    preview: 'qwik preview',
  },
});

// Angular Template
registerTemplate({
  id: 'angular',
  files: (): AdapterFile[] => [
    {
      path: 'src/app/app.component.ts',
      content: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Signal {
  label: string;
  value: string;
  detail: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  launches = signal(1);
  signals: Signal[] = [
    { label: 'Runtime', value: 'Angular 17+', detail: 'Standalone components ready' },
    { label: 'Styling', value: 'Tailwind v4', detail: 'Utility-first CSS framework' },
    { label: 'Build', value: 'SPA', detail: 'Optimized Angular output' },
  ];

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
        Shape your <span class="accent">Angular</span> launch surface.
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
        <strong>Angular</strong>
        <p>Angular, TypeScript, and Tailwind v4 are configured and ready.</p>
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

// Elysia Template
registerTemplate({
  id: 'elysia',
  files: (): AdapterFile[] => {
    const landingHTML = getStaticFrontendMarkup({
      framework: 'Elysia',
      runtime: 'Elysia + Bun',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Blazingly fast Bun web framework',
      editPath: 'src/index.ts',
      actionHref: '/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'src/index.ts',
        content: `import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
  .use(staticPlugin({
    assets: 'public'
  }))
  .get("/", () => '${landingHTML.replace(/'/g, "\\'")}')
  .get("/health", () => ({ 
    status: "ok", 
    framework: "elysia",
    timestamp: new Date().toISOString()
  }))
  .listen(3000);

console.log(\`🦊 Elysia is running at http://\${app.server?.hostname}:\${app.server?.port}\`);
`,
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      getStackmintLogoFile(),
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            skipLibCheck: true,
            outDir: 'dist',
          },
          include: ['src/**/*'],
        }, null, 2),
      },
    ];
  },
  scripts: { 
    dev: 'bun run --watch src/index.ts', 
    start: 'bun src/index.ts',
    build: 'bun build src/index.ts --outdir dist'
  },
});

// Fastify Template
registerTemplate({
  id: 'fastify',
  files: (): AdapterFile[] => {
    const landingHTML = getStaticFrontendMarkup({
      framework: 'Fastify',
      runtime: 'Fastify',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Fast, low-overhead web framework',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'src/index.ts',
        content: `import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';

const fastify = Fastify({
  logger: true
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

fastify.get('/', async function(request, reply) {
  reply.type('text/html');
  return '${landingHTML.replace(/'/g, "\\'")}';
});

fastify.get('/api/health', async function(request, reply) {
  return { 
    status: 'ok', 
    framework: 'fastify',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ES2022',
            moduleResolution: 'bundler',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            outDir: 'dist',
            rootDir: 'src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }, null, 2),
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      getStackmintLogoFile(),
    ];
  },
  scripts: { 
    dev: 'tsx watch src/index.ts', 
    build: 'tsup src/index.ts --format esm --outDir dist',
    start: 'node dist/index.js' 
  },
});

// NestJS Template
registerTemplate({
  id: 'nestjs',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-nestjs',
        scripts: {
          start: 'nest start',
          "start:dev": 'nest start --watch',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'nest start --watch', build: 'nest build' },
});

// h3 Template
registerTemplate({
  id: 'h3',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-h3',
        scripts: {
          dev: 'listhen -w ./src/index.ts',
        }
      }, null, 2),
    },
    {
      path: 'src/index.ts',
      content: `import { createApp, createRouter, defineEventHandler } from "h3";

export const app = createApp();
const router = createRouter();

router.get("/", defineEventHandler(() => "Hello H3!"));

app.use(router);`
    }
  ],
  scripts: { dev: 'listhen -w ./src/index.ts' },
});

// Bun Native Template
registerTemplate({
  id: 'bun-native',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-bun-native',
        scripts: {
          dev: 'bun run --watch src/index.ts',
        }
      }, null, 2),
    },
    {
      path: 'src/index.ts',
      content: `Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Bun!");
  },
});`
    }
  ],
  scripts: { dev: 'bun run --watch src/index.ts' },
});

// React Native Template
registerTemplate({
  id: 'react-native',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-react-native',
        scripts: {
          start: 'react-native start',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'react-native start' },
});

// Docusaurus Template
registerTemplate({
  id: 'docusaurus',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-docusaurus',
        scripts: {
          start: 'docusaurus start',
          build: 'docusaurus build',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'docusaurus start', build: 'docusaurus build' },
});

// Eleventy Template
registerTemplate({
  id: 'eleventy',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-eleventy',
        scripts: {
          start: 'eleventy --serve',
          build: 'eleventy',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'eleventy --serve', build: 'eleventy' },
});

// Gatsby Template
registerTemplate({
  id: 'gatsby',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-gatsby',
        scripts: {
          start: 'gatsby develop',
          build: 'gatsby build',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'gatsby develop', build: 'gatsby build' },
});

// Analog Template
registerTemplate({
  id: 'analog',
  files: (): AdapterFile[] => [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: 'stackmint-analog',
        scripts: {
          start: 'vite',
          build: 'vite build',
        }
      }, null, 2),
    }
  ],
  scripts: { dev: 'vite', build: 'vite build' },
});


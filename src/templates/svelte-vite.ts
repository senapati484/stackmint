import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('svelte-vite', {

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
  import Header from './components/Header.svelte';
  import Hero from './components/Hero.svelte';
  import Footer from './components/Footer.svelte';
  import './styles/app.css';
</script>

<div class="stackmint-shell">
  <Header />
  <main class="hero">
    <Hero />
  </main>
  <Footer />
</div>
`,
    },
    {
      path: 'src/components/Header.svelte',
      content: `<header class="topbar">
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
`,
    },
    {
      path: 'src/components/Hero.svelte',
      content: `<script lang="ts">
  let launches = 1;
  const signals = [
    { label: 'Runtime', value: 'Svelte', detail: 'Compiled UI ready' },
    { label: 'Styling', value: 'Tailwind v4', detail: 'Loaded through the Vite plugin' },
    { label: 'Build', value: 'SPA', detail: 'Optimized static output' },
  ];
</script>

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
      <strong><code>src/components/Hero.svelte</code></strong>
    </div>
    <div class="mini-panel">
      <span>Dev server</span>
      <strong><code>npm run dev</code></strong>
    </div>
  </div>
</section>
`,
    },
    {
      path: 'src/components/Footer.svelte',
      content: `<footer class="footer-note">
  Built with stackmint. Keep this layout and swap the framework section as new templates come online.
</footer>
`,
    },
    {
      path: 'src/lib/utils.ts',
      content: `/**
 * Utility functions for Svelte + Vite app
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
`,
    },
    {
      path: 'src/lib/stores/user.ts',
      content: `import { writable } from 'svelte/store';

interface User {
  id: string;
  email: string;
  name?: string;
}

function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    setUser: (user: User) => set(user),
    clearUser: () => set(null),
    updateUser: (updates: Partial<User>) =>
      update((current) => (current ? { ...current, ...updates } : null)),
  };
}

export const user = createUserStore();
`,
    },
    {
      path: 'src/lib/hooks/useLocalStorage.ts',
      content: `import { writable, type Writable } from 'svelte/store';

export function useLocalStorage<T>(key: string, initialValue: T): Writable<T> {
  const storedValue = getStoredValue<T>(key) ?? initialValue;
  const store = writable<T>(storedValue);

  store.subscribe((value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  });

  return store;
}

function getStoredValue<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}
`,
    },
    {
      path: 'src/types/index.ts',
      content: `/**
 * Shared TypeScript types and interfaces
 */

export interface ApiResponse<T> {
  data: T;
  status: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
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
  plugins: [
    svelte(), 
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
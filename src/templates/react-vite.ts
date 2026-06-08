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

TEMPLATE_REGISTRY.set('react-vite', {

  id: 'react-vite',
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
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import './styles/app.css';

function App() {
  const [launches, setLaunches] = useState(1);

  return (
    <div className="stackmint-shell">
      <Header />
      <main className="hero">
        <Hero launches={launches} setLaunches={setLaunches} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
`,
    },
    {
      path: 'src/components/Header.tsx',
      content: `export function Header() {
  return (
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
  );
}
`,
    },
    {
      path: 'src/components/Hero.tsx',
      content: `import { getFrameworkDescription, getFrameworkLabel, getSignals, getStackMintConfig } from '../lib/stackmint-config';

interface HeroProps {
  launches: number;
  setLaunches: (value: number) => void;
}

export function Hero({ launches, setLaunches }: HeroProps) {
  const config = getStackMintConfig();
  const signals = getSignals(config);
  const frameworkLabel = getFrameworkLabel(config.framework);
  const frameworkDescription = getFrameworkDescription(config);

  return (
    <>
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
          <button className="button button-primary" type="button" onClick={() => setLaunches(launches + 1)}>
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
            <strong>{frameworkLabel}</strong>
            <p>{frameworkDescription}</p>
          </aside>

          <div className="status-row">
            <div className="mini-panel">
              <span>Edit surface</span>
              <strong><code>src/components/Hero.tsx</code></strong>
            </div>
            <div className="mini-panel">
              <span>Dev server</span>
              <strong><code>npm run dev</code></strong>
            </div>
          </div>
        </section>
      </>
    );
}
`,
    },
    {
      path: 'src/components/Footer.tsx',
      content: `export function Footer() {
  return (
    <footer className="footer-note">
      Built with stackmint. Keep this layout and swap the framework section as new templates come online.
    </footer>
  );
}
`,
    },
    {
      path: 'src/components/index.ts',
      content: `export { Header } from './Header';
export { Hero } from './Hero';
export { Footer } from './Footer';
`,
    },
    {
      path: 'src/lib/utils.ts',
      content: `/**
 * Utility functions for React + Vite app
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

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
`,
    },
    {
      path: 'src/hooks/useLocalStorage.ts',
      content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
`,
    },
    {
      path: 'src/hooks/useWindowSize.ts',
      content: `import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
`,
    },
    {
      path: 'src/hooks/index.ts',
      content: `export { useLocalStorage } from './useLocalStorage';
export { useWindowSize } from './useWindowSize';
`,
    },
    {
      path: 'src/lib/api-client.ts',
      content: `/**
 * API client utilities for making HTTP requests
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(\`API error: \${response.status} \${response.statusText}\`);
    }

    return await response.json() as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiGet<T>(url: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'GET' });
}

export async function apiPost<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
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
      path: 'src/components/.gitkeep',
      content: '',
    },
    {
      path: 'src/lib/.gitkeep',
      content: '',
    },
    {
      path: 'src/styles/globals.css',
      content: `@import "tailwindcss";

@theme {
  --color-mint: #1ee0c6;
  --color-mint-light: #2ef5d6;
}

${getFrontendGlobalStyles().replace('@import "tailwindcss";\n', '')}`,
    },
    {
      path: 'src/styles/app.css',
      content: `${getFrontendAppStyles()}`,
    },
    {
      path: 'src/lib/stackmint-config.ts',
      content: buildStackmintConfigLib(config),
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
  plugins: [
    react(), 
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
      path: 'tsconfig.node.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true
        },
        include: ['vite.config.ts']
      }, null, 2),
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
        { name: '@testing-library/react', version: '^16.0.0', dev: true },
        { name: '@vitejs/plugin-react', version: '^4.3.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});

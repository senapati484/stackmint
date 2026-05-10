import { AdapterFile } from '../adapters/index.js';
import { StackConfig } from '../cli/types.js';

interface FrameworkTemplate {
  id: string;
  files: (config: StackConfig) => AdapterFile[];
  scripts: Record<string, string> | ((config: StackConfig) => Record<string, string>);
}

export const TEMPLATE_REGISTRY = new Map<string, FrameworkTemplate>();

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

function registerTemplate(template: FrameworkTemplate): void {
  TEMPLATE_REGISTRY.set(template.id, template);
}

// Next.js 15 App Router Template
registerTemplate({
  id: 'nextjs',
  files: (config: StackConfig): AdapterFile[] => {
    const files: AdapterFile[] = [
      {
        path: 'src/app/layout.tsx',
        content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${config.projectName || 'my-app'}',
  description: '${config.projectName || 'my-app'} — scaffolded by stackmint',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`,
      },
      {
        path: 'src/app/page.tsx',
        content: `export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome to ${config.projectName || 'my-app'}</h1>
      <p className="mt-4 text-muted-foreground">
        Get started by editing <code>src/app/page.tsx</code>
      </p>
      <footer className="mt-16 pt-8 border-t text-sm text-muted-foreground">
        Scaffolded with{' '}
        <a
          href="https://stackmint-docs.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          stackmint
        </a>
        {' '}— scaffold any TypeScript stack in seconds.
      </footer>
    </main>
  );
}
`,
      },
      {
        path: 'src/app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
}

body {
  font-family: system-ui, sans-serif;
}
`,
      },
      {
        path: 'src/app/api/health/route.ts',
        content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
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
        path: 'public/.gitkeep',
        content: '',
      },
      {
        path: 'next.config.ts',
        content: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
        path: 'tailwind.config.ts',
        content: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
`,
      });
    }

    return files;
  },
  scripts: {
    dev: 'next dev --turbopack',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
});

// Hono Template
registerTemplate({
  id: 'hono',
  files: (config: StackConfig): AdapterFile[] => {
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

app.get('/', (c) => c.json({ message: 'Hello from ' + (config.projectName || 'hono') }));
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

 Bun.serve({ fetch: app.fetch, port: 3000 });
 console.log('Server running on http://localhost:3000');
`
          : `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => c.json({ message: 'Hello from ' + (config.projectName || 'hono') }));
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
`,
      },
      {
        path: 'src/routes/index.ts',
        content: '',
      },
      {
        path: 'src/middleware/index.ts',
        content: '',
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
});
`,
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
      content: `<script lang="ts">
  const title = 'Welcome to SvelteKit';
</script>

<main class="min-h-screen p-8">
  <h1 class="text-4xl font-bold">{title}</h1>
  <p class="mt-4">Get started by editing src/routes/+page.svelte</p>
  <footer class="mt-16 pt-8 border-t text-sm text-gray-500">
    Scaffolded with <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-800">stackmint</a>
    — scaffold any TypeScript stack in seconds.
  </footer>
</main>
`,
    },
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
    return json({ status: 'ok', timestamp: new Date().toISOString() });
}
`,
    },
    {
      path: 'src/lib/index.ts',
      content: '',
    },
    {
      path: 'src/app.css',
      content: `html {
    font-family: system-ui, sans-serif;
}
`,
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

export default defineConfig({
    plugins: [sveltekit()]
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
    build: 'vite build',
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
    {
      path: 'pages/index.vue',
      content: `<script setup lang="ts">
const title = 'Welcome to Nuxt';
</script>

<template>
  <main class="min-h-screen p-8">
    <h1 class="text-4xl font-bold">{{ title }}</h1>
    <p class="mt-4">Get started by editing pages/index.vue</p>
    <footer class="mt-16 pt-8 border-t text-sm text-gray-500">
      Scaffolded with
      <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-800">
        stackmint
      </a>
      — scaffold any TypeScript stack in seconds.
    </footer>
  </main>
</template>
`,
    },
    {
      path: 'server/api/health.get.ts',
      content: `export default defineEventHandler(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
`,
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
      content: `export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: true,
    modules: [],
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
    {
      path: 'src/pages/index.astro',
      content: `---
const title = 'Welcome to Astro';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
    <meta name="viewport" content="width=device-width" />
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>Get started by editing src/pages/index.astro</p>
      <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #ccc; font-size: 0.875rem; color: #666;">
        Scaffolded with <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">stackmint</a>
        — scaffold any TypeScript stack in seconds.
      </footer>
    </main>
  </body>
</html>
`,
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

export default defineConfig({
    output: 'static',
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
    {
      path: 'src/pages/index.astro',
      content: `---
const title = 'Welcome to Astro';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
    <meta name="viewport" content="width=device-width" />
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>Get started by editing src/pages/index.astro</p>
      <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #ccc; font-size: 0.875rem; color: #666;">
        Scaffolded with <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">stackmint</a>
        — scaffold any TypeScript stack in seconds.
      </footer>
    </main>
  </body>
</html>
`,
    },
    {
      path: 'src/pages/api/health.ts',
      content: `export const prerender = false;

export async function GET() {
    return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
`,
    },
    {
      path: 'astro.config.mjs',
      content: `import node from '@astrojs/node';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
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

// React + Vite Template
registerTemplate({
  id: 'react-vite',
  files: (): AdapterFile[] => [
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: 'src/App.tsx',
      content: `function App() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome to React + Vite</h1>
      <p className="mt-4">Get started by editing src/App.tsx</p>
      <footer className="mt-16 pt-8 border-t text-sm text-gray-500">
        Scaffolded with <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800">stackmint</a>
        {' '}— scaffold any TypeScript stack in seconds.
      </footer>
    </div>
  );
}

export default App;
`,
    },
    {
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite</title>
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

export default defineConfig({
    plugins: [react()],
});
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
          coms: true,
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
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'src/index.ts',
      content: `import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          outDir: 'dist'
        },
        include: ['src/**/*']
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'tsx watch src/index.ts',
    build: 'tsup src/index.ts --format esm',
    start: 'node dist/index.js',
  },
});

// React Router v7 Template
registerTemplate({
  id: 'react-router-v7',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'app/routes/_index.tsx',
      content: `export default function Index() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to React Router v7</h1>
      <p>Scaffolded with stackmint</p>
    </div>
  );
}
`,
    },
    {
      path: 'react-router.config.ts',
      content: `import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
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

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome to TanStack Start!</h3>
    </div>
  );
}
`,
    },
    {
      path: 'app.config.ts',
      content: `import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({});
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
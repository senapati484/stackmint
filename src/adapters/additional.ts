import { Adapter, AdapterFile, AdapterDependency, ADAPTER_REGISTRY } from './index.js';
import { generateShadcnComponents } from './ui-library.js';
import { generateUtilsHelpers } from './utils-helpers.js';
import { generateProviderComponents } from './providers.js';
import { generateExampleComponents } from './examples.js';
import { generateSvelteKitComponents } from './sveltekit.js';
import { generateVueComponents } from './vue-framework.js';
import { generateReactViteComponents } from './react-vite.js';
import { generateSolidComponents } from './solid.js';
import { generateAstroComponents } from './astro.js';

interface StackConfig {
  framework?: string;
  database?: string;
  runtime?: string;
  packageManager?: string;
  deployTarget?: string;
  baas?: string;
  orm?: string;
  auth?: string;
  apiLayer?: string;
  validation?: string;
  styling?: string;
  uiLibrary?: string;
  forms?: string;
  stateManagement?: string;
  dataFetching?: string;
  ai?: string;
  jobs?: string;
  cache?: string;
  email?: string;
  payments?: string;
  testing?: string;
  docker?: boolean;
  githubActions?: boolean;
  husky?: boolean;
  changesets?: boolean;
  turborepo?: boolean;
  aiConfig?: string[];
  category?: string;
  projectName?: string;
  monorepo?: boolean;
  monorepoApps?: string[];
  preset?: string;
  [key: string]: unknown;
}

const isWebReactFramework = (framework?: string) =>
  framework === 'nextjs' ||
  framework === 'react-vite' ||
  framework === 'react-router-v7' ||
  framework === 'tanstack-start';

export function registerTailwindAdapter(): void {
  const adapter: Adapter = {
    id: 'tailwind',
    name: 'Tailwind CSS',
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [];

      const framework = config.framework || '';
      const cssPath = framework.startsWith('next')
        ? 'src/app/globals.css'
        : framework === 'sveltekit'
          ? 'src/app.css'
          : framework === 'nuxt'
            ? 'assets/css/main.css'
            : framework.startsWith('astro')
              ? 'src/styles/global.css'
              : 'src/styles/globals.css';

      files.push({
        path: cssPath,
        content: `@import "tailwindcss";
`,
      });

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/postcss', version: '^4.0.0', dev: true },
      { name: 'postcss', version: '^8.4.0', dev: true },
    ],
  };

  ADAPTER_REGISTRY.set('tailwind', adapter);
}

export function registerShadcnAdapter(): void {
  const adapter: Adapter = {
    id: 'shadcn',
    name: 'shadcn/ui',
    files: (config: StackConfig): AdapterFile[] => {
      const framework = config.framework || '';
      const cssPath = framework.startsWith('next')
        ? 'src/app/globals.css'
        : framework === 'sveltekit'
          ? 'src/app.css'
          : framework === 'nuxt'
            ? 'assets/css/main.css'
            : framework.startsWith('astro')
              ? 'src/styles/global.css'
              : 'src/styles/globals.css';

      const files: AdapterFile[] = [
        {
          path: 'components.json',
          content: JSON.stringify({
            $schema: 'https://ui.shadcn.com/schema.json',
            style: 'default',
            rsc: true,
            tsx: true,
            tailwind: {
              config: '',
              css: cssPath,
              baseColor: 'zinc',
              cssVariables: true,
            },
            aliases: {
              components: '@/components',
              utils: '@/lib/utils',
            },
          }, null, 2),
        },
      ];

      // Add framework-specific UI components
      if (framework.startsWith('next')) {
        files.push(...generateShadcnComponents({ framework }));
      } else if (framework === 'svelte-vite' || framework === 'sveltekit') {
        files.push(...generateSvelteKitComponents({ framework }));
      } else if (framework === 'vue-vite' || framework === 'nuxt') {
        files.push(...generateVueComponents({ framework }));
      } else if (framework === 'react-vite') {
        files.push(...generateReactViteComponents({ framework }));
      } else if (framework === 'solid-vite') {
        files.push(...generateSolidComponents({ framework }));
      } else if (framework.startsWith('astro')) {
        files.push(...generateAstroComponents({ framework }));
      } else {
        // Default to React/Next.js components for other frameworks
        files.push(...generateShadcnComponents({ framework }));
      }

      // Add utility helpers (all frameworks)
      files.push(...generateUtilsHelpers({ framework }));

      // Add provider components (Next.js only)
      if (framework.startsWith('next')) {
        files.push(...generateProviderComponents({
          framework,
          auth: config.auth,
          apiLayer: config.apiLayer,
          stateManagement: config.stateManagement,
        }));

        // Add example components
        files.push(...generateExampleComponents({
          framework,
          apiLayer: config.apiLayer,
          auth: config.auth,
        }));
      }

      return files;
    },
    dependencies: (config: StackConfig) => {
      const deps: AdapterDependency[] = [
        { name: 'clsx', version: '^2.0.0' },
        { name: 'tailwind-merge', version: '^2.0.0' },
        { name: 'class-variance-authority', version: '^0.7.0' },
      ];
      
      // Only add React-specific dependencies for React frameworks
      const framework = config.framework || '';
      if (framework.includes('react') || framework.includes('next')) {
        deps.push({ name: '@radix-ui/react-slot', version: '^1.2.0' });
      }
      
      return deps;
    },
  };

  ADAPTER_REGISTRY.set('shadcn', adapter);
}

export function registerTanStackQueryAdapter(): void {
  const adapter: Adapter = {
    id: 'tanstack-query',
    name: 'TanStack Query',
    condition: (config) => isWebReactFramework(config.framework),
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [
        {
          path: 'src/lib/query-client.ts',
          content: `import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});
`,
        },
      ];

      if (config.framework === 'nextjs') {
        files.push({
          path: 'src/components/providers/query-provider.tsx',
          content: `'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: '@tanstack/react-query', version: '^5.0.0' },
      { name: '@tanstack/react-query-devtools', version: '^5.0.0', dev: true },
    ],
  };

  ADAPTER_REGISTRY.set('tanstack-query', adapter);
}

export function registerZustandAdapter(): void {
  const adapter: Adapter = {
    id: 'zustand',
    name: 'Zustand',
    condition: (config) => isWebReactFramework(config.framework),
    files: (): AdapterFile[] => [
      {
        path: 'src/stores/index.ts',
        content: `import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`,
      },
    ],
    dependencies: () => [
      { name: 'zustand', version: '^4.5.0' },
    ],
  };

  ADAPTER_REGISTRY.set('zustand', adapter);
}

export function registerPiniaAdapter(): void {
  const adapter: Adapter = {
    id: 'pinia',
    name: 'Pinia',
    files: (): AdapterFile[] => [
      {
        path: 'src/stores/index.ts',
        content: `import { createPinia } from 'pinia';

export const pinia = createPinia();

export * from './counter';
`,
      },
      {
        path: 'src/stores/counter.ts',
        content: `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = 0;
  }

  return { count, doubleCount, increment, decrement, reset };
});
`,
      },
    ],
    dependencies: () => [
      { name: 'pinia', version: '^2.1.0' },
    ],
  };

  ADAPTER_REGISTRY.set('pinia', adapter);
}

export function registerResendAdapter(): void {
  const adapter: Adapter = {
    id: 'resend',
    name: 'Resend',
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/email.ts',
        content: `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
`,
      },
      {
        path: 'src/emails/welcome.tsx',
        content: `export function WelcomeEmail({ name }: { name: string }) {
  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <p>Thanks for joining us.</p>
    </div>
  );
}
`,
      },
    ],
    dependencies: () => [
      { name: 'resend', version: '^3.0.0' },
    ],
    envVars: () => [
      { key: 'RESEND_API_KEY', value: 're_...', comment: 'Your Resend API key' },
    ],
  };

  ADAPTER_REGISTRY.set('resend', adapter);
}

export function registerStripeAdapter(): void {
  const adapter: Adapter = {
    id: 'stripe',
    name: 'Stripe',
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [
        {
          path: 'src/lib/stripe.ts',
          content: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
`,
        },
        {
          path: 'src/lib/stripe-client.ts',
          content: `import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
`,
        },
      ];

      if (config.framework === 'nextjs') {
        files.push({
          path: 'src/app/api/webhooks/stripe/route.ts',
          content: `import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse('Webhook Error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment successful:', session.id);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  return new NextResponse(null, { status: 200 });
}
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'stripe', version: '^17.5.0' },
      { name: '@stripe/stripe-js', version: '^2.0.0' },
    ],
    envVars: () => [
      { key: 'STRIPE_SECRET_KEY', value: 'sk_test_...', comment: 'Your Stripe secret key' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: 'pk_test_...', comment: 'Your Stripe publishable key' },
      { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_...', comment: 'Your Stripe webhook secret' },
    ],
  };

  ADAPTER_REGISTRY.set('stripe', adapter);
}

export function registerUpstashAdapter(): void {
  const adapter: Adapter = {
    id: 'upstash',
    name: 'Upstash Redis',
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/redis.ts',
        content: `import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
`,
      },
      {
        path: 'src/lib/rate-limit.ts',
        content: `import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit',
});
`,
      },
    ],
    dependencies: () => [
      { name: '@upstash/redis', version: '^1.28.0' },
      { name: '@upstash/ratelimit', version: '^1.0.0' },
    ],
    envVars: () => [
      { key: 'UPSTASH_REDIS_REST_URL', value: 'https://your-redis.upstash.io', comment: 'Your Upstash Redis URL' },
      { key: 'UPSTASH_REDIS_REST_TOKEN', value: '...', comment: 'Your Upstash Redis token' },
    ],
  };

  ADAPTER_REGISTRY.set('upstash', adapter);
}

export function registerVitestAdapter(): void {
  const adapter: Adapter = {
    id: 'vitest',
    name: 'Vitest',
    files: (config: StackConfig): AdapterFile[] => {
      const isReact = config.framework?.includes('react') || config.framework === 'nextjs' || config.framework?.includes('tanstack');
      const isVue = config.framework?.includes('vue') || config.framework === 'nuxt';
      const isSvelte = config.framework?.includes('svelte');

      let cleanupImport = '';
      let cleanupCall = '';

      if (isReact) {
        cleanupImport = "import { cleanup } from '@testing-library/react';\n";
        cleanupCall = "  cleanup();\n";
      } else if (isVue) {
        cleanupImport = "import { cleanup } from '@testing-library/vue';\n";
        cleanupCall = "  cleanup();\n";
      } else if (isSvelte) {
        cleanupImport = "import { cleanup } from '@testing-library/svelte';\n";
        cleanupCall = "  cleanup();\n";
      }

      return [
        {
          path: 'vitest.config.ts',
          content: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`,
        },
        {
          path: 'tests/setup.ts',
          content: `import { beforeEach, afterEach } from 'vitest';
${cleanupImport}
beforeEach(() => {
  // Setup
});

afterEach(() => {
${cleanupCall}});
`,
        },
      ];
    },
    dependencies: (config: StackConfig): AdapterDependency[] => {
      const deps: AdapterDependency[] = [
        { name: 'vitest', version: '^4.1.5', dev: true },
        { name: '@vitest/coverage-v8', version: '^4.1.5', dev: true },
      ];
      
      const isFrontend = !['hono', 'elysia', 'fastify', 'nestjs', 'express', 'nitro', 'h3', 'bun-native'].includes(config.framework || '');
      
      if (isFrontend) {
        deps.push({ name: 'happy-dom', version: '^12.0.0', dev: true });
        
        const isReact = config.framework?.includes('react') || config.framework === 'nextjs' || config.framework?.includes('tanstack');
        const isVue = config.framework?.includes('vue') || config.framework === 'nuxt';
        const isSvelte = config.framework?.includes('svelte');
        
        if (isReact) {
          deps.push({ name: '@testing-library/react', version: '^16.0.0', dev: true });
        } else if (isVue) {
          deps.push({ name: '@testing-library/vue', version: '^8.0.0', dev: true });
        } else if (isSvelte) {
          deps.push({ name: '@testing-library/svelte', version: '^4.0.0', dev: true });
        }
      }
      
      return deps;
    },
  };

  ADAPTER_REGISTRY.set('vitest', adapter);
}

export function registerPlaywrightAdapter(): void {
  const adapter: Adapter = {
    id: 'playwright',
    name: 'Playwright',
    files: (): AdapterFile[] => [
      {
        path: 'playwright.config.ts',
        content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`,
      },
      {
        path: 'tests/e2e/home.spec.ts',
        content: `import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Home/);
});

test('health check endpoint', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
});
`,
      },
    ],
    dependencies: () => [
      { name: '@playwright/test', version: '^1.44.0', dev: true },
    ],
    postInstall: ['npx playwright install --with-deps chromium'],
  };

  ADAPTER_REGISTRY.set('playwright', adapter);
}

function registerReactHookFormAdapter(): void {
  const adapter: Adapter = {
    id: 'react-hook-form',
    name: 'React Hook Form',
    condition: (config) => isWebReactFramework(config.framework),
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/forms.ts',
        content: `// React Hook Form helpers
export { useForm, useFormContext, FormProvider } from 'react-hook-form';
export type { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: 'react-hook-form', version: '^7.51.3', dev: false },
      { name: '@hookform/resolvers', version: '^3.3.4', dev: false },
    ],
  };
  ADAPTER_REGISTRY.set('react-hook-form', adapter);
}

function registerTanStackFormAdapter(): void {
  const adapter: Adapter = {
    id: 'tanstack-form',
    name: 'TanStack Form',
    condition: (config) => isWebReactFramework(config.framework),
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: '@tanstack/react-form', version: '^0.22.0', dev: false },
    ],
  };
  ADAPTER_REGISTRY.set('tanstack-form', adapter);
}

function registerConformAdapter(): void {
  const adapter: Adapter = {
    id: 'conform',
    name: 'Conform',
    condition: (config) => isWebReactFramework(config.framework),
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: '@conform-to/react', version: '^1.1.0', dev: false },
      { name: '@conform-to/zod', version: '^1.1.0', dev: false },
    ],
  };
  ADAPTER_REGISTRY.set('conform', adapter);
}

function registerStackmintConfigAdapter(): void {
  const adapter: Adapter = {
    id: 'stackmint-config',
    name: 'stackmint Config Library',
    files: (config: StackConfig): AdapterFile[] => {
      const framework = config.framework || 'unknown';

      const path =
        framework === 'nuxt'
          ? 'lib/stackmint-config.ts'
          : framework === 'react-router-v7' || framework === 'tanstack-start'
            ? 'app/lib/stackmint-config.ts'
          : framework === 'react-native' || framework === 'expo'
            ? 'stackmint-config.ts'
            : 'src/lib/stackmint-config.ts';

      const frozen = {
        projectName: config.projectName || 'my-app',
        framework: config.framework || 'unknown',
        category: config.category || 'fullstack',
        deployTarget: config.deployTarget || 'none',
        database: config.database || 'none',
        orm: config.orm || 'none',
        baas: config.baas || 'none',
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
        packageManager: config.packageManager || 'npm',
        runtime: config.runtime || 'node',
        monorepo: !!config.monorepo,
        aiConfig: config.aiConfig || [],
      };

      return [
        {
          path,
          content: `export interface StackMintConfig {
  projectName: string;
  framework: string;
  category: string;
  deployTarget: string;
  database: string;
  orm: string;
  baas: string;
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
  packageManager: string;
  runtime: string;
  monorepo: boolean;
  aiConfig: string[];
}

export interface Signal {
  label: string;
  value: string;
  detail: string;
}

export function getStackMintConfig(): StackMintConfig {
  return ${JSON.stringify(frozen, null, 2)} as StackMintConfig;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: 'Next.js 15',
  sveltekit: 'SvelteKit',
  nuxt: 'Nuxt 3',
  nitro: 'Nitro',
  hono: 'Hono',
  fastify: 'Fastify',
  express: 'Express',
  h3: 'H3',
  elysia: 'Elysia',
  'bun-native': 'Bun Native',
  'astro-ssr': 'Astro SSR',
  'astro-ssg': 'Astro',
  'react-vite': 'React + Vite',
  'vue-vite': 'Vue + Vite',
  'svelte-vite': 'Svelte + Vite',
  'solid-vite': 'Solid + Vite',
  'react-router-v7': 'React Router v7',
  'tanstack-start': 'TanStack Start',
  angular: 'Angular',
  analog: 'Analog',
  nestjs: 'NestJS',
  qwik: 'Qwik',
  expo: 'Expo',
  'react-native': 'React Native',
  docusaurus: 'Docusaurus',
  eleventy: 'Eleventy',
  gatsby: 'Gatsby',
  vitepress: 'VitePress',
};

export function getFrameworkLabel(id: string): string {
  return FRAMEWORK_LABELS[id] ?? id;
}

export function getSignals(config: StackMintConfig): Signal[] {
  const s: Signal[] = [];

  s.push({
    label: 'Framework',
    value: getFrameworkLabel(config.framework),
    detail: 'Scaffolded by stackmint',
  });

  if (config.database !== 'none') {
    s.push({ label: 'Database', value: config.database, detail: 'Primary persistence' });
  } else if (config.baas !== 'none') {
    s.push({ label: 'Backend', value: config.baas, detail: 'Backend-as-a-Service' });
  }

  if (config.orm !== 'none') s.push({ label: 'ORM', value: config.orm, detail: 'Database access' });
  if (config.auth !== 'none') s.push({ label: 'Auth', value: config.auth, detail: 'Identity & security' });
  if (config.apiLayer !== 'none') s.push({ label: 'API', value: config.apiLayer, detail: 'Data communication' });
  if (config.styling !== 'none') s.push({ label: 'Styling', value: config.styling, detail: 'Visual layer' });
  if (config.uiLibrary !== 'none') s.push({ label: 'UI', value: config.uiLibrary, detail: 'Component library' });
  if (config.ai !== 'none') s.push({ label: 'AI', value: config.ai, detail: 'Intelligence' });
  if (config.deployTarget !== 'none') s.push({ label: 'Deploy', value: config.deployTarget, detail: 'Cloud target' });

  return s;
}

export function getFrameworkDescription(config: StackMintConfig): string {
  const parts: string[] = [];
  if (config.database !== 'none') parts.push('database');
  if (config.auth !== 'none') parts.push('auth');
  if (config.apiLayer !== 'none') parts.push('API');
  if (config.baas !== 'none' && config.database === 'none') parts.push('BaaS');

  const base = getFrameworkLabel(config.framework);
  return parts.length > 0 ? \`\${base} with \${parts.join(', ')}.\` : \`\${base} — ready for production.\`;
}
`,
        },
      ];
    },
    dependencies: (): AdapterDependency[] => [],
    condition: () => true,
  };

  ADAPTER_REGISTRY.set('stackmint-config', adapter);
}

export function initAdditionalAdapters(): void {
  registerStackmintConfigAdapter();
  registerTailwindAdapter();
  registerShadcnAdapter();
  registerTanStackQueryAdapter();
  registerZustandAdapter();
  registerPiniaAdapter();
  registerResendAdapter();
  registerStripeAdapter();
  registerUpstashAdapter();
  registerVitestAdapter();
  registerPlaywrightAdapter();
  registerReactHookFormAdapter();
  registerTanStackFormAdapter();
  registerConformAdapter();
}

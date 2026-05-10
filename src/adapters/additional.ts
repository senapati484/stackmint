import { Adapter, AdapterFile, AdapterDependency } from './index.js';

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

export function registerTailwindAdapter(): void {
  const adapter: Adapter = {
    id: 'tailwind',
    name: 'Tailwind CSS',
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [];

      const framework = config.framework || '';
      if (framework.startsWith('next') || framework === 'sveltekit' || framework === 'nuxt') {
        files.push({
          path: 'src/app/globals.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
`,
        });
      } else {
        files.push({
          path: 'src/styles/globals.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'tailwindcss', version: '^4.0.0' },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('tailwind', adapter);
}

export function registerShadcnAdapter(): void {
  const adapter: Adapter = {
    id: 'shadcn',
    name: 'shadcn/ui',
    files: (): AdapterFile[] => [
      {
        path: 'components.json',
        content: JSON.stringify({
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'default',
          rsc: true,
          tsx: true,
          tailwind: {
            config: '',
            css: 'src/app/globals.css',
            baseColor: 'zinc',
            cssVariables: true,
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils',
          },
        }, null, 2),
      },
      {
        path: 'src/components/ui/.gitkeep',
        content: '',
      },
    ],
    dependencies: () => [],
    postInstall: ['npx shadcn@latest init --yes --defaults'],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('shadcn', adapter);
}

export function registerTanStackQueryAdapter(): void {
  const adapter: Adapter = {
    id: 'tanstack-query',
    name: 'TanStack Query',
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

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('tanstack-query', adapter);
}

export function registerZustandAdapter(): void {
  const adapter: Adapter = {
    id: 'zustand',
    name: 'Zustand',
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

  const { ADAPTER_REGISTRY } = require('./index.js');
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

  const { ADAPTER_REGISTRY } = require('./index.js');
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

  const { ADAPTER_REGISTRY } = require('./index.js');
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
  apiVersion: '2024-12-18.acacia',
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
  const signature = headers().get('Stripe-Signature') as string;

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
      { name: 'stripe', version: '^14.0.0' },
      { name: '@stripe/stripe-js', version: '^2.0.0' },
    ],
    envVars: () => [
      { key: 'STRIPE_SECRET_KEY', value: 'sk_test_...', comment: 'Your Stripe secret key' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: 'pk_test_...', comment: 'Your Stripe publishable key' },
      { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_...', comment: 'Your Stripe webhook secret' },
    ],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
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

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('upstash', adapter);
}

export function registerVitestAdapter(): void {
  const adapter: Adapter = {
    id: 'vitest',
    name: 'Vitest',
    files: (): AdapterFile[] => [
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
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  // Setup
});

afterEach(() => {
  cleanup();
});
`,
      },
    ],
    dependencies: () => [
      { name: 'vitest', version: '^1.6.0', dev: true },
      { name: '@vitest/coverage-v8', version: '^1.6.0', dev: true },
      { name: 'happy-dom', version: '^12.0.0', dev: true },
    ],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
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

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('playwright', adapter);
}

export function initAdditionalAdapters(): void {
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
}
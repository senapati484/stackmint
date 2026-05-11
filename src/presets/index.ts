import type { StackConfig } from '../cli/types.js';

export const PRESETS: Record<string, Partial<StackConfig>> = {
  'react-vite': {
    framework: 'react-vite',
    styling: 'tailwind',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'vue-vite': {
    framework: 'vue-vite',
    styling: 'tailwind',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'svelte-vite': {
    framework: 'svelte-vite',
    styling: 'tailwind',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'solid-vite': {
    framework: 'solid-vite',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'api-hono': {
    category: 'backend',
    framework: 'hono',
    orm: 'drizzle',
    database: 'postgres',
    validation: 'zod',
    testing: 'vitest',
    githubActions: true,
    runtime: 'node',
    aiConfig: ['claude-code'],
  },
  't3-stack': {
    framework: 'nextjs',
    apiLayer: 'trpc',
    orm: 'drizzle',
    database: 'postgres',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    validation: 'zod',
    auth: 'better-auth',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'saas-nextjs': {
    framework: 'nextjs',
    auth: 'better-auth',
    orm: 'drizzle',
    database: 'postgres',
    payments: 'stripe',
    email: 'resend',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    validation: 'zod',
    forms: 'react-hook-form',
    testing: 'vitest+playwright',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'saas-supabase': {
    framework: 'nextjs',
    baas: 'supabase',
    payments: 'stripe',
    email: 'resend',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    validation: 'zod',
    forms: 'react-hook-form',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'ai-app': {
    framework: 'nextjs',
    ai: 'vercel-ai-sdk',
    orm: 'drizzle',
    database: 'postgres',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    validation: 'zod',
    auth: 'better-auth',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'edge-worker': {
    category: 'backend',
    framework: 'hono',
    deployTarget: 'cloudflare-workers',
    database: 'turso',
    cache: 'upstash',
    validation: 'zod',
    runtime: 'node',
    testing: 'vitest',
    aiConfig: ['claude-code'],
  },
  'content-astro': {
    category: 'content',
    framework: 'astro-ssg',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    testing: 'vitest',
    githubActions: true,
    aiConfig: ['claude-code'],
  },
  'docs-vitepress': {
    category: 'content',
    framework: 'vitepress',
    styling: 'none',
    testing: 'none',
    aiConfig: ['claude-code'],
  },
  'realtime-convex': {
    framework: 'nextjs',
    baas: 'convex',
    styling: 'tailwind',
    uiLibrary: 'shadcn',
    dataFetching: 'tanstack-query',
    validation: 'zod',
    testing: 'vitest',
    aiConfig: ['claude-code'],
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export function listPresets(): void {
  console.log('\n  Available Presets:\n');
  console.log('  ' + 'Name'.padEnd(20) + 'Framework'.padEnd(25) + 'Key Add-ons');
  console.log('  ' + '─'.repeat(70));

  const presetDescriptions: Record<string, { framework: string; addons: string }> = {
    'react-vite': { framework: 'React + Vite', addons: 'Tailwind CSS + Vitest' },
    'vue-vite': { framework: 'Vue + Vite', addons: 'Tailwind CSS + Vitest' },
    'svelte-vite': { framework: 'Svelte + Vite', addons: 'Tailwind CSS + Vitest' },
    'solid-vite': { framework: 'Solid + Vite', addons: 'Tailwind CSS + shadcn/ui + Vitest' },
    'api-hono': { framework: 'Hono', addons: 'Drizzle + Zod + Tailwind' },
    't3-stack': { framework: 'Next.js 15', addons: 'tRPC + Drizzle + Tailwind + shadcn/ui + Zod + Better Auth' },
    'saas-nextjs': { framework: 'Next.js 15', addons: 'Better Auth + Drizzle + Stripe + Resend + RHF' },
    'saas-supabase': { framework: 'Next.js 15', addons: 'Supabase + Stripe + Resend + shadcn/ui' },
    'ai-app': { framework: 'Next.js 15', addons: 'Vercel AI SDK + Drizzle + Tailwind' },
    'edge-worker': { framework: 'Hono', addons: 'Turso + Upstash + Cloudflare Workers' },
    'content-astro': { framework: 'Astro SSG', addons: 'Tailwind CSS + shadcn/ui + Vitest' },
    'docs-vitepress': { framework: 'VitePress', addons: 'None — minimal docs setup' },
    'realtime-convex': { framework: 'Next.js 15', addons: 'Convex + shadcn/ui + TanStack Query' },
  };

  for (const name of PRESET_NAMES) {
    const desc = presetDescriptions[name];
    console.log(`  ${name.padEnd(20)}${desc.framework.padEnd(25)}${desc.addons}`);
  }
  console.log('');
}

export function getPreset(name: string): Partial<StackConfig> | null {
  return PRESETS[name] ?? null;
}
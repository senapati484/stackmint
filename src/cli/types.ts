export interface StackConfig {
  projectName: string;
  projectDir: string;
  packageManager: 'npm' | 'pnpm' | 'bun' | 'yarn';
  runtime: 'node' | 'bun' | 'deno';
  category: 'fullstack' | 'spa' | 'backend' | 'mobile' | 'content' | 'monorepo';
  framework: string;
  deployTarget: 'vercel' | 'cloudflare-workers' | 'flyio' | 'railway' | 'self-hosted' | 'none';
  baas: 'supabase' | 'convex' | 'firebase' | 'none';
  database: 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'turso' | 'neon' | 'none';
  orm: 'drizzle' | 'prisma' | 'typeorm' | 'mongoose' | 'none';
  auth: 'better-auth' | 'clerk' | 'next-auth' | 'lucia' | 'none';
  apiLayer: 'trpc' | 'orpc' | 'ts-rest' | 'graphql' | 'rest' | 'none';
  validation: 'zod' | 'valibot' | 'arktype' | 'none';
  styling: 'tailwind' | 'panda-css' | 'stylex' | 'css-modules' | 'styled-components' | 'none';
  uiLibrary: 'shadcn' | 'radix' | 'ark-ui' | 'headlessui' | 'none';
  forms: 'react-hook-form' | 'tanstack-form' | 'conform' | 'none';
  stateManagement: 'zustand' | 'jotai' | 'pinia' | 'nanostores' | 'none';
  dataFetching: 'tanstack-query' | 'swr' | 'none';
  ai: 'vercel-ai-sdk' | 'langchain' | 'mastra' | 'none';
  jobs: 'inngest' | 'bullmq' | 'trigger-dev' | 'none';
  cache: 'upstash' | 'redis' | 'none';
  email: 'resend' | 'nodemailer' | 'sendgrid' | 'none';
  payments: 'stripe' | 'none';
  testing: 'vitest' | 'jest' | 'playwright' | 'vitest+playwright' | 'none';
  docker: boolean;
  githubActions: boolean;
  husky: boolean;
  changesets: boolean;
  turborepo: boolean;
  aiConfig: ('claude-code' | 'cursor' | 'copilot' | 'windsurf' | 'opencode' | 'continue' | 'sourcegraph' | 'replit' | 'kotata' | 'llm-code' | 'devin')[];
  monorepo: boolean;
  monorepoApps?: string[];
  preset?: string;
}

export interface FRAMEWORK_INFO {
  label: string;
  category: 'fullstack' | 'spa' | 'backend' | 'mobile' | 'content';
  defaultRuntime?: 'node' | 'bun' | 'deno';
}

export const FRAMEWORKS: Record<string, FRAMEWORK_INFO> = {
  'nextjs': { label: 'Next.js 15 (App Router)', category: 'fullstack' },
  'sveltekit': { label: 'SvelteKit', category: 'fullstack' },
  'nuxt': { label: 'Nuxt 3', category: 'fullstack' },
  'react-router-v7': { label: 'React Router v7 (Remix)', category: 'fullstack' },
  'analog': { label: 'Analog (Angular)', category: 'fullstack' },
  'tanstack-start': { label: 'TanStack Start', category: 'fullstack' },
  'astro-ssr': { label: 'Astro (SSR mode)', category: 'fullstack' },
  'astro-ssg': { label: 'Astro (SSG mode)', category: 'content' },
  'react-vite': { label: 'React + Vite', category: 'spa' },
  'vue-vite': { label: 'Vue + Vite', category: 'spa' },
  'solid-vite': { label: 'Solid + Vite', category: 'spa' },
  'svelte-vite': { label: 'Svelte + Vite', category: 'spa' },
  'qwik': { label: 'Qwik', category: 'spa' },
  'angular': { label: 'Angular', category: 'spa' },
  'hono': { label: 'Hono', category: 'backend' },
  'elysia': { label: 'Elysia', category: 'backend', defaultRuntime: 'bun' },
  'fastify': { label: 'Fastify', category: 'backend' },
  'nestjs': { label: 'NestJS', category: 'backend' },
  'express': { label: 'Express', category: 'backend' },
  'nitro': { label: 'Nitro', category: 'backend' },
  'h3': { label: 'H3', category: 'backend' },
  'bun-native': { label: 'Bun Native', category: 'backend', defaultRuntime: 'bun' },
  'expo': { label: 'Expo SDK 53', category: 'mobile' },
  'react-native': { label: 'React Native CLI', category: 'mobile' },
  'vitepress': { label: 'VitePress', category: 'content' },
  'docusaurus': { label: 'Docusaurus', category: 'content' },
  'eleventy': { label: 'Eleventy', category: 'content' },
  'gatsby': { label: 'Gatsby', category: 'content' },
};

export const CATEGORIES = [
  { value: 'fullstack', label: 'Full-Stack App', hint: 'Next.js / SvelteKit / Nuxt / Remix' },
  { value: 'spa', label: 'SPA / Frontend', hint: 'React / Vue / Solid / Svelte' },
  { value: 'backend', label: 'Backend / API', hint: 'Hono / Elysia / Fastify / NestJS / Nitro' },
  { value: 'mobile', label: 'Mobile', hint: 'Expo / React Native' },
  { value: 'content', label: 'Content / Docs', hint: 'Astro / VitePress / Docusaurus' },
  { value: 'monorepo', label: 'Monorepo', hint: 'Turborepo / nx' },
] as const;

export const DEFAULT_CONFIG: Partial<StackConfig> = {
  packageManager: 'npm',
  runtime: 'node',
  deployTarget: 'none',
  baas: 'none',
  database: 'none',
  orm: 'none',
  auth: 'none',
  apiLayer: 'none',
  validation: 'none',
  styling: 'none',
  uiLibrary: 'none',
  forms: 'none',
  stateManagement: 'none',
  dataFetching: 'none',
  ai: 'none',
  jobs: 'none',
  cache: 'none',
  email: 'none',
  payments: 'none',
  testing: 'none',
  docker: false,
  githubActions: false,
  husky: false,
  changesets: false,
  turborepo: false,
  aiConfig: [],
  monorepo: false,
};
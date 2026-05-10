import { StackConfig } from '../cli/types.js';
import { log } from '../utils/logger.js';

interface ConflictRule {
  id: string;
  check: (config: Partial<StackConfig>) => boolean;
  resolve: (config: Partial<StackConfig>) => Partial<StackConfig>;
  message: string;
  severity: 'error' | 'warn' | 'info';
}

export const CONFLICT_RULES: ConflictRule[] = [
  // C01: Convex + any ORM → remove orm, database
  {
    id: 'C01',
    check: (c) => c.baas === 'convex' && c.orm !== 'none',
    resolve: (c) => ({ ...c, orm: 'none', database: 'none' }),
    message: 'Convex manages your data — ORM removed.',
    severity: 'info',
  },
  // C02: Convex + Better Auth / Clerk / NextAuth → remove auth
  {
    id: 'C02',
    check: (c) => c.baas === 'convex' && ['better-auth', 'clerk', 'next-auth'].includes(c.auth || ''),
    resolve: (c) => ({ ...c, auth: 'none' }),
    message: 'Convex has built-in auth.',
    severity: 'info',
  },
  // C03: Convex + tRPC / oRPC → remove apiLayer
  {
    id: 'C03',
    check: (c) => c.baas === 'convex' && ['trpc', 'orpc'].includes(c.apiLayer || ''),
    resolve: (c) => ({ ...c, apiLayer: 'none' }),
    message: 'Convex replaces your API layer.',
    severity: 'info',
  },
  // C04: Supabase + Better Auth / Clerk / NextAuth → warn only
  {
    id: 'C04',
    check: (c) => c.baas === 'supabase' && ['better-auth', 'clerk', 'next-auth'].includes(c.auth || ''),
    resolve: (c) => c,
    message: 'Supabase includes Auth — consider using it instead of a separate auth library.',
    severity: 'warn',
  },
  // C05: Supabase + Drizzle/Prisma → info only
  {
    id: 'C05',
    check: (c) => c.baas === 'supabase' && ['drizzle', 'prisma'].includes(c.orm || ''),
    resolve: (c) => c,
    message: 'Supabase uses PostgreSQL under the hood — Drizzle is compatible but Supabase provides its own query builder.',
    severity: 'info',
  },
  // C06: Firebase selected → remove orm, database
  {
    id: 'C06',
    check: (c) => c.baas === 'firebase',
    resolve: (c) => ({ ...c, orm: 'none', database: 'none' }),
    message: 'Firebase uses Firestore (NoSQL) — ORM and SQL DB options removed.',
    severity: 'info',
  },
  // C07: tRPC + oRPC both selected → keep oRPC
  {
    id: 'C07',
    check: (c) => c.apiLayer === 'orpc',
    resolve: (c) => c,
    message: 'tRPC and oRPC are mutually exclusive. Keeping oRPC (broader framework support).',
    severity: 'warn',
  },
  // C08: tRPC on Vue/Nuxt/Solid/Svelte framework → warn + suggest oRPC
  {
    id: 'C08',
    check: (c) => c.apiLayer === 'trpc' && ['vue-vite', 'nuxt', 'solid-vite', 'svelte-vite', 'sveltekit'].some(f => c.framework?.includes(f)),
    resolve: (c) => c,
    message: 'tRPC is React-focused. oRPC supports Vue/Solid/Svelte natively.',
    severity: 'warn',
  },
  // C09: any apiLayer on static framework → remove
  {
    id: 'C09',
    check: (c) => ['astro-ssg', 'eleventy', 'vitepress', 'docusaurus'].includes(c.framework || '') && c.apiLayer !== 'none',
    resolve: (c) => ({ ...c, apiLayer: 'none' }),
    message: 'API layers require a server runtime. Removed for static framework.',
    severity: 'info',
  },
  // C10: multiple auth libraries → keep first, warn
  {
    id: 'C10',
    check: (c) => ['better-auth', 'clerk', 'next-auth', 'lucia'].filter(a => c.auth === a).length > 0,
    resolve: (c) => c,
    message: 'Only one auth library allowed.',
    severity: 'warn',
  },
  // C11: Lucia → swap to better-auth
  {
    id: 'C11',
    check: (c) => c.auth === 'lucia',
    resolve: (c) => ({ ...c, auth: 'better-auth' }),
    message: 'Lucia deprecated itself in 2025. Using Better Auth instead.',
    severity: 'warn',
  },
  // C12: shadcn/ui without Tailwind → remove shadcn
  {
    id: 'C12',
    check: (c) => c.uiLibrary === 'shadcn' && c.styling !== 'tailwind',
    resolve: (c) => ({ ...c, uiLibrary: 'radix' }),
    message: 'shadcn/ui requires Tailwind CSS.',
    severity: 'warn',
  },
  // C13: Ark UI without Panda CSS → warn
  {
    id: 'C13',
    check: (c) => c.uiLibrary === 'ark-ui' && c.styling !== 'panda-css',
    resolve: (c) => c,
    message: 'Ark UI is designed for Panda CSS. Works standalone but loses theming benefits.',
    severity: 'warn',
  },
  // C14: StyleX on non-React framework → remove
  {
    id: 'C14',
    check: (c) => c.styling === 'stylex' && !['nextjs', 'react-router-v7', 'react-vite', 'analog', 'tanstack-start'].some(f => c.framework?.includes(f)),
    resolve: (c) => ({ ...c, styling: 'none' }),
    message: 'StyleX is React-only.',
    severity: 'warn',
  },
  // C15: Elysia + runtime !== 'bun' → force runtime = 'bun'
  {
    id: 'C15',
    check: (c) => c.framework === 'elysia' && c.runtime !== 'bun',
    resolve: (c) => ({ ...c, runtime: 'bun' }),
    message: 'Elysia requires Bun runtime. Runtime updated.',
    severity: 'info',
  },
  // C16: Bun Native + runtime !== 'bun' → force runtime = 'bun'
  {
    id: 'C16',
    check: (c) => c.framework === 'bun-native' && c.runtime !== 'bun',
    resolve: (c) => ({ ...c, runtime: 'bun' }),
    message: 'Bun Native server requires Bun runtime.',
    severity: 'info',
  },
  // C17: Gatsby selected → warn only
  {
    id: 'C17',
    check: (c) => c.framework === 'gatsby',
    resolve: (c) => c,
    message: 'Gatsby is in maintenance mode (2025). Consider Astro for content/static sites.',
    severity: 'warn',
  },
  // C18: Next.js Pages Router referenced → info
  {
    id: 'C18',
    check: (c) => c.framework === 'nextjs' && c.deployTarget !== 'cloudflare-workers',
    resolve: (c) => c,
    message: 'App Router is recommended for all new Next.js projects.',
    severity: 'info',
  },
  // C19: Neon + Cloudflare Workers → info
  {
    id: 'C19',
    check: (c) => c.database === 'neon' && c.deployTarget === 'cloudflare-workers',
    resolve: (c) => c,
    message: 'Neon requires its HTTP driver (@neondatabase/serverless) for Cloudflare Workers — adapter updated automatically.',
    severity: 'info',
  },
  // C20: BullMQ + serverless deploy → warn
  {
    id: 'C20',
    check: (c) => c.jobs === 'bullmq' && ['vercel', 'cloudflare-workers'].includes(c.deployTarget || ''),
    resolve: (c) => c,
    message: 'BullMQ requires a persistent Redis connection — incompatible with serverless deploy targets. Consider Inngest.',
    severity: 'warn',
  },
  // C21: React Hook Form + non-React framework → remove
  {
    id: 'C21',
    check: (c) => c.forms === 'react-hook-form' && !['nextjs', 'react-router-v7', 'react-vite', 'analog', 'tanstack-start'].some(f => c.framework?.includes(f)),
    resolve: (c) => ({ ...c, forms: 'tanstack-form' }),
    message: 'React Hook Form is React-only. Using TanStack Form for this framework.',
    severity: 'warn',
  },
];

export function resolveConflicts(config: Partial<StackConfig>): {
  resolved: Partial<StackConfig>;
  messages: { id: string; message: string; severity: string }[];
} {
  const messages: { id: string; message: string; severity: string }[] = [];
  let resolved = { ...config };

  for (const rule of CONFLICT_RULES) {
    if (rule.check(resolved)) {
      resolved = rule.resolve(resolved);
      messages.push({ id: rule.id, message: rule.message, severity: rule.severity });

      if (rule.severity === 'error') {
        log.error(`[${rule.id}] ${rule.message}`);
      } else if (rule.severity === 'warn') {
        log.warn(`[${rule.id}] ${rule.message}`);
      } else {
        log.info(`[${rule.id}] ${rule.message}`);
      }
    }
  }

  return { resolved, messages };
}
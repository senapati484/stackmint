import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStackmintLogoFile } from './shared/logo.js';

// ─── layout.tsx ─────────────────────────────────────────────────────────────
// Dynamically wraps {children} with the right provider tree based on config.
// Provider *component files* (TRPCProvider, QueryProvider, ConvexClientProvider)
// come from their respective adapters — we only wire in the imports/wrapping here.

function buildLayoutContent(config: StackConfig): string {
  const appName = config.projectName || 'my-app';

  const extraImports: string[] = [];
  const providerOpens: string[] = [];
  const providerCloses: string[] = [];

  if (config.auth === 'clerk') {
    extraImports.push(`import { ClerkProvider } from '@clerk/nextjs';`);
    providerOpens.push(`        <ClerkProvider>`);
    providerCloses.unshift(`        </ClerkProvider>`);
  }

  if (config.baas === 'convex') {
    extraImports.push(`import { ConvexClientProvider } from '@/lib/convex';`);
    providerOpens.push(`          <ConvexClientProvider>`);
    providerCloses.unshift(`          </ConvexClientProvider>`);
  }

  if (config.apiLayer === 'trpc') {
    extraImports.push(`import { TRPCProvider } from '@/components/providers/trpc-provider';`);
    providerOpens.push(`            <TRPCProvider>`);
    providerCloses.unshift(`            </TRPCProvider>`);
  } else if (config.dataFetching === 'tanstack-query') {
    extraImports.push(`import { QueryProvider } from '@/components/providers/query-provider';`);
    providerOpens.push(`            <QueryProvider>`);
    providerCloses.unshift(`            </QueryProvider>`);
  }

  const childrenBlock =
    providerOpens.length > 0
      ? [
          ...providerOpens,
          `              {children}`,
          ...providerCloses,
        ].join('\n')
      : `          {children}`;

  return `import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
${extraImports.join('\n')}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${appName}',
  description: 'Built with stackmint.',
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
      <body className={inter.className}>
${childrenBlock}
      </body>
    </html>
  );
}
`;
}

// ─── middleware.ts ───────────────────────────────────────────────────────────
// Returns null when no middleware is needed (Clerk writes its own via its adapter).

function buildMiddlewareContent(config: StackConfig): string | null {
  // Clerk adapter writes its own middleware — skip
  if (config.auth === 'clerk') return null;

  if (config.auth === 'next-auth') {
    return `export { auth as middleware } from '@/../../auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
`;
  }

  if (config.auth === 'better-auth') {
    return `import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next');

  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\\\.ico).*)'],
};
`;
  }

  if (config.baas === 'supabase') {
    return `import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\\\.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
`;
  }

  return null;
}

// ─── next.config.ts ─────────────────────────────────────────────────────────

function buildNextConfig(config: StackConfig, standalone = false): string {
  const lines: string[] = [`import type { NextConfig } from 'next';`, ``];

  if (standalone) {
    lines.push(
      `const nextConfig: NextConfig = {`,
      `  outputFileTracingRoot: process.cwd(),`,
      `  // Required for Docker standalone builds`,
      `  output: 'standalone',`,
      `};`,
    );
  } else if (config.deployTarget === 'cloudflare-workers') {
    lines.push(
      `// Cloudflare deployment — install @cloudflare/next-on-pages`,
      `// then run: npx @cloudflare/next-on-pages`,
      `const nextConfig: NextConfig = {`,
      `  outputFileTracingRoot: process.cwd(),`,
      `};`,
    );
  } else {
    lines.push(
      `const nextConfig: NextConfig = {`,
      `  outputFileTracingRoot: process.cwd(),`,
      `};`,
    );
  }

  lines.push(``, `export default nextConfig;`);
  return lines.join('\n');
}

// ─── stackmint-config.ts ─────────────────────────────────────────────────────
// Baked into the generated project so the landing page reflects the full stack.

function buildStackmintConfigLib(config: StackConfig): string {
  const frozen = {
    projectName: config.projectName || 'my-app',
    framework: config.framework || 'nextjs',
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
    husky: !!config.husky,
    changesets: !!config.changesets,
    turborepo: !!config.turborepo,
    packageManager: config.packageManager || 'npm',
    runtime: config.runtime || 'node',
  };

  return `// Auto-generated by stackmint — do not edit manually.

export interface StackMintConfig {
  projectName: string; framework: string; category: string; deployTarget: string;
  database: string; orm: string; baas: string; auth: string; apiLayer: string;
  validation: string; styling: string; uiLibrary: string; forms: string;
  stateManagement: string; dataFetching: string; ai: string; jobs: string;
  cache: string; email: string; payments: string; testing: string;
  docker: boolean; githubActions: boolean; husky: boolean; changesets: boolean;
  turborepo: boolean; packageManager: string; runtime: string;
}

export function getStackMintConfig(): StackMintConfig {
  return ${JSON.stringify(frozen, null, 2)};
}

// ── label helpers ─────────────────────────────────────────────────────────────

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: 'Next.js 15', sveltekit: 'SvelteKit', nuxt: 'Nuxt 3',
  'react-router-v7': 'React Router v7', 'analog': 'Analog',
  'tanstack-start': 'TanStack Start', 'astro-ssr': 'Astro SSR',
  'astro-ssg': 'Astro SSG', 'react-vite': 'React + Vite',
  'vue-vite': 'Vue + Vite', 'solid-vite': 'Solid + Vite',
  'svelte-vite': 'Svelte + Vite', qwik: 'Qwik', angular: 'Angular',
  hono: 'Hono', elysia: 'Elysia', fastify: 'Fastify',
  nestjs: 'NestJS', express: 'Express', nitro: 'Nitro', h3: 'H3',
  'bun-native': 'Bun Native',
};

export function getFrameworkLabel(id: string): string {
  return FRAMEWORK_LABELS[id] ?? id;
}

// ── signal cards ──────────────────────────────────────────────────────────────
// One card per active integration. The signal grid CSS uses auto-fill so any
// number of cards looks good (see globals.css override).

export interface Signal { label: string; value: string; detail: string; }

type LabelMap = Record<string, [string, string]>;

function pick(map: LabelMap, key: string, fallback: string): [string, string] {
  return map[key] ?? [key, fallback];
}

export function getSignals(config: StackMintConfig): Signal[] {
  const s: Signal[] = [];

  // ── Always show framework ──────────────────────────────────────────────────
  s.push({ label: 'Framework', value: getFrameworkLabel(config.framework), detail: 'App Router · Next.js 15' });

  // ── Database / BaaS ────────────────────────────────────────────────────────
  if (config.database !== 'none') {
    const m: LabelMap = { postgres: ['PostgreSQL', 'Relational DB'], mysql: ['MySQL', 'Relational DB'],
      sqlite: ['SQLite', 'File-based'], mongodb: ['MongoDB', 'Document store'],
      turso: ['Turso', 'Distributed SQLite'], neon: ['Neon', 'Serverless Postgres'] };
    const [v, d] = pick(m, config.database, 'Database');
    s.push({ label: 'Database', value: v, detail: d });
  } else if (config.baas !== 'none') {
    const m: LabelMap = { supabase: ['Supabase', 'Open-source BaaS'],
      convex: ['Convex', 'Real-time backend'], firebase: ['Firebase', 'Google BaaS'] };
    const [v, d] = pick(m, config.baas, 'BaaS');
    s.push({ label: 'Backend', value: v, detail: d });
  }

  // ── ORM ────────────────────────────────────────────────────────────────────
  if (config.orm !== 'none') {
    const m: LabelMap = { drizzle: ['Drizzle ORM', 'Type-safe SQL'], prisma: ['Prisma', 'Schema-first ORM'],
      typeorm: ['TypeORM', 'Decorator ORM'], mongoose: ['Mongoose', 'MongoDB ODM'] };
    const [v, d] = pick(m, config.orm, 'ORM');
    s.push({ label: 'ORM', value: v, detail: d });
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  if (config.auth !== 'none') {
    const m: LabelMap = { 'better-auth': ['Better Auth', 'Modern auth lib'],
      clerk: ['Clerk', 'Auth platform'], 'next-auth': ['NextAuth.js v5', 'OAuth + sessions'],
      lucia: ['Lucia', 'Lightweight auth'] };
    const [v, d] = pick(m, config.auth, 'Auth');
    s.push({ label: 'Auth', value: v, detail: d });
  }

  // ── API layer ──────────────────────────────────────────────────────────────
  if (config.apiLayer !== 'none') {
    const m: LabelMap = { trpc: ['tRPC v11', 'End-to-end type safety'],
      orpc: ['oRPC', 'OpenAPI-first RPC'], 'ts-rest:fetch': ['ts-rest', 'Type-safe REST'], 'ts-rest:axios': ['ts-rest', 'Type-safe REST'],
      graphql: ['GraphQL', 'Query language'], rest: ['REST', 'Standard HTTP API'] };
    const [v, d] = pick(m, config.apiLayer, 'API');
    s.push({ label: 'API', value: v, detail: d });
  }

  // ── Styling ────────────────────────────────────────────────────────────────
  if (config.styling !== 'none') {
    const m: LabelMap = { tailwind: ['Tailwind v4', 'Utility-first CSS'],
      'panda-css': ['Panda CSS', 'Atomic CSS-in-JS'], stylex: ['StyleX', 'Meta CSS-in-JS'],
      'css-modules': ['CSS Modules', 'Scoped styles'], 'styled-components': ['Styled Comp.', 'CSS-in-JS'] };
    const [v, d] = pick(m, config.styling, 'Styling');
    s.push({ label: 'Styling', value: v, detail: d });
  }

  // ── UI library ─────────────────────────────────────────────────────────────
  if (config.uiLibrary !== 'none') {
    const m: LabelMap = { shadcn: ['shadcn/ui', 'Copy-paste components'],
      radix: ['Radix UI', 'Primitives'], 'ark-ui': ['Ark UI', 'Accessible'],
      headlessui: ['Headless UI', 'Unstyled'] };
    const [v, d] = pick(m, config.uiLibrary, 'UI');
    s.push({ label: 'UI', value: v, detail: d });
  }

  // ── AI ─────────────────────────────────────────────────────────────────────
  if (config.ai !== 'none') {
    const m: LabelMap = { 'vercel-ai-sdk': ['Vercel AI SDK', 'Streaming AI'],
      langchain: ['LangChain.js', 'LLM orchestration'], mastra: ['Mastra', 'AI agents'] };
    const [v, d] = pick(m, config.ai, 'AI');
    s.push({ label: 'AI', value: v, detail: d });
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  if (config.payments !== 'none') {
    s.push({ label: 'Payments', value: 'Stripe', detail: 'Checkout + webhooks' });
  }

  // ── Email ──────────────────────────────────────────────────────────────────
  if (config.email !== 'none') {
    const m: LabelMap = { resend: ['Resend', 'Developer email API'],
      nodemailer: ['Nodemailer', 'SMTP'], sendgrid: ['SendGrid', 'Email platform'] };
    const [v, d] = pick(m, config.email, 'Email');
    s.push({ label: 'Email', value: v, detail: d });
  }

  // ── Jobs ───────────────────────────────────────────────────────────────────
  if (config.jobs !== 'none') {
    const m: LabelMap = { inngest: ['Inngest', 'Event-driven jobs'],
      bullmq: ['BullMQ', 'Redis queues'], 'trigger-dev': ['Trigger.dev', 'Background jobs'] };
    const [v, d] = pick(m, config.jobs, 'Jobs');
    s.push({ label: 'Jobs', value: v, detail: d });
  }

  // ── Cache ──────────────────────────────────────────────────────────────────
  if (config.cache !== 'none') {
    const m: LabelMap = { upstash: ['Upstash Redis', 'Serverless Redis'], redis: ['Redis', 'In-memory'] };
    const [v, d] = pick(m, config.cache, 'Cache');
    s.push({ label: 'Cache', value: v, detail: d });
  }

  // ── Forms ──────────────────────────────────────────────────────────────────
  if (config.forms !== 'none') {
    const m: LabelMap = { 'react-hook-form': ['React Hook Form', 'Performant forms'],
      'tanstack-form': ['TanStack Form', 'Type-safe forms'], conform: ['Conform', 'Progressive forms'] };
    const [v, d] = pick(m, config.forms, 'Forms');
    s.push({ label: 'Forms', value: v, detail: d });
  }

  // ── State ──────────────────────────────────────────────────────────────────
  if (config.stateManagement !== 'none') {
    const m: LabelMap = { zustand: ['Zustand', 'Global state'], jotai: ['Jotai', 'Atomic state'],
      nanostores: ['Nanostores', 'Tiny stores'] };
    const [v, d] = pick(m, config.stateManagement, 'State');
    s.push({ label: 'State', value: v, detail: d });
  }

  // ── Testing ────────────────────────────────────────────────────────────────
  if (config.testing !== 'none') {
    const m: LabelMap = { vitest: ['Vitest', 'Unit testing'], jest: ['Jest', 'Unit testing'],
      playwright: ['Playwright', 'E2E testing'], 'vitest+playwright': ['Vitest + PW', 'Unit + E2E'] };
    const [v, d] = pick(m, config.testing, 'Testing');
    s.push({ label: 'Testing', value: v, detail: d });
  }

  // ── Deploy ─────────────────────────────────────────────────────────────────
  if (config.deployTarget !== 'none') {
    const m: LabelMap = { vercel: ['Vercel', 'Serverless platform'],
      'cloudflare-workers': ['Cloudflare', 'Edge platform'],
      flyio: ['Fly.io', 'App deployment'], railway: ['Railway', 'Cloud infra'],
      'self-hosted': ['Self-hosted', 'Your server'] };
    const [v, d] = pick(m, config.deployTarget, 'Deploy');
    s.push({ label: 'Deploy', value: v, detail: d });
  }

  return s;
}

export function getFrameworkDescription(config: StackMintConfig): string {
  const parts: string[] = [];
  if (config.database !== 'none' || config.baas !== 'none') parts.push('data layer');
  if (config.auth !== 'none') parts.push('auth');
  if (config.apiLayer !== 'none') parts.push('typed API');
  if (config.ai !== 'none') parts.push('AI');
  if (config.payments !== 'none') parts.push('payments');
  return parts.length > 0
    ? \`Next.js 15 with \${parts.join(', ')}.\`
    : 'Next.js 15 — App Router, TypeScript, ready to build.';
}
\`;
}

// ─── src/types/index.ts ─────────────────────────────────────────────────────

const TYPES_FILE = \`// Shared TypeScript types — extend as your project grows.

export type ID = string;

export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
}

export interface User {
  id: ID;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
\`;

// ─── src/app/page.tsx ────────────────────────────────────────────────────────

const PAGE_CONTENT = \`'use client';

import { useState } from 'react';
import {
  getStackMintConfig,
  getSignals,
  getFrameworkLabel,
  getFrameworkDescription,
} from '@/lib/stackmint-config';

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
          <span className="eyebrow">
            <span className="pulse" /> Prebuilt frontend template
          </span>
          <h1 id="hero-title">
            Shape your <span className="accent">{frameworkLabel}</span> launch surface.
          </h1>
          <p className="hero-lede">
            A polished stackmint canvas with real brand artwork, responsive panels,
            and a consistent layout ready to mirror across every frontend framework.
          </p>

          <div className="actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => setLaunches((v) => v + 1)}
            >
              Launch pulse {launches}
            </button>
            <a className="button button-secondary" href="/api/health">
              Check API health
            </a>
          </div>

          <div className="signal-grid" aria-label="Stack highlights">
            {signals.map((s) => (
              <article className="signal-card" key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
                <p>{s.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hero-visual" aria-label="stackmint preview">
          <div className="logo-stage">
            <img className="logo-image" src="/logo.png" alt="stackmint" />
          </div>
          <aside className="framework-card">
            <span>Your stack</span>
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
        Built with stackmint ·{' '}
        <a href="https://stackmint-docs.vercel.app" target="_blank" rel="noreferrer">
          docs
        </a>
      </footer>
    </div>
  );
}
\`;

// ─── globals.css — add responsive signal-grid override ───────────────────────

function buildGlobalsCss(): string {
  return \`\${getFrontendGlobalStyles()}
\${getFrontendAppStyles()}
/* Signal grid: auto-fill so the cards reflow gracefully for any number of integrations */
.signal-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
\`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

TEMPLATE_REGISTRY.set('nextjs', {
  id: 'nextjs',

  // ── Files ──────────────────────────────────────────────────────────────────
  files: (config: StackConfig): AdapterFile[] => {
    const appName = config.projectName || 'my-app';
    const useDocker = !!config.docker;

    const files: AdapterFile[] = [

      // ── Project manifest ─────────────────────────────────────────────────
      {
        path: 'stackmint.config.json',
        content: JSON.stringify({
          projectName: config.projectName, framework: config.framework,
          category: config.category, deployTarget: config.deployTarget,
          database: config.database, orm: config.orm, baas: config.baas,
          auth: config.auth, apiLayer: config.apiLayer,
          validation: config.validation, styling: config.styling,
          uiLibrary: config.uiLibrary, forms: config.forms,
          stateManagement: config.stateManagement, dataFetching: config.dataFetching,
          ai: config.ai, jobs: config.jobs, cache: config.cache,
          email: config.email, payments: config.payments, testing: config.testing,
          docker: config.docker, githubActions: config.githubActions,
          husky: config.husky, changesets: config.changesets,
          turborepo: config.turborepo, packageManager: config.packageManager,
          runtime: config.runtime,
        }, null, 2),
      },

      // ── App directory ────────────────────────────────────────────────────
      { path: 'src/app/layout.tsx', content: buildLayoutContent(config) },
      { path: 'src/app/page.tsx', content: PAGE_CONTENT },
      { path: 'src/app/globals.css', content: buildGlobalsCss() },
      {
        path: 'src/app/api/health/route.ts',
        content: \`import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'nextjs',
    app: '\${appName}',
    timestamp: new Date().toISOString(),
  });
}
\`,
      },

      // ── Lib ──────────────────────────────────────────────────────────────
      { path: 'src/lib/stackmint-config.ts', content: buildStackmintConfigLib(config) },
      {
        path: 'src/lib/utils.ts',
        content: \`import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely. Works great with shadcn/ui. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
\`,
      },

      // ── Types ────────────────────────────────────────────────────────────
      { path: 'src/types/index.ts', content: TYPES_FILE },

      // ── Public / assets ──────────────────────────────────────────────────
      getStackmintLogoFile(),
      { path: 'public/.gitkeep', content: '' },

      // ── Directory placeholders ───────────────────────────────────────────
      { path: 'src/components/.gitkeep', content: '' },
      { path: 'src/server/.gitkeep', content: '' },

      // ── Next.js config ───────────────────────────────────────────────────
      { path: 'next.config.ts', content: buildNextConfig(config, useDocker) },

      // ── TypeScript ───────────────────────────────────────────────────────
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

      // ── PostCSS (Tailwind v4) ─────────────────────────────────────────────
      {
        path: 'postcss.config.mjs',
        content: \`export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
\`,
      },
    ];

    // ── Middleware ───────────────────────────────────────────────────────────
    const middlewareContent = buildMiddlewareContent(config);
    if (middlewareContent) {
      files.push({ path: 'src/middleware.ts', content: middlewareContent });
    }

    // ── NextAuth v5 ──────────────────────────────────────────────────────────
    // NextAuth v5 uses a root auth.ts that exports handlers used in the API route.
    if (config.auth === 'next-auth') {
      files.push(
        {
          path: 'auth.ts',
          content: \`import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
// Add more providers: https://authjs.dev/getting-started/providers

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
\`,
        },
        {
          path: 'src/app/api/auth/[...nextauth]/route.ts',
          content: \`import { handlers } from '@/../../auth';

export const { GET, POST } = handlers;
\`,
        },
      );
    }

    // ── Vitest (Next.js-specific config) ─────────────────────────────────────
    // We overwrite the generic vitest.config.ts that the vitest adapter produces
    // with a React + jsdom version that also understands the @/* path alias.
    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'vitest.config.ts',
          overwrite: true,
          content: \`import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
\`,
        },
        {
          path: 'tests/setup.ts',
          overwrite: true,
          content: \`import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
\`,
        },
        {
          path: 'tests/home.test.tsx',
          content: \`import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the launch pulse button', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('button', { name: /launch pulse/i }),
    ).toBeInTheDocument();
  });
});
\`,
        },
      );
    }

    // ── Playwright (Next.js-specific config) ─────────────────────────────────
    if (config.testing === 'playwright' || config.testing === 'vitest+playwright') {
      files.push(
        {
          path: 'playwright.config.ts',
          overwrite: true,
          content: \`import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
\`,
        },
        {
          path: 'tests/e2e/home.spec.ts',
          content: \`import { test, expect } from '@playwright/test';

test('homepage has launch button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /launch pulse/i })).toBeVisible();
});

test('health route returns ok', async ({ page }) => {
  const response = await page.goto('/api/health');
  expect(response?.status()).toBe(200);
  const json: unknown = await response?.json();
  expect((json as { status: string }).status).toBe('ok');
});
\`,
        },
      );
    }

    // ── Docker — Next.js standalone multi-stage build ─────────────────────────
    // Overrides the generic Dockerfile from the docker adapter with one that
    // leverages Next.js standalone output for minimal image size.
    if (useDocker) {
      files.push(
        {
          path: 'Dockerfile',
          overwrite: true,
          content: \`# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
\`,
        },
        {
          path: '.dockerignore',
          content: \`node_modules\\n.next\\n.env\\n.env.local\\n.env.*\\ndist\\ncoverage\\n.git\\n*.log\\n\`,
        },
      );
    }

    // ── GitHub Actions — Next.js build + type-check workflow ─────────────────
    if (config.githubActions) {
      const pm = config.packageManager ?? 'npm';
      const installCmd =
        pm === 'pnpm' ? 'pnpm install --frozen-lockfile'
        : pm === 'bun' ? 'bun install --frozen-lockfile'
        : 'npm ci';
      const buildCmd = pm === 'pnpm' ? 'pnpm build' : pm === 'bun' ? 'bun run build' : 'npm run build';
      const testCmd = pm === 'pnpm' ? 'pnpm test' : pm === 'bun' ? 'bun test' : 'npm test';

      files.push({
        path: '.github/workflows/nextjs.yml',
        content: \`name: Next.js CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: '\${pm === 'bun' ? 'npm' : pm}'

      - name: Install dependencies
        run: \${installCmd}

      - name: Type-check
        run: npx tsc --noEmit

      - name: Build
        run: \${buildCmd}
        env:
          NEXT_TELEMETRY_DISABLED: 1
\${
  config.testing === 'vitest' || config.testing === 'vitest+playwright'
    ? \`\\n      - name: Unit tests\\n        run: \${testCmd}\`
    : ''
}
\`,
      });
    }

    return files;
  },

  // ── Scripts ────────────────────────────────────────────────────────────────
  // Adapter scripts (db:generate, db:push, etc.) are merged on top of these.
  scripts: (config: StackConfig): Record<string, string> => {
    const scripts: Record<string, string> = {
      dev: 'next dev --turbopack',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      'type-check': 'tsc --noEmit',
    };

    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      scripts.test = 'vitest run';
      scripts['test:watch'] = 'vitest';
      scripts['test:coverage'] = 'vitest run --coverage';
    }

    if (config.testing === 'playwright' || config.testing === 'vitest+playwright') {
      scripts['test:e2e'] = 'playwright test';
      scripts['test:e2e:ui'] = 'playwright test --ui';
    }

    return scripts;
  },

  // ── Template-level dependencies ─────────────────────────────────────────────
  // Core Next.js deps (next, react, react-dom, typescript, @types/*)
  // come from the 'nextjs-framework' condition-adapter (frameworks.ts),
  // which the generator auto-activates. We only declare what the
  // template *files themselves* reference and what no adapter covers.
  dependencies: (config: StackConfig): AdapterDependency[] => {
    const deps: AdapterDependency[] = [
      // utils.ts uses clsx + tailwind-merge regardless of uiLibrary
      { name: 'clsx', version: '^2.1.1' },
      { name: 'tailwind-merge', version: '^2.5.4' },
    ];

    // NextAuth v5 — auth adapter only covers better-auth and Clerk
    if (config.auth === 'next-auth') {
      deps.push({ name: 'next-auth', version: '^5.0.0-beta.25' });
    }

    // Vitest needs React testing utilities + tsconfig-paths resolution
    if (config.testing === 'vitest' || config.testing === 'vitest+playwright') {
      deps.push(
        { name: '@testing-library/react', version: '^16.0.0', dev: true },
        { name: '@testing-library/jest-dom', version: '^6.6.0', dev: true },
        { name: '@testing-library/user-event', version: '^14.5.0', dev: true },
        { name: '@vitejs/plugin-react', version: '^4.3.0', dev: true },
        { name: 'vite-tsconfig-paths', version: '^5.1.0', dev: true },
        { name: 'jsdom', version: '^25.0.0', dev: true },
      );
    }

    return deps;
  },
});
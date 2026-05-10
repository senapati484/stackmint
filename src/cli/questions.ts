import { cancel, confirm, select, text } from '@clack/prompts';
import { StackConfig, FRAMEWORKS } from './types.js';
import { log } from '../utils/logger.js';

function isValidPackageName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && !name.startsWith('-') && !name.includes(' ');
}

export async function askIdentity(): Promise<Partial<StackConfig>> {
  const projectName = await text({
    message: 'Project name?',
    placeholder: 'my-app',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (!isValidPackageName(value)) return 'Must be a valid npm package name (lowercase, no spaces)';
    },
  });

  if (canceled(projectName)) return exitWithMessage();

  const packageManager = await select({
    message: 'Package manager?',
    options: [
      { value: 'bun', label: 'Bun', hint: 'fastest, native TS' },
      { value: 'pnpm', label: 'pnpm', hint: 'efficient, monorepo-ready' },
      { value: 'npm', label: 'npm', hint: 'universal standard' },
      { value: 'yarn', label: 'Yarn', hint: 'classic' },
    ],
  });

  if (canceled(packageManager)) return exitWithMessage();

  const category = await select({
    message: 'What are you building?',
    options: [
      { value: 'fullstack', label: 'Full-Stack App', hint: 'Next.js / SvelteKit / Nuxt / Remix' },
      { value: 'spa', label: 'SPA / Frontend', hint: 'React / Vue / Solid / Svelte' },
      { value: 'backend', label: 'Backend / API', hint: 'Hono / Elysia / Fastify / NestJS / Nitro' },
      { value: 'mobile', label: 'Mobile', hint: 'Expo / React Native' },
      { value: 'content', label: 'Content / Docs', hint: 'Astro / VitePress / Docusaurus' },
    ],
  });

  if (canceled(category)) return exitWithMessage();

  let runtime: StackConfig['runtime'] = 'node';
  if (category === 'backend') {
    const runtimeChoice = await select({
      message: 'Runtime?',
      options: [
        { value: 'node', label: 'Node.js', hint: 'stable, largest ecosystem' },
        { value: 'bun', label: 'Bun', hint: '3x faster, native TS, auto-selected for Elysia' },
        { value: 'deno', label: 'Deno 2', hint: 'secure by default, npm compat' },
      ],
    });
    if (canceled(runtimeChoice)) return exitWithMessage();
    if (packageManager === 'bun') runtime = 'bun';
    else runtime = runtimeChoice as StackConfig['runtime'];
  }

  return {
    projectName: projectName as string,
    packageManager: packageManager as StackConfig['packageManager'],
    category: category as StackConfig['category'],
    runtime,
  };
}

export async function askFramework(config: Partial<StackConfig>): Promise<Partial<StackConfig>> {
  const { category, runtime } = config;

  let frameworkOptions: { value: string; label: string; hint?: string }[] = [];

  switch (category) {
    case 'fullstack':
      frameworkOptions = [
        { value: 'nextjs', label: 'Next.js 15 (App Router)' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt 3' },
        { value: 'react-router-v7', label: 'React Router v7 (Remix)' },
        { value: 'analog', label: 'Analog (Angular)' },
        { value: 'tanstack-start', label: 'TanStack Start' },
        { value: 'astro-ssr', label: 'Astro (SSR mode)' },
      ];
      break;
    case 'spa':
      frameworkOptions = [
        { value: 'react-vite', label: 'React + Vite' },
        { value: 'vue-vite', label: 'Vue + Vite' },
        { value: 'solid-vite', label: 'Solid + Vite' },
        { value: 'svelte-vite', label: 'Svelte + Vite' },
        { value: 'qwik', label: 'Qwik' },
        { value: 'angular', label: 'Angular' },
      ];
      break;
    case 'backend':
      frameworkOptions = [
        { value: 'hono', label: 'Hono' },
        { value: 'elysia', label: 'Elysia', hint: 'auto-selects Bun runtime' },
        { value: 'fastify', label: 'Fastify' },
        { value: 'nestjs', label: 'NestJS' },
        { value: 'express', label: 'Express' },
        { value: 'nitro', label: 'Nitro', hint: 'file-based routes, multi-target deploy' },
        { value: 'h3', label: 'H3', hint: 'minimal HTTP, cross-runtime' },
        ...(runtime === 'bun' ? [{ value: 'bun-native', label: 'Bun Native', hint: 'only with Bun runtime — Bun.serve()' }] : []),
      ];
      break;
    case 'mobile':
      frameworkOptions = [
        { value: 'expo', label: 'Expo SDK 53' },
        { value: 'react-native', label: 'React Native CLI' },
      ];
      break;
    case 'content':
      frameworkOptions = [
        { value: 'astro-ssg', label: 'Astro (SSG)', hint: 'recommended' },
        { value: 'vitepress', label: 'VitePress' },
        { value: 'docusaurus', label: 'Docusaurus' },
        { value: 'eleventy', label: 'Eleventy' },
        { value: 'gatsby', label: 'Gatsby', hint: '⚠ maintenance mode — prefer Astro' },
      ];
      break;
  }

  const framework = await select({
    message: 'Framework?',
    options: frameworkOptions,
  });

  if (canceled(framework)) return exitWithMessage();

  if (framework === 'gatsby') {
    log.deprecated('Gatsby', 'Astro');
  }

  if (framework === 'elysia') {
    config.runtime = 'bun';
    log.info('Elysia auto-selects Bun runtime.');
  }

  const deployTarget = await select({
    message: 'Deploy target?',
    options: [
      { value: 'vercel', label: 'Vercel', hint: 'generates vercel.json' },
      { value: 'cloudflare-workers', label: 'Cloudflare Workers', hint: 'generates wrangler.toml' },
      { value: 'flyio', label: 'Fly.io', hint: 'generates fly.toml + Dockerfile' },
      { value: 'railway', label: 'Railway', hint: 'generates railway.toml' },
      { value: 'self-hosted', label: 'Self-hosted / VPS', hint: 'generates Dockerfile + docker-compose' },
      { value: 'none', label: "I'll decide later" },
    ],
  });

  if (canceled(deployTarget)) return exitWithMessage();

  const docker = ['flyio', 'self-hosted'].includes(deployTarget as string);

  let baas: StackConfig['baas'] = 'none';
  if (!['content', 'mobile'].includes(category as string)) {
    const baasChoice = await select({
      message: 'Backend platform?',
      options: [
        { value: 'none', label: 'None — use ORM + DB directly' },
        { value: 'supabase', label: 'Supabase', hint: 'Postgres + Auth + Storage + Realtime' },
        { value: 'convex', label: 'Convex', hint: 'Reactive TS backend — replaces ORM + DB' },
        { value: 'firebase', label: 'Firebase', hint: 'Google — Firestore + Auth + Storage' },
      ],
    });
    if (canceled(baasChoice)) return exitWithMessage();
    baas = baasChoice as StackConfig['baas'];

    if (baas === 'convex') {
      log.info('Convex replaces your ORM and database — skipping those questions.');
    } else if (baas === 'supabase') {
      log.info('Supabase includes its own auth — you can still add Better Auth but it\'s redundant.');
    }
  }

  return {
    ...config,
    framework: framework as string,
    deployTarget: deployTarget as StackConfig['deployTarget'],
    docker,
    baas,
  };
}

export async function askAddons(config: Partial<StackConfig>): Promise<Partial<StackConfig>> {
  const result = { ...config };

  const shouldSkip = (condition: boolean) => condition;

  if (shouldSkip(result.baas === 'convex')) {
  } else if (result.baas !== 'none') {
  }

  if (!['content', 'mobile'].includes(result.category as string) && result.baas === 'none') {
    const database = await select({
      message: 'Database?',
      options: [
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mongodb', label: 'MongoDB' },
        { value: 'turso', label: 'Turso (SQLite edge)' },
        { value: 'neon', label: 'Neon (serverless Postgres)' },
        { value: 'none', label: 'None' },
      ],
    });
    if (canceled(database)) return exitWithMessage();
    result.database = database as StackConfig['database'];

    if (result.database !== 'mongodb' && result.database !== 'none') {
      const orm = await select({
        message: 'ORM?',
        options: [
          { value: 'drizzle', label: 'Drizzle', hint: 'recommended' },
          { value: 'prisma', label: 'Prisma' },
          { value: 'typeorm', label: 'TypeORM' },
          { value: 'none', label: 'None' },
        ],
      });
      if (canceled(orm)) return exitWithMessage();
      result.orm = orm as StackConfig['orm'];
    }
  }

  if (result.baas !== 'convex' && result.baas !== 'none') {
    if (result.baas === 'supabase') {
      const auth = await select({
        message: 'Authentication?',
        options: [
          { value: 'supabase-auth', label: 'Supabase Auth (included)' },
          { value: 'better-auth', label: 'Better Auth', hint: 'recommended' },
          { value: 'clerk', label: 'Clerk' },
          { value: 'next-auth', label: 'NextAuth/Auth.js' },
          { value: 'none', label: 'None' },
        ],
      });
      if (canceled(auth)) return exitWithMessage();
      result.auth = auth === 'supabase-auth' ? 'none' : (auth as StackConfig['auth']);
    } else {
      const auth = await select({
        message: 'Authentication?',
        options: [
          { value: 'better-auth', label: 'Better Auth', hint: 'recommended' },
          { value: 'clerk', label: 'Clerk' },
          { value: 'next-auth', label: 'NextAuth/Auth.js' },
          { value: 'none', label: 'None' },
        ],
      });
      if (canceled(auth)) return exitWithMessage();
      result.auth = auth as StackConfig['auth'];
    }
  } else if (result.baas === 'none') {
    const auth = await select({
      message: 'Authentication?',
      options: [
        { value: 'better-auth', label: 'Better Auth', hint: 'recommended' },
        { value: 'clerk', label: 'Clerk' },
        { value: 'next-auth', label: 'NextAuth/Auth.js' },
        { value: 'none', label: 'None' },
      ],
    });
    if (canceled(auth)) return exitWithMessage();
    result.auth = auth as StackConfig['auth'];
  }

  if (!['spa', 'content', 'mobile', 'backend'].includes(result.category as string)) {
    const apiLayerOptions: { value: string; label: string; hint?: string }[] = [
      { value: 'trpc', label: 'tRPC v11', hint: 'React-focused, battle-tested' },
      { value: 'orpc', label: 'oRPC v1', hint: 'tRPC + native OpenAPI, all frameworks' },
      { value: 'ts-rest', label: 'ts-rest', hint: 'contract-first, standard REST' },
      { value: 'graphql', label: 'GraphQL (Pothos)' },
      { value: 'rest', label: 'REST routes (manual)' },
      { value: 'none', label: 'None' },
    ];

    const isReactFramework = ['nextjs', 'react-router-v7', 'analog', 'tanstack-start'].some(f => result.framework?.startsWith(f));
    if (!isReactFramework && ['vue-vite', 'nuxt', 'solid-vite', 'svelte-vite', 'sveltekit'].some(f => result.framework?.startsWith(f))) {
      apiLayerOptions.unshift({ value: 'orpc', label: 'oRPC v1', hint: 'recommended for non-React' });
    }

    const apiLayer = await select({
      message: 'API layer?',
      options: apiLayerOptions,
    });
    if (canceled(apiLayer)) return exitWithMessage();
    result.apiLayer = apiLayer as StackConfig['apiLayer'];
  }

  const validation = await select({
    message: 'Schema validation?',
    options: [
      { value: 'zod', label: 'Zod v4', hint: 'recommended — universal standard' },
      { value: 'valibot', label: 'Valibot', hint: 'tree-shakeable, edge-friendly, 1.3KB' },
      { value: 'arktype', label: 'ArkType', hint: 'TypeScript-native, fastest parsing' },
      { value: 'none', label: 'None' },
    ],
  });
  if (canceled(validation)) return exitWithMessage();
  result.validation = validation as StackConfig['validation'];

  if (result.category !== 'backend') {
    const stylingOptions: { value: string; label: string; hint?: string }[] = [
      { value: 'tailwind', label: 'Tailwind CSS v4', hint: 'recommended' },
      { value: 'panda-css', label: 'Panda CSS', hint: 'zero-runtime CSS-in-JS' },
      { value: 'stylex', label: 'StyleX', hint: 'Meta\'s atomic CSS, React only' },
      { value: 'css-modules', label: 'CSS Modules' },
      { value: 'styled-components', label: 'Styled Components' },
      { value: 'none', label: 'None' },
    ];

    if (result.framework?.includes('react') && !result.framework?.includes('nextjs') && !result.framework?.includes('router') && !result.framework?.includes('analog')) {
    } else if (result.framework === 'angular') {
    } else {
    }

    const styling = await select({
      message: 'Styling?',
      options: stylingOptions,
    });
    if (canceled(styling)) return exitWithMessage();
    result.styling = styling as StackConfig['styling'];

    if (result.styling !== 'none' && result.category !== 'backend') {
      const uiOptions: { value: string; label: string; hint?: string }[] = [];
      if (result.styling === 'tailwind') {
        uiOptions.push({ value: 'shadcn', label: 'shadcn/ui', hint: 'copy-paste components, Tailwind required' });
      }
      uiOptions.push(
        { value: 'radix', label: 'Radix UI primitives' },
      );
      if (result.styling === 'panda-css') {
        uiOptions.push({ value: 'ark-ui', label: 'Ark UI', hint: 'pairs with Panda CSS' });
      }
      uiOptions.push({ value: 'none', label: 'None' });

      const uiLibrary = await select({
        message: 'UI component library?',
        options: uiOptions,
      });
      if (canceled(uiLibrary)) return exitWithMessage();
      result.uiLibrary = uiLibrary as StackConfig['uiLibrary'];
    }
  }

  if (!['backend', 'content', 'mobile'].includes(result.category as string)) {
    const isReact = ['nextjs', 'react-router-v7', 'analog', 'tanstack-start', 'react-vite'].some(f => result.framework?.startsWith(f));
    const formOptions: { value: string; label: string; hint?: string }[] = [];

    if (isReact) {
      formOptions.push({ value: 'react-hook-form', label: 'React Hook Form + Zod resolver' });
    }
    formOptions.push(
      { value: 'tanstack-form', label: 'TanStack Form', hint: 'all frameworks' },
      { value: 'conform', label: 'Conform', hint: 'Remix/SvelteKit server actions' },
      { value: 'none', label: 'None' },
    );

    const forms = await select({
      message: 'Form library?',
      options: formOptions,
    });
    if (canceled(forms)) return exitWithMessage();
    result.forms = forms as StackConfig['forms'];
  }

  if (!['backend', 'content'].includes(result.category as string)) {
    const stateOptions: { value: string; label: string; hint?: string }[] = [];

    if (['vue', 'nuxt'].some(f => result.framework?.includes(f))) {
      stateOptions.push({ value: 'pinia', label: 'Pinia', hint: 'recommended — official Vue state' });
      stateOptions.push({ value: 'nanostores', label: 'Nanostores', hint: 'for micro-state alongside Pinia' });
    } else {
      stateOptions.push(
        { value: 'zustand', label: 'Zustand' },
        { value: 'jotai', label: 'Jotai' },
        { value: 'nanostores', label: 'Nanostores' },
        { value: 'tanstack-query', label: 'TanStack Query', hint: 'server state only' },
      );
    }
    stateOptions.push({ value: 'none', label: 'None' });

    const stateManagement = await select({
      message: 'State management?',
      options: stateOptions,
    });
    if (canceled(stateManagement)) return exitWithMessage();
    result.stateManagement = stateManagement as StackConfig['stateManagement'];
  }

  const ai = await select({
    message: 'AI integration?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'vercel-ai-sdk', label: 'Vercel AI SDK', hint: 'streaming, tool use, structured output' },
      { value: 'mastra', label: 'Mastra', hint: 'agent workflows + Studio UI' },
      { value: 'langchain', label: 'LangChain.js', hint: 'RAG pipelines, complex retrieval' },
    ],
  });
  if (canceled(ai)) return exitWithMessage();
  result.ai = ai as StackConfig['ai'];

  if (!['spa', 'content', 'mobile'].includes(result.category as string)) {
    const jobs = await select({
      message: 'Background jobs?',
      options: [
        { value: 'none', label: 'None' },
        { value: 'inngest', label: 'Inngest', hint: 'serverless/edge-friendly, TypeScript-first' },
        { value: 'bullmq', label: 'BullMQ + Redis', hint: 'traditional Node.js queue' },
        { value: 'trigger-dev', label: 'Trigger.dev', hint: 'durable background jobs' },
      ],
    });
    if (canceled(jobs)) return exitWithMessage();
    result.jobs = jobs as StackConfig['jobs'];

    const email = await select({
      message: 'Email?',
      options: [
        { value: 'none', label: 'None' },
        { value: 'resend', label: 'Resend', hint: 'recommended' },
        { value: 'nodemailer', label: 'Nodemailer' },
        { value: 'sendgrid', label: 'SendGrid' },
      ],
    });
    if (canceled(email)) return exitWithMessage();
    result.email = email as StackConfig['email'];
  }

  if (result.category === 'fullstack') {
    const payments = await confirm({
      message: 'Add Stripe?',
    });
    if (canceled(payments)) return exitWithMessage();
    result.payments = payments ? 'stripe' : 'none';
  }

  const testingOptions: { value: string; label: string }[] = [
    { value: 'vitest', label: 'Vitest (unit + integration) — recommended' },
    { value: 'playwright', label: 'Playwright (E2E)' },
    { value: 'vitest+playwright', label: 'Vitest + Playwright' },
    { value: 'jest', label: 'Jest (legacy)' },
    { value: 'none', label: 'None' },
  ];

  const testing = await select({
    message: 'Testing?',
    options: testingOptions,
  });
  if (canceled(testing)) return exitWithMessage();
  result.testing = testing as StackConfig['testing'];

  const devopsOptions: { value: string; label: string }[] = [
    { value: 'github-actions', label: 'GitHub Actions CI' },
    { value: 'docker', label: 'Docker + docker-compose' },
    { value: 'husky', label: 'Husky + lint-staged' },
    { value: 'changesets', label: 'Changesets (versioning)' },
    { value: 'turborepo', label: 'Turborepo' },
  ];

  const devopsResults = [];
  for (const opt of devopsOptions) {
    const selected = await confirm({ message: opt.label + '?' });
    if (canceled(selected)) return exitWithMessage();
    if (selected) devopsResults.push(opt.value);
  }

  result.githubActions = devopsResults.includes('github-actions');
  result.docker = result.docker || devopsResults.includes('docker');
  result.husky = devopsResults.includes('husky');
  result.changesets = devopsResults.includes('changesets');
  result.turborepo = devopsResults.includes('turborepo');

  const aiIdeOptions: { value: string; label: string; hint?: string }[] = [
    { value: 'claude-code', label: 'Claude Code', hint: 'OpenCode / Claude CLI context' },
    { value: 'cursor', label: 'Cursor Rules', hint: '.cursor/rules/ directory' },
    { value: 'opencode', label: 'OpenCode', hint: 'OpenCode CLI context' },
    { value: 'continue', label: 'Continue.dev', hint: 'Continue config for VS Code/JetBrains' },
    { value: 'sourcegraph', label: 'Sourcegraph Cody', hint: 'Cody context instructions' },
    { value: 'copilot', label: 'GitHub Copilot', hint: '.github/copilot-instructions.md' },
    { value: 'windsurf', label: 'Windsurf', hint: '.windsurf/rules.md' },
    { value: 'replit', label: 'Replit Agent', hint: 'Replit context' },
    { value: 'kotata', label: 'Kotata', hint: 'Kotata AI context' },
    { value: 'llm-code', label: 'LLM Coding', hint: 'Generic LLM coding conventions' },
    { value: 'devin', label: 'Devin (Cognition)', hint: 'Devin AI agent context' },
  ];

  const aiConfig: StackConfig['aiConfig'] = ['claude-code'];
  for (const opt of aiIdeOptions) {
    if (opt.value === 'claude-code') continue;
    const selected = await confirm({ message: 'Generate ' + opt.label + ' context file?' });
    if (canceled(selected)) return exitWithMessage();
    if (selected) aiConfig.push(opt.value as StackConfig['aiConfig'][number]);
  }
  result.aiConfig = aiConfig;

  return result;
}

function canceled(value: unknown): boolean {
  return typeof value === 'symbol';
}

function exitWithMessage(): never {
  console.log(chalk.gray('Cancelled. Goodbye!'));
  process.exit(0);
}

export async function askAll(): Promise<Partial<StackConfig>> {
  const identity = await askIdentity();
  const framework = await askFramework(identity);
  const addons = await askAddons(framework);
  return addons;
}
export interface AdapterFile {
  path: string;
  content: string;
  overwrite?: boolean;
}

export interface AdapterEnvVar {
  key: string;
  value: string;
  comment?: string;
}

export interface AdapterDependency {
  name: string;
  version: string;
  dev?: boolean;
}

export interface Adapter {
  id: string;
  name: string;
  files: (config: StackConfig) => AdapterFile[];
  dependencies: (config: StackConfig) => AdapterDependency[];
  envVars?: (config: StackConfig) => AdapterEnvVar[];
  scripts?: Record<string, string>;
  postInstall?: string[];
  conflictsWith?: string[];
  condition?: (config: StackConfig) => boolean;
}

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

export const ADAPTER_REGISTRY = new Map<string, Adapter>();

export function getAdapter(id: string): Adapter | undefined {
  return ADAPTER_REGISTRY.get(id);
}

export function getAdapters(ids: string[]): Adapter[] {
  return ids.map(id => ADAPTER_REGISTRY.get(id)).filter(Boolean) as Adapter[];
}

function registerAdapter(adapter: Adapter): void {
  ADAPTER_REGISTRY.set(adapter.id, adapter);
}

// Database adapters
registerAdapter({
  id: 'drizzle',
  name: 'Drizzle ORM',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'prisma',
  name: 'Prisma',
  files: () => [],
  dependencies: () => [],
});

// BaaS adapters
registerAdapter({
  id: 'supabase',
  name: 'Supabase',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'convex',
  name: 'Convex',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'firebase',
  name: 'Firebase',
  files: () => [],
  dependencies: () => [],
});

// Auth adapters
registerAdapter({
  id: 'better-auth',
  name: 'Better Auth',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'clerk',
  name: 'Clerk',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'next-auth',
  name: 'NextAuth/Auth.js',
  files: () => [],
  dependencies: () => [],
});

// API adapters
registerAdapter({
  id: 'trpc',
  name: 'tRPC',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'orpc',
  name: 'oRPC',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'ts-rest',
  name: 'ts-rest',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'graphql',
  name: 'GraphQL',
  files: () => [],
  dependencies: () => [],
});

// Validation adapters
registerAdapter({
  id: 'zod',
  name: 'Zod',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'valibot',
  name: 'Valibot',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'arktype',
  name: 'ArkType',
  files: () => [],
  dependencies: () => [],
});

// Styling adapters
registerAdapter({
  id: 'tailwind',
  name: 'Tailwind CSS',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'panda-css',
  name: 'Panda CSS',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'stylex',
  name: 'StyleX',
  files: () => [],
  dependencies: () => [],
});

// UI adapters
registerAdapter({
  id: 'shadcn',
  name: 'shadcn/ui',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'radix',
  name: 'Radix UI',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'ark-ui',
  name: 'Ark UI',
  files: () => [],
  dependencies: () => [],
});

// Forms adapters
registerAdapter({
  id: 'react-hook-form',
  name: 'React Hook Form',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'tanstack-form',
  name: 'TanStack Form',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'conform',
  name: 'Conform',
  files: () => [],
  dependencies: () => [],
});

// State adapters
registerAdapter({
  id: 'zustand',
  name: 'Zustand',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'jotai',
  name: 'Jotai',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'pinia',
  name: 'Pinia',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'nanostores',
  name: 'Nanostores',
  files: () => [],
  dependencies: () => [],
});

// AI adapters
registerAdapter({
  id: 'vercel-ai-sdk',
  name: 'Vercel AI SDK',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'langchain',
  name: 'LangChain.js',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'mastra',
  name: 'Mastra',
  files: () => [],
  dependencies: () => [],
});

// Jobs adapters
registerAdapter({
  id: 'inngest',
  name: 'Inngest',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'bullmq',
  name: 'BullMQ',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'trigger-dev',
  name: 'Trigger.dev',
  files: () => [],
  dependencies: () => [],
});

// Cache adapters
registerAdapter({
  id: 'upstash',
  name: 'Upstash Redis',
  files: () => [],
  dependencies: () => [],
});

// Email adapters
registerAdapter({
  id: 'resend',
  name: 'Resend',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'nodemailer',
  name: 'Nodemailer',
  files: () => [],
  dependencies: () => [],
});

// Payments adapters
registerAdapter({
  id: 'stripe',
  name: 'Stripe',
  files: () => [],
  dependencies: () => [],
});

// DevOps adapters
registerAdapter({
  id: 'docker',
  name: 'Docker',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'github-actions',
  name: 'GitHub Actions',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'husky',
  name: 'Husky',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'changesets',
  name: 'Changesets',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'turborepo',
  name: 'Turborepo',
  files: () => [],
  dependencies: () => [],
});

// Deploy adapters
registerAdapter({
  id: 'deploy-vercel',
  name: 'Vercel',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'deploy-cloudflare',
  name: 'Cloudflare Workers',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'deploy-flyio',
  name: 'Fly.io',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'deploy-railway',
  name: 'Railway',
  files: () => [],
  dependencies: () => [],
});

// Docs adapters
registerAdapter({
  id: 'openapi-scalar',
  name: 'OpenAPI/Scalar',
  files: () => [],
  dependencies: () => [],
});

// AI IDE adapters
registerAdapter({
  id: 'agents-md',
  name: 'AGENTS.md',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'cursor-rules',
  name: 'Cursor Rules',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'copilot-instructions',
  name: 'GitHub Copilot',
  files: () => [],
  dependencies: () => [],
});

registerAdapter({
  id: 'windsurf-rules',
  name: 'Windsurf Rules',
  files: () => [],
  dependencies: () => [],
});
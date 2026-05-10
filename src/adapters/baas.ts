import { Adapter, AdapterFile, AdapterDependency, AdapterEnvVar, ADAPTER_REGISTRY } from './index.js';

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

export function registerSupabaseAdapter(): void {
  const adapter: Adapter = {
    id: 'supabase',
    name: 'Supabase',
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/supabase/client.ts',
        content: `import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`,
      },
      {
        path: 'src/lib/supabase/server.ts',
        content: `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The setAll method was called from a Server Component.
          }
        },
      },
    }
  );
}
`,
      },
      {
        path: 'src/lib/supabase/middleware.ts',
        content: `import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
        },
      },
    }
  );

  return response;
}
`,
      },
      {
        path: 'src/types/supabase.ts',
        content: `// Run 'supabase gen types typescript --local > src/types/supabase.ts' to generate
export type Database = any;
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: '@supabase/supabase-js', version: '^2.39.0' },
      { name: '@supabase/ssr', version: '^0.4.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        value: 'https://your-project.supabase.co',
        comment: 'Your Supabase project URL',
      },
      {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        value: 'your-anon-key',
        comment: 'Your Supabase anon key',
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        value: 'your-service-role-key',
        comment: 'Server-only, never expose to client',
      },
    ],
    scripts: {
      'supabase:types': 'supabase gen types typescript --local > src/types/supabase.ts',
    },
    postInstall: ["echo 'Add your Supabase project URL and anon key to .env.local'"],
  };

  ADAPTER_REGISTRY.set('supabase', adapter);
}

export function registerConvexAdapter(): void {
  const adapter: Adapter = {
    id: 'convex',
    name: 'Convex',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'convex/_generated/.gitkeep',
        content: '',
      },
      {
        path: 'convex/schema.ts',
        content: `import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index('by_email', ['email']),
});
`,
      },
      {
        path: 'convex/users.ts',
        content: `import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  },
});

export const create = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert('users', args);
    return userId;
  },
});
`,
      },
      {
        path: 'src/lib/convex.tsx',
        content: `'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: 'convex', version: '^1.12.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'NEXT_PUBLIC_CONVEX_URL',
        value: 'https://your-deployment.convex.cloud',
        comment: 'Your Convex deployment URL',
      },
    ],
    scripts: {
      'convex:dev': 'convex dev',
      'convex:deploy': 'convex deploy',
    },
    postInstall: ['npx convex dev --once'],
  };

  ADAPTER_REGISTRY.set('convex', adapter);
}

export function initBaaSAdapters(): void {
  registerSupabaseAdapter();
  registerConvexAdapter();
}
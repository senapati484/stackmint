import { StackConfig, Adapter, AdapterFile, AdapterDependency, AdapterEnvVar, ADAPTER_REGISTRY } from './index.js';

export function registerBetterAuthAdapter(): void {
  const isBetterAuthSupported = (framework?: string) =>
    framework === 'nextjs' || framework === 'hono' || framework === 'elysia';

  const adapter: Adapter = {
    id: 'better-auth',
    name: 'Better Auth',
    condition: (config: StackConfig) => isBetterAuthSupported(config.framework),
    files: (config: StackConfig): AdapterFile[] => {
      let provider = 'pg';
      if (config.database === 'mysql') provider = 'mysql';
      else if (config.database === 'sqlite' || config.database === 'turso') provider = 'sqlite';

      const files: AdapterFile[] = [
        {
          path: 'src/lib/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${provider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Add your OAuth providers here
  },
});
`,
        },
        {
          path: 'src/lib/auth-client.ts',
          content: `import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});
`,
        },
      ];

      if (config.framework === 'nextjs') {
        files.push({
          path: 'src/app/api/auth/[...all]/route.ts',
          content: `import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'better-auth', version: '^1.0.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'BETTER_AUTH_SECRET',
        value: 'generate-a-random-secret-here',
        comment: 'Generate with: openssl rand -base64 32',
      },
      {
        key: 'BETTER_AUTH_URL',
        value: 'http://localhost:3000',
        comment: 'Your application URL',
      },
    ],
  };

  ADAPTER_REGISTRY.set('better-auth', adapter);
}

export function registerClerkAdapter(): void {
  const adapter: Adapter = {
    id: 'clerk',
    name: 'Clerk',
    files: (config: StackConfig): AdapterFile[] => {
      const framework = config.framework || 'nextjs';
      const isNext = framework === 'nextjs';
      const isSvelteKit = framework === 'sveltekit';

      const files: AdapterFile[] = [];

      if (isNext) {
        files.push(
          {
            path: 'src/middleware.ts',
            content: `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/api/health']);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
`,
          },
          {
            path: 'src/lib/clerk.ts',
            content: `import { currentUser } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  return await currentUser();
}
`,
          }
        );
      } else if (isSvelteKit) {
        files.push({
          path: 'src/hooks.server.ts',
          content: `import { clerkClient } from '@clerk/fetch-node';

export const load = async ({ request }: { request: Request }) => {
  const user = await clerkClient.users.getUserList();
  return { user };
};
`,
        });
      }

      return files;
    },
    dependencies: (config: StackConfig): AdapterDependency[] => {
      const deps: AdapterDependency[] = [];
      if (config.framework === 'nextjs') {
        deps.push({ name: '@clerk/nextjs', version: '^5.0.0' });
      } else if (config.framework === 'sveltekit') {
        deps.push({ name: '@clerk/sveltekit', version: '^1.0.0' });
      }
      return deps;
    },
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        value: 'pk_test_...',
        comment: 'Your Clerk publishable key',
      },
      {
        key: 'CLERK_SECRET_KEY',
        value: 'sk_test_...',
        comment: 'Your Clerk secret key',
      },
    ],
  };

  ADAPTER_REGISTRY.set('clerk', adapter);
}

function registerNextAuthAdapter(): void {
  const adapter: Adapter = {
    id: 'next-auth',
    name: 'NextAuth.js',
    condition: (config) => config.framework === 'nextjs',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [],
  };
  ADAPTER_REGISTRY.set('next-auth', adapter);
}

export function initAuthAdapters(): void {
  registerBetterAuthAdapter();
  registerClerkAdapter();
  registerNextAuthAdapter();
}

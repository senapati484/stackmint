import { StackConfig } from '../../cli/types.js';

export interface AuthFile {
  path: string;
  content: string;
}

export function buildAuthFiles(config: StackConfig): AuthFile[] {
  if (config.auth === 'none' || config.baas !== 'none') {
    return [];
  }

  const framework = config.framework;

  switch (config.auth) {
    case 'next-auth':
      return buildNextAuthFiles(framework);
    case 'better-auth':
      return buildBetterAuthFiles(framework);
    case 'clerk':
      return buildClerkFiles(framework);
    default:
      return [];
  }
}

function buildNextAuthFiles(framework: string): AuthFile[] {
  switch (framework) {
    case 'nextjs':
      return [
        {
          path: 'src/auth.ts',
          content: `import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
});
`,
        },
        {
          path: 'src/app/api/(auth)/auth/[...nextauth]/route.ts',
          content: `import { handlers } from '@/auth';
export const { GET, POST } = handlers;
`,
        },
      ];

    case 'sveltekit':
      return [
        {
          path: 'src/auth.ts',
          content: `import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [GitHub],
});
`,
        },
      ];

    case 'nuxt':
      return [
        {
          path: 'server/api/auth/[...].ts',
          content: `import { getServerAuthSession } from './server/auth';

export default defineEventHandler(async (event) => {
  const session = await getServerAuthSession();
  return session;
});
`,
        },
      ];

    case 'react-router-v7':
      return [
        {
          path: 'app/routes/__auth.tsx',
          content: `import { createCookieSessionStorage, redirect } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET || 'default-secret';

const storage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}
`,
        },
      ];

    case 'analog':
      return [];

    case 'tanstack-start':
      return [];

    default:
      return [];
  }
}

function buildBetterAuthFiles(framework: string): AuthFile[] {
  switch (framework) {
    case 'nextjs':
      return [
        {
          path: 'src/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
        {
          path: 'src/app/api/auth/[...all]/route.ts',
          content: `import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/auth';

export const { GET, POST } = toNextJsHandler(auth);
`,
        },
      ];

    case 'sveltekit':
      return [
        {
          path: 'src/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
      ];

    default:
      return [];
  }
}

function buildClerkFiles(framework: string): AuthFile[] {
  switch (framework) {
    case 'nextjs':
      return [
        {
          path: 'src/middleware.ts',
          content: `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
`,
        },
      ];

    default:
      return [];
  }
}
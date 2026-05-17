import { StackConfig } from '../../cli/types.js';

export interface AuthFile {
  path: string;
  content: string;
}

export function buildAuthFiles(config: StackConfig): AuthFile[] {
  if (config.auth === 'none' || config.baas !== 'none') {
    return [];
  }

  switch (config.auth) {
    case 'next-auth':
      return buildNextAuthFiles(config);
    case 'better-auth':
      return buildBetterAuthFiles(config);
    case 'clerk':
      return buildClerkFiles(config);
    default:
      return [];
  }
}

function buildNextAuthFiles(config: StackConfig): AuthFile[] {
  const framework = config.framework;
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

function buildBetterAuthFiles(config: StackConfig): AuthFile[] {
  const framework = config.framework;
  const dbProvider = config.database === 'mysql' ? 'mysql' : (config.database === 'sqlite' || config.database === 'turso' ? 'sqlite' : 'pg');
  
  let dbImportPath = '@/lib/db';
  if (framework === 'nextjs') dbImportPath = '@/lib/server/db';
  else if (framework === 'sveltekit') dbImportPath = '$lib/server/db';
  else if (framework === 'nuxt') dbImportPath = '~/server/db';
  else if (framework === 'astro-ssr' || framework === 'astro-ssg') dbImportPath = '@/db';

  switch (framework) {
    case 'nextjs':
      return [
        {
          path: 'src/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
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
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
      ];

    case 'nuxt':
      return [
        {
          path: 'server/utils/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
        {
          path: 'server/api/auth/[...all].ts',
          content: `import { auth } from '../utils/auth';

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
`,
        },
      ];

    case 'astro-ssr':
    case 'astro-ssg':
      return [
        {
          path: 'src/lib/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
        {
          path: 'src/pages/api/auth/[...all].ts',
          content: `import { auth } from '../../../lib/auth';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = ({ request }) => {
  return auth.handler(request);
};
`,
        },
      ];

    case 'react-router-v7':
    case 'tanstack-start':
      return [
        {
          path: 'app/lib/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
        {
          path: framework === 'react-router-v7' ? 'app/routes/api.auth.$.ts' : 'app/routes/api/auth/$.ts',
          content: `import { auth } from '@/lib/auth';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '${framework === 'react-router-v7' ? 'react-router' : '@tanstack/react-router'}';

export const action = async ({ request }: ActionFunctionArgs) => {
  return auth.handler(request);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return auth.handler(request);
};
`,
        },
      ];

    case 'qwik':
      return [
        {
          path: 'src/lib/auth.ts',
          content: `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '${dbImportPath}';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: '${dbProvider}',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
`,
        },
        {
          path: 'src/routes/api/auth/[...all]/index.ts',
          content: `import { auth } from '~/lib/auth';
import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ request, send }) => {
  const res = await auth.handler(request);
  send(res);
};

export const onPost: RequestHandler = async ({ request, send }) => {
  const res = await auth.handler(request);
  send(res);
};
`,
        },
      ];

    default:
      return [];
  }
}

function buildClerkFiles(config: StackConfig): AuthFile[] {
  const framework = config.framework;
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
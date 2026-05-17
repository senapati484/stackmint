import { StackConfig } from '../../cli/types.js';

export interface MiddlewareFile {
  path: string;
  content: string;
}

export function buildMiddleware(config: StackConfig): MiddlewareFile | null {
  if (config.auth === 'none' || config.auth === 'clerk') {
    return null;
  }

  const framework = config.framework;

  switch (framework) {
    case 'sveltekit':
      return buildSvelteKitMiddleware(config);
    case 'nuxt':
      return buildNuxtMiddleware(config);
    case 'react-router-v7':
      return buildReactRouterMiddleware(config);
    case 'analog':
      return buildAnalogMiddleware(config);
    case 'tanstack-start':
      return buildTanStackStartMiddleware(config);
    case 'astro-ssr':
      return buildAstroMiddleware(config);
    default:
      return null;
  }
}

function buildSvelteKitMiddleware(config: StackConfig): MiddlewareFile | null {
  if (config.auth === 'next-auth') {
    return {
      path: 'src/hooks.server.ts',
      content: `import { handle } from '@auth/sveltekit';
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [GitHub],
});
`,
    };
  }

  if (config.auth === 'better-auth') {
    return {
      path: 'src/hooks.server.ts',
      content: `import { createHelpers } from '@tanstack/svelte-query';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
};
`,
    };
  }

  if (config.baas === 'supabase') {
    return {
      path: 'src/hooks.server.ts',
      content: `import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, { path: '/', ...options });
        },
        remove: (key, options) => {
          event.cookies.delete(key, { path: '/', ...options });
        },
      },
    }
  );

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-range',
  });
};
`,
    };
  }

  return null;
}

function buildNuxtMiddleware(config: StackConfig): MiddlewareFile | null {
  if (config.auth === 'next-auth') {
    return {
      path: 'server/middleware/auth.ts',
      content: `import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
`,
    };
  }

  if (config.baas === 'supabase') {
    return {
      path: 'server/middleware/supabase.ts',
      content: `import { createServerClient } from '@supabase/ssr';

export default defineEventHandler(async (event) => {
  const cookies = event.node.req.headers.cookie || '';
  const supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookies.split('; ').find((c) => c.startsWith(key + '='))?.split('=')[1],
      },
    }
  );
  event.context.supabase = supabase;
});
`,
    };
  }

  return null;
}

function buildReactRouterMiddleware(config: StackConfig): MiddlewareFile | null {
  if (config.auth === 'next-auth') {
    return {
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
    };
  }

  return null;
}

function buildAnalogMiddleware(config: StackConfig): MiddlewareFile | null {
  if (config.auth === 'next-auth') {
    return {
      path: 'src/app/app.config.ts',
      content: `import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering } from '@angular/platform-server';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServerRendering(),
  ],
};
`,
    };
  }

  return null;
}

function buildTanStackStartMiddleware(config: StackConfig): MiddlewareFile | null {
  return null;
}

function buildAstroMiddleware(config: StackConfig): MiddlewareFile | null {
  return null;
}
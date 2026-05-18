import { registerAdapter } from './index.js';
import type { Adapter } from './index.js';

export function initApiAdapters(): void {
  const isTrpcSupported = (config: { framework?: string }) => config.framework === 'nextjs';

  const trpcAdapter: Adapter = {
    id: 'trpc',
    name: 'tRPC',
    condition: (config) => isTrpcSupported(config),
    dependencies: (config) =>
      isTrpcSupported(config)
        ? [
          { name: '@trpc/client', version: '^11.0.0', dev: false },
          { name: '@trpc/server', version: '^11.0.0', dev: false },
          { name: '@trpc/react-query', version: '^11.0.0', dev: false },
          { name: '@tanstack/react-query', version: '^5.61.0', dev: false },
        ]
        : [],
    files: (config) => {
      if (config.framework === 'nextjs') {
        return [
          {
            path: 'src/server/trpc.ts',
            content: `import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
`
          },
          {
            path: 'src/server/routers/_app.ts',
            content: `import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query((opts) => {
      return {
        greeting: \`hello \${opts.input.text}\`,
      };
    }),
});

export type AppRouter = typeof appRouter;
`
          },
          {
            path: 'src/app/api/trpc/[trpc]/route.ts',
            content: `import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
`
          },
          {
            path: 'src/utils/trpc.ts',
            content: `import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return \`https://\${process.env.VERCEL_URL}\`;
  return \`http://localhost:\${process.env.PORT ?? 3000}\`;
}
`,
          },
          {
            path: 'src/components/providers/trpc-provider.tsx',
            content: `'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState, type ReactNode } from 'react';
import { trpc, getBaseUrl } from '@/utils/trpc';

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: \`\${getBaseUrl()}/api/trpc\`,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
`,
          },
        ];
      }
      return [];
    },
  };

  const orpcAdapter: Adapter = {
    id: 'orpc',
    name: 'oRPC',
    dependencies: () => [],
    files: () => [],
  };

  const tsRestAdapter: Adapter = {
    id: 'ts-rest',
    name: 'ts-rest',
    dependencies: () => [],
    files: () => [],
  };

  const graphqlAdapter: Adapter = {
    id: 'graphql',
    name: 'GraphQL',
    dependencies: () => [],
    files: () => [],
  };

  registerAdapter(trpcAdapter);
  registerAdapter(orpcAdapter);
  registerAdapter(tsRestAdapter);
  registerAdapter(graphqlAdapter);
}

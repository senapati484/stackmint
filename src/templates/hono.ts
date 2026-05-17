import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('hono', {

  id: 'hono',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'Hono',
      runtime: 'Hono',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Lightweight, multi-runtime framework',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    const files: AdapterFile[] = [
      {
        path: 'src/index.ts',
        content: config.runtime === 'bun'
          ? `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

app.get('/', (c) => c.html(landingHTML));
app.get('/api/health', (c) => c.json({ 
  status: 'ok',
  framework: 'hono',
  runtime: 'bun',
  timestamp: new Date().toISOString() 
}));

let port = parseInt(process.env.PORT || '3000', 10);
let server;
while (true) {
  try {
    server = Bun.serve({
      port,
      fetch: app.fetch,
      development: true,
      onListen: ({ port }) => {
        console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
      }
    });
    break;
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      console.log(\`Port \${port} is in use, trying \${port + 1}...\`);
      port++;
    } else {
      throw error;
    }
  }
}
export default server;
`
          : `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

app.get('/', (c) => c.html(landingHTML));
app.get('/api/health', (c) => c.json({ 
  status: 'ok',
  framework: 'hono',
  timestamp: new Date().toISOString()
}));

const startServer = (port: number) => {
  const server = serve({ fetch: app.fetch, port });
  
  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log(\`Port \${port} is in use, trying \${port + 1}...\`);
      setTimeout(() => startServer(port + 1), 100);
    } else {
      console.error(e);
      process.exit(1);
    }
  });

  server.on('listening', () => {
    console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
  });
};

const initialPort = parseInt(process.env.PORT || '3000', 10);
startServer(initialPort);
`,
      },
      getStackmintLogoFile(),
      {
        path: 'src/routes/index.ts',
        content: '// Add your routes here',
      },
      {
        path: 'src/middleware/index.ts',
        content: '// Add your middleware here',
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            outDir: 'dist',
            paths: { '@/*': ['./src/*'] },
          },
          include: ['src/**/*'],
        }, null, 2),
      },
    ];

    if (config.validation === 'zod') {
      files.push({
        path: 'src/lib/schemas/index.ts',
        content: `import { z } from 'zod';

export const healthSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});`,
      });
    }

    return files;
  },
  scripts: (config) => ({
    dev: config.runtime === 'bun' ? 'bun run --hot src/index.ts' : 'tsx watch src/index.ts',
    build: 'tsup src/index.ts --format esm --dts',
    start: config.runtime === 'bun' ? 'bun src/index.ts' : 'node dist/index.js',
  }),
});
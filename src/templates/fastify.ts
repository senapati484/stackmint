import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';

TEMPLATE_REGISTRY.set('fastify', {

  id: 'fastify',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'Fastify',
      runtime: 'Fastify',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Fast, low-overhead web framework',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      {
        path: 'src/server/public/health.ts',
        content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'fastify',
    timestamp: new Date().toISOString(),
  };
}
`,
      },
      {
        path: 'src/index.ts',
        content: `import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { getHealthPayload } from './server/public/health';

const fastify = Fastify({
  logger: false
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

fastify.get('/', async function(request, reply) {
  reply.type('text/html');
  return landingHTML;
});

fastify.get('/api/health', async function(request, reply) {
  return getHealthPayload();
});

const start = async () => {
  try {
    const port = 3000;
    await fastify.listen({ port });
    console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ES2022',
            moduleResolution: 'bundler',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            outDir: 'dist',
            rootDir: 'src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }, null, 2),
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      getStackmintLogoFile(),
    ];
  },
  scripts: { 
    dev: 'tsx watch src/index.ts', 
    build: 'tsup src/index.ts --format esm --outDir dist',
    start: 'node dist/index.js' 
  },
});

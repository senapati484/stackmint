import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';

TEMPLATE_REGISTRY.set('h3', {

  id: 'h3',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'H3',
      runtime: 'H3',
      styling: 'HTML/CSS',
      build: 'Minimal HTTP',
      detail: 'Cross-runtime, minimal HTTP server',
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
    framework: 'h3',
    timestamp: new Date().toISOString(),
  };
}
`,
      },
      {
        path: 'src/index.ts',
        content: `import { createApp, createRouter, eventHandler } from 'h3';
import { getHealthPayload } from './server/public/health';

const app = createApp();
const router = createRouter();

const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

router.get('/', eventHandler((event) => {
  event.node.res.setHeader('content-type', 'text/html');
  return landingHTML;
}));

router.get('/api/health', eventHandler(() => getHealthPayload()));

app.use(router);

export default app;
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
            resolveJsonModule: true,
            outDir: 'dist',
            rootDir: 'src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist'],
        }, null, 2),
      },
      getStackmintLogoFile(),
      {
        path: 'public/.gitkeep',
        content: '',
      },
    ];
  },
  scripts: { dev: 'listhen -w ./src/index.ts', build: 'tsc', start: 'node dist/index.js' },
});

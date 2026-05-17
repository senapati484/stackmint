import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';

TEMPLATE_REGISTRY.set('nitro', {

  id: 'nitro',
  files: (config: StackConfig): AdapterFile[] => {
    let preset = 'node-server';
    if (config.deployTarget === 'vercel') preset = 'vercel';
    if (config.deployTarget === 'cloudflare-workers') preset = 'cloudflare';

    const landingHTML = getStaticFrontendHTML({
      framework: 'Nitro',
      runtime: 'Nitro',
      styling: 'HTML/CSS',
      build: 'Server Engine',
      detail: 'Next-generation server engine',
      editPath: 'routes/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'stackmint.config.json',
        content: JSON.stringify(config, null, 2),
      },
      {
        path: 'server/public/health.ts',
        content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'nitro',
    timestamp: new Date().toISOString(),
  };
}
`,
      },
      {
        path: 'nitro.config.ts',
        content: `export default defineNitroConfig({
    preset: '${preset}',
    routeRules: {
        '/**': { cors: true }
    }
});
`,
      },
      {
        path: 'routes/index.ts',
        content: `const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
export default defineEventHandler((event) => {
    event.node.res.setHeader('content-type', 'text/html');
    return landingHTML;
});
`,
      },
      {
        path: 'routes/api/health.ts',
        content: `import { getHealthPayload } from '../../server/public/health';

export default defineEventHandler(() => getHealthPayload());
`,
      },
      {
        path: 'middleware/logger.ts',
        content: `export default defineEventHandler(async (event) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(\`\${event.method} \${event.path} - \${duration}ms\`);
});
`,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          extends: './.nuxt/tsconfig.json'
        }, null, 2),
      },
    ];
  },
  scripts: {
    dev: 'nitro dev',
    build: 'nitro build',
    preview: 'nitro preview',
  },
});

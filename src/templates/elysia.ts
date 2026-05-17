import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';
import { buildTestingSetup, buildPlaywrightConfig } from './shared/testing.js';
import { buildDockerfile } from './shared/docker.js';

TEMPLATE_REGISTRY.set('elysia', {

  id: 'elysia',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'Elysia',
      runtime: 'Elysia + Bun',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Blazingly fast Bun web framework',
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
    framework: 'elysia',
    timestamp: new Date().toISOString(),
  };
}
`,
      },
      {
        path: 'src/index.ts',
        content: `import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { getHealthPayload } from "./server/public/health";

const app = new Elysia()
  .use(staticPlugin({
    assets: 'public'
  }))
  .get("/", () => \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)
  .get("/api/health", () => getHealthPayload())
  .listen(3000);

console.log(\`\\n✨ Server running at http://localhost:\${app.server?.port}\\n\`);
`,
      },
      {
        path: 'public/.gitkeep',
        content: '',
      },
      getStackmintLogoFile(),
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            skipLibCheck: true,
            outDir: 'dist',
          },
          include: ['src/**/*'],
        }, null, 2),
      },
    ];
  },
  scripts: { 
    dev: 'bun run --watch src/index.ts', 
    start: 'bun src/index.ts',
    build: 'bun build src/index.ts --outdir dist'
  },
});

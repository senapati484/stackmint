import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('express', {

  id: 'express',
  files: (config: StackConfig): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'Express',
      runtime: 'Express.js',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Production-grade Node.js framework',
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
        content: `export function getHealthPayload(app?: string) {
  return {
    status: 'ok',
    framework: 'express',
    timestamp: new Date().toISOString(),
    ...(app ? { app } : {}),
  };
}
`,
      },
      {
        path: 'src/index.ts',
        content: `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getHealthPayload } from './server/public/health';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

app.get('/', (req, res) => {
  res.send(landingHTML);
});

app.get('/api/health', (req, res) => {
  res.json(getHealthPayload('${config.projectName || 'my-api'}'));
});

app.listen(port, () => {
  console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
});
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
    start: 'node dist/index.js',
  },
});

import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('bun-native', {

  id: 'bun-native',
  files: (): AdapterFile[] => {
    const landingHTML = getStaticFrontendHTML({
      framework: 'Bun',
      runtime: 'Bun Native',
      styling: 'HTML/CSS',
      build: 'Native Server',
      detail: 'Blazingly fast native Bun.serve()',
      editPath: 'src/index.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    });

    return [
      {
        path: 'src/index.ts',
        content: `const landingHTML = \`${landingHTML.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === '/') {
      return new Response(landingHTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        framework: 'bun-native',
        runtime: 'bun',
        timestamp: new Date().toISOString(),
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
});

console.log(\`\\n✨ Server running at http://localhost:3000\\n\`);
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
            lib: ['ES2022'],
          },
          include: ['src/**/*.ts'],
        }, null, 2),
      },
      getStackmintLogoFile(),
      {
        path: 'public/.gitkeep',
        content: '',
      },
    ];
  },
  scripts: { dev: 'bun run --watch src/index.ts', start: 'bun src/index.ts', build: 'bun build src/index.ts --outdir dist' },
});
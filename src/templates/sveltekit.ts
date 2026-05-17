import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('sveltekit', {

  id: 'sveltekit',
  files: (): AdapterFile[] => [
    {
      path: 'src/routes/+layout.svelte',
      content: `<script lang="ts">
  import '../app.css';
</script>

<slot />
`,
    },
    {
      path: 'src/routes/+page.svelte',
      content: `${getStaticFrontendMarkup({
        framework: 'SvelteKit',
        runtime: 'SvelteKit',
        styling: 'Tailwind v4',
        build: 'SSR',
        detail: 'SvelteKit routing, server endpoints, and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'src/routes/+page.svelte',
        actionHref: '/api/health',
        actionLabel: 'Check API health',
      })}
`,
    },
    getStackmintLogoFile(),
    {
      path: 'src/routes/+layout.ts',
      content: `export const load = () => {
    return {};
};
`,
    },
    {
      path: 'src/routes/api/health/+server.ts',
      content: `import { json } from '@sveltejs/kit';

export function GET() {
    return json({
        status: 'ok',
        framework: 'sveltekit',
        timestamp: new Date().toISOString()
    });
}
`,
    },
    {
      path: 'src/lib/index.ts',
      content: '',
    },
    {
      path: 'src/app.html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`,
    },
    {
      path: 'src/app.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'svelte.config.js',
      content: `import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter()
    }
};

export default config;
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    sveltekit(), 
    tailwindcss(),
    {
      name: 'stackmint-port-logger',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const address = server.httpServer?.address();
          const port = typeof address === 'object' ? address?.port : null;
          if (port) {
            console.log(\`\\n✨ Server running at http://localhost:\${port}\\n\`);
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: './.svelte-kit/tsconfig.json',
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          sourceMap: true,
          strict: true,
          moduleResolution: 'bundler'
        }
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'vite dev',
    build: 'svelte-kit sync && vite build',
    preview: 'vite preview',
    check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
  },
});
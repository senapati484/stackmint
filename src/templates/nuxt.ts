import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('nuxt', {

  id: 'nuxt',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'app.vue',
      content: `<template>
  <NuxtPage />
</template>
`,
    },
    getStackmintLogoFile(),
    {
      path: 'pages/index.vue',
      content: `<template>
  ${getStaticFrontendMarkup({
        framework: 'Nuxt',
        runtime: 'Nuxt 3',
        styling: 'Tailwind v4',
        build: 'SSR',
        detail: 'Nuxt pages, server API routes, and Tailwind v4 share the stackmint frontend shell.',
        editPath: 'pages/index.vue',
        actionHref: '/api/health',
        actionLabel: 'Check API health',
      })}
</template>
`,
    },
    {
      path: 'server/public/health.ts',
      content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'nuxt',
    timestamp: new Date().toISOString(),
  };
}
`,
    },
    {
      path: 'server/api/health.get.ts',
      content: `import { getHealthPayload } from '../public/health';

export default defineEventHandler(() => getHealthPayload());
`,
    },
    getStackmintLogoFile(),
    {
      path: 'assets/css/main.css',
      content: `${getFrontendGlobalStyles()}
${getFrontendAppStyles()}`,
    },
    {
      path: 'composables/.gitkeep',
      content: '',
    },
    {
      path: 'components/.gitkeep',
      content: '',
    },
    {
      path: 'nuxt.config.ts',
      content: `import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: true,
    css: ['~/assets/css/main.css'],
    modules: [],
    devServer: {
        port: 3000
    },
    vite: {
        plugins: [
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
        ]
    },
});
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: './.nuxt/tsconfig.json'
      }, null, 2),
    },
  ],
  scripts: {
    dev: 'nuxt dev',
    build: 'nuxt build',
    start: 'node .output/server/index.mjs',
    generate: 'nuxt generate',
  },
});

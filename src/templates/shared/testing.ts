import { StackConfig } from '../../cli/types.js';

export interface TestingFile {
  path: string;
  content: string;
}

export function buildTestingSetup(config: StackConfig): TestingFile[] {
  if (!config.testing?.includes('vitest')) {
    return [];
  }

  const framework = config.framework || '';
  const isReact = framework.includes('react') || framework === 'nextjs' || framework.includes('tanstack');
  const isVue = framework.includes('vue') || framework === 'nuxt';
  const isSvelte = framework.includes('svelte');
  const isSolid = framework.includes('solid');

  const isBackend = ['hono', 'elysia', 'fastify', 'nestjs', 'express', 'nitro', 'h3', 'bun-native'].includes(framework);
  const isFrontend = !isBackend;

  let testEnv = 'node';
  let setupFilesLine = '';
  let imports = "import { defineConfig } from 'vitest/config';\nimport tsconfigPaths from 'vite-tsconfig-paths';\n";
  let plugins = "tsconfigPaths()";

  if (isFrontend) {
    testEnv = isVue ? 'happy-dom' : 'jsdom';
    setupFilesLine = "\n    setupFiles: ['./tests/setup.ts'],";
    if (isReact) {
      imports += "import react from '@vitejs/plugin-react';\n";
      plugins = "react(), tsconfigPaths()";
    } else if (isVue) {
      imports += "import vue from '@vitejs/plugin-vue';\n";
      plugins = "vue(), tsconfigPaths()";
    } else if (isSvelte) {
      imports += "import { svelte } from '@sveltejs/vite-plugin-svelte';\n";
      plugins = "svelte({ hot: !process.env.VITEST }), tsconfigPaths()";
    } else if (isSolid) {
      imports += "import solid from 'vite-plugin-solid';\n";
      plugins = "solid(), tsconfigPaths()";
    }
  }

  let cleanupImport = '';
  let cleanupCall = '';

  if (isReact) {
    cleanupImport = "import '@testing-library/jest-dom';\nimport { cleanup } from '@testing-library/react';\n";
    cleanupCall = "  cleanup();\n";
  } else if (isVue) {
    cleanupImport = "import { cleanup } from '@testing-library/vue';\n";
    cleanupCall = "  cleanup();\n";
  } else if (isSvelte) {
    cleanupImport = "import { cleanup } from '@testing-library/svelte';\n";
    cleanupCall = "  cleanup();\n";
  } else if (isSolid) {
    cleanupImport = "import { cleanup } from '@solidjs/testing-library';\n";
    cleanupCall = "  cleanup();\n";
  }

  const files: TestingFile[] = [
    {
      path: 'vitest.config.ts',
      content: `${imports}
export default defineConfig({
  plugins: [${plugins}],
  test: {
    globals: true,
    environment: '${testEnv}',${setupFilesLine}
    include: ['**/*.test.{ts,tsx,js,jsx}'],
  },
});
`,
    },
  ];

  if (isFrontend) {
    files.push({
      path: 'tests/setup.ts',
      content: `import { beforeEach, afterEach } from 'vitest';
${cleanupImport}
beforeEach(() => {
  // Setup
});

afterEach(() => {
${cleanupCall}});
`,
    });
  }

  return files;
}

export function buildPlaywrightConfig(): TestingFile {
  return {
    path: 'playwright.config.ts',
    content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`,
  };
}
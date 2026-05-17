import { StackConfig } from '../../cli/types.js';

export interface TestingFile {
  path: string;
  content: string;
}

export function buildTestingSetup(config: StackConfig): TestingFile[] {
  if (!config.testing?.includes('vitest')) {
    return [];
  }

  const files: TestingFile[] = [
    {
      path: 'vitest.config.ts',
      content: `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
});
`,
    },
    {
      path: 'tests/setup.ts',
      content: `import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
`,
    },
  ];

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
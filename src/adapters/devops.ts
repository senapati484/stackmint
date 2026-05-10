import { Adapter, AdapterFile, AdapterDependency } from './index.js';

interface StackConfig {
  framework?: string;
  database?: string;
  runtime?: string;
  packageManager?: string;
  deployTarget?: string;
  baas?: string;
  orm?: string;
  auth?: string;
  apiLayer?: string;
  validation?: string;
  styling?: string;
  uiLibrary?: string;
  forms?: string;
  stateManagement?: string;
  dataFetching?: string;
  ai?: string;
  jobs?: string;
  cache?: string;
  email?: string;
  payments?: string;
  testing?: string;
  docker?: boolean;
  githubActions?: boolean;
  husky?: boolean;
  changesets?: boolean;
  turborepo?: boolean;
  aiConfig?: string[];
  category?: string;
  projectName?: string;
  monorepo?: boolean;
  monorepoApps?: string[];
  preset?: string;
  [key: string]: unknown;
}

const PRESET_NAMES = [
  't3-stack', 'saas-nextjs', 'saas-supabase', 'ai-app',
  'api-hono', 'edge-worker', 'content-astro', 'docs-vitepress', 'realtime-convex'
];

export function registerDevOpsAdapters(): void {
  const githubActionsAdapter: Adapter = {
    id: 'github-actions',
    name: 'GitHub Actions',
    files: (): AdapterFile[] => [
      {
        path: '.github/workflows/ci.yml',
        content: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ['20', '22']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test
`,
      },
      {
        path: '.github/workflows/smoke.yml',
        content: `name: Template Smoke Tests

on:
  pull_request:

jobs:
  smoke:
    strategy:
      matrix:
        preset: [${PRESET_NAMES.map(p => `'${p}'`).join(', ')}]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: node bin/stackmint.js --preset \${{ matrix.preset }} --output ./test-\${{ matrix.preset }} --no-install
      - run: cd test-\${{ matrix.preset }} && npx tsc --noEmit
`,
      },
      {
        path: '.github/workflows/release.yml',
        content: `name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - name: Publish to npm
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npm publish --access public
`,
      },
      {
        path: '.github/workflows/ecosystem-check.yml',
        content: `name: Ecosystem Freshness Check

on:
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: node scripts/check-ecosystem.ts
      - if: failure()
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: Ecosystem gap detected — \${{ github.event.inputs.date || new Date().toISOString().split('T')[0] }}
          labels: ecosystem, automated
`,
      },
    ],
    dependencies: () => [],
  };

  const huskyAdapter: Adapter = {
    id: 'husky',
    name: 'Husky',
    files: (): AdapterFile[] => [
      {
        path: '.husky/pre-commit',
        content: `#!/usr/bin/env sh
npx lint-staged
`,
      },
      {
        path: '.lintstagedrc.json',
        content: JSON.stringify({
          '*.{ts,tsx}': ['eslint --fix', 'prettier --write']
        }, null, 2),
      },
    ],
    dependencies: () => [
      { name: 'husky', version: '^9.0.0', dev: true },
      { name: 'lint-staged', version: '^15.0.0', dev: true },
    ],
    postInstall: ['npx husky install'],
  };

  const changesetsAdapter: Adapter = {
    id: 'changesets',
    name: 'Changesets',
    files: (): AdapterFile[] => [
      {
        path: '.changeset/config.json',
        content: JSON.stringify({
          access: 'public',
          baseBranch: 'main',
          updateInternalDependencies: 'patch'
        }, null, 2),
      },
      {
        path: '.changeset/README.md',
        content: `# Changesets\n\nThis directory is for changesets. Changesets are used to track and release changes to this project.\n\n## Adding a changeset\n\n1. Run \`npm run changeset\`\n2. Follow the prompts\n3. Commit the changeset file\n\n## Releasing\n\nWhen merging to main, changesets will automatically be released.\n`,
      },
    ],
    dependencies: () => [
      { name: '@changesets/cli', version: '^2.27.0', dev: true },
    ],
    scripts: {
      changeset: 'changeset',
      version: 'changeset version',
      release: 'npm run build && changeset publish',
    },
  };

  const dockerAdapter: Adapter = {
    id: 'docker',
    name: 'Docker',
    files: (config: StackConfig): AdapterFile[] => {
      const runtime = config.runtime || 'node';
      let nodeVersion = '20';
      if (runtime === 'bun') nodeVersion = 'latest';

      return [
        {
          path: 'Dockerfile',
          content: `FROM ${runtime === 'bun' ? 'oven/bun:latest' : `node:${nodeVersion}-alpine`} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN ${runtime === 'bun' ? 'bun install --frozen-lockfile' : 'npm ci --ignore-scripts'}

FROM ${runtime === 'bun' ? 'oven/bun:latest' : `node:${nodeVersion}-alpine`} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${getBuildCommand(config, runtime)}

FROM ${runtime === 'bun' ? 'oven/bun:latest' : `node:${nodeVersion}-alpine`} AS runner
WORKDIR /app
ENV NODE_ENV=production
${runtime === 'bun' ? '' : 'RUN addgroup --system --gid 1001 nodejs\nRUN adduser --system --uid 1001 nodejs\n'}
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
USER nodejs
EXPOSE 3000
CMD ${getStartCommand(config, runtime)}
`,
        },
        {
          path: '.dockerignore',
          content: `node_modules
.next
.env
.env.local
.env.*
dist
coverage
.git
*.log
`,
        },
      ];
    },
    dependencies: () => [],
  };

  const turborepoAdapter: Adapter = {
    id: 'turborepo',
    name: 'Turborepo',
    files: (): AdapterFile[] => [
      {
        path: 'turbo.json',
        content: JSON.stringify({
          $schema: 'https://turbo.build/schema.json',
          tasks: {
            build: {
              dependsOn: ['^build'],
              outputs: ['dist/**', '.next/**'],
            },
            test: {
              dependsOn: ['^build'],
              outputs: ['coverage/**'],
            },
            lint: {
              outputs: [],
            },
            dev: {
              cache: false,
              persistent: true,
            },
          },
        }, null, 2),
      },
      {
        path: 'packages/.gitkeep',
        content: '',
      },
    ],
    dependencies: () => [
      { name: 'turbo', version: '^2.0.0', dev: true },
    ],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('github-actions', githubActionsAdapter);
  ADAPTER_REGISTRY.set('husky', huskyAdapter);
  ADAPTER_REGISTRY.set('changesets', changesetsAdapter);
  ADAPTER_REGISTRY.set('docker', dockerAdapter);
  ADAPTER_REGISTRY.set('turborepo', turborepoAdapter);
}

function getBuildCommand(config: StackConfig, runtime: string): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return runtime === 'bun' ? 'bun run build' : 'npm run build';
  if (framework === 'sveltekit') return runtime === 'bun' ? 'bun run build' : 'npm run build';
  if (framework === 'nuxt') return runtime === 'bun' ? 'bun run build' : 'npm run build';
  if (framework === 'hono' || framework === 'elysia') {
    return runtime === 'bun' ? 'bun run build' : 'npm run build';
  }
  return runtime === 'bun' ? 'bun run build' : 'npm run build';
}

function getStartCommand(config: StackConfig, runtime: string): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'npm start';
  if (framework === 'hono' || framework === 'elysia') {
    return runtime === 'bun' ? 'bun run start' : 'node dist/index.js';
  }
  return runtime === 'bun' ? 'bun run start' : 'npm start';
}

export function initDevOpsAdapters(): void {
  registerDevOpsAdapters();
}
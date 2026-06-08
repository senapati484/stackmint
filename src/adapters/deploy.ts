import { StackConfig, Adapter, AdapterFile, ADAPTER_REGISTRY } from './index.js';
import { generateDockerfileContent } from './shared/docker.js';

const FRAMEWORK_VERCEL_MAP: Record<string, string> = {
  nextjs: 'nextjs',
  sveltekit: 'sveltekit',
  nuxt: 'nuxt',
  'react-router-v7': 'remix',
  astro: 'astro',
  analog: 'angular',
};

export function registerDeployAdapters(): void {
  const vercelAdapter: Adapter = {
    id: 'deploy-vercel',
    name: 'Vercel',
    files: (config: StackConfig): AdapterFile[] => {
      const framework = FRAMEWORK_VERCEL_MAP[config.framework || ''] || 'vercel';

      return [
        {
          path: 'vercel.json',
          content: JSON.stringify(
            {
              framework: framework,
              buildCommand: getBuildCommand(config),
              devCommand: getDevCommand(config),
              installCommand: getInstallCommand(config.packageManager || 'npm'),
              regions: ['iad1'],
              ...(config.framework === 'nextjs' && {
                functions: {
                  'src/app/api/**': {
                    maxDuration: 30,
                  },
                },
              }),
            },
            null,
            2
          ),
        },
      ];
    },
    dependencies: () => [],
  };

  const cloudflareAdapter: Adapter = {
    id: 'deploy-cloudflare',
    name: 'Cloudflare Workers',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'wrangler.toml',
        content: `name = "${config.projectName || 'my-worker'}"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "${getBuildCommand(config) || 'npm run build'}"

# Uncomment as needed:
# [[kv_namespaces]]
# binding = "KV"

# [[d1_databases]]
# binding = "DB"
# database_name = "my-db"
# database_id = "xxxx-xxxx-xxxx"

# [[r2_buckets]]
# binding = "BUCKET"
# bucket_name = "my-bucket"
`,
      },
    ],
    dependencies: () => [
      { name: 'wrangler', version: '^3.0.0', dev: true },
    ],
  };

  const flyioAdapter: Adapter = {
    id: 'deploy-flyio',
    name: 'Fly.io',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'fly.toml',
        content: `app = "${config.projectName || 'my-app'}"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_lb = true
  auto_start = true
  min_machines_running = 0
  max_machines_running = 3

  [[http_service.checks]]
    interval = "10s"
    timeout = "2s"
    method = "GET"
    path = "/api/health"
`,
      },
      {
        path: 'Dockerfile',
        content: generateDockerfileContent({
          runtime: config.runtime || 'node',
          buildCommand: getBuildCommand(config),
          startCommand: config.runtime === 'bun' ? '["bun", "src/index.ts"]' : '["node", "dist/index.js"]',
        }),
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
    ],
    dependencies: () => [],
  };

  const railwayAdapter: Adapter = {
    id: 'deploy-railway',
    name: 'Railway',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'railway.toml',
        content: `[build]
builder = "NIXPACKS"

[deploy]
startCommand = "${getStartCommand(config) || 'npm start'}"
`,
      },
      {
        path: 'Procfile',
        content: `web: ${getStartCommand(config) || 'npm start'}
`,
      },
    ],
    dependencies: () => [],
  };


  ADAPTER_REGISTRY.set('deploy-vercel', vercelAdapter);
  ADAPTER_REGISTRY.set('deploy-cloudflare', cloudflareAdapter);
  ADAPTER_REGISTRY.set('deploy-flyio', flyioAdapter);
  ADAPTER_REGISTRY.set('deploy-railway', railwayAdapter);
}

function getBuildCommand(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'npm run build';
  if (framework === 'sveltekit') return 'npm run build';
  if (framework === 'nuxt') return 'npm run build';
  if (framework === 'astro') return 'npm run build';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run build' : 'npm run build';
  }
  return 'npm run build';
}

function getDevCommand(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'npm run dev';
  if (framework === 'sveltekit') return 'npm run dev';
  if (framework === 'nuxt') return 'npm run dev';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run dev' : 'npm run dev';
  }
  return 'npm run dev';
}

function getInstallCommand(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'pnpm install';
    case 'yarn': return 'yarn install';
    case 'bun': return 'bun install';
    default: return 'npm install';
  }
}

function getStartCommand(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'npm start';
  if (framework === 'hono' || framework === 'elysia') return 'node dist/index.js';
  return 'npm start';
}

export function initDeployAdapters(): void {
  registerDeployAdapters();
}
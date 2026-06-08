import { StackConfig } from '../index.js';

export interface DockerfileOptions {
  runtime: string;
  buildCommand: string;
  startCommand: string;
  nodeVersion?: string;
}

export function generateDockerfileContent(opts: DockerfileOptions): string {
  const runtime = opts.runtime || 'node';
  const baseImage = runtime === 'bun' ? 'oven/bun:latest' : `node:${opts.nodeVersion || '20'}-alpine`;

  return `FROM ${baseImage} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN ${runtime === 'bun' ? 'bun install --frozen-lockfile' : 'npm ci --ignore-scripts'}

FROM ${baseImage} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${opts.buildCommand}

FROM ${baseImage} AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs 2>/dev/null || true
RUN adduser --system --uid 1001 nodejs 2>/dev/null || true

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs
EXPOSE 3000
CMD ${opts.startCommand}
`;
}

export function getDockerBuildCommand(config: StackConfig): string {
  const framework = config.framework || '';
  const runtime = config.runtime || 'node';
  const cmd = runtime === 'bun' ? 'bun run build' : 'npm run build';
  if (framework.startsWith('next')) return cmd;
  if (framework === 'sveltekit') return cmd;
  if (framework === 'nuxt') return cmd;
  return cmd;
}

export function getDockerStartCommand(config: StackConfig): string {
  const framework = config.framework || '';
  const runtime = config.runtime || 'node';
  if (framework.startsWith('next')) return runtime === 'bun' ? '["bun", "server.js"]' : '["node", "server.js"]';
  if (framework === 'hono' || framework === 'elysia') {
    return runtime === 'bun' ? '["bun", "src/index.ts"]' : '["node", "dist/index.js"]';
  }
  return runtime === 'bun' ? '["bun", "src/index.ts"]' : '["node", "dist/index.js"]';
}

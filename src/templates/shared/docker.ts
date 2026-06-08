import { StackConfig } from '../../cli/types.js';

export interface DockerfileFile {
  path: string;
  content: string;
}

export function buildDockerfile(config: StackConfig): DockerfileFile | null {
  if (!config.docker) {
    return null;
  }

  const framework = config.framework;
  const nodeVersion = '20-alpine';

  switch (framework) {
    case 'nextjs':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
`,
      };

    case 'sveltekit':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "build/index.js"]
`,
      };

    case 'nuxt':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
ENV PORT=3000 NITRO_PRESET=node-server
CMD ["node", ".output/server/index.mjs"]
`,
      };

    case 'react-router-v7':
    case 'analog':
    case 'tanstack-start':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/server/index.js"]
`,
      };

    case 'astro-ssr':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/server/entry.mjs"]
`,
      };

    case 'nestjs':
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${nodeVersion} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${nodeVersion} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/main.js"]
`,
      };

    default:
      return {
        path: 'Dockerfile',
        content: `# syntax=docker/dockerfile:1
FROM node:${nodeVersion}
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`,
      };
  }
}
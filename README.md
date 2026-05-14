[![stackmint Logo](/public/img/logo.png)](https://github.com/senapati484/stackmint)

[![CI](https://github.com/senapati484/stackmint/actions/workflows/ci.yml/badge.svg)](https://github.com/senapati484/stackmint/actions/workflows/ci.yml)
[![Template Smoke Tests](https://github.com/senapati484/stackmint/actions/workflows/smoke.yml/badge.svg)](https://github.com/senapati484/stackmint/actions/workflows/smoke.yml)
[![NPM Version](https://img.shields.io/npm/v/stackmint.svg)](https://www.npmjs.com/package/stackmint)
[![NPM Downloads](https://img.shields.io/npm/dm/stackmint.svg)](https://www.npmjs.com/package/stackmint)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/stackmint)](https://bundlephobia.com/package/stackmint)
[![GitHub stars](https://img.shields.io/github/stars/senapati484/stackmint)](https://github.com/senapati484/stackmint/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/senapati484/stackmint)](https://github.com/senapati484/stackmint/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/senapati484/stackmint)](https://github.com/senapati484/stackmint/commits/main)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/senapati484/stackmint)](https://github.com/senapati484/stackmint/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Scaffold any TypeScript full-stack project in seconds.

```bash
npx stackmint
# or
npm create stackmint@latest
```

## Features

- **34+ frameworks** supported
- **50+ integrations** (ORMs, auth, AI, payments, etc.)
- **13+ presets** for common stacks
- **11+ AI IDE configs** (Claude Code, OpenCode, Cursor, Copilot, Windsurf, Continue.dev, Sourcegraph Cody, and more)
- **Conflict resolution** with smart defaults

## Quick Start

```bash
# Interactive mode
npx stackmint

# Use a preset
npx stackmint --preset t3-stack

# Skip dependency installation
npx stackmint --preset saas-nextjs --no-install

# List all presets
npx stackmint --list-presets
```

## Available Presets

| Preset | Framework | Key Add-ons |
|--------|-----------|-------------|
| `react-vite` | React + Vite | Tailwind CSS + Vitest |
| `vue-vite` | Vue + Vite | Tailwind CSS + Vitest |
| `svelte-vite` | Svelte + Vite | Tailwind CSS + Vitest |
| `solid-vite` | Solid + Vite | Tailwind CSS + Vitest |
| `api-hono` | Hono | Drizzle + Zod + Tailwind |
| `t3-stack` | Next.js 15 | tRPC + Drizzle + Tailwind + shadcn/ui + Zod + Better Auth |
| `saas-nextjs` | Next.js 15 | Better Auth + Drizzle + Stripe + Resend + RHF |
| `saas-supabase` | Next.js 15 | Supabase + Stripe + Resend + shadcn/ui |
| `ai-app` | Next.js 15 | Vercel AI SDK + Drizzle + Tailwind |
| `edge-worker` | Hono | Turso + Upstash + Cloudflare Workers |
| `content-astro` | Astro SSG | Tailwind CSS + Vitest |
| `docs-vitepress` | VitePress | Minimal docs setup |
| `realtime-convex` | Next.js 15 | Convex + shadcn/ui + TanStack Query |

## CLI Options

```
npx stackmint [project-name] [options]

Options:
  --preset <name>          Use a named preset (skip interactive questions)
  --list-presets           List all available presets and exit
  --pm <manager>           Package manager: npm | pnpm | bun | yarn
  --no-install             Scaffold files only, skip dependency installation
  --yes                    Accept all defaults (non-interactive mode)
  --output <dir>           Output directory
  --version, -v            Show version
  --help, -h               Show help
```

## Supported Frameworks

| Category | Frameworks |
|----------|------------|
| Full-stack | Next.js, SvelteKit, Nuxt, React Router v7, Astro, Analog, TanStack Start |
| SPA | React + Vite, Vue + Vite, Solid + Vite, Svelte + Vite, Qwik, Angular |
| Backend | Hono, Elysia, Fastify, NestJS, Express, Nitro, H3, Bun Native |
| Mobile | Expo SDK 53, React Native CLI |
| Content | Astro, VitePress, Docusaurus, Eleventy |

## Supported Integrations

- **Database**: PostgreSQL, MySQL, SQLite, MongoDB, Turso, Neon
- **ORM**: Drizzle, Prisma
- **BaaS**: Supabase, Convex, Firebase
- **Auth**: Better Auth, Clerk, NextAuth
- **API**: tRPC, oRPC, ts-rest, GraphQL
- **Validation**: Zod, Valibot, ArkType
- **Styling**: Tailwind CSS, Panda CSS, StyleX
- **UI**: shadcn/ui, Radix UI, Ark UI
- **AI**: Vercel AI SDK, LangChain.js, Mastra
- **Jobs**: Inngest, BullMQ, Trigger.dev
- **Payments**: Stripe
- **Email**: Resend, Nodemailer

## AI IDE Support

| AI IDE | Config File |
|--------|-------------|
| Claude Code / OpenCode | `AGENTS.md` (auto-generated) |
| Cursor | `.cursor/rules/stack.mdc` |
| OpenCode | `.opencode/CLAUDE.md` |
| Continue.dev | `.continue/config.json` |
| Sourcegraph Cody | `.cody/commands.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurf/rules.md` |
| Replit Agent | `.replit` + `REPLIT.md` |
| Kotata | `.kotata/context.md` |
| LLM Coding | `.claude/llm-conventions.md` |
| Devin | `.devin/context.md` |

## How It Works

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Questions  │ -> │ Conflict Check  │ -> │   Generate   │
│  (CLI)      │    │  (21 rules)     │    │  (Templates) │
└─────────────┘    └─────────────────┘    └──────────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │     Adapters        │
                                    │ (files + deps)      │
                                    └─────────────────────┘
```

## Local Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Generate a project
node dist/stackmint.js --preset t3-stack
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Adding new framework templates
- Adding new adapters
- Adding new presets
- Local dev setup

## License

MIT
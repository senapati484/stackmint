# AI Agent Context — t3-stack

This file provides context to AI coding assistants (Claude Code, OpenCode, and other AI IDEs).

## Stack Overview
- Framework: nextjs
- Database: postgres
- ORM: drizzle
- Auth: better-auth
- API: trpc
- Validation: zod
- Styling: tailwind
- UI: shadcn

## Key Conventions
- Database queries use Drizzle ORM — no raw SQL unless in migrations
- All external data must be validated with Zod before use
- Use Tailwind utility classes — no inline styles, no CSS files except globals.css
- API calls go through trpc — no direct fetch to /api routes
- TypeScript: strict mode, no any
- Never commit .env files

## Do Not
- Never use require() — ESM only
- Never commit .env files
- Never use Pages Router (for Next.js)

## Common Commands
- `dev`
- `build`
- `start`
- `db:generate`
- `db:migrate`
- `db:push`
- `test`

## Framework-specific Notes
- Use App Router (src/app/), not Pages Router
- Server Components by default, add 'use client' only when needed
- Use Next.js App Router patterns for data fetching

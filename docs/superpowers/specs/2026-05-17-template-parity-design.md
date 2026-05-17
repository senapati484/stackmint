# Template Parity (Next.js as Reference)

## Goal

Standardize stackmint templates so they feel consistently “stackmint-quality” regardless of framework, using the Next.js template as the reference point, while preserving each framework’s idioms and runtime expectations.

This parity work is scoped to template output only. Adapters continue to be the mechanism for optional integrations (auth/db/testing/devops/etc.), but templates should provide consistent “mount points” and baseline capabilities so adapters integrate predictably.

## Non-Goals

- Forcing identical folder structures across frameworks when the framework has a canonical structure (Nuxt `server/`, Nitro `routes/`, SvelteKit `src/routes`, Astro `src/pages/api`, etc.).
- Introducing heavy dependencies into the CLI or templates solely for parity.
- Refactoring the generator architecture (Registry & Adapter pattern remains unchanged).

## Parity Checklist

### Root Artifacts (All Templates)

- Emit `stackmint.config.json` containing the resolved `StackConfig` (same behavior as Next.js).
- Emit the stackmint logo asset (already handled by `getStackmintLogoFile()` in most templates).

### Frontend Shell (Templates With UI)

- Use the shared stackmint frontend shell (shared markup + shared styles) as the landing page content.
- Ensure the primary action link points to `/api/health` (or the framework-equivalent path when the framework cannot support that URL).

### API Baseline (Templates With Server/API)

- Provide a public health endpoint at `/api/health` returning a JSON payload with:
  - `status: "ok"`
  - `framework: <template id>`
  - `timestamp: <ISO string>`
- Organize routes by intent where the framework allows it without changing URLs:
  - “public” routes (health, webhooks, unauthenticated endpoints)
  - “auth” routes (auth handlers/callbacks)
  - “internal” routes (admin/metrics, behind auth)

Implementation mapping by routing model:
- **Route-group capable without URL changes**: Next.js App Router `(public)/(auth)`; SvelteKit route groups via parenthesized directories.
- **Filesystem routing but grouping changes URLs** (Nuxt/Nitro/Astro): keep the route file path stable for `/api/health`, but move logic into `server/public/*` or `src/server/public/*` and keep the route file as a thin wrapper.
- **Code-routed servers** (Hono/Express/Fastify/H3/Bun/Elysia): split route registration into modules like `src/server/public.ts`, `src/server/auth.ts`, and import/register from `src/index.ts`.

### Tooling & Scripts (All Templates, Closest Equivalent)

- Keep script keys consistent where possible:
  - `dev`, `build`, and either `start` or `preview` depending on framework convention.
  - `check` if the framework has a standard check step.
- Prefer strict TypeScript settings, but do not break framework-required `tsconfig` extends.

### Integration Readiness (Template Side Only)

Templates should include predictable “mount points” so adapters can add files with minimal overwrite:
- A consistent “lib” space (prefer `src/lib/*` where idiomatic).
- A consistent “server” space (framework-native equivalent acceptable) for server-side glue code.
- A consistent place for environment configuration guidance (at minimum `.env.example` is handled by writer from collected env vars; templates may add baseline env only when needed).

## Implementation Plan (Incremental Passes)

### Pass 1: Baseline Consistency

- Add `stackmint.config.json` to every template’s file list.
- Ensure every template’s UI CTA points to `/api/health`.
- Ensure every template exposes `/api/health`, adjusting framework-specific health paths where currently inconsistent.

### Pass 2: Route Organization

- Apply public/auth/internal organization per framework mapping above without changing URLs.

### Pass 3: Tooling Parity

- Normalize script keys where possible and align minimal configs (without breaking frameworks).

## Verification

- Run `npm run typecheck` for the CLI codebase after each pass.
- Run existing template/integration tests where applicable (`npm run test`, `npm run test:frameworks`, or existing smoke tests).


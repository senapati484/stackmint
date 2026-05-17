# Template Parity v2 (Next.js as Reference)

## Goal

Make every StackMint template feel “Next.js-quality” at the baseline without forcing Next.js internals on other frameworks. Parity is defined as consistent baseline artifacts, UX, and predictable mount points, while integrations remain framework-idiomatic and are skipped cleanly when unsupported.

## Success Criteria (Template Parity)

For every framework template:

- Emits `stackmint.config.json` with the resolved `StackConfig`.
- Emits the StackMint logo asset.
- Provides a consistent “stackmint shell” landing experience (shared layout/styling where applicable).
- Uses the generated StackMint config library to drive the landing “signals” (where a UI exists and the template is TypeScript-capable).

For server-capable templates:

- Exposes a public health endpoint at `/api/health` returning a JSON payload with:
  - `status: "ok"`
  - `framework: <template id>`
  - `timestamp: <ISO string>`
- Keeps route URLs stable; grouping/organization should not change URL shape.

For integrations (adapters):

- No framework should receive broken/invalid dependencies or files due to an unsupported integration.
- Unsupported integrations are skipped (no partial/placeholder output unless explicitly requested).

## Non-Goals

- Enforcing identical folder structures across frameworks when the framework has canonical conventions.
- Guaranteeing “deep integration parity” (e.g., Next.js middleware/auth routes/provider trees) across every framework.
- Implementing identical auth/db/api behaviors across all frameworks when the framework/runtime model differs.

## Design Principles

- **Framework-idiomatic output:** templates should use the framework’s conventional routing and entry points.
- **Stable mount points:** each template should expose predictable places where future adapters can integrate without full-file overwrites.
- **Adapter safety:** adapters must not “leak” framework-specific deps/files into other frameworks.
- **Thin wrapper routes:** for file-system routing frameworks, keep `/api/health` as a thin route wrapper, and place shared logic in a stable module (e.g., `src/server/public/health.ts`).

## Capability Matrix (High-Level)

### UI Templates (SPA or SSR)

Baseline:

- Landing page uses StackMint shell + config-driven signals.
- Consistent “primary CTA”:
  - Server-capable UI templates: CTA points to `/api/health`.
  - Frontend-only templates: CTA remains “Open docs”.

Mount points by framework family:

- Next.js: `src/app/layout.tsx`, provider components, optional middleware.
- React Router v7: root document (`app/root.tsx`) + route modules (`app/routes/*`).
- TanStack Start: root route + generated route tree + `app/router.tsx`.
- SvelteKit: `src/routes/+layout.svelte` and `src/routes/(public)/api/*`.
- Nuxt: `app.vue` + `server/api/*` or equivalent with server-side modules.
- Angular/Analog: `AppComponent` + `src/server/routes/api/*` (Analog) when server-capable.
- Astro:
  - SSR: `/api/health` as server endpoint.
  - SSG: no API; CTA remains docs.

### Code-Routed Servers

Baseline:

- `/api/health` implemented in the main server/router.
- `src/server/public/health.ts` contains the payload generator.

Examples: Express, Fastify, Hono, H3, Elysia, Bun-native, Nitro.

## Adapter Safety Design

### Current Problem

Some adapters add framework-specific dependencies or files even when the framework cannot use them.

### Required Behavior

- Each adapter should define a `condition(config)` expressing applicability.
- The generator must apply adapters only if `condition(config)` is true.

### Implementation Notes

- Treat `condition` as an **applicability gate** (not just auto-activation).
- For framework-limited adapters:
  - set `condition` to supported frameworks
  - and ensure `dependencies()` and `files()` return `[]` when unsupported

## Incremental Execution Plan

### Wave 1 — Generator/Adapter Gating

- Enforce `adapter.condition` during adapter application so unsupported adapters are skipped.
- Add/update `condition` on framework-specific adapters so they cannot break other frameworks.

### Wave 2 — Health Endpoint Parity

- Add `/api/health` to any server-capable template that lacks it.
- Ensure the UI CTA points to `/api/health` only for server-capable templates.

### Wave 3 — Config-Driven Landing Signals

- Ensure templates with a UI and TypeScript support derive landing signals from the generated StackMint config library.
- Do not attempt runtime-dynamic config on purely static outputs; config is compile-time for those frameworks.

### Wave 4 — Minimal Script Parity (Optional)

- Where idiomatic, add `typecheck`/`check` script aliases without breaking framework conventions.

## Verification

- CLI repository: `npm run typecheck`, `npm run test:smoke`.
- Framework generation smoke: `npm run test:frameworks`.
- Integration smoke (when available): `npm run test:integration` (expected skips remain skips).


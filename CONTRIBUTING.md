# Contributing to Stackmint

First off, thank you for considering contributing to Stackmint! It's people like you that make Stackmint a great tool for the community.

## Development Setup

Stackmint is built using [Bun](https://bun.sh/). Please ensure you have Bun installed on your system. We do not use npm, yarn, or pnpm for local development.

1. Clone the repository:
   ```bash
   git clone https://github.com/senapati484/stackmint.git
   cd stackmint
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run the CLI in development mode:
   ```bash
   bun run dev
   ```

### Testing
We have a comprehensive test suite to ensure templates and adapters generate valid projects. Please run these tests before submitting a PR.
- `bun run test` - Run unit tests using vitest
- `bun run test:smoke` - Run smoke tests
- `bun run test:frameworks` - Run framework tests
- `bun run test:integration` - Run integration tests

### Build
To build the CLI for production (this generates the `dist/` folder):
```bash
bun run build
```
Note: The build process automatically embeds the Stackmint logo and prepares the executable.

## Architecture

Stackmint has a modular architecture designed to scaffold any TypeScript full-stack project smoothly.

- **`src/cli/`**: Contains the CLI prompts, parsing logic, and execution flow.
- **`src/core/`**: Core logic for generation, conflict resolution, and applying adapters.
- **`src/templates/`**: Base template definitions for each supported framework (e.g., Next.js, React, Astro, Hono).
- **`src/adapters/`**: Adapters that modify files or add dependencies for specific features (e.g., Tailwind, Drizzle, tRPC).
- **`src/presets/`**: Pre-defined combinations of frameworks and adapters to skip manual questions.

## How to Contribute

### 1. Adding a new Framework Template
Framework templates form the base of a generated project. They are located in `src/templates/`. To add a new framework:
1. Define a new `FrameworkTemplate` block in `src/templates/index.ts` (or add a separate file and import it).
2. Implement the `files`, `scripts`, and `dependencies` functions for your framework.
3. Ensure you provide a consistent base UI (Stackmint shell) similar to other templates to maintain the standard look and feel.

### 2. Adding a new Adapter
Adapters inject specific libraries or tools into the generated project (e.g., adding an ORM, an Auth provider, or a styling library). They are located in `src/adapters/`.
1. Create or modify an adapter file (e.g., `src/adapters/database.ts` or `src/adapters/ui-library.ts`).
2. Add the required dependencies and any file modifications (like creating configuration files or wrapping app components).
3. Hook your adapter into the generator core if necessary.

### 3. Adding a new Preset
Presets are fast-tracks for common stacks. They are defined in `src/presets/index.ts`. To add a preset:
1. Add a new configuration key to the `PRESETS` object.
2. Specify the framework and the various features you want included (e.g., `styling: 'tailwind'`, `orm: 'drizzle'`).
3. Update `presetDescriptions` inside the `listPresets` function to accurately describe your new preset so users know what it includes.

## Pull Request Guidelines
- Follow the existing coding style and naming conventions.
- Run `bun run typecheck` to verify TypeScript typings.
- Ensure all tests pass (`bun run test:smoke`, `bun run test:integration`, etc.).
- Write clear, descriptive commit messages and Pull Request descriptions.

## AI Code Assistants
If you are using AI code assistants (like Claude, Cursor, Copilot, etc.) to contribute to Stackmint, please refer to the `CLAUDE.md` and related `.cursor/rules` files. Stackmint has very specific constraints (like preferring `Bun` APIs over standard node APIs, e.g., `Bun.serve()`, `Bun.file`, `bun test`) which should be followed.

## License
By contributing to Stackmint, you agree that your contributions will be licensed under its MIT License.

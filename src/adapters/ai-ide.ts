import { StackConfig, Adapter, AdapterFile, ADAPTER_REGISTRY } from './index.js';

export function generateStackContext(config: StackConfig): string {
  const techs: string[] = [];

  if (config.framework) techs.push(`Framework: ${config.framework}`);
  if (config.database && config.database !== 'none') techs.push(`Database: ${config.database}`);
  if (config.orm && config.orm !== 'none') techs.push(`ORM: ${config.orm}`);
  if (config.baas && config.baas !== 'none') techs.push(`BaaS: ${config.baas}`);
  if (config.auth && config.auth !== 'none') techs.push(`Auth: ${config.auth}`);
  if (config.apiLayer && config.apiLayer !== 'none') techs.push(`API: ${config.apiLayer}`);
  if (config.validation && config.validation !== 'none') techs.push(`Validation: ${config.validation}`);
  if (config.styling && config.styling !== 'none') techs.push(`Styling: ${config.styling}`);
  if (config.uiLibrary && config.uiLibrary !== 'none') techs.push(`UI: ${config.uiLibrary}`);
  if (config.ai && config.ai !== 'none') techs.push(`AI: ${config.ai}`);
  if (config.jobs && config.jobs !== 'none') techs.push(`Jobs: ${config.jobs}`);
  if (config.email && config.email !== 'none') techs.push(`Email: ${config.email}`);
  if (config.payments && config.payments !== 'none') techs.push(`Payments: ${config.payments}`);

  const conventions: string[] = [];

  if (config.packageManager) {
    conventions.push(`Package manager: ${config.packageManager} (always use this, never npm/yarn/pnpm/bun interchangeably)`);
  }

  if (config.orm === 'drizzle') {
    conventions.push('Database queries use Drizzle ORM — no raw SQL unless in migrations');
  }

  if (config.validation === 'zod') {
    conventions.push('All external data must be validated with Zod before use');
  }

  if (config.styling === 'tailwind') {
    conventions.push('Use Tailwind utility classes — no inline styles, no CSS files except globals.css');
  }

  if (config.apiLayer === 'trpc' || config.apiLayer === 'orpc') {
    conventions.push(`API calls go through ${config.apiLayer} — no direct fetch to /api routes`);
  }

  conventions.push('TypeScript: strict mode, no any');
  conventions.push('Never commit .env files');

  let context = `## Stack Overview\n${techs.map(t => `- ${t}`).join('\n')}\n`;
  context += `\n## Key Conventions\n${conventions.map(c => `- ${c}`).join('\n')}\n`;
  context += `\n## Do Not\n- Never use require() — ESM only\n- Never commit .env files\n- Never use Pages Router (for Next.js)\n`;

  return context;
}

export function registerAIIDEAdapters(): void {

  // AGENTS.md - Primary context file (always generated, used by Claude Code and OpenCode)
  ADAPTER_REGISTRY.set('claude-code', {
    id: 'claude-code',
    name: 'Claude Code / OpenCode Context',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'AGENTS.md',
        content: generateAGENTSMdContent(config),
      },
    ],
    dependencies: () => [],
  });

  // Cursor Rules
  ADAPTER_REGISTRY.set('cursor', {
    id: 'cursor',
    name: 'Cursor Rules',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.cursor/rules/stack.mdc',
        content: `---\nalwaysApply: true\n---\n\n${generateStackContext(config)}\n`,
      },
      {
        path: '.cursor/rules/no-antipatterns.mdc',
        content: getAntiPatterns(config),
      },
    ],
    dependencies: () => [],
  });

  // OpenCode (uses AGENTS.md by default, but also supports .opencode/ directory)
  ADAPTER_REGISTRY.set('opencode', {
    id: 'opencode',
    name: 'OpenCode',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.opencode/CLAUDE.md',
        content: `# OpenCode Context — ${config.projectName || 'Project'}\n\n${generateStackContext(config)}\n\n${generateCommands(config)}`,
      },
    ],
    dependencies: () => [],
  });

  // Continue.dev (VS Code / JetBrains extension)
  ADAPTER_REGISTRY.set('continue', {
    id: 'continue',
    name: 'Continue.dev',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.continue/config.json',
        content: generateContinueConfig(config),
      },
    ],
    dependencies: () => [],
  });

  // Sourcegraph Cody
  ADAPTER_REGISTRY.set('sourcegraph', {
    id: 'sourcegraph',
    name: 'Sourcegraph Cody',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.cody/commands.json',
        content: generateCodyCommands(config),
      },
    ],
    dependencies: () => [],
  });

  // GitHub Copilot
  ADAPTER_REGISTRY.set('copilot', {
    id: 'copilot',
    name: 'GitHub Copilot',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.github/copilot-instructions.md',
        content: `# Stack Context for GitHub Copilot\n\n${generateStackContext(config)}\n`,
      },
    ],
    dependencies: () => [],
  });

  // Windsurf
  ADAPTER_REGISTRY.set('windsurf', {
    id: 'windsurf',
    name: 'Windsurf',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.windsurf/rules.md',
        content: `# Stack Rules\n\n${generateStackContext(config)}\n`,
      },
    ],
    dependencies: () => [],
  });

  // Replit Agent
  ADAPTER_REGISTRY.set('replit', {
    id: 'replit',
    name: 'Replit Agent',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.replit',
        content: `run = "${getDevCommand(config)}"\nmodules = ["nodejs-20"]\n[nix]\nchannel = "stable-23_05"\n`,
      },
      {
        path: 'REPLIT.md',
        content: `# Replit Context\n\n${generateStackContext(config)}\n`,
      },
    ],
    dependencies: () => [],
  });

  // Kotata AI
  ADAPTER_REGISTRY.set('kotata', {
    id: 'kotata',
    name: 'Kotata',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.kotata/context.md',
        content: `# Kotata AI Context\n\n${generateStackContext(config)}\n`,
      },
    ],
    dependencies: () => [],
  });

  // Generic LLM Coding Conventions
  ADAPTER_REGISTRY.set('llm-code', {
    id: 'llm-code',
    name: 'LLM Coding Conventions',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.claude/llm-conventions.md',
        content: `# LLM Coding Conventions\n\n## Stack\n${generateStackContext(config)}\n\n## Coding Rules\n1. TypeScript strict mode - no \`any\`\n2. ESM modules only - no \`require()\`\n3. Use Zod for all external data validation\n4. Follow framework conventions (App Router for Next.js, etc.)\n5. Test coverage required for new features\n6. No inline styles - use Tailwind or CSS modules\n7. Never commit .env files\n`,
      },
    ],
    dependencies: () => [],
  });

  // Devin (Cognition AI)
  ADAPTER_REGISTRY.set('devin', {
    id: 'devin',
    name: 'Devin (Cognition)',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: '.devin/context.md',
        content: `# Devin AI Agent Context\n\n## Project: ${config.projectName || 'Project'}\n\n${generateStackContext(config)}\n\n${generateCommands(config)}\n\n## Task Guidelines\n- Break down complex tasks into smaller steps\n- Write tests before implementing features\n- Follow existing code patterns\n- Commit frequently with descriptive messages\n- Update documentation when changing APIs\n`,
      },
    ],
    dependencies: () => [],
  });
}

function generateAGENTSMdContent(config: StackConfig): string {
  const context = generateStackContext(config);

  let content = `# AI Agent Context — ${config.projectName || 'Project'}\n\n`;
  content += `This file provides context to AI coding assistants (Claude Code, OpenCode, and other AI IDEs).\n\n`;
  content += context;
  content += generateCommands(config);

  if (config.framework === 'nextjs') {
    content += `\n## Framework-specific Notes\n`;
    content += `- Use App Router (src/app/), not Pages Router\n`;
    content += `- Server Components by default, add 'use client' only when needed\n`;
    content += `- Use Next.js App Router patterns for data fetching\n`;
  }

  if (config.baas === 'convex') {
    content += `\n## Framework-specific Notes\n`;
    content += `- Write server functions in convex/ directory\n`;
    content += `- Use useQuery and useMutation from 'convex/react'\n`;
    content += `- Convex replaces ORM, database, and API layer\n`;
  }

  if (config.framework?.startsWith('hono') || config.framework === 'elysia') {
    content += `\n## Framework-specific Notes\n`;
    content += `- Hono/Elysia uses lightweight routing\n`;
    content += `- Middleware is applied with \`app.use()\`\n`;
    content += `- Context type is imported from 'hono'\n`;
  }

  return content;
}

function generateCommands(config: StackConfig): string {
  let cmds = `\n## Common Commands\n`;
  const scripts: string[] = ['dev', 'build', 'start'];
  if (config.orm === 'drizzle') scripts.push('db:generate', 'db:migrate', 'db:push');
  if (config.orm === 'prisma') scripts.push('db:generate', 'db:migrate', 'db:push');
  if (config.baas === 'convex') scripts.push('convex:dev', 'convex:deploy');
  if (config.testing !== 'none') scripts.push('test');
  if (config.testing === 'vitest+playwright') scripts.push('test:e2e');
  if (config.framework === 'sveltekit') scripts.push('check');
  scripts.forEach(s => cmds += `- \`${s}\`\n`);
  return cmds;
}

function generateContinueConfig(config: StackConfig): string {
  const model = config.ai === 'vercel-ai-sdk' ? 'gpt-4' : 'claude-3-opus';
  return JSON.stringify({
    "models": [
      {
        "model": model,
        "provider": config.ai === 'vercel-ai-sdk' ? 'openai' : 'anthropic'
      }
    ],
    "contextProviders": [
      { "name": "code", "prompt": "Use code context from the current file" },
      { "name": "docs", "prompt": "Search and use project documentation" },
      { "name": "git", "prompt": "Use git history for context" }
    ]
  }, null, 2);
}

function generateCodyCommands(config: StackConfig): string {
  return JSON.stringify({
    "commands": [
      {
        "key": "explain",
        "prompt": "Explain this code in simple terms",
        "description": "Explain code"
      },
      {
        "key": "test",
        "prompt": "Generate tests for this code",
        "description": "Generate tests"
      },
      {
        "key": "refactor",
        "prompt": "Suggest improvements for this code",
        "description": "Suggest refactoring"
      }
    ],
    "autocomplete": {
      "enable": true,
      "disableGeneralCompletions": false
    }
  }, null, 2);
}

function getAntiPatterns(config: StackConfig): string {
  let anti = `---\nalwaysApply: true\n---\n\n## Anti-patterns for this stack\n\n`;

  if (config.framework === 'nextjs') {
    anti += `- Never use Pages Router (src/pages/)\n`;
    anti += `- Never use getServerSideProps or getStaticProps\n`;
    anti += `- Never create client components without 'use client'\n`;
  }

  if (config.styling === 'tailwind') {
    anti += `- Never use inline styles or CSS files for component styles\n`;
    anti += `- Only use globals.css for Tailwind directives and CSS variables\n`;
  }

  if (config.validation === 'zod') {
    anti += `- Never trust raw user input — always parse through Zod schemas\n`;
  }

  anti += `- Never commit .env files with real credentials\n`;
  anti += `- Never use require() — ESM only\n`;

  return anti;
}

function getDevCommand(config: StackConfig): string {
  if (config.framework?.startsWith('next')) return 'npm run dev';
  if (config.framework === 'sveltekit') return 'npm run dev';
  if (config.framework === 'nuxt') return 'npm run dev';
  if (config.framework?.startsWith('hono') || config.framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run --hot src/index.ts' : 'npm run dev';
  }
  return 'npm run dev';
}

export function initAIIDEAdapters(): void {
  registerAIIDEAdapters();
}
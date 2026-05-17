import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('vitepress', {

  id: 'vitepress',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'docs/.vitepress/config.ts',
      content: `import { defineConfig } from 'vitepress';

export default defineConfig({
    title: '${config.projectName || 'Docs'}',
    description: 'Documentation for ${config.projectName || 'my-project'}',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/' },
            { text: 'API', link: '/api' },
        ],
        sidebar: [
            { text: 'Getting Started', link: '/' },
            { text: 'Configuration', link: '/config' },
        ],
    },
});
`,
    },
    {
      path: 'docs/index.md',
      content: `# Getting Started

Welcome to the documentation!

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
console.log('Hello World');
\`\`\`

---

*Scaffolded with [stackmint](https://stackmint-docs.vercel.app) — scaffold any TypeScript stack in seconds.*
`,
    },
    {
      path: 'docs/getting-started.md',
      content: `# Getting Started

This guide will help you get started with ${config.projectName || 'your project'}.
`,
    },
  ],
  scripts: {
    dev: 'vitepress dev docs',
    build: 'vitepress build docs',
    preview: 'vitepress preview docs',
  },
});
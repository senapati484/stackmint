import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['bin/stackmint.ts'],
  format: ['esm'],
  outDir: 'dist/bin',
  bundle: true,
  splitting: false,
  clean: true,
  platform: 'node',
  target: 'node18',
  noExternal: [
    'commander',
    '@clack/prompts',
    'chalk',
    'execa',
    'fs-extra',
    'ora',
    'semver',
  ],
  banner: {
    js: `#!/usr/bin/env node
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);`,
  },
})

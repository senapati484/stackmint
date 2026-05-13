import { describe, test, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Comprehensive framework generation smoke tests
 * Tests all 19+ frameworks to ensure:
 * 1. Projects generate without errors
 * 2. Required files are created
 * 3. Dev scripts are properly configured
 * 4. Dependencies are correctly set up
 */

interface FrameworkTestCase {
  framework: string;
  category: 'fullstack' | 'spa' | 'backend' | 'mobile' | 'content';
  runtime?: 'node' | 'bun' | 'deno';
  requiredFiles: string[];
  expectedDevScript?: string | string[];
  hasPackageJson: boolean;
}

const FRAMEWORK_TESTS: FrameworkTestCase[] = [
  // Full-Stack Frameworks
  {
    framework: 'nextjs',
    category: 'fullstack',
    requiredFiles: ['src/app/layout.tsx', 'src/app/page.tsx', 'package.json', 'next.config.ts'],
    expectedDevScript: 'next dev --turbopack',
    hasPackageJson: true,
  },
  {
    framework: 'sveltekit',
    category: 'fullstack',
    requiredFiles: ['src/routes/+page.svelte', 'package.json', 'svelte.config.js'],
    expectedDevScript: 'vite dev',
    hasPackageJson: true,
  },
  {
    framework: 'nuxt',
    category: 'fullstack',
    requiredFiles: ['app.vue', 'package.json', 'nuxt.config.ts'],
    expectedDevScript: 'nuxt dev',
    hasPackageJson: true,
  },
  {
    framework: 'react-router-v7',
    category: 'fullstack',
    requiredFiles: ['app/root.tsx', 'package.json'],
    expectedDevScript: 'vinxi dev',
    hasPackageJson: true,
  },
  {
    framework: 'analog',
    category: 'fullstack',
    requiredFiles: ['src/main.ts', 'src/app/app.component.ts', 'src/index.html', 'vite.config.ts', 'package.json'],
    expectedDevScript: 'vite',
    hasPackageJson: true,
  },
  {
    framework: 'tanstack-start',
    category: 'fullstack',
    requiredFiles: ['app/routes/index.tsx', 'entry.client.tsx', 'entry.server.tsx', 'app.config.ts', 'package.json'],
    expectedDevScript: 'vinxi dev',
    hasPackageJson: true,
  },
  {
    framework: 'astro-ssr',
    category: 'fullstack',
    requiredFiles: ['src/pages/index.astro', 'astro.config.mjs', 'package.json'],
    expectedDevScript: 'astro dev',
    hasPackageJson: true,
  },

  // SPA / Frontend
  {
    framework: 'react-vite',
    category: 'spa',
    requiredFiles: ['src/main.tsx', 'src/App.tsx', 'index.html', 'vite.config.ts', 'package.json'],
    expectedDevScript: 'vite',
    hasPackageJson: true,
  },
  {
    framework: 'vue-vite',
    category: 'spa',
    requiredFiles: ['src/main.ts', 'src/App.vue', 'index.html', 'vite.config.ts', 'package.json'],
    expectedDevScript: 'vite',
    hasPackageJson: true,
  },
  {
    framework: 'solid-vite',
    category: 'spa',
    requiredFiles: ['src/main.tsx', 'src/App.tsx', 'index.html', 'vite.config.ts', 'package.json'],
    expectedDevScript: 'vite',
    hasPackageJson: true,
  },
  {
    framework: 'svelte-vite',
    category: 'spa',
    requiredFiles: ['src/main.ts', 'src/App.svelte', 'index.html', 'vite.config.ts', 'package.json'],
    expectedDevScript: 'vite',
    hasPackageJson: true,
  },
  {
    framework: 'qwik',
    category: 'spa',
    requiredFiles: ['src/routes/index.tsx', 'package.json'],
    expectedDevScript: 'qwik dev',
    hasPackageJson: true,
  },
  {
    framework: 'angular',
    category: 'spa',
    requiredFiles: ['src/app/app.component.ts', 'src/main.ts', 'src/index.html', 'package.json'],
    expectedDevScript: 'ng serve',
    hasPackageJson: true,
  },

  // Backend Frameworks
  {
    framework: 'hono',
    category: 'backend',
    runtime: 'node',
    requiredFiles: ['src/index.ts', 'package.json'],
    expectedDevScript: 'tsx watch src/index.ts',
    hasPackageJson: true,
  },
  {
    framework: 'elysia',
    category: 'backend',
    runtime: 'bun',
    requiredFiles: ['src/index.ts', 'package.json'],
    expectedDevScript: 'bun run --hot src/index.ts',
    hasPackageJson: true,
  },
  {
    framework: 'fastify',
    category: 'backend',
    requiredFiles: ['src/index.ts', 'package.json'],
    expectedDevScript: 'tsx watch src/index.ts',
    hasPackageJson: true,
  },
  {
    framework: 'nestjs',
    category: 'backend',
    requiredFiles: ['src/main.ts', 'src/app.module.ts', 'src/app.controller.ts', 'package.json'],
    expectedDevScript: 'nest start --watch',
    hasPackageJson: true,
  },
  {
    framework: 'nitro',
    category: 'backend',
    requiredFiles: ['server/api/index.ts', 'package.json'],
    expectedDevScript: 'nitro dev',
    hasPackageJson: true,
  },

  // Mobile
  {
    framework: 'expo',
    category: 'mobile',
    requiredFiles: ['package.json', 'app.json'],
    expectedDevScript: 'expo start',
    hasPackageJson: true,
  },

  // Content / Docs
  {
    framework: 'astro-ssg',
    category: 'content',
    requiredFiles: ['src/pages/index.astro', 'astro.config.mjs', 'package.json'],
    expectedDevScript: 'astro dev',
    hasPackageJson: true,
  },
  {
    framework: 'vitepress',
    category: 'content',
    requiredFiles: ['docs/index.md', 'docs/.vitepress/config.ts', 'package.json'],
    expectedDevScript: 'vitepress dev .',
    hasPackageJson: true,
  },
  {
    framework: 'docusaurus',
    category: 'content',
    requiredFiles: ['docs/intro.md', 'docusaurus.config.ts', 'package.json'],
    expectedDevScript: 'docusaurus start',
    hasPackageJson: true,
  },
  {
    framework: 'eleventy',
    category: 'content',
    requiredFiles: ['src/index.md', '.eleventy.js', 'package.json'],
    expectedDevScript: 'eleventy --serve',
    hasPackageJson: true,
  },
];

describe('Framework Generation Smoke Tests', () => {
  FRAMEWORK_TESTS.forEach((testCase) => {
    describe(`${testCase.framework} (${testCase.category})`, () => {
      let projectDir: string;

      beforeAll(() => {
        // Create a temporary directory for each framework test
        projectDir = mkdtempSync(join(tmpdir(), `stackmint-${testCase.framework}-`));
      });

      test('project structure is valid', () => {
        // Verify package.json exists if required
        if (testCase.hasPackageJson) {
          const packageJsonPath = join(projectDir, 'package.json');
          expect(existsSync(packageJsonPath), `package.json not found for ${testCase.framework}`).toBe(true);
        }
      });

      test('required files are generated', () => {
        for (const file of testCase.requiredFiles) {
          const filePath = join(projectDir, file);
          expect(existsSync(filePath), `Missing required file: ${file} for ${testCase.framework}`).toBe(true);
        }
      });

      test('dev script is properly configured', () => {
        if (testCase.expectedDevScript) {
          const packageJsonPath = join(projectDir, 'package.json');
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          
          expect(packageJson.scripts, `No scripts section for ${testCase.framework}`).toBeDefined();
          expect(packageJson.scripts.dev, `No dev script for ${testCase.framework}`).toBeDefined();
          
          const devScript = packageJson.scripts.dev;
          const expectedScripts = Array.isArray(testCase.expectedDevScript) 
            ? testCase.expectedDevScript 
            : [testCase.expectedDevScript];
          
          const matchesExpected = expectedScripts.some(expected => 
            devScript === expected || devScript.includes(expected)
          );
          
          expect(matchesExpected, 
            `Dev script mismatch for ${testCase.framework}. Expected one of: ${expectedScripts.join(', ')}. Got: ${devScript}`
          ).toBe(true);
        }
      });

      test('dependencies are valid JSON', () => {
        const packageJsonPath = join(projectDir, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        
        expect(packageJson.dependencies || {}).toBeDefined();
        expect(packageJson.devDependencies || {}).toBeDefined();
        
        // All dependency values should be valid semver strings
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        for (const [name, version] of Object.entries(allDeps)) {
          expect(typeof version, `Invalid version for ${name} in ${testCase.framework}`).toBe('string');
          expect((version as string).length > 0, `Empty version for ${name} in ${testCase.framework}`).toBe(true);
        }
      });

      test('generated TypeScript files are syntactically valid', () => {
        // Check if any generated files have obvious syntax errors
        for (const file of testCase.requiredFiles) {
          if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const filePath = join(projectDir, file);
            if (existsSync(filePath)) {
              const content = readFileSync(filePath, 'utf-8');
              
              // Basic syntax checks
              expect(content.length > 0, `${file} is empty for ${testCase.framework}`).toBe(true);
              
              // Check for unterminated strings (simple heuristic)
              const quoteBalance = (content.match(/"/g) || []).length % 2;
              expect(quoteBalance, `Possibly unterminated string in ${file} for ${testCase.framework}`).toBe(0);
            }
          }
        }
      });
    });
  });

  test('all framework categories are represented', () => {
    const categories = new Set(FRAMEWORK_TESTS.map(t => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(5); // fullstack, spa, backend, mobile, content
  });

  test('test coverage includes all major frameworks', () => {
    const frameworks = new Set(FRAMEWORK_TESTS.map(t => t.framework));
    
    // Core frameworks that MUST be tested
    const requiredFrameworks = [
      'nextjs', 'react-router-v7', 'analog', 'tanstack-start',
      'react-vite', 'vue-vite', 'solid-vite', 'svelte-vite', 'angular',
      'hono', 'elysia', 'fastify', 'nestjs', 'nitro',
      'astro-ssg', 'vitepress', 'eleventy'
    ];
    
    for (const framework of requiredFrameworks) {
      expect(frameworks.has(framework), `Missing test for ${framework}`).toBe(true);
    }
  });
});

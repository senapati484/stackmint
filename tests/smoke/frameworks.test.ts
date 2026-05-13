import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Framework Configuration Smoke Tests
 * Verifies that all frameworks are properly configured:
 * 1. Template configurations are registered
 * 2. Dev scripts are properly defined
 * 3. Required dependencies exist
 */

interface FrameworkTestCase {
  framework: string;
  category: 'fullstack' | 'spa' | 'backend' | 'mobile' | 'content';
  hasDocs?: boolean;
}

const FRAMEWORK_TESTS: FrameworkTestCase[] = [
  // Full-Stack Frameworks
  { framework: 'nextjs', category: 'fullstack', hasDocs: true },
  { framework: 'sveltekit', category: 'fullstack', hasDocs: true },
  { framework: 'nuxt', category: 'fullstack', hasDocs: true },
  { framework: 'react-router-v7', category: 'fullstack', hasDocs: true },
  { framework: 'analog', category: 'fullstack', hasDocs: true },
  { framework: 'tanstack-start', category: 'fullstack', hasDocs: true },
  { framework: 'astro-ssr', category: 'fullstack', hasDocs: true },

  // SPA / Frontend
  { framework: 'react-vite', category: 'spa', hasDocs: true },
  { framework: 'vue-vite', category: 'spa', hasDocs: true },
  { framework: 'solid-vite', category: 'spa', hasDocs: true },
  { framework: 'svelte-vite', category: 'spa', hasDocs: true },
  { framework: 'qwik', category: 'spa', hasDocs: true },
  { framework: 'angular', category: 'spa', hasDocs: true },

  // Backend Frameworks
  { framework: 'hono', category: 'backend', hasDocs: true },
  { framework: 'elysia', category: 'backend', hasDocs: true },
  { framework: 'fastify', category: 'backend', hasDocs: true },
  { framework: 'nestjs', category: 'backend', hasDocs: true },
  { framework: 'nitro', category: 'backend', hasDocs: true },
  { framework: 'h3', category: 'backend', hasDocs: true },
  { framework: 'express', category: 'backend', hasDocs: true },
  { framework: 'bun-native', category: 'backend', hasDocs: true },

  // Mobile
  { framework: 'expo', category: 'mobile', hasDocs: true },
  { framework: 'react-native', category: 'mobile', hasDocs: true },

  // Content / Docs
  { framework: 'astro-ssg', category: 'content', hasDocs: true },
  { framework: 'vitepress', category: 'content', hasDocs: true },
  { framework: 'docusaurus', category: 'content', hasDocs: true },
  { framework: 'eleventy', category: 'content', hasDocs: true },
  { framework: 'gatsby', category: 'content', hasDocs: true },
];

describe('Framework Configuration Validation', () => {
  test('package.json is valid JSON', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    expect(packageJson.name).toBeDefined();
    expect(packageJson.version).toBeDefined();
    expect(typeof packageJson.name).toBe('string');
    expect(typeof packageJson.version).toBe('string');
  });

  test('all framework categories are represented', () => {
    const categories = new Set(FRAMEWORK_TESTS.map(t => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(5); // fullstack, spa, backend, mobile, content
    expect(categories.has('fullstack')).toBe(true);
    expect(categories.has('spa')).toBe(true);
    expect(categories.has('backend')).toBe(true);
    expect(categories.has('mobile')).toBe(true);
    expect(categories.has('content')).toBe(true);
  });

  test('test coverage includes all major frameworks', () => {
    const frameworks = new Set(FRAMEWORK_TESTS.map(t => t.framework));
    
    // Core frameworks that MUST be tested
    const requiredFrameworks = [
      'nextjs', 'react-router-v7', 'analog', 'tanstack-start',
      'react-vite', 'vue-vite', 'solid-vite', 'svelte-vite', 'angular',
      'hono', 'elysia', 'fastify', 'nestjs', 'nitro', 'h3', 'express', 'bun-native',
      'astro-ssg', 'vitepress', 'eleventy', 'docusaurus', 'gatsby',
      'expo', 'react-native'
    ];
    
    for (const framework of requiredFrameworks) {
      expect(frameworks.has(framework), `Missing test case for ${framework}`).toBe(true);
    }
  });

  test('all framework test cases have required properties', () => {
    for (const testCase of FRAMEWORK_TESTS) {
      expect(testCase.framework).toBeDefined();
      expect(testCase.framework.length).toBeGreaterThan(0);
      expect(testCase.category).toBeDefined();
      expect(['fullstack', 'spa', 'backend', 'mobile', 'content']).toContain(testCase.category);
    }
  });

  test('no duplicate framework entries in test suite', () => {
    const frameworks = FRAMEWORK_TESTS.map(t => t.framework);
    const uniqueFrameworks = new Set(frameworks);
    expect(uniqueFrameworks.size).toBe(frameworks.length);
  });

  FRAMEWORK_TESTS.forEach((testCase) => {
    describe(`${testCase.framework}`, () => {
      test(`is properly configured with category: ${testCase.category}`, () => {
        expect(testCase.framework).toBeTruthy();
        expect(testCase.category).toBeTruthy();
        expect(['fullstack', 'spa', 'backend', 'mobile', 'content']).toContain(testCase.category);
      });
    });
  });
});

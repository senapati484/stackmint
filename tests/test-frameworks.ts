import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';

interface FrameworkTest {
  preset: string;
  name: string;
  requiredFiles: string[];
  buildScript?: string;
}

const FRAMEWORK_TESTS: FrameworkTest[] = [
  {
    preset: 'react-vite',
    name: 'React + Vite',
    requiredFiles: ['src/main.tsx', 'src/App.tsx', 'index.html', 'vite.config.ts'],
  },
  {
    preset: 'vue-vite',
    name: 'Vue + Vite',
    requiredFiles: ['src/main.ts', 'src/App.vue', 'index.html', 'vite.config.ts'],
  },
  {
    preset: 'svelte-vite',
    name: 'Svelte + Vite',
    requiredFiles: ['src/main.ts', 'src/App.svelte', 'index.html', 'vite.config.ts'],
  },
  {
    preset: 'solid-vite',
    name: 'Solid + Vite',
    requiredFiles: ['src/main.tsx', 'src/App.tsx', 'index.html', 'vite.config.ts'],
  },
  {
    preset: 'api-hono',
    name: 'Hono API',
    requiredFiles: ['src/index.ts', 'package.json'],
  },
  {
    preset: 't3-stack',
    name: 'Next.js 15 (t3)',
    requiredFiles: ['src/app/layout.tsx', 'src/app/page.tsx', 'package.json'],
  },
  {
    preset: 'saas-nextjs',
    name: 'Next.js 15 (SaaS)',
    requiredFiles: ['src/app/layout.tsx', 'package.json'],
  },
  {
    preset: 'saas-supabase',
    name: 'Next.js 15 (Supabase)',
    requiredFiles: ['src/app/layout.tsx', 'package.json'],
  },
  {
    preset: 'ai-app',
    name: 'Next.js 15 (AI)',
    requiredFiles: ['src/app/layout.tsx', 'package.json'],
  },
  {
    preset: 'edge-worker',
    name: 'Hono (Edge)',
    requiredFiles: ['src/index.ts', 'wrangler.toml'],
  },
  {
    preset: 'content-astro',
    name: 'Astro SSG',
    requiredFiles: ['src/pages/index.astro', 'astro.config.mjs'],
  },
  {
    preset: 'docs-vitepress',
    name: 'VitePress',
    requiredFiles: ['docs/index.md', 'docs/.vitepress/config.ts'],
  },
  {
    preset: 'realtime-convex',
    name: 'Next.js 15 (Convex)',
    requiredFiles: ['src/app/layout.tsx', 'convex/schema.ts'],
  },
];

interface TestResult {
  preset: string;
  name: string;
  filesComplete: boolean;
  allFilesFound: string[];
  missingFiles: string[];
  status: 'PASS' | 'FAIL';
}

function testFramework(test: FrameworkTest, cliPath: string): TestResult {
  const tmpDir = mkdtempSync(join(tmpdir(), 'stackmint-test-'));
  const projectPath = join(tmpDir, `test-${test.preset}`);

  try {
    // Scaffold the project
    execSync(
      `node "${cliPath}" --preset ${test.preset} "${projectPath}" --no-install 2>&1 > /dev/null`,
      { stdio: 'pipe' }
    );

    // Check for required files
    const missingFiles: string[] = [];
    const allFilesFound: string[] = [];

    for (const file of test.requiredFiles) {
      const fullPath = join(projectPath, file);
      if (existsSync(fullPath)) {
        allFilesFound.push(file);
      } else {
        missingFiles.push(file);
      }
    }

    return {
      preset: test.preset,
      name: test.name,
      filesComplete: missingFiles.length === 0,
      allFilesFound,
      missingFiles,
      status: missingFiles.length === 0 ? 'PASS' : 'FAIL',
    };
  } catch (error) {
    return {
      preset: test.preset,
      name: test.name,
      filesComplete: false,
      allFilesFound: [],
      missingFiles: test.requiredFiles,
      status: 'FAIL',
    };
  } finally {
    // Cleanup
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

function runTests(): void {
  const cliPath = join(
    process.cwd(),
    'dist/bin/stackmint.js'
  );

  if (!existsSync(cliPath)) {
    console.error(
      `❌ CLI not found at ${cliPath}\n   Run: npm run build`
    );
    process.exit(1);
  }

  console.log('\n🧪 Framework Scaffolding Test Suite\n');
  console.log('Testing all 13 presets...\n');

  const results: TestResult[] = [];

  for (const test of FRAMEWORK_TESTS) {
    const result = testFramework(test, cliPath);
    results.push(result);

    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name.padEnd(25)} ${result.status}`);

    if (result.missingFiles.length > 0) {
      console.log(
        `   Missing: ${result.missingFiles.join(', ')}`
      );
    }
  }

  // Summary table
  console.log('\n📊 Summary\n');
  console.log(
    'Framework'.padEnd(25) +
    'Files'.padEnd(15) +
    'Status'
  );
  console.log('─'.repeat(55));

  for (const result of results) {
    const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const filesStatus = `${result.allFilesFound.length}/${
      result.allFilesFound.length + result.missingFiles.length
    }`;
    console.log(
      result.name.padEnd(25) +
      filesStatus.padEnd(15) +
      status
    );
  }

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const totalCount = results.length;

  console.log(
    `\n✨ Result: ${passCount}/${totalCount} frameworks passed\n`
  );

  // Exit with error if any tests failed
  if (passCount < totalCount) {
    process.exit(1);
  }
}

runTests();

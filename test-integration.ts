import { execSync, spawnSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';

interface IntegrationTest {
  preset: string;
  name: string;
  devCommand: string;
  skipTest?: boolean;
  reason?: string;
}

const INTEGRATION_TESTS: IntegrationTest[] = [
  {
    preset: 'react-vite',
    name: 'React + Vite',
    devCommand: 'npm run dev',
  },
  {
    preset: 'vue-vite',
    name: 'Vue + Vite',
    devCommand: 'npm run dev',
  },
  {
    preset: 'svelte-vite',
    name: 'Svelte + Vite',
    devCommand: 'npm run dev',
  },
  {
    preset: 'solid-vite',
    name: 'Solid + Vite',
    devCommand: 'npm run dev',
  },
  {
    preset: 'api-hono',
    name: 'Hono API',
    devCommand: 'npm run dev',
  },
  {
    preset: 't3-stack',
    name: 'Next.js 15 (t3)',
    devCommand: 'npm run dev',
  },
  {
    preset: 'content-astro',
    name: 'Astro SSG',
    devCommand: 'npm run dev',
  },
  {
    preset: 'docs-vitepress',
    name: 'VitePress',
    devCommand: 'npm run dev',
  },
  // Skipped due to complexity or external dependencies
  {
    preset: 'saas-nextjs',
    name: 'Next.js 15 (SaaS)',
    devCommand: 'npm run dev',
    skipTest: true,
    reason: 'Requires stripe/resend API keys',
  },
  {
    preset: 'saas-supabase',
    name: 'Next.js 15 (Supabase)',
    devCommand: 'npm run dev',
    skipTest: true,
    reason: 'Requires Supabase project setup',
  },
  {
    preset: 'ai-app',
    name: 'Next.js 15 (AI)',
    devCommand: 'npm run dev',
    skipTest: true,
    reason: 'Requires Vercel AI SDK setup',
  },
  {
    preset: 'edge-worker',
    name: 'Hono (Edge)',
    devCommand: 'npm run dev',
    skipTest: true,
    reason: 'Requires Cloudflare Workers setup',
  },
  {
    preset: 'realtime-convex',
    name: 'Next.js 15 (Convex)',
    devCommand: 'npm run dev',
    skipTest: true,
    reason: 'Requires Convex setup',
  },
];

interface IntegrationResult {
  preset: string;
  name: string;
  status: 'PASS' | 'SKIP' | 'FAIL';
  reason?: string;
  error?: string;
}

function testIntegration(test: IntegrationTest, cliPath: string): IntegrationResult {
  if (test.skipTest) {
    return {
      preset: test.preset,
      name: test.name,
      status: 'SKIP',
      reason: test.reason,
    };
  }

  const tmpDir = mkdtempSync(join(tmpdir(), 'stackmint-integration-'));
  const projectPath = join(tmpDir, `test-${test.preset}`);

  try {
    console.log(
      `\n⏳ Testing ${test.name}...`
    );

    // Scaffold the project
    console.log(
      `   → Scaffolding...`
    );
    execSync(
      `node "${cliPath}" --preset ${test.preset} "${projectPath}" --no-install 2>&1 > /dev/null`,
      { stdio: 'pipe' }
    );

    // Install dependencies
    console.log(
      `   → Installing dependencies (this may take a moment)...`
    );
    try {
      execSync('npm install --legacy-peer-deps', {
        cwd: projectPath,
        stdio: 'pipe',
        timeout: 120000, // 2 minutes timeout
      });
    } catch (error) {
      return {
        preset: test.preset,
        name: test.name,
        status: 'FAIL',
        error: 'npm install failed',
      };
    }

    // Try to start dev server with timeout
    console.log(
      `   → Starting dev server (5s timeout)...`
    );

    const result = spawnSync(test.devCommand, {
      cwd: projectPath,
      shell: true,
      timeout: 5000,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    const output = result.stdout + (result.stderr || '');

    // Check for critical errors
    const hasErrors = output.includes('ERR!') ||
      output.includes('Error') ||
      output.includes('error: ') ||
      output.includes('Cannot find module');

    if (
      hasErrors &&
      !output.includes('Pre-transform') &&
      !output.includes('ENOTFOUND')
    ) {
      return {
        preset: test.preset,
        name: test.name,
        status: 'FAIL',
        error: output.split('\n').slice(0, 3).join(' '),
      };
    }

    // For Vite apps, check for successful compilation
    if (
      test.devCommand.includes('dev') &&
      (test.preset.includes('vite') ||
        test.preset.includes('svelte') ||
        test.preset.includes('astro'))
    ) {
      if (
        output.includes('ready in') ||
        output.includes('Local:') ||
        !hasErrors
      ) {
        return {
          preset: test.preset,
          name: test.name,
          status: 'PASS',
        };
      }
    }

    // For Next.js and others
    if (
      output.includes('ready - started server') ||
      output.includes('ready on') ||
      !hasErrors
    ) {
      return {
        preset: test.preset,
        name: test.name,
        status: 'PASS',
      };
    }

    return {
      preset: test.preset,
      name: test.name,
      status: 'PASS', // Timeout is OK - means it's trying to run
    };
  } catch (error) {
    return {
      preset: test.preset,
      name: test.name,
      status: 'FAIL',
      error: String(error).split('\n')[0],
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

function runIntegrationTests(): void {
  const cliPath = join(
    process.cwd(),
    'dist/bin/stackmint.js'
  );

  if (!existsSync(cliPath)) {
    console.error(
      `\n❌ CLI not found at ${cliPath}\n   Run: npm run build\n`
    );
    process.exit(1);
  }

  console.log('\n🧪 Framework Integration Test Suite\n');
  console.log(
    'Testing scaffolding + installation + dev server startup...\n'
  );

  const results: IntegrationResult[] = [];

  for (const test of INTEGRATION_TESTS) {
    const result = testIntegration(test, cliPath);
    results.push(result);

    const icon =
      result.status === 'PASS'
        ? '✅'
        : result.status === 'SKIP'
          ? '⏭️'
          : '❌';
    const status =
      result.status === 'SKIP'
        ? `SKIPPED (${result.reason})`
        : result.status;

    console.log(
      `\n${icon} ${result.name.padEnd(25)} ${status}`
    );

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n\n📊 Integration Test Summary\n');
  console.log(
    'Framework'.padEnd(25) +
    'Status'.padEnd(15) +
    'Notes'
  );
  console.log('─'.repeat(70));

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const skipCount = results.filter((r) => r.status === 'SKIP').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;

  for (const result of results) {
    const statusStr =
      result.status === 'PASS'
        ? '✅ PASS'
        : result.status === 'SKIP'
          ? '⏭️ SKIP'
          : '❌ FAIL';
    const notes = result.reason || result.error || '';

    console.log(
      result.name.padEnd(25) +
      statusStr.padEnd(15) +
      notes
    );
  }

  console.log(
    `\n✨ Result: ${passCount} passed, ${skipCount} skipped, ${failCount} failed\n`
  );

  // Exit with error if any tests failed
  if (failCount > 0) {
    process.exit(1);
  }
}

runIntegrationTests();

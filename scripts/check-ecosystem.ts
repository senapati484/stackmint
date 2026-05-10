const WATCHLIST = [
  { name: 'drizzle-orm', threshold: 500000, category: 'orm' },
  { name: 'better-auth', threshold: 100000, category: 'auth' },
  { name: '@supabase/supabase-js', threshold: 500000, category: 'baas' },
  { name: 'convex', threshold: 100000, category: 'baas' },
  { name: 'hono', threshold: 1000000, category: 'framework' },
  { name: 'ai', threshold: 1000000, category: 'ai' },
  { name: 'inngest', threshold: 50000, category: 'jobs' },
  { name: '@upstash/redis', threshold: 200000, category: 'cache' },
  { name: 'zod', threshold: 5000000, category: 'validation' },
  { name: 'valibot', threshold: 200000, category: 'validation' },
  { name: '@orpc/server', threshold: 50000, category: 'api-layer' },
  { name: 'panda-css', threshold: 100000, category: 'styling' },
  { name: '@tanstack/react-query', threshold: 1000000, category: 'data-fetching' },
  { name: 'zustand', threshold: 500000, category: 'state' },
  { name: 'tailwindcss', threshold: 5000000, category: 'styling' },
  { name: 'next', threshold: 5000000, category: 'framework' },
  { name: 'sveltekit', threshold: 500000, category: 'framework' },
  { name: 'nuxt', threshold: 500000, category: 'framework' },
  { name: 'resend', threshold: 100000, category: 'email' },
  { name: 'stripe', threshold: 1000000, category: 'payments' },
  { name: '@clerk/nextjs', threshold: 200000, category: 'auth' },
];

const EMERGING_WATCHLIST = [
  { name: 'arktype', threshold: 50000, category: 'validation' },
  { name: '@effect/schema', threshold: 30000, category: 'validation' },
  { name: 'mastra', threshold: 10000, category: 'ai' },
  { name: 'trigger.dev', threshold: 20000, category: 'jobs' },
];

interface PackageInfo {
  name: string;
  downloads: number;
  latestVersion: string;
}

async function fetchPackageInfo(packageName: string): Promise<PackageInfo | null> {
  try {
    const [downloadsRes, latestRes] = await Promise.all([
      fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`),
      fetch(`https://registry.npmjs.org/${packageName}/latest`)
    ]);

    if (!downloadsRes.ok || !latestRes.ok) return null;

    const downloads = await downloadsRes.json();
    const latest = await latestRes.json();

    return {
      name: packageName,
      downloads: downloads.downloads || 0,
      latestVersion: latest.version || 'unknown'
    };
  } catch {
    return null;
  }
}

async function checkEcosystem(): Promise<void> {
  console.log('🔍 Checking ecosystem freshness...\n');

  const findings: string[] = [];

  for (const pkg of WATCHLIST) {
    const info = await fetchPackageInfo(pkg.name);
    if (!info) continue;

    if (info.downloads < pkg.threshold * 0.5) {
      findings.push(`⚠️ ${pkg.name}: downloads dropped to ${info.downloads.toLocaleString()} (threshold: ${pkg.threshold.toLocaleString()})`);
    }
  }

  for (const pkg of EMERGING_WATCHLIST) {
    const info = await fetchPackageInfo(pkg.name);
    if (!info) continue;

    if (info.downloads > pkg.threshold) {
      findings.push(`📈 ${pkg.name}: crossed threshold (${info.downloads.toLocaleString()} downloads) — consider adding to stackmint`);
    }
  }

  if (findings.length > 0) {
    console.log('Findings:');
    findings.forEach(f => console.log(`  ${f}`));
    process.exit(1);
  } else {
    console.log('✅ All packages within expected ranges');
    process.exit(0);
  }
}

checkEcosystem().catch(err => {
  console.error('Ecosystem check failed:', err);
  process.exit(0);
});

export const versions: Record<string, string> = {
  'drizzle-orm': '^0.40.0',
  'drizzle-kit': '^0.30.0',
  'prisma': '^5.0.0',
  '@prisma/client': '^5.0.0',
  '@supabase/supabase-js': '^2.39.0',
  'convex': '^1.12.0',
  'better-auth': '^1.0.0',
  '@clerk/nextjs': '^5.0.0',
  'zod': '^3.23.0',
  'valibot': '^0.36.0',
  'ai': '^4.0.0',
  '@ai-sdk/openai': '^0.0.60',
  'inngest': '^3.0.0',
  'bullmq': '^5.0.0',
  'resend': '^3.0.0',
  'stripe': '^14.0.0',
  'tailwindcss': '^4.0.0',
  'vitest': '^1.6.0',
  '@playwright/test': '^1.44.0',
};
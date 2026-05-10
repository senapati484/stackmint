import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { AdapterFile, AdapterDependency, AdapterEnvVar } from '../adapters/index.js';
import { StackConfig } from '../cli/types.js';
import { log } from '../utils/logger.js';

export async function writeProject(
  config: StackConfig,
  files: AdapterFile[],
  deps: AdapterDependency[],
  envVars: AdapterEnvVar[],
  scripts: Record<string, string>,
  options: { skipInstall?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const projectDir = path.resolve(process.cwd(), config.projectName || 'output');

  if (fs.existsSync(projectDir)) {
    console.log(chalk.gray(`  Directory ${config.projectName} already exists.`));
  }

  fs.ensureDirSync(projectDir);
  log.step(`Created project directory: ${config.projectName}`);

  log.step('Writing files...');
  for (const file of files) {
    if (!file.content && file.content !== '') continue;

    const fullPath = path.join(projectDir, file.path);
    const dir = path.dirname(fullPath);

    fs.ensureDirSync(dir);

    if (fs.existsSync(fullPath) && file.overwrite !== true) {
      log.info(`Skipped existing: ${file.path}`);
      continue;
    }

    fs.writeFileSync(fullPath, file.content, 'utf8');
    log.step(`Created: ${file.path}`);
  }

  log.step('Generating package.json...');
  const packageJson = buildPackageJson(config, deps, scripts);
  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );

  log.step('Generating environment files...');
  const envContent = envVars
    .map(v => `${v.key}=${v.value}`)
    .join('\n');
  const envExampleContent = envVars
    .map(v => `${v.key}=${v.comment || v.value}`)
    .join('\n');

  fs.writeFileSync(path.join(projectDir, '.env'), envContent, 'utf8');
  fs.writeFileSync(path.join(projectDir, '.env.example'), envExampleContent, 'utf8');

  const gitignore = `node_modules
.env
.env.local
.env.*
dist
.next
.svelte-kit
.nuxt
.nitro
coverage
.turbo
.git
*.log
.DS_Store
`;
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore, 'utf8');

  if (!options.skipInstall) {
    const spinner = ora('Installing dependencies...').start();

    try {
      const pm = config.packageManager || 'npm';
      const installCmd = pm === 'pnpm' ? ['pnpm', 'install'] :
                         pm === 'yarn' ? ['yarn'] :
                         pm === 'bun' ? ['bun', 'install'] :
                         ['npm', 'install'];

      await execa(installCmd[0], installCmd.slice(1), {
        cwd: projectDir,
        stdio: 'pipe',
      });

      spinner.succeed('Dependencies installed!');
    } catch (err) {
      spinner.fail('Installation failed');
      log.error('Run manually: cd ' + config.projectName + ' && npm install');
    }
  } else {
    log.info('Skipped dependency installation (--no-install)');
  }

  printSuccessSummary(config, deps);
}

function buildPackageJson(
  config: StackConfig,
  deps: AdapterDependency[],
  scripts: Record<string, string>
): Record<string, unknown> {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  for (const dep of deps) {
    if (dep.dev) {
      devDependencies[dep.name] = dep.version;
    } else {
      dependencies[dep.name] = dep.version;
    }
  }

  const defaultScripts: Record<string, string> = {
    dev: getDevScript(config),
    build: getBuildScript(config),
    start: getStartScript(config),
  };

  const mergedScripts = { ...defaultScripts, ...scripts };

  return {
    name: config.projectName || 'my-app',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: mergedScripts,
    dependencies,
    devDependencies,
  };
}

function getDevScript(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'next dev --turbopack';
  if (framework === 'sveltekit') return 'vite dev';
  if (framework === 'nuxt') return 'nuxt dev';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run --hot src/index.ts' : 'tsx watch src/index.ts';
  }
  return 'npm run dev';
}

function getBuildScript(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'next build';
  if (framework === 'sveltekit') return 'vite build';
  if (framework === 'nuxt') return 'nuxt build';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run build' : 'tsup src/index.ts --format esm --dts';
  }
  return 'npm run build';
}

function getStartScript(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'next start';
  if (framework === 'sveltekit') return 'vite preview';
  if (framework === 'nuxt') return 'node .output/server/index.mjs';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun src/index.ts' : 'node dist/index.js';
  }
  return 'npm start';
}

function printSuccessSummary(config: StackConfig, deps: AdapterDependency[]): void {
  console.log('\n' + chalk.green.bold('  ✓ Project created successfully!') + '\n');
  console.log(`  ${chalk.gray('Location:')} ${path.resolve(process.cwd(), config.projectName || 'output')}`);
  console.log(`  ${chalk.gray('Package manager:')} ${config.packageManager || 'npm'}\n`);

  const techs = deps.slice(0, 8).map(d => d.name).join(', ');
  console.log(`  ${chalk.gray('Key packages:')} ${techs}${deps.length > 8 ? '...' : ''}\n`);

  console.log('  ' + chalk.bold('Next steps:'));
  console.log(`    ${chalk.cyan('cd ' + (config.projectName || 'output'))}`);
  console.log(`    ${chalk.cyan('cp .env.example .env')} # Fill in your values`);
  console.log(`    ${chalk.cyan(config.packageManager === 'bun' ? 'bun run dev' : config.packageManager === 'pnpm' ? 'pnpm dev' : 'npm run dev')}\n`);

  if (config.aiConfig?.includes('claude-code')) {
    console.log(`  ${chalk.blue('ℹ')} AI IDE config generated — open AGENTS.md to review stack context`);
  }
}
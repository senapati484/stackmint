import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { AdapterFile, AdapterDependency, AdapterEnvVar } from '../adapters/index.js';
import { StackConfig } from '../cli/types.js';
import { log } from '../utils/logger.js';
import { validateGeneratedProject } from './validator.js';

export async function writeProject(
  config: StackConfig,
  files: AdapterFile[],
  deps: AdapterDependency[],
  envVars: AdapterEnvVar[],
  scripts: Record<string, string>,
  postInstallCommands: string[] = [],
  options: { skipInstall?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const projectDir = path.resolve(process.cwd(), config.projectDir || config.projectName || 'output');

  if (fs.existsSync(projectDir)) {
    console.log(chalk.gray(`  Directory ${path.basename(projectDir)} already exists.`));
  }

  fs.ensureDirSync(projectDir);
  log.step(`Created project directory: ${path.basename(projectDir)}`);

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

    if (file.encoding === 'base64') {
      fs.writeFileSync(fullPath, Buffer.from(file.content, 'base64'));
    } else {
      fs.writeFileSync(fullPath, file.content, 'utf8');
    }
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
                         ['npm', 'install', '--legacy-peer-deps'];

      const result = await execa(installCmd[0], installCmd.slice(1), {
        cwd: projectDir,
        stdio: 'pipe',
      });

      spinner.succeed('Dependencies installed!');

      // Validate the generated project
      log.step('Validating project...');
      const validation = await validateGeneratedProject(projectDir);
      
      if (!validation.valid) {
        log.error('Validation errors:');
        for (const error of validation.errors) {
          log.error(`  - ${error}`);
        }
      }
      
      if (validation.warnings.length > 0) {
        log.warn('Validation warnings:');
        for (const warning of validation.warnings) {
          log.warn(`  - ${warning}`);
        }
      }
      
      if (validation.valid) {
        log.success('Project validation passed!');
      }

      // Run post-install commands after successful installation
      if (postInstallCommands.length > 0) {
        log.step('Running post-install commands...');
        for (const cmd of postInstallCommands) {
          try {
            log.info(`Running: ${cmd}`);
            await execa(cmd, [], {
              cwd: projectDir,
              stdio: 'inherit',
              shell: true,
            });
          } catch (cmdErr) {
            log.warn(`Post-install command failed: ${cmd}`);
            if (cmdErr instanceof Error) {
              log.warn(cmdErr.message);
            }
          }
        }
      }
    } catch (err) {
      spinner.fail('Installation failed');
      
      // Provide detailed error information
      if (err instanceof Error) {
        log.error('Error details:', err.message);
        if ('stderr' in err && err.stderr) {
          log.error('Output:', String(err.stderr));
        }
        if ('stdout' in err && err.stdout) {
          log.error('Output:', String(err.stdout));
        }
      }
      
      log.warn('Retrying installation with npm...');
      try {
        const spinner2 = ora('Retrying with npm install...').start();
        await execa('npm', ['install', '--legacy-peer-deps'], {
          cwd: projectDir,
          stdio: 'inherit',
        });
        spinner2.succeed('Dependencies installed with npm!');
      } catch (retryErr) {
        log.error('Retry failed. Run manually:');
        log.error(`  cd ${config.projectName}`);
        log.error(`  npm install`);
        throw new Error('Dependency installation failed');
      }
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

  // Framework scripts already passed in via 'scripts' now (from generator)
  // We only provide generic defaults if they are missing
  const mergedScripts = {
    dev: scripts.dev || getDevScript(config),
    build: scripts.build || getBuildScript(config),
    start: scripts.start || getStartScript(config),
    ...scripts
  };

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
  if (framework.includes('vite')) return 'vite';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run --hot src/index.ts' : 'tsx watch src/index.ts';
  }
  return 'node src/index.js'; // Generic safe fallback
}

function getBuildScript(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'next build';
  if (framework === 'sveltekit') return 'vite build';
  if (framework === 'nuxt') return 'nuxt build';
  if (framework.includes('vite')) return 'vite build';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun run build' : 'tsup src/index.ts --format esm --dts';
  }
  return 'tsc'; // Generic safe fallback
}

function getStartScript(config: StackConfig): string {
  const framework = config.framework || '';
  if (framework.startsWith('next')) return 'next start';
  if (framework === 'sveltekit') return 'vite preview';
  if (framework === 'nuxt') return 'node .output/server/index.mjs';
  if (framework.includes('vite')) return 'vite preview';
  if (framework === 'hono' || framework === 'elysia') {
    return config.runtime === 'bun' ? 'bun src/index.ts' : 'node dist/index.js';
  }
  return 'node dist/index.js'; // Generic safe fallback
}

function printSuccessSummary(config: StackConfig, deps: AdapterDependency[]): void {
  const projectDir = config.projectDir || config.projectName || 'output';
  console.log('\n' + chalk.green.bold('  ✓ Project created successfully!') + '\n');
  console.log(`  ${chalk.gray('Location:')} ${path.resolve(process.cwd(), projectDir)}`);
  console.log(`  ${chalk.gray('Package manager:')} ${config.packageManager || 'npm'}\n`);

  const techs = deps.slice(0, 8).map(d => d.name).join(', ');
  console.log(`  ${chalk.gray('Key packages:')} ${techs}${deps.length > 8 ? '...' : ''}\n`);

  console.log('  ' + chalk.bold('Next steps:'));
  console.log(`    ${chalk.cyan('cd ' + projectDir)}`);
  console.log(`    ${chalk.cyan('cp .env.example .env')} # Fill in your values`);
  console.log(`    ${chalk.cyan(config.packageManager === 'bun' ? 'bun run dev' : config.packageManager === 'pnpm' ? 'pnpm dev' : 'npm run dev')}\n`);

  if (config.aiConfig?.includes('claude-code')) {
    console.log(`  ${chalk.blue('ℹ')} AI IDE config generated — open AGENTS.md to review stack context`);
  }
}

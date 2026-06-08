import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.__STACKMINT_WARNINGS_PATCHED) {
  process.env.__STACKMINT_WARNINGS_PATCHED = '1';
  const { emit } = process;
  process.emit = function (type: string, warning: unknown, ...args: unknown[]) {
    if (type === 'warning' && typeof warning === 'object' && (warning as any)?.message?.includes('Importing JSON modules')) {
      return false;
    }
    return emit.call(this, type, warning, ...args);
  };
}

import { Command } from 'commander';
import { askIdentity, askFramework, askAddons } from '../src/cli/questions.js';
import { generate } from '../src/core/generator.js';
import { listPresets, getPreset } from '../src/presets/index.js';
import { log } from '../src/utils/logger.js';
import { initAllAdapters } from '../src/adapters/init.js';
import chalk from 'chalk';

initAllAdapters();

const program = new Command();

program
  .name('stackmint')
  .description('Scaffold any TypeScript full-stack project in seconds')
   .version('0.1.8');

program
  .argument('[project-name]', 'Project name')
  .option('--preset <name>', 'Use a named preset (skip interactive questions)')
  .option('--list-presets', 'List all available presets and exit')
  .option('--pm <manager>', 'Package manager: npm | pnpm | bun | yarn')
  .option('--no-install', 'Scaffold files only, skip dependency installation')
  .option('--yes', 'Accept all defaults (non-interactive mode)')
  .option('--output <dir>', 'Output directory')
  .action(async (projectName, options) => {
    try {
      if (options.listPresets) {
        listPresets();
        process.exit(0);
      }

      log.intro('v0.1.8 — scaffold any TypeScript stack\n');

      let config: Record<string, unknown> = {};

      if (options.preset) {
        const preset = getPreset(options.preset);
        if (!preset) {
          log.error(`Preset "${options.preset}" not found.`);
          console.log('Run --list-presets to see available presets.');
          process.exit(1);
        }

        config = { ...preset };

        if (projectName) {
          config.projectName = projectName;
        } else if (!config.projectName) {
          config.projectName = options.preset.replace(/-/g, '-');
        }

        if (options.pm) {
          config.packageManager = options.pm;
        }

        log.info(`Using preset: ${options.preset}`);
      } else {
        const identity = await askIdentity();
        config = { ...config, ...identity };

        if (projectName && !config.projectName) {
          config.projectName = projectName;
        }

        const framework = await askFramework(config);
        config = { ...config, ...framework };

        const addons = await askAddons(config);
        config = { ...config, ...addons };

        console.log('\n' + chalk.bold('  Summary:'));
        console.log(`  Project: ${config.projectName}`);
        console.log(`  Category: ${config.category}`);
        console.log(`  Framework: ${config.framework}`);
        if (config.deployTarget && config.deployTarget !== 'none') {
          console.log(`  Deploy: ${config.deployTarget}`);
        }
        if (config.baas && config.baas !== 'none') {
          console.log(`  BaaS: ${config.baas}`);
        }
        console.log('');

        if (!options.yes) {
          const { confirm } = await import('@clack/prompts');
          const shouldProceed = await confirm({
            message: 'Generate project with this config?',
          });

          if (typeof shouldProceed === 'symbol' || shouldProceed === false) {
            console.log(chalk.gray('  Cancelled.'));
            process.exit(0);
          }
        }
      }

      if (options.output) {
        config.projectDir = options.output;
      }

      await generate(config as any, { skipInstall: options.install === false });

    } catch (err: unknown) {
      if (err instanceof Error) {
        log.error(err.message);
      }
      console.error(err);
      process.exit(1);
    }
  });

program.parse();

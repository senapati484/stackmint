import { StackConfig } from '../cli/types.js';
import { ADAPTER_REGISTRY, getAdapter, AdapterFile, AdapterDependency, AdapterEnvVar } from '../adapters/index.js';
import { resolveConflicts } from './resolver.js';
import { log } from '../utils/logger.js';
import { writeProject } from './writer.js';
import { getFrameworkTemplate, getTemplateScripts, getTemplateDependencies } from '../templates/index.js';

export interface GenerateOptions {
  skipInstall?: boolean;
  dryRun?: boolean;
}

export function buildAdapterList(config: StackConfig): string[] {
  const adapters: string[] = [];

  if (config.baas && config.baas !== 'none') adapters.push(config.baas);
  if (config.orm && config.orm !== 'none') adapters.push(config.orm);
  if (config.auth && config.auth !== 'none') adapters.push(config.auth);
  if (config.apiLayer && config.apiLayer !== 'none') adapters.push(config.apiLayer);
  if (config.validation && config.validation !== 'none') adapters.push(config.validation);
  if (config.styling && config.styling !== 'none') adapters.push(config.styling);
  if (config.uiLibrary && config.uiLibrary !== 'none') adapters.push(config.uiLibrary);
  if (config.forms && config.forms !== 'none') adapters.push(config.forms);
  if (config.stateManagement && config.stateManagement !== 'none') adapters.push(config.stateManagement);
  if (config.dataFetching && config.dataFetching !== 'none') adapters.push(config.dataFetching);
  if (config.ai && config.ai !== 'none') adapters.push(config.ai);
  if (config.jobs && config.jobs !== 'none') adapters.push(config.jobs);
  if (config.cache && config.cache !== 'none') adapters.push(config.cache);
  if (config.email && config.email !== 'none') adapters.push(config.email);
  if (config.payments && config.payments !== 'none') adapters.push(config.payments);

  if (config.testing && config.testing !== 'none') {
    if (config.testing === 'vitest+playwright') {
      adapters.push('vitest', 'playwright');
    } else if (config.testing === 'vitest') {
      adapters.push('vitest');
    } else if (config.testing === 'playwright') {
      adapters.push('playwright');
    }
  }

  if (config.docker) adapters.push('docker');
  if (config.githubActions) adapters.push('github-actions');
  if (config.husky) adapters.push('husky');
  if (config.changesets) adapters.push('changesets');
  if (config.turborepo) adapters.push('turborepo');

  if (config.aiConfig && config.aiConfig.includes('claude-code')) adapters.push('claude-code');
  if (config.aiConfig && config.aiConfig.includes('cursor')) adapters.push('cursor');
  if (config.aiConfig && config.aiConfig.includes('opencode')) adapters.push('opencode');
  if (config.aiConfig && config.aiConfig.includes('continue')) adapters.push('continue');
  if (config.aiConfig && config.aiConfig.includes('sourcegraph')) adapters.push('sourcegraph');
  if (config.aiConfig && config.aiConfig.includes('copilot')) adapters.push('copilot');
  if (config.aiConfig && config.aiConfig.includes('windsurf')) adapters.push('windsurf');
  if (config.aiConfig && config.aiConfig.includes('replit')) adapters.push('replit');
  if (config.aiConfig && config.aiConfig.includes('kotata')) adapters.push('kotata');
  if (config.aiConfig && config.aiConfig.includes('llm-code')) adapters.push('llm-code');
  if (config.aiConfig && config.aiConfig.includes('devin')) adapters.push('devin');

  if (config.deployTarget === 'vercel') adapters.push('deploy-vercel');
  if (config.deployTarget === 'cloudflare-workers') adapters.push('deploy-cloudflare');
  if (config.deployTarget === 'flyio') adapters.push('deploy-flyio');
  if (config.deployTarget === 'railway') adapters.push('deploy-railway');

  return adapters;
}

export async function generate(
  rawConfig: Partial<StackConfig>,
  options: GenerateOptions = {}
): Promise<void> {
  log.intro('Generating project...');

  log.step('Resolving conflicts...');
  const { resolved } = resolveConflicts(rawConfig);

  log.step('Building adapter list...');
  const adapterIds = buildAdapterList(resolved as StackConfig);
  
  // Auto-activate framework adapters based on condition
  for (const [adapterId, adapter] of ADAPTER_REGISTRY) {
    if (adapter.condition && adapter.condition(resolved as StackConfig)) {
      if (!adapterIds.includes(adapterId)) {
        adapterIds.push(adapterId);
      }
    }
  }
  
  log.info(`Active adapters: ${adapterIds.length}`);
  if (resolved.framework) {
    log.info(`Framework: ${resolved.framework}`);
  }

  log.step('Collecting files and dependencies...');
  let allFiles: AdapterFile[] = [];
  let allDeps: AdapterDependency[] = [];
  let allEnvVars: AdapterEnvVar[] = [];
  const allScripts: Record<string, string> = {};
  const postInstallCommands: string[] = [];

  const frameworkId = resolved.framework || 'nextjs';
  const frameworkFiles = getFrameworkTemplate(frameworkId, resolved as StackConfig);
  allFiles.push(...frameworkFiles);

  const frameworkScripts = getTemplateScripts(frameworkId, resolved as StackConfig);
  Object.assign(allScripts, frameworkScripts);

  const frameworkDeps = getTemplateDependencies(frameworkId, resolved as StackConfig);
  allDeps.push(...frameworkDeps);

  for (const adapterId of adapterIds) {
    const adapter = getAdapter(adapterId);
    if (!adapter) {
      log.warn(`Adapter not found: ${adapterId}`);
      continue;
    }

    const files = adapter.files(resolved as StackConfig);
    allFiles.push(...files);

    const deps = adapter.dependencies(resolved as StackConfig);
    allDeps.push(...deps);

    if (adapter.envVars) {
      const envVars = adapter.envVars(resolved as StackConfig);
      allEnvVars.push(...envVars);
    }

    if (adapter.scripts) {
      Object.assign(allScripts, adapter.scripts);
    }

    if (adapter.postInstall) {
      postInstallCommands.push(...adapter.postInstall);
    }
  }

  const dedupedDeps = deduplicateDeps(allDeps);
  const dedupedFiles = deduplicateFiles(allFiles);

  log.step('Writing project files...');
  await writeProject(
    resolved as StackConfig,
    dedupedFiles,
    dedupedDeps,
    allEnvVars,
    allScripts,
    options
  );

  log.step('Running post-install commands...');
  for (const cmd of postInstallCommands) {
    log.info(`Running: ${cmd}`);
  }

  log.success('Project generated successfully!');
}

function deduplicateDeps(deps: AdapterDependency[]): AdapterDependency[] {
  const seen = new Map<string, AdapterDependency>();
  for (const dep of deps) {
    const existing = seen.get(dep.name);
    if (!existing) {
      seen.set(dep.name, dep);
    } else {
      if (compareVersions(dep.version, existing.version) > 0) {
        seen.set(dep.name, dep);
      }
    }
  }
  return Array.from(seen.values());
}

function compareVersions(a: string, b: string): number {
  const parse = (v: string) => {
    const cleaned = v.replace(/^[\^~>=<]/, '');
    const parts = cleaned.split('.').map(p => parseInt(p, 10) || 0);
    return parts;
  };

  const aParts = parse(a);
  const bParts = parse(b);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  return 0;
}

function deduplicateFiles(files: AdapterFile[]): AdapterFile[] {
  const seen = new Map<string, AdapterFile>();
  for (const file of files) {
    if (!seen.has(file.path) || file.overwrite === true) {
      seen.set(file.path, file);
    }
  }
  return Array.from(seen.values());
}
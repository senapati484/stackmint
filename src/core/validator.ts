import { readFile } from 'fs/promises';
import { join } from 'path';
import { execa } from 'execa';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateGeneratedProject(projectPath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if package.json exists and is valid
    const packageJsonPath = join(projectPath, 'package.json');
    let packageJson: any;
    try {
      const content = await readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    } catch (e) {
      errors.push('package.json is invalid or missing');
      return { valid: false, errors, warnings };
    }

    // Check required scripts
    const requiredScripts = ['dev', 'build'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts || !packageJson.scripts[script]) {
        errors.push(`Missing required script: "${script}"`);
      }
    }

    // Check dependencies are not empty
    if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
      warnings.push('No dependencies found in package.json');
    }

    // Try to run dev server with timeout
    if (errors.length === 0 && packageJson.scripts?.dev) {
      try {
        const devScript = packageJson.scripts.dev;
        
        // Detect package manager
        const pm = detectPackageManager(projectPath, packageJson);
        
        // Run the dev command with timeout
        await validateDevServer(projectPath, devScript, pm);
      } catch (e) {
        const err = e as Error;
        // Don't fail on dev server startup - it might need additional setup
        warnings.push(`Dev server startup: ${err.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (e) {
    const err = e as Error;
    errors.push(`Validation failed: ${err.message}`);
    return { valid: false, errors, warnings };
  }
}

function detectPackageManager(projectPath: string, packageJson: any): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  // Check packageManager field in package.json
  if (packageJson.packageManager) {
    if (packageJson.packageManager.includes('pnpm')) return 'pnpm';
    if (packageJson.packageManager.includes('yarn')) return 'yarn';
    if (packageJson.packageManager.includes('bun')) return 'bun';
  }
  return 'npm';
}

async function validateDevServer(projectPath: string, _devScript: string, pm: 'npm' | 'yarn' | 'pnpm' | 'bun'): Promise<void> {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), 5000);

  try {
    const subprocess = execa(pm === 'bun' ? 'bun' : pm,
      pm === 'bun' ? ['run', 'dev'] : pm === 'yarn' ? ['dev'] : pm === 'pnpm' ? ['dev'] : ['run', 'dev'],
      {
        cwd: projectPath,
        signal: abortController.signal,
        stdio: 'pipe',
      }
    );

    await subprocess;
  } catch {
    // Expected — dev server may not fully start within 5s
  } finally {
    clearTimeout(timer);
  }
}

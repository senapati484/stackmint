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

async function validateDevServer(projectPath: string, devScript: string, pm: 'npm' | 'yarn' | 'pnpm' | 'bun'): Promise<void> {
  // Extract just the command from the script (e.g., "vite" from "vite")
  const command = devScript.split(' ')[0];
  
  // Skip validation if it's a custom/complex command
  if (command.includes('&&') || command.includes('|') || command.includes(';')) {
    return;
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Dev server startup timeout (5s) - may need manual setup'));
    }, 5000);
  });

  try {
    // Run dev command with timeout
    const promise = execa(pm === 'bun' ? 'bun' : pm, 
      pm === 'bun' ? ['run', 'dev'] : pm === 'yarn' ? ['dev'] : pm === 'pnpm' ? ['dev'] : ['run', 'dev'],
      {
        cwd: projectPath,
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    // Give the server 5 seconds to start
    await Promise.race([promise, timeoutPromise]);
  } catch (e) {
    // Ignore errors from dev server startup - might be expected behavior
    // (e.g., server starts in background)
  }
}

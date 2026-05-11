import { ADAPTER_REGISTRY } from '../adapters/index.js';
import { initDatabaseAdapters } from '../adapters/database.js';
import { initBaaSAdapters } from '../adapters/baas.js';
import { initAuthAdapters } from '../adapters/auth.js';
import { initValidationAdapters } from '../adapters/validation.js';
import { initDeployAdapters } from '../adapters/deploy.js';
import { initAIAdapters } from '../adapters/ai.js';
import { initJobsAdapters } from '../adapters/jobs.js';
import { initAIIDEAdapters } from '../adapters/ai-ide.js';
import { initDevOpsAdapters } from '../adapters/devops.js';
import { initAdditionalAdapters } from '../adapters/additional.js';
import { initFrameworkAdapters } from '../adapters/frameworks.js';
import { initApiAdapters } from '../adapters/api.js';

export function initAllAdapters(): void {
  try {
    initFrameworkAdapters();
    initDatabaseAdapters();
    initBaaSAdapters();
    initAuthAdapters();
    initApiAdapters();
    initValidationAdapters();
    initDeployAdapters();
    initAIAdapters();
    initJobsAdapters();
    initAIIDEAdapters();
    initDevOpsAdapters();
    initAdditionalAdapters();
  } catch (err) {
    console.warn('Some adapters failed to initialize:', err);
  }
}

export { ADAPTER_REGISTRY } from '../adapters/index.js';
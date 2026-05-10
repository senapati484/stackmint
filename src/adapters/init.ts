import { ADAPTER_REGISTRY } from '../adapters/index.js';

export function initAllAdapters(): void {
  // Import and initialize all adapter registration functions
  // This ensures all adapters are registered before generation

  try {
    // Database adapters
    const dbModule = require('../adapters/database');
    if (dbModule.initDatabaseAdapters) dbModule.initDatabaseAdapters();

    // BaaS adapters
    const baasModule = require('../adapters/baas');
    if (baasModule.initBaaSAdapters) baasModule.initBaaSAdapters();

    // Auth adapters
    const authModule = require('../adapters/auth');
    if (authModule.initAuthAdapters) authModule.initAuthAdapters();

    // Validation adapters
    const validationModule = require('../adapters/validation');
    if (validationModule.initValidationAdapters) validationModule.initValidationAdapters();

    // Deploy adapters
    const deployModule = require('../adapters/deploy');
    if (deployModule.initDeployAdapters) deployModule.initDeployAdapters();

    // AI adapters
    const aiModule = require('../adapters/ai');
    if (aiModule.initAIAdapters) aiModule.initAIAdapters();

    // Jobs adapters
    const jobsModule = require('../adapters/jobs');
    if (jobsModule.initJobsAdapters) jobsModule.initJobsAdapters();

    // AI IDE adapters
    const aiIdeModule = require('../adapters/ai-ide');
    if (aiIdeModule.initAIIDEAdapters) aiIdeModule.initAIIDEAdapters();

    // DevOps adapters
    const devopsModule = require('../adapters/devops');
    if (devopsModule.initDevOpsAdapters) devopsModule.initDevOpsAdapters();

    // Additional adapters
    const additionalModule = require('../adapters/additional');
    if (additionalModule.initAdditionalAdapters) additionalModule.initAdditionalAdapters();

  } catch (err) {
    console.warn('Some adapters failed to initialize:', err);
  }
}

export { ADAPTER_REGISTRY } from '../adapters/index.js';
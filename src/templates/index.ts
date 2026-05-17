import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { FrameworkTemplate } from './registry.js';

export { TEMPLATE_REGISTRY } from './registry.js';
export type { FrameworkTemplate } from './registry.js';

export function getFrameworkTemplate(id: string, config: StackConfig): AdapterFile[] {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template) {
    return [];
  }
  return template.files(config);
}

export function getTemplateScripts(id: string, config: StackConfig): Record<string, string> {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template) {
    return {};
  }
  const scripts = template.scripts;
  if (typeof scripts === 'function') {
    return scripts(config);
  }
  return scripts;
}

export function getTemplateDependencies(id: string, config: StackConfig): AdapterDependency[] {
  const template = TEMPLATE_REGISTRY.get(id);
  if (!template || !template.dependencies) {
    return [];
  }
  const deps = template.dependencies;
  if (typeof deps === 'function') {
    return deps(config);
  }
  return deps;
}

import './nextjs.js';
import './hono.js';
import './sveltekit.js';
import './nuxt.js';
import './astro-ssg.js';
import './astro-ssr.js';
import './vitepress.js';
import './vue-vite.js';
import './svelte-vite.js';
import './solid-vite.js';
import './react-vite.js';
import './expo.js';
import './express.js';
import './react-router-v7.js';
import './tanstack-start.js';
import './nitro.js';
import './qwik.js';
import './angular.js';
import './elysia.js';
import './fastify.js';
import './nestjs.js';
import './h3.js';
import './bun-native.js';
import './react-native.js';
import './docusaurus.js';
import './eleventy.js';
import './gatsby.js';
import './analog.js';
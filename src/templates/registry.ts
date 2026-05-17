import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';

export interface FrameworkTemplate {
  id: string;
  files: (config: StackConfig) => AdapterFile[];
  scripts: Record<string, string> | ((config: StackConfig) => Record<string, string>);
  dependencies?: AdapterDependency[] | ((config: StackConfig) => AdapterDependency[]);
}

export const TEMPLATE_REGISTRY = new Map<string, FrameworkTemplate>();

export function registerTemplate(template: FrameworkTemplate) {
  TEMPLATE_REGISTRY.set(template.id, template);
}

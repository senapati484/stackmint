export interface AdapterFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
  overwrite?: boolean;
}

export interface AdapterEnvVar {
  key: string;
  value: string;
  comment?: string;
}

export interface AdapterDependency {
  name: string;
  version: string;
  dev?: boolean;
}

export interface Adapter {
  id: string;
  name: string;
  files: (config: StackConfig) => AdapterFile[];
  dependencies: (config: StackConfig) => AdapterDependency[];
  envVars?: (config: StackConfig) => AdapterEnvVar[];
  scripts?: Record<string, string>;
  postInstall?: string[];
  conflictsWith?: string[];
  condition?: (config: StackConfig) => boolean;
}

interface StackConfig {
  framework?: string;
  database?: string;
  runtime?: string;
  packageManager?: string;
  deployTarget?: string;
  baas?: string;
  orm?: string;
  auth?: string;
  apiLayer?: string;
  validation?: string;
  styling?: string;
  uiLibrary?: string;
  forms?: string;
  stateManagement?: string;
  dataFetching?: string;
  ai?: string;
  jobs?: string;
  cache?: string;
  email?: string;
  payments?: string;
  testing?: string;
  docker?: boolean;
  githubActions?: boolean;
  husky?: boolean;
  changesets?: boolean;
  turborepo?: boolean;
  aiConfig?: string[];
  category?: string;
  projectName?: string;
  monorepo?: boolean;
  monorepoApps?: string[];
  preset?: string;
  [key: string]: unknown;
}

export const ADAPTER_REGISTRY = new Map<string, Adapter>();

export function getAdapter(id: string): Adapter | undefined {
  return ADAPTER_REGISTRY.get(id);
}

export function getAdapters(ids: string[]): Adapter[] {
  return ids.map(id => ADAPTER_REGISTRY.get(id)).filter(Boolean) as Adapter[];
}

export function registerAdapter(adapter: Adapter): void {
  ADAPTER_REGISTRY.set(adapter.id, adapter);
}


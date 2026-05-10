import { Adapter, AdapterFile, AdapterDependency, ADAPTER_REGISTRY } from './index.js';

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

export function registerZodAdapter(): void {
  const adapter: Adapter = {
    id: 'zod',
    name: 'Zod',
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/validations/index.ts',
        content: `export * from './common';
`,
      },
      {
        path: 'src/lib/validations/common.ts',
        content: `import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const idSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  password: passwordSchema,
});

export const updateUserSchema = createUserSchema.partial();
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: 'zod', version: '^3.23.0' },
    ],
  };


  ADAPTER_REGISTRY.set('zod', adapter);
}

export function registerValibotAdapter(): void {
  const adapter: Adapter = {
    id: 'valibot',
    name: 'Valibot',
    files: (): AdapterFile[] => [
      {
        path: 'src/lib/validations/index.ts',
        content: `export * from './common';
`,
      },
      {
        path: 'src/lib/validations/common.ts',
        content: `import * as v from 'valibot';

export const emailSchema = v.pipe(v.string(), v.email());

export const passwordSchema = v.pipe(
  v.string(),
  v.minLength(8, 'Password must be at least 8 characters'),
  v.regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  v.regex(/[a-z]/, 'Password must contain at least one lowercase letter'),
  v.regex(/[0-9]/, 'Password must contain at least one number')
);

export const idSchema = v.pipe(v.string(), v.uuid());

export const paginationSchema = v.object({
  page: v.pipe(v.string(), v.coerceToNumber(), v.minValue(1)),
  limit: v.pipe(v.string(), v.coerceToNumber(), v.minValue(1), v.maxValue(100)),
});

export const createUserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: emailSchema,
  password: passwordSchema,
});

export const updateUserSchema = v.partial(createUserSchema);
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: 'valibot', version: '^0.36.0' },
    ],
  };


  ADAPTER_REGISTRY.set('valibot', adapter);
}

export function initValidationAdapters(): void {
  registerZodAdapter();
  registerValibotAdapter();
}
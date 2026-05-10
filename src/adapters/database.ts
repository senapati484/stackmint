import { Adapter, AdapterFile, AdapterDependency, AdapterEnvVar } from './index.js';

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

export function registerDrizzleAdapter(): void {
  const adapter: Adapter = {
    id: 'drizzle',
    name: 'Drizzle ORM',
    files: (config: StackConfig): AdapterFile[] => {
      const dbFiles: AdapterFile[] = [
        {
          path: 'src/lib/db.ts',
          content: getDrizzleDbContent(config),
        },
        {
          path: 'src/db/schema/index.ts',
          content: getDrizzleSchemaContent(config),
        },
        {
          path: 'drizzle.config.ts',
          content: getDrizzleConfigContent(config),
        },
        {
          path: 'src/db/migrations/.gitkeep',
          content: '',
        },
      ];
      return dbFiles;
    },
    dependencies: (config: StackConfig): AdapterDependency[] => {
      const deps: AdapterDependency[] = [
        { name: 'drizzle-orm', version: '^0.40.0' },
        { name: 'drizzle-kit', version: '^0.30.0', dev: true },
      ];
      if (config.database === 'postgres') {
        deps.push({ name: 'pg', version: '^8.11.0' }, { name: '@types/pg', version: '^8.11.0', dev: true });
      } else if (config.database === 'mysql') {
        deps.push({ name: 'mysql2', version: '^3.6.0' });
      } else if (config.database === 'sqlite' || config.database === 'turso') {
        deps.push({ name: '@libsql/client', version: '^0.6.0' });
      } else if (config.database === 'neon') {
        deps.push({ name: '@neondatabase/serverless', version: '^0.9.0' });
      }
      return deps;
    },
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'DATABASE_URL',
        value: getDatabaseUrlPlaceholder('postgres'),
        comment: 'PostgreSQL connection string',
      },
    ],
    scripts: {
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'drizzle-kit migrate',
      'db:studio': 'drizzle-kit studio',
      'db:push': 'drizzle-kit push',
    },
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('drizzle', adapter);
}

function getDrizzleDbContent(config: StackConfig): string {
  let importStatement = '';
  let clientInit = '';

  switch (config.database) {
    case 'postgres':
      importStatement = "import { drizzle } from 'drizzle-orm/node-postgres';";
      clientInit = "import pg from 'pg';\nconst pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });\nexport const db = drizzle(pool);";
      break;
    case 'mysql':
      importStatement = "import { drizzle } from 'drizzle-orm/mysql2';";
      clientInit = "import mysql from 'mysql2/promise';\nconst pool = mysql.createPool(process.env.DATABASE_URL!);\nexport const db = drizzle(pool);";
      break;
    case 'sqlite':
    case 'turso':
      importStatement = "import { drizzle } from 'drizzle-orm/better-sqlite3';";
      clientInit = "import Database from 'better-sqlite3';\nconst dbClient = new Database(process.env.DATABASE_URL!);\nexport const db = drizzle(dbClient);";
      break;
    case 'neon':
      importStatement = "import { drizzle } from 'drizzle-orm/neon-http';";
      clientInit = "import { neon } from '@neondatabase/serverless';\nconst sql = neon(process.env.DATABASE_URL!);\nexport const db = drizzle(sql);";
      break;
    default:
      importStatement = "import { drizzle } from 'drizzle-orm/node-postgres';";
      clientInit = "import pg from 'pg';\nconst pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });\nexport const db = drizzle(pool);";
  }

  return `${importStatement}\n${clientInit}\n`;
}

function getDrizzleSchemaContent(_config: StackConfig): string {
  return `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add your schema definitions here
`;
}

function getDrizzleConfigContent(config: StackConfig): string {
  let driver = 'pg';
  if (config.database === 'mysql') driver = 'mysql2';
  else if (config.database === 'sqlite' || config.database === 'turso') driver = 'libsql';
  else if (config.database === 'neon') driver = 'neon-http';

  return `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: \`\${driver}\`,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;
}

export function registerPrismaAdapter(): void {
  const adapter: Adapter = {
    id: 'prisma',
    name: 'Prisma',
    files: (config: StackConfig): AdapterFile[] => {
      let provider = 'postgresql';
      if (config.database === 'mysql') provider = 'mysql';
      else if (config.database === 'sqlite') provider = 'sqlite';
      else if (config.database === 'mongodb') provider = 'mongodb';

      return [
        {
          path: 'prisma/schema.prisma',
          content: getPrismaSchema(provider),
        },
        {
          path: 'src/lib/db.ts',
          content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`,
        },
      ];
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'prisma', version: '^5.0.0', dev: true },
      { name: '@prisma/client', version: '^5.0.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      {
        key: 'DATABASE_URL',
        value: 'postgresql://user:password@localhost:5432/mydb',
        comment: 'PostgreSQL connection string',
      },
    ],
    scripts: {
      'db:generate': 'prisma generate',
      'db:migrate': 'prisma migrate dev',
      'db:studio': 'prisma studio',
      'db:push': 'prisma db push',
    },
    postInstall: ['prisma generate'],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('prisma', adapter);
}

function getPrismaSchema(provider: string): string {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = \`\${provider}\`
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

function getDatabaseUrlPlaceholder(dbType: string): string {
  switch (dbType) {
    case 'postgres':
      return 'postgresql://user:password@localhost:5432/mydb';
    case 'mysql':
      return 'mysql://user:password@localhost:3306/mydb';
    case 'sqlite':
      return './sqlite.db';
    case 'turso':
      return 'libsql://your-db.turso.io?authToken=your-auth-token';
    case 'neon':
      return 'postgresql://user:password@ep-xxx.region.aws.neon.tech/mydb?sslmode=require';
    default:
      return 'postgresql://user:password@localhost:5432/mydb';
  }
}

export function initDatabaseAdapters(): void {
  registerDrizzleAdapter();
  registerPrismaAdapter();
}
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

export function registerJobsAdapters(): void {
  const inngestAdapter: Adapter = {
    id: 'inngest',
    name: 'Inngest',
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [
        {
          path: 'src/lib/inngest/client.ts',
          content: `import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: '${config.projectName || 'my-app'}',
});
`,
        },
        {
          path: 'src/lib/inngest/functions/index.ts',
          content: `import { inngest } from '../client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello' },
  async ({ event }) => {
    return { message: \`Hello, \${event.data.name || 'World'}!\` };
  }
);

export const functions = [helloWorld];
`,
        },
      ];

      if (config.framework === 'nextjs') {
        files.push({
          path: 'src/app/api/inngest/route.ts',
          content: `import { serve } from 'inngest/next';
import { functions } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({ client: inngest, functions });
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'inngest', version: '^3.0.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      { key: 'INNGEST_SIGNING_KEY', value: 'signkey-prod-...', comment: 'Your Inngest signing key' },
      { key: 'INNGEST_EVENT_KEY', value: '...', comment: 'Your Inngest event key' },
    ],
  };

  const bullmqAdapter: Adapter = {
    id: 'bullmq',
    name: 'BullMQ',
    files: (config: StackConfig): AdapterFile[] => [
      {
        path: 'src/lib/queue/redis.ts',
        content: config.cache === 'upstash'
          ? `import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
`
          : `import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
`,
      },
      {
        path: 'src/lib/queue/queues.ts',
        content: `import { Queue } from 'bullmq';
import { redis } from './redis';

export const myQueue = new Queue('my-queue', { connection: redis });

export async function addMyJob(data: { name: string }) {
  await myQueue.add('my-job', data);
}
`,
      },
      {
        path: 'src/lib/queue/workers/example.worker.ts',
        content: `import { Worker } from 'bullmq';
import { redis } from './redis';

const worker = new Worker(
  'my-queue',
  async (job) => {
    console.log(\`Processing job \${job.id}: \`, job.data);
    return { result: 'done' };
  },
  { connection: redis }
);

worker.on('completed', (job) => {
  console.log(\`Job \${job.id} completed\`);
});

worker.on('failed', (job) => {
  console.log(\`Job \${job?.id} failed\`);
});
`,
      },
    ],
    dependencies: (): AdapterDependency[] => [
      { name: 'bullmq', version: '^5.0.0' },
      { name: 'ioredis', version: '^5.3.0' },
    ],
    envVars: (): AdapterEnvVar[] => [
      { key: 'REDIS_URL', value: 'redis://localhost:6379', comment: 'Redis connection URL' },
    ],
  };

  const { ADAPTER_REGISTRY } = require('./index.js');
  ADAPTER_REGISTRY.set('inngest', inngestAdapter);
  ADAPTER_REGISTRY.set('bullmq', bullmqAdapter);
}

export function initJobsAdapters(): void {
  registerJobsAdapters();
}
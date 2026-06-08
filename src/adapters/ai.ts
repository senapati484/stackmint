import { StackConfig, Adapter, AdapterFile, AdapterDependency, AdapterEnvVar, ADAPTER_REGISTRY } from './index.js';

export function registerAIAdapters(): void {
  const vercelAISDKAdapter: Adapter = {
    id: 'vercel-ai-sdk',
    name: 'Vercel AI SDK',
    files: (config: StackConfig): AdapterFile[] => {
      const files: AdapterFile[] = [
        {
          path: 'src/lib/ai.ts',
          content: `import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const model = openai('gpt-4o');
`,
        },
        {
          path: 'src/lib/ai-providers.ts',
          content: `import { createProvider } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// OpenAI (default)
export const openaiProvider = createProvider();

// Anthropic (uncomment to use)
// export const anthropicProvider = createAnthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });
`,
        },
      ];

      if (config.framework === 'nextjs') {
        files.push({
          path: 'src/app/api/chat/route.ts',
          content: `import { streamText } from 'ai';
import { openai } from '@/lib/ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
`,
        });
      }

      return files;
    },
    dependencies: (): AdapterDependency[] => [
      { name: 'ai', version: '^4.0.0' },
      { name: '@ai-sdk/openai', version: '^0.0.60' },
    ],
    envVars: (): AdapterEnvVar[] => [
      { key: 'OPENAI_API_KEY', value: 'sk-...', comment: 'Your OpenAI API key' },
      { key: 'ANTHROPIC_API_KEY', value: 'sk-ant-...', comment: 'Optional - for Anthropic models' },
    ],
  };

  ADAPTER_REGISTRY.set('vercel-ai-sdk', vercelAISDKAdapter);
}

export function initAIAdapters(): void {
  registerAIAdapters();
}
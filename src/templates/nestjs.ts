import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('nestjs', {

  id: 'nestjs',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'stackmint.config.json',
      content: JSON.stringify(config, null, 2),
    },
    {
      path: 'src/server/public/health.ts',
      content: `export function getHealthPayload() {
  return {
    status: 'ok',
    framework: 'nestjs',
    timestamp: new Date().toISOString(),
  };
}
`,
    },
    {
      path: 'src/main.ts',
      content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(3000, () => {
    console.log(\`\\n✨ Server running at http://localhost:3000\\n\`);
  });
}
bootstrap();
`,
    },
    {
      path: 'src/app.module.ts',
      content: `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`,
    },
    {
      path: 'src/app.controller.ts',
      content: `import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { getHealthPayload } from './server/public/health';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('content-type', 'text/html; charset=utf-8')
  getIndex(): string {
    return this.appService.getIndexHTML();
  }

  @Get('api/health')
  getHealth() {
    return getHealthPayload();
  }
}
`,
    },
    {
      path: 'src/app.service.ts',
      content: `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getIndexHTML(): string {
    return \`${getStaticFrontendHTML({
      framework: 'NestJS',
      runtime: 'NestJS',
      styling: 'HTML/CSS',
      build: 'API Server',
      detail: 'Production-ready NestJS starter with a consistent stackmint shell.',
      editPath: 'src/app.controller.ts',
      actionHref: '/api/health',
      actionLabel: 'Check API Health',
    }).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
  }
}
`,
    },
    {
      path: 'public/.gitkeep',
      content: '',
    },
    getStackmintLogoFile(),
    {
      path: 'nest-cli.json',
      content: JSON.stringify({
        $schema: 'https://json.schemastore.org/nest-cli',
        collection: '@nestjs/schematics',
        sourceRoot: 'src',
        compilerOptions: {
          deleteOutDir: true,
        },
      }, null, 2),
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          module: 'commonjs',
          target: 'ES2022',
          lib: ['ES2022'],
          declaration: true,
          outDir: './dist',
          baseUrl: './',
          incremental: true,
          skipLibCheck: true,
          strictNullChecks: false,
          forceConsistentCasingInFileNames: false,
          resolveJsonModule: true,
          strict: false,
        },
      }, null, 2),
    },
    {
      path: 'tsconfig.build.json',
      content: JSON.stringify({
        extends: './tsconfig.json',
        exclude: ['node_modules', 'dist', 'test', '**/*spec.ts'],
      }, null, 2),
    },
  ],
  scripts: { dev: 'nest start --watch', build: 'nest build', start: 'node dist/main' },
});

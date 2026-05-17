import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('nestjs', {

  id: 'nestjs',
  files: (): AdapterFile[] => [
    {
      path: 'src/main.ts',
      content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
      content: `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      framework: 'nestjs',
    };
  }
}
`,
    },
    {
      path: 'src/app.service.ts',
      content: `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from NestJS! Built with stackmint.';
  }
}
`,
    },
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
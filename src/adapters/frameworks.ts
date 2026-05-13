import { Adapter, AdapterFile, AdapterDependency, ADAPTER_REGISTRY } from './index.js';

interface StackConfig {
  framework?: string;
  [key: string]: unknown;
}

export function registerReactFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'react-framework',
    name: 'React Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'react', version: '^18.2.0' },
      { name: 'react-dom', version: '^18.2.0' },
      { name: '@vitejs/plugin-react', version: '^4.2.0', dev: true },
      { name: 'vite', version: '^5.0.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/react', version: '^18.2.0', dev: true },
      { name: '@types/react-dom', version: '^18.2.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'react-vite',
  };


  ADAPTER_REGISTRY.set('react-framework', adapter);
}

export function registerNextJSFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'nextjs-framework',
    name: 'Next.js Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'next', version: '^15.0.0' },
      { name: 'react', version: '^19.0.0' },
      { name: 'react-dom', version: '^19.0.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/node', version: '^20.0.0', dev: true },
      { name: '@types/react', version: '^19.0.0', dev: true },
      { name: '@types/react-dom', version: '^19.0.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/postcss', version: '^4.0.0', dev: true },
      { name: 'postcss', version: '^8.4.0', dev: true },
    ],
    condition: (config: StackConfig) => !!config.framework?.startsWith('next'),
  };


  ADAPTER_REGISTRY.set('nextjs-framework', adapter);
}

export function registerVueFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'vue-framework',
    name: 'Vue Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'vue', version: '^3.3.0' },
      { name: '@vitejs/plugin-vue', version: '^5.0.0', dev: true },
      { name: 'vue-tsc', version: '^2.0.0', dev: true },
      { name: 'vite', version: '^5.0.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@vue/test-utils', version: '^2.4.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'vue-vite',
  };


  ADAPTER_REGISTRY.set('vue-framework', adapter);
}

export function registerSvelteFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'svelte-framework',
    name: 'Svelte Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'svelte', version: '^4.0.0' },
      { name: '@sveltejs/vite-plugin-svelte', version: '^3.0.0', dev: true },
      { name: '@tsconfig/svelte', version: '^5.0.0', dev: true },
      { name: 'vite', version: '^5.0.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'svelte-vite',
  };


  ADAPTER_REGISTRY.set('svelte-framework', adapter);
}

export function registerSolidFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'solid-framework',
    name: 'Solid Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'solid-js', version: '^1.8.0' },
      { name: 'vite', version: '^5.0.0', dev: true },
      { name: 'vite-plugin-solid', version: '^2.7.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'solid-vite',
  };


  ADAPTER_REGISTRY.set('solid-framework', adapter);
}

export function registerExpressFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'express-framework',
    name: 'Express Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'express', version: '^4.19.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/express', version: '^4.17.0', dev: true },
      { name: '@types/node', version: '^20.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'express',
  };
  ADAPTER_REGISTRY.set('express-framework', adapter);
}

export function registerNitroFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'nitro-framework',
    name: 'Nitro Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'nitropack', version: '^2.9.0' },
    ],
    condition: (config: StackConfig) => config.framework === 'nitro',
  };
  ADAPTER_REGISTRY.set('nitro-framework', adapter);
}

export function registerH3FrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'h3-framework',
    name: 'H3 Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'h3', version: '^1.11.0' },
      { name: 'listhen', version: '^1.7.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'h3',
  };
  ADAPTER_REGISTRY.set('h3-framework', adapter);
}

export function registerReactRouterAdapter(): void {
  const adapter: Adapter = {
    id: 'react-router-framework',
    name: 'React Router v7',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'react-router', version: '^7.0.0' },
      { name: '@react-router/node', version: '^7.0.0' },
      { name: '@react-router/serve', version: '^7.0.0' },
      { name: 'react', version: '^18.2.0' },
      { name: 'react-dom', version: '^18.2.0' },
      { name: '@react-router/dev', version: '^7.0.0', dev: true },
      { name: 'vite', version: '^5.4.11', dev: true },
      { name: 'vite-tsconfig-paths', version: '^5.1.4', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'react-router-v7',
  };
  ADAPTER_REGISTRY.set('react-router-framework', adapter);
}

export function registerTanStackStartAdapter(): void {
  const adapter: Adapter = {
    id: 'tanstack-start-framework',
    name: 'TanStack Start',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: '@tanstack/react-start', version: '^1.0.0' },
      { name: '@tanstack/react-router', version: '^1.0.0' },
      { name: 'react', version: '^19.0.0' },
      { name: 'react-dom', version: '^19.0.0' },
      { name: 'vinxi', version: 'latest' },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
      { name: 'vite-tsconfig-paths', version: '^5.1.0', dev: true },
      { name: 'typescript', version: '^5.5.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'tanstack-start',
  };
  ADAPTER_REGISTRY.set('tanstack-start-framework', adapter);
}

export function initFrameworkAdapters(): void {
  registerReactFrameworkAdapter();
  registerNextJSFrameworkAdapter();
  registerVueFrameworkAdapter();
  registerSvelteFrameworkAdapter();
  registerSolidFrameworkAdapter();
  registerHonoFrameworkAdapter();
  registerElysiaFrameworkAdapter();
  registerSvelteKitFrameworkAdapter();
  registerNuxtFrameworkAdapter();
  registerAstroFrameworkAdapter();
  registerQwikFrameworkAdapter();
  registerAngularFrameworkAdapter();
  registerFastifyFrameworkAdapter();
  registerNestJSFrameworkAdapter();
  registerExpressFrameworkAdapter();
  registerNitroFrameworkAdapter();
  registerH3FrameworkAdapter();
  registerReactRouterAdapter();
  registerTanStackStartAdapter();
}

export function registerHonoFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'hono-framework',
    name: 'Hono Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'hono', version: '^4.0.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/node', version: '^20.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'hono',
  };


  ADAPTER_REGISTRY.set('hono-framework', adapter);
}

export function registerElysiaFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'elysia-framework',
    name: 'Elysia Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'elysia', version: '^1.0.0' },
      { name: '@elysiajs/static', version: '^0.7.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'bun-types', version: 'latest', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'elysia',
  };


  ADAPTER_REGISTRY.set('elysia-framework', adapter);
}

export function registerSvelteKitFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'sveltekit-framework',
    name: 'SvelteKit Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'svelte', version: '^5.0.0' },
      { name: '@sveltejs/kit', version: '^2.0.0' },
      { name: '@sveltejs/adapter-auto', version: '^3.0.0', dev: true },
      { name: '@sveltejs/vite-plugin-svelte', version: '^6.0.0', dev: true },
      { name: 'vite', version: '^7.0.0', dev: true },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'sveltekit',
  };


  ADAPTER_REGISTRY.set('sveltekit-framework', adapter);
}

export function registerNuxtFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'nuxt-framework',
    name: 'Nuxt Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'nuxt', version: '^3.0.0' },
      { name: 'vue', version: '^3.3.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'nuxt',
  };


  ADAPTER_REGISTRY.set('nuxt-framework', adapter);
}

export function registerAstroFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'astro-framework',
    name: 'Astro Framework',
    files: (): AdapterFile[] => [],
    dependencies: (config: StackConfig): AdapterDependency[] => [
      { name: 'astro', version: '^4.0.0' },
      ...(config.framework === 'astro-ssr' ? [{ name: '@astrojs/node', version: '^8.0.0' }] : []),
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: 'tailwindcss', version: '^4.0.0', dev: true },
      { name: '@tailwindcss/vite', version: '^4.0.0', dev: true },
    ],
    condition: (config: StackConfig) => !!config.framework?.startsWith('astro'),
  };


  ADAPTER_REGISTRY.set('astro-framework', adapter);
}

export function registerQwikFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'qwik-framework',
    name: 'Qwik Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: '@builder.io/qwik', version: '^1.0.0' },
      { name: '@builder.io/qwik-city', version: '^1.0.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'qwik',
  };


  ADAPTER_REGISTRY.set('qwik-framework', adapter);
}

export function registerAngularFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'angular-framework',
    name: 'Angular Framework',
    files: (): AdapterFile[] => [],
    dependencies: (config: StackConfig): AdapterDependency[] => {
      if (config.framework === 'analog') {
        return [
          { name: '@analogjs/platform', version: '^1.0.0' },
          { name: '@analogjs/router', version: '^1.0.0' },
          { name: '@angular/core', version: '^19.0.0' },
          { name: '@angular/common', version: '^19.0.0' },
          { name: '@angular/compiler', version: '^19.0.0' },
          { name: '@angular/platform-browser', version: '^19.0.0' },
          { name: '@angular/platform-browser-dynamic', version: '^19.0.0' },
          { name: '@angular/platform-server', version: '^19.0.0' },
          { name: '@angular/router', version: '^19.0.0' },
          { name: 'rxjs', version: '^7.8.0' },
          { name: 'zone.js', version: '~0.15.0' },
          { name: 'typescript', version: '^5.5.0', dev: true },
          { name: 'vite', version: '^6.0.0', dev: true },
          { name: '@angular/compiler-cli', version: '^19.0.0', dev: true },
        ];
      }
      return [
        { name: '@angular/core', version: '^19.0.0' },
        { name: '@angular/common', version: '^19.0.0' },
        { name: '@angular/compiler', version: '^19.0.0' },
        { name: '@angular/platform-browser', version: '^19.0.0' },
        { name: '@angular/platform-browser-dynamic', version: '^19.0.0' },
        { name: '@angular/router', version: '^19.0.0' },
        { name: '@angular/forms', version: '^19.0.0' },
        { name: '@angular/common', version: '^19.0.0' },
        { name: 'rxjs', version: '^7.8.0' },
        { name: 'zone.js', version: '~0.15.0' },
        { name: 'tslib', version: '^2.6.0' },
        { name: 'typescript', version: '^5.5.0', dev: true },
        { name: '@angular/cli', version: '^19.0.0', dev: true },
        { name: '@angular/compiler-cli', version: '^19.0.0', dev: true },
        { name: '@angular-devkit/build-angular', version: '^19.0.0', dev: true },
      ];
    },
    condition: (config: StackConfig) => config.framework === 'angular' || config.framework === 'analog',
  };


  ADAPTER_REGISTRY.set('angular-framework', adapter);
}

export function registerFastifyFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'fastify-framework',
    name: 'Fastify Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: 'fastify', version: '^4.0.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/node', version: '^20.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'fastify',
  };


  ADAPTER_REGISTRY.set('fastify-framework', adapter);
}

export function registerNestJSFrameworkAdapter(): void {
  const adapter: Adapter = {
    id: 'nestjs-framework',
    name: 'NestJS Framework',
    files: (): AdapterFile[] => [],
    dependencies: (): AdapterDependency[] => [
      { name: '@nestjs/core', version: '^10.0.0' },
      { name: '@nestjs/common', version: '^10.0.0' },
      { name: '@nestjs/platform-express', version: '^10.0.0' },
      { name: 'typescript', version: '^5.3.0', dev: true },
      { name: '@types/node', version: '^20.0.0', dev: true },
    ],
    condition: (config: StackConfig) => config.framework === 'nestjs',
  };


  ADAPTER_REGISTRY.set('nestjs-framework', adapter);
}

import { AdapterFile } from './index.js';

interface VueConfig {
  framework?: string;
}

export function generateVueComponents(config: VueConfig): AdapterFile[] {
  const files: AdapterFile[] = [];

  // Button component for Vue
  files.push({
    path: 'src/components/Button.vue',
    content: `<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="type"
    :class="cn(buttonVariants({ variant, size }), $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';

interface Props extends VariantProps<typeof buttonVariants> {
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
});

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
</script>
`,
  });

  // Card component for Vue
  files.push({
    path: 'src/components/Card.vue',
    content: `<template>
  <div :class="cn('rounded-lg border border-input bg-card text-card-foreground shadow-sm', $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils/utils';
</script>
`,
  });

  // Input component for Vue
  files.push({
    path: 'src/components/Input.vue',
    content: `<template>
  <input
    :type="type"
    :value="modelValue"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      $attrs.class
    )"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event.target.value)"
    @change="$emit('change')"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils/utils';

interface Props {
  modelValue: string;
  type?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
});

defineEmits<{
  'update:modelValue': [value: string];
  change: [];
}>();
</script>
`,
  });

  // Badge component for Vue
  files.push({
    path: 'src/components/Badge.vue',
    content: `<template>
  <div :class="cn(badgeVariants({ variant }), $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';

interface Props extends VariantProps<typeof badgeVariants> {}

withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
</script>
`,
  });

  // Utility functions
  files.push({
    path: 'src/lib/utils/utils.ts',
    content: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  });

  // Format utilities
  files.push({
    path: 'src/lib/utils/format.ts',
    content: `export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, format = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US');
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toISOString();
}

export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
  
  return 'just now';
}
`,
  });

  // Validation utilities
  files.push({
    path: 'src/lib/utils/validation.ts',
    content: `export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\\+1)?[-.]?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}$/;
  return phoneRegex.test(phone.replace(/\\s/g, ''));
}
`,
  });

  // API client for Vue
  files.push({
    path: 'src/lib/utils/api-client.ts',
    content: `interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiClient<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    finalUrl = \`\${url}?\${searchParams.toString()}\`;
  }

  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.statusText}\`);
  }

  return response.json() as Promise<T>;
}

export function apiPost<T = unknown>(
  url: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiClient<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiGet<T = unknown>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  return apiClient<T>(url, {
    ...options,
    method: 'GET',
  });
}
`,
  });

  // Vue composable for user state
  files.push({
    path: 'src/lib/composables/useUser.ts',
    content: `import { ref, computed } from 'vue';

interface User {
  id: string;
  email: string;
  name?: string;
}

const currentUser = ref<User | null>(null);

export function useUser() {
  const isAuthenticated = computed(() => !!currentUser.value);

  const setUser = (user: User) => {
    currentUser.value = user;
  };

  const clearUser = () => {
    currentUser.value = null;
  };

  const updateUser = (updates: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates };
    }
  };

  return {
    user: computed(() => currentUser.value),
    isAuthenticated,
    setUser,
    clearUser,
    updateUser,
  };
}
`,
  });

  return files;
}

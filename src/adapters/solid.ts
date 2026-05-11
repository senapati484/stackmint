import { AdapterFile } from './index.js';

interface SolidConfig {
  framework?: string;
}

export function generateSolidComponents(config: SolidConfig): AdapterFile[] {
  const files: AdapterFile[] = [];

  // Button component for Solid.js
  files.push({
    path: 'src/components/ui/Button.tsx',
    content: `import { splitProps, Show } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  as?: 'button' | 'a';
  href?: string;
  class?: string;
  children?: any;
}

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

export const Button = (props: ButtonProps) => {
  const [local, others] = splitProps(props, ['as', 'variant', 'size', 'class', 'href']);
  const Component = local.as || 'button';

  return (
    <Component
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      href={local.href}
      {...others}
    />
  );
};
`,
  });

  // Card component for Solid.js
  files.push({
    path: 'src/components/ui/Card.tsx',
    content: `import { splitProps } from 'solid-js';
import { cn } from '@/lib/utils';

interface CardProps {
  class?: string;
  children?: any;
}

export const Card = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={cn('rounded-lg border border-input bg-card text-card-foreground shadow-sm', local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardHeader = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={cn('flex flex-col space-y-1.5 p-6', local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardTitle = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <h2 class={cn('text-2xl font-semibold leading-none tracking-tight', local.class)} {...others}>
      {local.children}
    </h2>
  );
};

export const CardDescription = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <p class={cn('text-sm text-muted-foreground', local.class)} {...others}>
      {local.children}
    </p>
  );
};

export const CardContent = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={cn('p-6 pt-0', local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardFooter = (props: CardProps) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <div class={cn('flex items-center p-6 pt-0', local.class)} {...others}>
      {local.children}
    </div>
  );
};
`,
  });

  // Input component for Solid.js
  files.push({
    path: 'src/components/ui/Input.tsx',
    content: `import { splitProps } from 'solid-js';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: string;
}

export const Input = (props: InputProps) => {
  const [local, others] = splitProps(props, ['class', 'type']);

  return (
    <input
      type={local.type || 'text'}
      class={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...others}
    />
  );
};
`,
  });

  // Badge component for Solid.js
  files.push({
    path: 'src/components/ui/Badge.tsx',
    content: `import { splitProps } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  class?: string;
  children?: any;
}

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

export const Badge = (props: BadgeProps) => {
  const [local, others] = splitProps(props, ['variant', 'class', 'children']);

  return (
    <div class={cn(badgeVariants({ variant: local.variant }), local.class)} {...others}>
      {local.children}
    </div>
  );
};
`,
  });

  // Utility functions
  files.push({
    path: 'src/lib/utils.ts',
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

  // API client for Solid
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

  // Solid stores
  files.push({
    path: 'src/lib/stores/user.ts',
    content: `import { createSignal, createEffect } from 'solid-js';

interface User {
  id: string;
  email: string;
  name?: string;
}

const [user, setUser] = createSignal<User | null>(null);

export function useUser() {
  return {
    user,
    setUser,
    clearUser: () => setUser(null),
    updateUser: (updates: Partial<User>) =>
      setUser(current => (current ? { ...current, ...updates } : null)),
  };
}

// Auto-load user from localStorage
createEffect(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }
});

// Auto-save user to localStorage
createEffect(() => {
  const currentUser = user();
  if (currentUser) {
    localStorage.setItem('user', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('user');
  }
});
`,
  });

  return files;
}

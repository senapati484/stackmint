import { AdapterFile } from './index.js';

interface AstroConfig {
  framework?: string;
}

export function generateAstroComponents(config: AstroConfig): AdapterFile[] {
  const files: AdapterFile[] = [];

  // Button component for Astro
  files.push({
    path: 'src/components/ui/Button.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'button'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const {
  variant = 'default',
  size = 'default',
  class: className,
  ...rest
} = Astro.props;

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const buttonClass = \`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 \${variantStyles[variant]} \${sizeStyles[size]} \${className || ''}\`;
---

<button class={buttonClass} {...rest}>
  <slot />
</button>
`,
  });

  // Card component for Astro
  files.push({
    path: 'src/components/ui/Card.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  variant?: 'default';
}

const { variant = 'default', class: className, ...rest } = Astro.props;
const cardClass = \`rounded-lg border border-input bg-card text-card-foreground shadow-sm \${className || ''}\`;
---

<div class={cardClass} {...rest}>
  <slot />
</div>
`,
  });

  // CardHeader component
  files.push({
    path: 'src/components/ui/CardHeader.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
const headerClass = \`flex flex-col space-y-1.5 p-6 \${className || ''}\`;
---

<div class={headerClass} {...rest}>
  <slot />
</div>
`,
  });

  // CardTitle component
  files.push({
    path: 'src/components/ui/CardTitle.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'h2'> {}

const { class: className, ...rest } = Astro.props;
const titleClass = \`text-2xl font-semibold leading-none tracking-tight \${className || ''}\`;
---

<h2 class={titleClass} {...rest}>
  <slot />
</h2>
`,
  });

  // CardDescription component
  files.push({
    path: 'src/components/ui/CardDescription.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'p'> {}

const { class: className, ...rest } = Astro.props;
const descriptionClass = \`text-sm text-muted-foreground \${className || ''}\`;
---

<p class={descriptionClass} {...rest}>
  <slot />
</p>
`,
  });

  // CardContent component
  files.push({
    path: 'src/components/ui/CardContent.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
const contentClass = \`p-6 pt-0 \${className || ''}\`;
---

<div class={contentClass} {...rest}>
  <slot />
</div>
`,
  });

  // CardFooter component
  files.push({
    path: 'src/components/ui/CardFooter.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
const footerClass = \`flex items-center p-6 pt-0 \${className || ''}\`;
---

<div class={footerClass} {...rest}>
  <slot />
</div>
`,
  });

  // Input component for Astro
  files.push({
    path: 'src/components/ui/Input.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'input'> {
  type?: string;
}

const { type = 'text', class: className, ...rest } = Astro.props;
const inputClass = \`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 \${className || ''}\`;
---

<input type={type} class={inputClass} {...rest} />
`,
  });

  // Badge component for Astro
  files.push({
    path: 'src/components/ui/Badge.astro',
    content: `---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const { variant = 'default', class: className, ...rest } = Astro.props;

const variantStyles = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground',
};

const badgeClass = \`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 \${variantStyles[variant]} \${className || ''}\`;
---

<div class={badgeClass} {...rest}>
  <slot />
</div>
`,
  });

  // Utility functions (same structure but in src/lib/utils.ts)
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
    path: 'src/lib/format.ts',
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
    path: 'src/lib/validation.ts',
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

  // API client for Astro
  files.push({
    path: 'src/lib/api-client.ts',
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

  // Example component for Astro
  files.push({
    path: 'src/components/WelcomeCard.astro',
    content: `---
import Card from './ui/Card.astro';
import CardHeader from './ui/CardHeader.astro';
import CardTitle from './ui/CardTitle.astro';
import CardDescription from './ui/CardDescription.astro';
import CardContent from './ui/CardContent.astro';
import Button from './ui/Button.astro';
---

<Card>
  <CardHeader>
    <CardTitle>Welcome to Your App</CardTitle>
    <CardDescription>Built with Astro + shadcn/ui</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="text-sm text-muted-foreground mb-4">
      Ready to build something amazing? Start by editing the components in <code class="text-xs bg-muted px-1 rounded">src/components</code>.
    </p>
    <Button variant="default">Get Started</Button>
  </CardContent>
</Card>
`,
  });

  return files;
}

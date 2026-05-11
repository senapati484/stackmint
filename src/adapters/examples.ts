import { AdapterFile } from './index.js';

interface ExamplesConfig {
  framework?: string;
  apiLayer?: string;
  auth?: string;
}

export function generateExampleComponents(config: ExamplesConfig): AdapterFile[] {
  const files: AdapterFile[] = [];
  const hasTrpc = config.apiLayer === 'trpc';
  const hasAuth = config.auth && config.auth !== 'none';

  // Example user card component
  files.push({
    path: 'src/components/examples/user-card.tsx',
    content: `'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  name: string;
  email: string;
  role?: string;
  status?: 'active' | 'inactive';
  onAction?: () => void;
}

/**
 * Example user card component
 * Demonstrates using UI components together
 */
export function UserCard({ name, email, role = 'user', status = 'active', onAction }: UserCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Role</span>
          <Badge variant="secondary">{role}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={status === 'active' ? 'default' : 'outline'}>
            {status}
          </Badge>
        </div>
        {onAction && (
          <Button onClick={onAction} className="w-full mt-2">
            View Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
`,
  });

  // Example dashboard layout
  files.push({
    path: 'src/components/examples/dashboard-layout.tsx',
    content: `'use client';

import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}

/**
 * Example dashboard layout component
 * Provides common dashboard structure with sidebar and header
 */
export function DashboardLayout({
  children,
  sidebar,
  header,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-64 border-r border-border bg-card">
          {sidebar}
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {header && (
          <header className="border-b border-border bg-card px-6 py-4">
            {header}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
`,
  });

  // Example form component
  files.push({
    path: 'src/components/examples/form-example.tsx',
    content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { isValidEmail } from '@/lib/utils/validation';

/**
 * Example form component
 * Demonstrates form validation and state management
 */
export function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Simulate API call
    console.log('Form submitted:', formData);
    setSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium">✓ Form submitted successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
`,
  });

  // Example stats card
  files.push({
    path: 'src/components/examples/stats-card.tsx',
    content: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Example stats card component
 * Used for displaying KPIs and metrics
 */
export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <span
              className={\`text-xs font-medium \${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }\`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
`,
  });

  // Example modal component
  files.push({
    path: 'src/components/examples/modal-example.tsx',
    content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example modal component
 * Demonstrates dialog pattern with overlay
 */
export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Example Modal</CardTitle>
              <CardDescription>
                This is a simple modal example
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Modal content goes here. You can add any React components inside.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
`,
  });

  return files;
}

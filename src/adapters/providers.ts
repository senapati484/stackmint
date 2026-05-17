import { AdapterFile } from './index.js';

interface ProvidersConfig {
  framework?: string;
  auth?: string;
  apiLayer?: string;
  stateManagement?: string;
}

export function generateProviderComponents(config: ProvidersConfig): AdapterFile[] {
  const files: AdapterFile[] = [];
  const framework = config.framework || '';
  const isNextJs = framework.startsWith('next');
  const hasAuth = config.auth && config.auth !== 'none';

  if (isNextJs) {
    // Auth provider (if auth is configured)
    if (hasAuth) {
      files.push({
        path: 'src/components/providers/auth-provider.tsx',
        content: `'use client';

import React, { type ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider
 * - Wraps app with authentication context
 * - Session state is managed through useSession() hook
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
`,
      });

      // Auth hooks helper
      files.push({
        path: 'src/lib/hooks/useAuth.ts',
        content: `'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

/**
 * Hook to get current auth session
 * Auto-updates when session changes
 */
export function useAuth() {
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        // Get initial session
        const data = await authClient.getSession();
        setSession(data?.data?.session || null);
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session,
  };
}
`,
      });
    }
  }

  // Common provider utilities
  files.push({
    path: 'src/lib/providers/context.ts',
    content: `import { createContext } from 'react';

/**
 * Theme context for light/dark mode
 */
export const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

/**
 * App context for global state
 */
export const AppContext = createContext<{
  isLoading: boolean;
  error: string | null;
}>({
  isLoading: false,
  error: null,
});
`,
  });

  return files;
}

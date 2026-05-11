import { AdapterFile } from './index.js';

interface UtilsConfig {
  framework?: string;
}

export function generateUtilsHelpers(config: UtilsConfig): AdapterFile[] {
  const files: AdapterFile[] = [];

  // Format utilities
  files.push({
    path: 'src/lib/utils/format.ts',
    content: `/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a date string
 */
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

/**
 * Format time difference (e.g., "2 hours ago")
 */
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
    content: `/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if phone number is valid (basic US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\\+1)?[-.]?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}$/;
  return phoneRegex.test(phone.replace(/\\s/g, ''));
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
`,
  });

  // API client utilities
  files.push({
    path: 'src/lib/utils/api-client.ts',
    content: `interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Wrapper around fetch with query params support
 */
export async function apiClient<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
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

/**
 * POST request helper
 */
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

/**
 * GET request helper
 */
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

  // Hooks (React only)
  const isReactBased = !config.framework || config.framework.includes('next') || config.framework.includes('react') || config.framework.includes('vite');
  
  if (isReactBased) {
    files.push({
      path: 'src/lib/hooks/useLocalStorage.ts',
      content: `'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for syncing state with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        setStoredValue(JSON.parse(item));
      } catch (error) {
        console.error('Error parsing localStorage item:', error);
      }
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (isMounted) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  };

  return [storedValue, setValue];
}
`,
    });

    files.push({
      path: 'src/lib/hooks/useWindowSize.ts',
      content: `'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Hook for tracking window size
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
`,
    });
  }

  // TypeScript types
  files.push({
    path: 'src/lib/types/index.ts',
    content: `/**
 * Common API response type
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * User type (common base)
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}
`,
  });

  return files;
}

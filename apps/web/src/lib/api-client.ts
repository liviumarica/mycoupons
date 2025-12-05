/**
 * API Client utilities with retry logic and error handling
 */

import cache, { withCache, invalidateCache } from './cache';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  useCache?: boolean;
  cacheTTL?: number;
}

const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  useCache: false,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Delays execution for the specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if the error is retryable
 */
function isRetryableError(status: number, retryableStatuses: number[]): boolean {
  return retryableStatuses.includes(status);
}

/**
 * Fetches data with automatic retry logic and optional caching
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries,
    retryDelay,
    retryableStatuses,
    useCache,
    cacheTTL,
  } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...retryOptions,
  };

  // Only cache GET requests
  const method = options.method?.toUpperCase() || 'GET';
  const shouldCache = useCache && method === 'GET';
  const cacheKey = shouldCache ? `api:${url}` : '';

  // Check cache first
  if (shouldCache) {
    const cached = cache.get<ApiResponse<T>>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      lastResponse = response;

      // If response is ok, parse and return
      if (response.ok) {
        const data = await response.json();
        
        // Cache successful GET responses
        if (shouldCache && data.success) {
          cache.set(cacheKey, data, cacheTTL);
        }
        
        return data;
      }

      // If not retryable, throw immediately
      if (!isRetryableError(response.status, retryableStatuses)) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Request failed with status ${response.status}`,
        };
      }

      // If retryable and not last attempt, wait and retry
      if (attempt < maxRetries - 1) {
        await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      // Last attempt failed
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Request failed after ${maxRetries} attempts`,
      };
    } catch (error) {
      lastError = error as Error;

      // Network errors are always retryable
      if (attempt < maxRetries - 1) {
        await delay(retryDelay * Math.pow(2, attempt));
        continue;
      }
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError?.message || 'Network error. Please check your connection.',
  };
}

/**
 * User-friendly error messages for common HTTP status codes
 */
export function getErrorMessage(status: number, defaultMessage?: string): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You need to be logged in to perform this action.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timeout. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service temporarily unavailable. Please try again.',
    504: 'Request timeout. Please try again.',
  };

  return messages[status] || defaultMessage || 'An unexpected error occurred.';
}

/**
 * Checks if the user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Creates an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Invalidate API cache for specific patterns
 */
export function invalidateApiCache(pattern: string | RegExp): void {
  invalidateCache(pattern);
}

/**
 * Clear all API cache
 */
export function clearApiCache(): void {
  cache.clear();
}

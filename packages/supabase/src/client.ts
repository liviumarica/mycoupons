import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Creates a Supabase client for use in browser/Client Components
 * Uses @supabase/ssr for proper SSR support
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClientSSR<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Note: For server-side usage (Server Components, Route Handlers, Server Actions),
 * create the client directly in your Next.js app using @supabase/ssr's createServerClient
 * with proper cookie handling. See the steering guide for the correct implementation.
 * 
 * This package provides the Database types and query helpers that can be used
 * with any Supabase client instance.
 */

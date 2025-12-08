import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@coupon-management/supabase';

/**
 * Creates a Supabase client for use in Client Components
 * Uses @supabase/ssr for proper SSR support
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

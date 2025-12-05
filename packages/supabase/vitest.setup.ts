import { beforeAll, afterAll } from 'vitest';

// Setup and teardown for RLS tests
beforeAll(() => {
  // Verify required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}`
    );
    console.warn('RLS tests require a real Supabase instance to run properly.');
  }
});

afterAll(() => {
  // Cleanup if needed
});

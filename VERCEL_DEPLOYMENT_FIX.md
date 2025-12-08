# Vercel Deployment Fix

## Current Status

The build works locally but fails on Vercel with module resolution errors. This appears to be a webpack/Next.js path resolution issue in the Vercel build environment.

## Issues Fixed

### 1. Environment Variable Configuration
Updated Supabase client files to use the correct environment variable name as per the SSR implementation guide:
- Changed from `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Files Updated:**
- `apps/web/src/lib/supabase/client.ts`
- `apps/web/src/lib/supabase/server.ts`
- `apps/web/src/middleware.ts`
- `apps/web/.env.local` (added both variables for compatibility)

### 2. Turbo Configuration
Added environment variables to `turbo.json` to fix the Vercel build warning:

```json
{
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
  ],
  "tasks": {
    "build": {
      "env": [...]
    }
  }
}
```

### 3. ESLint Errors Fixed
Fixed unescaped entity errors in:
- `apps/web/src/app/about/page.tsx` - Replaced apostrophes with `&apos;`
- `apps/web/src/app/contact/page.tsx` - Replaced apostrophes with `&apos;`
- `apps/web/src/app/privacy/page.tsx` - Replaced apostrophes with `&apos;` and quotes with `&quot;`

## Required Vercel Environment Variables

You need to add/update these environment variables in your Vercel project settings:

### Required Variables:
1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable/anon key
3. `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
4. `OPENAI_API_KEY` - Your OpenAI API key

### Optional Variables:
5. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For web push notifications

### Legacy Support:
6. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Can be set to the same value as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for backward compatibility

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select the appropriate environments (Production, Preview, Development)
5. Click **Save**

## Deployment Steps

1. Commit and push these changes to your repository:
   ```bash
   git add .
   git commit -m "Fix: Update Supabase client configuration and fix ESLint errors"
   git push origin main
   ```

2. Add the environment variables in Vercel (see above)

3. Trigger a new deployment:
   - Vercel will automatically deploy when you push to main
   - Or manually trigger from the Vercel dashboard

## Verification

After deployment, verify:
- [ ] Build completes successfully
- [ ] No environment variable warnings in build logs
- [ ] Authentication works correctly
- [ ] All pages load without errors

## Additional Configuration Changes

### 4. TypeScript Configuration
Added `baseUrl` to `apps/web/tsconfig.json` for better path resolution:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. Webpack Configuration
Added explicit webpack configuration in `next.config.js` for better module resolution:
```javascript
webpack: (config, { isServer }) => {
  config.resolve.extensionAlias = {
    '.js': ['.ts', '.tsx', '.js', '.jsx'],
    '.mjs': ['.mts', '.mjs'],
    '.cjs': ['.cts', '.cjs'],
  };
  return config;
}
```

### 6. pnpm Configuration
Created `.npmrc` file at the root with:
```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

### 7. Vercel Build Command
Updated to use frozen lockfile:
```json
"buildCommand": "cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=web"
```

## Troubleshooting

If the build still fails on Vercel, try these steps:

1. **Clear Vercel Build Cache**
   - Go to Vercel Dashboard → Settings → General
   - Scroll to "Build & Development Settings"
   - Clear the build cache

2. **Check Environment Variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set in Vercel
   - Verify all required environment variables are present

3. **Verify Node Version**
   - Check that Vercel is using Node 18+ (required for Next.js 15)
   - Set in vercel.json or project settings if needed

4. **Check Build Logs**
   - Look for any pnpm workspace resolution errors
   - Verify that all workspace packages are being found

5. **Try Manual Deployment**
   - Use Vercel CLI: `vercel --prod`
   - This can help identify environment-specific issues

## Notes

- The code now follows the official Supabase SSR implementation guide
- Both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are supported for compatibility
- Local build passes successfully with these changes
- The module resolution issue appears to be specific to Vercel's build environment

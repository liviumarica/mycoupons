# Vercel Deployment Fix

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

## Notes

- The code now follows the official Supabase SSR implementation guide
- Both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are supported for compatibility
- Local build passes successfully with these changes

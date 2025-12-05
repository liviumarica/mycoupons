# Environment Variables Reference

Complete reference for all environment variables used in the Coupon Management Platform.

## Table of Contents

- [Overview](#overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [How to Obtain Values](#how-to-obtain-values)
- [Troubleshooting](#troubleshooting)

## Overview

Environment variables are used to configure the application for different environments (development, staging, production) without changing code.

### File Locations

- **Development**: `apps/web/.env.local` (not committed to git)
- **Production**: Configured in Vercel Dashboard
- **Example**: `apps/web/.env.example` (template, committed to git)

### Variable Naming Convention

- **`NEXT_PUBLIC_*`**: Exposed to browser (client-side)
- **No prefix**: Server-side only (never exposed to browser)

## Required Variables

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`

- **Type**: String (URL)
- **Required**: Yes
- **Exposed to**: Client and Server
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Type**: String (JWT)
- **Required**: Yes
- **Exposed to**: Client and Server
- **Description**: Supabase anonymous/public key for client-side operations
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Security**: Safe to expose (RLS policies protect data)

#### `SUPABASE_SERVICE_ROLE_KEY`

- **Type**: String (JWT)
- **Required**: Yes
- **Exposed to**: Server only
- **Description**: Supabase service role key for server-side operations (bypasses RLS)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `service_role`
- **Security**: ⚠️ **NEVER expose to client** - has full database access

### OpenAI Configuration

#### `OPENAI_API_KEY`

- **Type**: String
- **Required**: Yes
- **Exposed to**: Server only
- **Description**: OpenAI API key for GPT-4 and GPT-4 Vision
- **Example**: `sk-proj-abc123...`
- **Where to find**: OpenAI Platform → API Keys → Create new secret key
- **Security**: ⚠️ **NEVER expose to client** - costs money per request
- **Cost**: Pay-per-use (GPT-4 Vision: ~$0.01-0.03 per image)

### Web Push Notifications (VAPID)

#### `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

- **Type**: String (Base64)
- **Required**: Yes (for push notifications)
- **Exposed to**: Client and Server
- **Description**: VAPID public key for web push notifications
- **Example**: `BEl62iUYgUivxIkv69yViEuiBIa-Ib27SzV8-jnk...`
- **How to generate**: Run `node apps/web/scripts/generate-vapid-keys.js`
- **Security**: Safe to expose

#### `VAPID_PRIVATE_KEY`

- **Type**: String (Base64)
- **Required**: Yes (for push notifications)
- **Exposed to**: Server only
- **Description**: VAPID private key for signing push notifications
- **Example**: `bdSiGcHIxSk-5yHfnvXxU9MlT6ZcqGqWA1...`
- **How to generate**: Run `node apps/web/scripts/generate-vapid-keys.js`
- **Security**: ⚠️ **NEVER expose to client**

## Optional Variables

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`

- **Type**: String (URL)
- **Required**: No
- **Default**: `http://localhost:3000` (development)
- **Exposed to**: Client and Server
- **Description**: Base URL of the application
- **Example**: `https://mycoupons.vercel.app`
- **Usage**: Used for generating absolute URLs (e.g., in emails, notifications)

#### `NODE_ENV`

- **Type**: String
- **Required**: No
- **Default**: `development`
- **Exposed to**: Server only
- **Description**: Node.js environment mode
- **Values**: `development`, `production`, `test`
- **Usage**: Automatically set by Next.js and Vercel

### Development/Debugging

#### `NEXT_PUBLIC_DEBUG`

- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Exposed to**: Client and Server
- **Description**: Enable debug logging
- **Values**: `true`, `false`
- **Usage**: Set to `true` for verbose console logs

## Environment-Specific Configuration

### Development (.env.local)

```env
# Supabase (Development Project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Development Key with lower rate limits)
OPENAI_API_KEY=sk-proj-dev-abc123...

# VAPID (Development Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa...
VAPID_PRIVATE_KEY=bdSiGcHIxSk-5yHfnvXxU9MlT6ZcqGqWA1...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Production (Vercel)

```env
# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Production Key)
OPENAI_API_KEY=sk-proj-prod-xyz789...

# VAPID (Production Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDifferentKeyForProduction...
VAPID_PRIVATE_KEY=differentPrivateKeyForProduction...

# App Configuration
NEXT_PUBLIC_APP_URL=https://mycoupons.vercel.app
NODE_ENV=production
```

### Staging/Preview (Vercel)

Use separate Supabase project or same as development with different keys.

## Security Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good - in .gitignore
apps/web/.env.local
apps/web/.env.production

# ❌ Bad - committed to git
apps/web/.env
```

### 2. Use Different Keys Per Environment

- **Development**: Lower rate limits, test data
- **Staging**: Similar to production, separate database
- **Production**: Full rate limits, real data

### 3. Rotate Keys Regularly

- **OpenAI API Key**: Every 90 days
- **VAPID Keys**: Every 180 days
- **Supabase Keys**: When team members leave

### 4. Limit Key Permissions

- Use Supabase **anon key** for client-side (protected by RLS)
- Use **service role key** only in API routes (never client-side)
- Set OpenAI API key usage limits

### 5. Monitor Usage

- Track OpenAI API costs daily
- Monitor Supabase API requests
- Set up alerts for unusual activity

### 6. Secure Storage

Store production secrets in:
- Vercel Environment Variables (encrypted)
- 1Password / LastPass (team access)
- AWS Secrets Manager (enterprise)

**Never:**
- Email secrets
- Store in Slack/Discord
- Commit to git
- Share in screenshots

## How to Obtain Values

### Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to **API Keys**
3. Click **"Create new secret key"**
4. Name it (e.g., "Coupon Management - Production")
5. Copy the key immediately (shown only once)
6. Set usage limits (recommended: $50/month)

### VAPID Keys

Generate using the provided script:

```bash
node apps/web/scripts/generate-vapid-keys.js
```

Output:
```
VAPID Keys Generated:

Public Key (add to .env.local as NEXT_PUBLIC_VAPID_PUBLIC_KEY):
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SzV8-jnk...

Private Key (add to .env.local as VAPID_PRIVATE_KEY):
bdSiGcHIxSk-5yHfnvXxU9MlT6ZcqGqWA1...
```

Copy both keys to your `.env.local` file.

## Troubleshooting

### Variables Not Loading

**Symptom:** App can't connect to Supabase or OpenAI

**Solutions:**

1. **Check file location:**
   ```bash
   # Should be in apps/web/.env.local
   ls -la apps/web/.env.local
   ```

2. **Check variable names:**
   - Client-side variables MUST start with `NEXT_PUBLIC_`
   - Names are case-sensitive

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

4. **Check for syntax errors:**
   ```env
   # ✅ Correct
   OPENAI_API_KEY=sk-proj-abc123

   # ❌ Wrong (no spaces around =)
   OPENAI_API_KEY = sk-proj-abc123

   # ❌ Wrong (no quotes needed)
   OPENAI_API_KEY="sk-proj-abc123"
   ```

### Variables Not Working in Production

**Symptom:** Works locally but fails on Vercel

**Solutions:**

1. **Check Vercel dashboard:**
   - Go to Project → Settings → Environment Variables
   - Verify all variables are set
   - Check they're enabled for Production environment

2. **Redeploy after adding variables:**
   - Adding variables doesn't auto-redeploy
   - Trigger new deployment manually

3. **Check variable names match:**
   - Copy from `.env.local` to avoid typos
   - Verify case sensitivity

### CORS Errors

**Symptom:** "CORS policy" errors in browser console

**Solutions:**

1. **Verify Supabase URL:**
   - Must match exactly (including https://)
   - No trailing slash

2. **Check API key:**
   - Use anon key for client-side
   - Use service role key for server-side only

### OpenAI API Errors

**Symptom:** "Invalid API key" or "Rate limit exceeded"

**Solutions:**

1. **Verify API key:**
   - Should start with `sk-proj-` or `sk-`
   - No extra spaces or quotes

2. **Check billing:**
   - Go to OpenAI Platform → Billing
   - Ensure payment method is active
   - Check usage limits

3. **Check rate limits:**
   - Free tier: Very limited
   - Paid tier: Higher limits
   - Consider upgrading plan

### Push Notifications Not Working

**Symptom:** Notifications not received

**Solutions:**

1. **Verify VAPID keys:**
   - Public key should start with 'B'
   - Both keys should be base64 strings
   - Regenerate if unsure: `node apps/web/scripts/generate-vapid-keys.js`

2. **Check Supabase secrets:**
   ```bash
   supabase secrets list
   ```
   Should show VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY

3. **Test in different browser:**
   - Some browsers block notifications
   - Try Chrome/Firefox

## Validation Script

Create `scripts/validate-env.js` to check environment variables:

```javascript
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY'
]

const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:')
  missing.forEach(key => console.error(`  - ${key}`))
  process.exit(1)
}

console.log('✅ All required environment variables are set')
```

Run before deployment:
```bash
node scripts/validate-env.js
```

## Quick Reference

| Variable | Client/Server | Required | Where to Get |
|----------|---------------|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Both | Yes | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both | Yes | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Yes | Supabase Dashboard |
| `OPENAI_API_KEY` | Server | Yes | OpenAI Platform |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Both | Yes | Generate script |
| `VAPID_PRIVATE_KEY` | Server | Yes | Generate script |
| `NEXT_PUBLIC_APP_URL` | Both | No | Your domain |
| `NODE_ENV` | Server | No | Auto-set |

## Related Documentation

- [Setup Guide](./SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Supabase Setup](./SUPABASE_SETUP.md)

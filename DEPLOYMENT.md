# Deployment Guide

This guide covers deploying the Coupon Management Platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project created and configured
- ✅ OpenAI API key with sufficient credits
- ✅ VAPID keys generated for push notifications
- ✅ All environment variables documented
- ✅ Database migrations applied
- ✅ Edge Functions deployed
- ✅ RLS policies tested

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select the repository containing your code

### Step 2: Configure Project

**Framework Preset:** Next.js

**Root Directory:** `apps/web`

**Build Command:**
```bash
cd ../.. && pnpm install && pnpm build --filter=web
```

**Output Directory:** `.next`

**Install Command:**
```bash
pnpm install
```

### Step 3: Environment Variables

Add all environment variables in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Important:** 
- Set environment variables for **Production**, **Preview**, and **Development** environments
- Never commit `.env.local` files to version control
- Use Vercel's environment variable encryption

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (typically 2-5 minutes)
3. Verify deployment at the provided URL

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## Supabase Configuration

### Step 1: Production Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Database** → **Migrations**
4. Ensure all migrations are applied

### Step 2: Row Level Security

Verify RLS policies are enabled:

```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### Step 3: Storage Configuration

1. Navigate to **Storage** → **Policies**
2. Verify RLS policies on `coupon-images` bucket:
   - Users can upload to their own folder
   - Users can read their own images
   - Users can delete their own images

### Step 4: Edge Functions

Deploy Edge Functions using Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set VAPID_PUBLIC_KEY=your-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-private-key

# Deploy all functions
supabase functions deploy

# Verify deployment
supabase functions list
```

See [supabase/DEPLOYMENT.md](./supabase/DEPLOYMENT.md) for detailed Edge Function deployment.

### Step 5: Cron Jobs

Verify the notification cron job is configured:

1. Go to **Edge Functions** → `send-expiry-notifications`
2. Check **Cron** tab
3. Ensure schedule is set to: `0 9 * * *` (9 AM UTC daily)

## Environment Variables

### Production Environment Variables

Create a secure backup of your production environment variables:

```bash
# Export from Vercel
vercel env pull .env.production

# Or manually document in a secure location (1Password, etc.)
```

### Environment Variable Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key
- [ ] `VAPID_PRIVATE_KEY` - VAPID private key (server-only)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `NODE_ENV=production` - Environment mode

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** (every 90 days recommended)
4. **Limit API key permissions** to minimum required
5. **Monitor API usage** for anomalies
6. **Use environment-specific keys** for Vercel preview deployments

## CI/CD Pipeline

### GitHub Actions Setup

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
      
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm type-check
      
      - name: Build
        run: pnpm build

  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
```

### Vercel Integration

Vercel automatically deploys on:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and pushes to other branches

Configure in `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm build --filter=web",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Deployment Workflow

1. **Development** → Push to feature branch
2. **Preview** → Create pull request (Vercel creates preview deployment)
3. **Review** → Test preview deployment
4. **Merge** → Merge to main (triggers production deployment)
5. **Verify** → Check production deployment

## Post-Deployment

### Step 1: Verify Application

Test critical paths:

- [ ] User can sign up with magic link
- [ ] User can log in
- [ ] User can add coupon via text
- [ ] User can add coupon via image
- [ ] User can view dashboard
- [ ] User can filter/sort coupons
- [ ] User can configure reminders
- [ ] Push notifications work

### Step 2: Configure Monitoring

Set up monitoring in Vercel:

1. Go to Project → Analytics
2. Enable **Web Analytics**
3. Enable **Speed Insights**
4. Configure **Log Drains** (optional)

### Step 3: Set Up Alerts

Configure alerts for:
- Deployment failures
- High error rates
- Performance degradation
- API quota warnings

### Step 4: Database Indexes

Verify performance indexes are created:

```sql
-- Check existing indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Required indexes:
- `coupons(user_id)`
- `coupons(valid_until)`
- `reminder_preferences(user_id)`
- `push_subscriptions(user_id)`
- `notification_logs(coupon_id, notification_type, sent_at)`

### Step 5: Backup Strategy

Configure automated backups in Supabase:

1. Go to **Database** → **Backups**
2. Enable **Daily Backups**
3. Set retention period (7 days minimum)
4. Test restore procedure

## Monitoring

### Application Monitoring

**Vercel Analytics:**
- Page views and unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Error tracking
- API route performance

**Supabase Dashboard:**
- Database performance
- API usage
- Storage usage
- Edge Function invocations

### Key Metrics to Monitor

1. **Performance**
   - Page load time < 3s
   - Time to Interactive < 5s
   - API response time < 500ms

2. **Errors**
   - Error rate < 1%
   - Failed API calls
   - Failed push notifications

3. **Usage**
   - Daily active users
   - Coupons created per day
   - Notifications sent per day
   - API quota usage

4. **Costs**
   - Vercel bandwidth usage
   - Supabase database size
   - OpenAI API costs
   - Edge Function invocations

### Logging

Access logs:

**Vercel Logs:**
```bash
vercel logs <deployment-url>
```

**Supabase Edge Function Logs:**
```bash
supabase functions logs send-expiry-notifications
```

**Database Logs:**
- Go to Supabase Dashboard → Logs
- Filter by severity and time range

## Troubleshooting

### Deployment Fails

**Issue:** Build fails on Vercel

**Solutions:**
1. Check build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Ensure build command is correct
4. Check Node.js version compatibility
5. Clear Vercel cache and redeploy

### Environment Variables Not Working

**Issue:** App can't connect to Supabase or OpenAI

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Check variable names (case-sensitive)
3. Ensure `NEXT_PUBLIC_` prefix for client-side variables
4. Redeploy after adding variables
5. Check for trailing spaces in values

### Database Connection Issues

**Issue:** Can't connect to Supabase database

**Solutions:**
1. Verify Supabase project is active
2. Check connection pooler settings
3. Verify RLS policies allow access
4. Check service role key is correct
5. Review Supabase status page

### Push Notifications Not Working

**Issue:** Users not receiving notifications

**Solutions:**
1. Verify VAPID keys are set in Supabase secrets
2. Check Edge Function is deployed and active
3. Verify cron schedule is configured
4. Check notification_logs table for errors
5. Test push subscription in browser
6. Review Edge Function logs

### Performance Issues

**Issue:** Slow page loads or API responses

**Solutions:**
1. Enable Vercel Edge Caching
2. Optimize images with Next.js Image
3. Add database indexes
4. Implement API response caching
5. Use Vercel Analytics to identify bottlenecks
6. Consider upgrading Supabase plan

### High Costs

**Issue:** Unexpected high costs

**Solutions:**
1. Review OpenAI API usage
2. Check Vercel bandwidth usage
3. Optimize database queries
4. Implement rate limiting
5. Cache API responses
6. Review Edge Function invocations

## Rollback Procedure

If deployment causes issues:

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Database Rollback

```bash
# List migrations
supabase db remote list

# Rollback to specific version
supabase db reset --version <version>
```

### Edge Function Rollback

```bash
# List function versions
supabase functions list --show-versions

# Deploy specific version
supabase functions deploy send-expiry-notifications --version <version-id>
```

## Security Checklist

Before going live:

- [ ] All RLS policies enabled and tested
- [ ] Service role key only used server-side
- [ ] HTTPS enforced on all connections
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Secrets not in version control
- [ ] Error messages don't leak sensitive info
- [ ] Database backups configured
- [ ] Monitoring and alerts set up

## Performance Checklist

- [ ] Images optimized with Next.js Image
- [ ] Code splitting implemented
- [ ] API responses cached
- [ ] Database queries optimized
- [ ] Indexes created on frequently queried columns
- [ ] Static pages pre-rendered
- [ ] Bundle size analyzed and optimized
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

## Support

For deployment issues:

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Documentation**: See project docs folder

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Supabase Setup](./SUPABASE_SETUP.md)
- [Supabase Edge Functions](./supabase/DEPLOYMENT.md)
- [Push Notifications](./apps/web/docs/PUSH_NOTIFICATIONS.md)

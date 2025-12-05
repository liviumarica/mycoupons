# Deployment Checklist

Use this checklist before deploying to production to ensure everything is configured correctly.

## Pre-Deployment

### Code Quality

- [ ] All tests passing locally (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code formatted (`pnpm format`)
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed or documented

### Environment Variables

- [ ] All required environment variables documented in `ENVIRONMENT_VARIABLES.md`
- [ ] `.env.example` file updated with all variables
- [ ] Production environment variables set in Vercel
- [ ] Supabase URL and keys configured
- [ ] OpenAI API key configured
- [ ] VAPID keys generated and configured
- [ ] No secrets committed to git

### Database

- [ ] All migrations applied to production database
- [ ] Database indexes created (see `supabase/migrations/add_performance_indexes.sql`)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested with `pnpm test:rls`
- [ ] Storage bucket created with RLS policies
- [ ] Database backups configured (daily minimum)

### Supabase Configuration

- [ ] Production Supabase project created
- [ ] Auth providers configured (Magic Link)
- [ ] Email templates customized
- [ ] Storage buckets created (`coupon-images`)
- [ ] Edge Functions deployed
- [ ] Cron jobs configured (notification function at 9 AM UTC)
- [ ] Secrets set in Supabase (VAPID keys)

### Security

- [ ] RLS policies enabled and tested
- [ ] Service role key only used server-side
- [ ] CORS configured correctly
- [ ] Rate limiting implemented on API routes
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured (see `vercel.json`)
- [ ] HTTPS enforced

### Performance

- [ ] Images optimized with Next.js Image component
- [ ] Code splitting implemented
- [ ] API responses cached where appropriate
- [ ] Database queries optimized
- [ ] Bundle size analyzed and acceptable
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

### Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry or similar)
- [ ] Log drains configured (optional)
- [ ] Alerts set up for critical errors
- [ ] Database monitoring enabled
- [ ] API usage monitoring enabled

## Deployment Steps

### 1. Vercel Setup

- [ ] Repository connected to Vercel
- [ ] Project settings configured
  - [ ] Framework: Next.js
  - [ ] Root Directory: `apps/web`
  - [ ] Build Command: `cd ../.. && pnpm install && pnpm build --filter=web`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `pnpm install`
- [ ] Environment variables added
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned

### 2. Initial Deployment

- [ ] Deploy to production
- [ ] Verify build succeeds
- [ ] Check deployment logs for errors
- [ ] Verify deployment URL is accessible

### 3. Supabase Edge Functions

- [ ] Edge Functions deployed (`supabase functions deploy`)
- [ ] Secrets configured (`supabase secrets set`)
- [ ] Cron schedule verified
- [ ] Test manual invocation
- [ ] Check function logs

## Post-Deployment Verification

### Functional Testing

- [ ] User can access the application
- [ ] User can sign up with magic link
- [ ] User receives magic link email
- [ ] User can log in
- [ ] User can add coupon via text
- [ ] User can add coupon via image upload
- [ ] AI extraction works correctly
- [ ] User can view dashboard
- [ ] User can filter coupons
- [ ] User can sort coupons
- [ ] User can delete coupons
- [ ] User can configure reminder preferences
- [ ] User can enable push notifications
- [ ] Push notification permission requested
- [ ] User can log out

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] API response time < 500ms
- [ ] Images load quickly
- [ ] No layout shifts (CLS)
- [ ] Smooth animations

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Testing

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px+)
- [ ] Large desktop (1920px+)

### Security Testing

- [ ] Cannot access other users' data
- [ ] Cannot bypass authentication
- [ ] Cannot inject SQL
- [ ] Cannot inject XSS
- [ ] HTTPS enforced
- [ ] Security headers present

### Monitoring Setup

- [ ] Vercel Analytics showing data
- [ ] Error tracking receiving events
- [ ] Database metrics visible
- [ ] API usage tracking working
- [ ] Alerts configured and tested

## Post-Deployment Tasks

### Documentation

- [ ] Update README with production URL
- [ ] Document any deployment issues encountered
- [ ] Update runbook with production specifics
- [ ] Share deployment announcement with team

### Communication

- [ ] Notify stakeholders of deployment
- [ ] Share production URL
- [ ] Provide access credentials (if needed)
- [ ] Schedule follow-up review

### Monitoring

- [ ] Monitor error rates for 24 hours
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor API costs (OpenAI)
- [ ] Monitor database usage

## Rollback Plan

If issues are discovered:

### Immediate Actions

- [ ] Identify the issue
- [ ] Assess severity (critical/major/minor)
- [ ] Decide: fix forward or rollback

### Rollback Steps

1. **Vercel Rollback:**
   - [ ] Go to Vercel Dashboard → Deployments
   - [ ] Find previous working deployment
   - [ ] Click "..." → "Promote to Production"

2. **Database Rollback (if needed):**
   - [ ] Identify migration to rollback to
   - [ ] Run: `supabase db reset --version <version>`
   - [ ] Verify data integrity

3. **Edge Function Rollback (if needed):**
   - [ ] List versions: `supabase functions list --show-versions`
   - [ ] Deploy previous version: `supabase functions deploy <name> --version <id>`

4. **Verification:**
   - [ ] Test critical paths
   - [ ] Verify issue is resolved
   - [ ] Monitor for 30 minutes

### Post-Rollback

- [ ] Document what went wrong
- [ ] Create fix in development
- [ ] Test fix thoroughly
- [ ] Plan re-deployment

## Maintenance Schedule

### Daily

- [ ] Check error rates
- [ ] Monitor API costs
- [ ] Review critical alerts

### Weekly

- [ ] Review performance metrics
- [ ] Check database size
- [ ] Review user feedback
- [ ] Update dependencies (if needed)

### Monthly

- [ ] Security audit
- [ ] Performance optimization review
- [ ] Cost analysis
- [ ] Backup verification
- [ ] Key rotation check

### Quarterly

- [ ] Rotate API keys
- [ ] Review and update documentation
- [ ] Dependency updates
- [ ] Security penetration testing
- [ ] Disaster recovery drill

## Emergency Contacts

Document key contacts for production issues:

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **OpenAI Support**: https://help.openai.com
- **Team Lead**: [Name/Email]
- **DevOps**: [Name/Email]
- **On-Call**: [Phone/Slack]

## Useful Commands

### Vercel

```bash
# View logs
vercel logs <deployment-url>

# List deployments
vercel ls

# Promote deployment
vercel promote <deployment-url>
```

### Supabase

```bash
# Deploy functions
supabase functions deploy

# View function logs
supabase functions logs <function-name>

# List secrets
supabase secrets list

# Run migration
supabase db push
```

### Monitoring

```bash
# Check build status
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Success Criteria

Deployment is considered successful when:

- ✅ All automated tests pass
- ✅ All manual test cases pass
- ✅ No critical errors in logs
- ✅ Performance metrics meet targets
- ✅ Security checks pass
- ✅ Monitoring is active
- ✅ Team is notified
- ✅ Documentation is updated

## Notes

Use this space to document deployment-specific notes:

- Deployment date: _______________
- Deployed by: _______________
- Version/commit: _______________
- Issues encountered: _______________
- Resolution: _______________
- Follow-up items: _______________

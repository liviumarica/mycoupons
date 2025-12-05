# Production Readiness Guide

This guide helps you prepare the Coupon Management Platform for production deployment.

## Table of Contents

- [Overview](#overview)
- [Infrastructure Setup](#infrastructure-setup)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Observability](#monitoring--observability)
- [Disaster Recovery](#disaster-recovery)
- [Cost Optimization](#cost-optimization)
- [Compliance](#compliance)

## Overview

### Production Readiness Checklist

Use this high-level checklist to track your progress:

- [ ] Infrastructure configured
- [ ] Security hardened
- [ ] Performance optimized
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Team trained
- [ ] Runbook created

## Infrastructure Setup

### Vercel Configuration

**Project Settings:**
- [ ] Framework: Next.js
- [ ] Node.js Version: 18.x
- [ ] Build Command: `cd ../.. && pnpm install && pnpm build --filter=web`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`
- [ ] Root Directory: `apps/web`

**Deployment Settings:**
- [ ] Auto-deploy on push to main: Enabled
- [ ] Preview deployments: Enabled for PRs
- [ ] Production branch: `main`
- [ ] Deployment protection: Enabled (optional)

**Domain Configuration:**
- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Redirects configured (www → non-www or vice versa)

### Supabase Configuration

**Project Settings:**
- [ ] Production project created (separate from development)
- [ ] Region selected (closest to users)
- [ ] Pricing plan: Pro or higher (for production workloads)
- [ ] Connection pooling: Enabled
- [ ] Connection pool size: 15+ (adjust based on load)

**Database:**
- [ ] All migrations applied
- [ ] Indexes created (see performance section)
- [ ] RLS policies enabled on all tables
- [ ] RLS policies tested
- [ ] Backup schedule: Daily
- [ ] Point-in-time recovery: Enabled (Pro plan)

**Storage:**
- [ ] `coupon-images` bucket created
- [ ] RLS policies configured
- [ ] File size limits set (10MB recommended)
- [ ] Allowed MIME types configured (image/*)

**Auth:**
- [ ] Magic link enabled
- [ ] Email templates customized
- [ ] Rate limiting configured
- [ ] Session timeout: 7 days (adjust as needed)
- [ ] Email confirmations: Enabled

**Edge Functions:**
- [ ] `send-expiry-notifications` deployed
- [ ] Cron schedule: `0 9 * * *` (9 AM UTC)
- [ ] Secrets configured (VAPID keys)
- [ ] Timeout: 60 seconds
- [ ] Memory: 256MB (adjust if needed)

### OpenAI Configuration

- [ ] Production API key created
- [ ] Usage limits set ($100/month recommended)
- [ ] Billing alerts configured
- [ ] Rate limits understood (GPT-4: 10,000 TPM)
- [ ] Fallback strategy for rate limits

## Security Hardening

### Authentication & Authorization

**Supabase Auth:**
- [ ] Magic link expiration: 1 hour
- [ ] Session expiration: 7 days
- [ ] Refresh token rotation: Enabled
- [ ] Email verification: Required
- [ ] Rate limiting: 5 attempts per hour per IP

**Row Level Security:**
- [ ] RLS enabled on all tables
- [ ] Policies tested with multiple users
- [ ] Service role key only used server-side
- [ ] Anon key used for client-side

### API Security

**Rate Limiting:**
```typescript
// Implement in API routes
const rateLimit = {
  '/api/coupons/extract': '10 per minute',
  '/api/coupons': '100 per minute',
  '/api/notifications/subscribe': '5 per minute'
}
```

**Input Validation:**
- [ ] All form inputs validated server-side
- [ ] File uploads validated (type, size)
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React escapes by default)

**Headers:**
- [ ] Security headers configured (see `vercel.json`)
- [ ] CORS configured correctly
- [ ] CSP headers (optional, for extra security)

### Secrets Management

**Environment Variables:**
- [ ] All secrets in Vercel environment variables
- [ ] No secrets in code or git
- [ ] Different keys for dev/staging/prod
- [ ] Keys rotated every 90 days

**Access Control:**
- [ ] Vercel team access limited
- [ ] Supabase project access limited
- [ ] OpenAI organization access limited
- [ ] 2FA enabled for all accounts

### Data Protection

**Encryption:**
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Database encryption at rest (Supabase default)
- [ ] Backup encryption (Supabase default)

**Privacy:**
- [ ] User data isolated (RLS)
- [ ] No PII in logs
- [ ] Data retention policy defined
- [ ] GDPR compliance (if applicable)

## Performance Optimization

### Database Optimization

**Indexes:**
```sql
-- Required indexes for performance
CREATE INDEX idx_coupons_user_id ON coupons(user_id);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX idx_coupons_user_valid ON coupons(user_id, valid_until);
CREATE INDEX idx_reminder_preferences_user_id ON reminder_preferences(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_notification_logs_dedup ON notification_logs(coupon_id, notification_type, sent_at);
```

**Query Optimization:**
- [ ] Use `select()` to fetch only needed columns
- [ ] Implement pagination for large lists
- [ ] Use database views for complex queries
- [ ] Monitor slow queries in Supabase dashboard

### Frontend Optimization

**Code Splitting:**
- [ ] Route-based splitting (automatic with Next.js)
- [ ] Component lazy loading for heavy components
- [ ] Dynamic imports for modals and dialogs

**Image Optimization:**
- [ ] Use Next.js Image component
- [ ] Serve images from Supabase CDN
- [ ] Generate thumbnails for dashboard
- [ ] Lazy load images below fold

**Caching:**
- [ ] API responses cached (stale-while-revalidate)
- [ ] Static pages pre-rendered
- [ ] CDN caching for assets
- [ ] Service worker for offline support

**Bundle Size:**
- [ ] Analyze bundle with `@next/bundle-analyzer`
- [ ] Remove unused dependencies
- [ ] Tree-shake libraries
- [ ] Target bundle size: < 200KB (gzipped)

### API Optimization

**Response Times:**
- [ ] Target: < 500ms for API routes
- [ ] Database queries optimized
- [ ] OpenAI requests cached (5 minutes)
- [ ] Parallel requests where possible

**Edge Functions:**
- [ ] Batch notification sending
- [ ] Optimize database queries
- [ ] Handle timeouts gracefully
- [ ] Monitor execution time

## Monitoring & Observability

### Application Monitoring

**Vercel Analytics:**
- [ ] Web Analytics enabled
- [ ] Speed Insights enabled
- [ ] Real User Monitoring (RUM)
- [ ] Core Web Vitals tracking

**Error Tracking:**
- [ ] Sentry or similar configured
- [ ] Error alerts to Slack/email
- [ ] Source maps uploaded
- [ ] User context included

**Logging:**
- [ ] Structured logging implemented
- [ ] Log levels configured (error, warn, info)
- [ ] Sensitive data excluded from logs
- [ ] Log retention: 30 days

### Infrastructure Monitoring

**Supabase Dashboard:**
- [ ] Database performance metrics
- [ ] API usage tracking
- [ ] Storage usage tracking
- [ ] Edge Function invocations

**Key Metrics:**
```
Performance:
- Page load time: < 3s (target)
- API response time: < 500ms (target)
- Database query time: < 100ms (target)

Availability:
- Uptime: > 99.9% (target)
- Error rate: < 1% (target)

Usage:
- Daily active users
- Coupons created per day
- Notifications sent per day
- API calls per day
```

### Alerts

**Critical Alerts:**
- [ ] Error rate > 5%
- [ ] Response time > 2s
- [ ] Database CPU > 80%
- [ ] Storage > 80% full
- [ ] OpenAI API errors

**Warning Alerts:**
- [ ] Error rate > 1%
- [ ] Response time > 1s
- [ ] Database CPU > 60%
- [ ] Storage > 60% full
- [ ] High API costs

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- [ ] Automated daily backups (Supabase)
- [ ] Retention: 7 days (minimum)
- [ ] Point-in-time recovery enabled (Pro plan)
- [ ] Backup restoration tested monthly

**Storage Backups:**
- [ ] Images backed up to separate bucket
- [ ] Backup frequency: Weekly
- [ ] Retention: 30 days

**Code Backups:**
- [ ] Git repository (primary backup)
- [ ] GitHub/GitLab (remote backup)
- [ ] Local clones (team members)

### Recovery Procedures

**Database Recovery:**
```bash
# Restore from backup
supabase db restore --backup-id <backup-id>

# Verify data integrity
# Run smoke tests
```

**Application Recovery:**
```bash
# Rollback Vercel deployment
vercel promote <previous-deployment-url>

# Verify application works
# Monitor for 30 minutes
```

**Edge Function Recovery:**
```bash
# Deploy previous version
supabase functions deploy <name> --version <version-id>

# Verify function works
supabase functions invoke <name>
```

### Incident Response

**Severity Levels:**
- **P0 (Critical)**: Complete outage, data loss
- **P1 (High)**: Major feature broken, security issue
- **P2 (Medium)**: Minor feature broken, performance degraded
- **P3 (Low)**: Cosmetic issue, minor bug

**Response Times:**
- P0: Immediate (< 15 minutes)
- P1: < 1 hour
- P2: < 4 hours
- P3: < 24 hours

**Incident Checklist:**
1. [ ] Identify and assess severity
2. [ ] Notify stakeholders
3. [ ] Investigate root cause
4. [ ] Implement fix or rollback
5. [ ] Verify resolution
6. [ ] Document incident
7. [ ] Conduct post-mortem
8. [ ] Implement preventive measures

## Cost Optimization

### Vercel Costs

**Free Tier Limits:**
- Bandwidth: 100GB/month
- Build execution: 100 hours/month
- Serverless function execution: 100GB-hours/month

**Optimization:**
- [ ] Enable edge caching
- [ ] Optimize images
- [ ] Minimize API route usage
- [ ] Use ISR for static content

**Estimated Costs:**
- Pro plan: $20/month (team)
- Bandwidth overage: $40/TB
- Function overage: $40/100GB-hours

### Supabase Costs

**Free Tier Limits:**
- Database: 500MB
- Storage: 1GB
- Bandwidth: 2GB
- Edge Functions: 500K invocations/month

**Pro Plan ($25/month):**
- Database: 8GB included
- Storage: 100GB included
- Bandwidth: 50GB included
- Edge Functions: 2M invocations/month

**Optimization:**
- [ ] Optimize database queries
- [ ] Compress images before upload
- [ ] Use CDN for static assets
- [ ] Batch Edge Function operations

### OpenAI Costs

**Pricing:**
- GPT-4: $0.03/1K tokens (input), $0.06/1K tokens (output)
- GPT-4 Vision: $0.01/image (low detail), $0.03/image (high detail)

**Optimization:**
- [ ] Cache extraction results (5 minutes)
- [ ] Use low detail for images when possible
- [ ] Implement rate limiting
- [ ] Set monthly budget ($100 recommended)

**Estimated Costs:**
- 100 extractions/day: ~$30/month
- 1000 extractions/day: ~$300/month

### Total Estimated Costs

**Small Scale (< 100 users):**
- Vercel: $20/month
- Supabase: $25/month
- OpenAI: $30/month
- **Total: ~$75/month**

**Medium Scale (100-1000 users):**
- Vercel: $20-50/month
- Supabase: $25-100/month
- OpenAI: $100-300/month
- **Total: ~$150-450/month**

## Compliance

### GDPR (if applicable)

- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Data processing agreement with vendors
- [ ] User consent recorded

### Accessibility

- [ ] WCAG 2.1 Level AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] Alt text for images

### Terms of Service

- [ ] Terms of service published
- [ ] User acceptance recorded
- [ ] Regular review and updates

## Pre-Launch Checklist

### Final Verification

- [ ] All tests passing
- [ ] Performance targets met
- [ ] Security audit complete
- [ ] Monitoring configured
- [ ] Backups tested
- [ ] Documentation complete
- [ ] Team trained
- [ ] Runbook created
- [ ] Incident response plan ready
- [ ] Stakeholders notified

### Launch Day

- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Monitor for 24 hours
- [ ] Address any issues immediately
- [ ] Communicate with users
- [ ] Celebrate! 🎉

## Post-Launch

### Week 1

- [ ] Monitor error rates daily
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Address critical issues
- [ ] Document lessons learned

### Month 1

- [ ] Review all metrics
- [ ] Optimize based on usage patterns
- [ ] Plan feature improvements
- [ ] Conduct security review
- [ ] Update documentation

### Ongoing

- [ ] Weekly metric reviews
- [ ] Monthly security audits
- [ ] Quarterly disaster recovery drills
- [ ] Regular dependency updates
- [ ] Continuous improvement

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Web.dev Performance](https://web.dev/performance/)
- [OWASP Security](https://owasp.org/)

## Support

For production issues:
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/support
- **OpenAI**: https://help.openai.com

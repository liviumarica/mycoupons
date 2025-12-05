# Quick Reference Guide

Fast access to common commands, configurations, and resources for the Coupon Management Platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cd apps/web
cp .env.example .env.local
# Edit .env.local with your values

# Generate VAPID keys
node apps/web/scripts/generate-vapid-keys.js

# Start development server
pnpm dev
```

## 📋 Common Commands

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Validate environment
pnpm validate-env
```

### Testing

```bash
# Run all tests
pnpm test

# Run UI tests
pnpm test:ui

# Run RLS tests
pnpm test:rls
```

### Deployment

```bash
# Pre-deployment checks
pnpm predeploy

# Deploy to Vercel (automatic on push to main)
git push origin main

# Deploy Edge Functions
supabase functions deploy

# View deployment logs
vercel logs
```

## 🔑 Environment Variables

### Required

| Variable | Where to Get |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI Platform → API Keys |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Run `node apps/web/scripts/generate-vapid-keys.js` |
| `VAPID_PRIVATE_KEY` | Run `node apps/web/scripts/generate-vapid-keys.js` |

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete reference.

## 📁 Project Structure

```
coupon-management/
├── apps/web/              # Next.js application
│   ├── src/app/          # App Router pages
│   ├── src/components/   # React components
│   └── src/lib/          # Utilities
├── packages/
│   ├── core/             # Business logic
│   ├── supabase/         # Database client
│   └── ui/               # UI components
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
└── scripts/              # Utility scripts
```

## 🗄️ Database

### Tables

- `users` - User accounts (Supabase Auth)
- `coupons` - Coupon data
- `reminder_preferences` - Notification settings
- `push_subscriptions` - Web push subscriptions
- `notification_logs` - Notification history

### Common Queries

```sql
-- View all coupons for a user
SELECT * FROM coupons WHERE user_id = 'user-id';

-- View expiring coupons
SELECT * FROM coupons 
WHERE valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + 7;

-- View notification logs
SELECT * FROM notification_logs 
ORDER BY sent_at DESC LIMIT 10;
```

## 🔐 Security

### RLS Policies

All tables have Row Level Security enabled:
- Users can only access their own data
- Service role key bypasses RLS (server-side only)
- Anon key respects RLS (client-side)

### API Keys

- **Never commit** API keys to git
- **Use different keys** for dev/staging/prod
- **Rotate keys** every 90 days
- **Monitor usage** for anomalies

## 🚨 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .turbo node_modules
pnpm install
pnpm build
```

### Environment Variables Not Loading

```bash
# Verify file location
ls -la apps/web/.env.local

# Restart dev server
# Stop with Ctrl+C, then:
pnpm dev
```

### Database Connection Issues

1. Check Supabase project is active
2. Verify connection string
3. Check RLS policies
4. Review Supabase status page

### Push Notifications Not Working

1. Verify VAPID keys are set
2. Check browser permissions
3. Test in different browser
4. Review Edge Function logs

## 📊 Monitoring

### Vercel

- Dashboard: https://vercel.com/dashboard
- View deployments, analytics, logs
- Configure environment variables

### Supabase

- Dashboard: https://supabase.com/dashboard
- View database, storage, functions
- Monitor performance and usage

### OpenAI

- Platform: https://platform.openai.com
- View API usage and costs
- Set usage limits

## 🔗 Important Links

### Documentation

- [README](./README.md) - Project overview
- [Setup Guide](./SETUP.md) - Initial setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete variable reference
- [Production Readiness](./PRODUCTION_READINESS.md) - Pre-launch checklist
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## 🆘 Getting Help

### Common Issues

1. **Build errors** → Check [Troubleshooting](#troubleshooting)
2. **Environment issues** → See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
3. **Deployment issues** → See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Database issues** → Check Supabase Dashboard logs

### Support Channels

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **OpenAI Support**: https://help.openai.com
- **Project Issues**: GitHub Issues

## 📝 Checklists

### Before Committing

- [ ] Code formatted (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Tests passing (`pnpm test`)
- [ ] No console.log statements

### Before Deploying

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Documentation updated
- [ ] Team notified

### After Deploying

- [ ] Verify application works
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Review user feedback
- [ ] Document any issues

## 🎯 Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Database Query**: < 100ms
- **Uptime**: > 99.9%
- **Error Rate**: < 1%

## 💰 Cost Estimates

### Small Scale (< 100 users)

- Vercel: $20/month
- Supabase: $25/month
- OpenAI: $30/month
- **Total: ~$75/month**

### Medium Scale (100-1000 users)

- Vercel: $20-50/month
- Supabase: $25-100/month
- OpenAI: $100-300/month
- **Total: ~$150-450/month**

## 🔄 Regular Maintenance

### Daily

- Check error rates
- Monitor API costs
- Review critical alerts

### Weekly

- Review performance metrics
- Check database size
- Update dependencies (if needed)

### Monthly

- Security audit
- Performance optimization
- Cost analysis
- Backup verification

### Quarterly

- Rotate API keys
- Update documentation
- Security penetration testing
- Disaster recovery drill

## 📞 Emergency Contacts

- **Vercel Status**: https://www.vercel-status.com
- **Supabase Status**: https://status.supabase.com
- **OpenAI Status**: https://status.openai.com

## 🎉 Quick Wins

### Improve Performance

```bash
# Analyze bundle size
pnpm build
# Check .next/analyze output

# Optimize images
# Use Next.js Image component everywhere

# Add database indexes
# See supabase/migrations/add_performance_indexes.sql
```

### Reduce Costs

```bash
# Cache API responses
# Implement in API routes

# Optimize OpenAI usage
# Cache extraction results

# Compress images
# Before uploading to storage
```

### Enhance Security

```bash
# Run security audit
pnpm audit

# Update dependencies
pnpm update

# Review RLS policies
# Test with multiple users
```

---

**Last Updated**: December 2024

For detailed information, see the complete documentation in the project root.

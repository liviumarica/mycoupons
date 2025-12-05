# Quick Start Guide - Edge Function Deployment

This is a quick reference for deploying the notification Edge Function.

## Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref fonwcqxjwuubnuaavgyr
```

## Setup VAPID Keys

```bash
# 1. Generate VAPID keys
node apps/web/scripts/generate-vapid-keys.js

# 2. Copy the output keys

# 3. Set as Supabase secrets
supabase secrets set VAPID_PUBLIC_KEY=your-public-key-here
supabase secrets set VAPID_PRIVATE_KEY=your-private-key-here

# 4. Verify secrets are set
supabase secrets list
```

## Deploy Function

```bash
# Deploy the notification function
supabase functions deploy send-expiry-notifications

# Verify deployment
supabase functions list
```

## Test Function

```bash
# Manual test
supabase functions invoke send-expiry-notifications

# View logs
supabase functions logs send-expiry-notifications
```

## Verify Cron Job

The function should run automatically at 9 AM UTC daily.

Check the Supabase Dashboard:
1. Go to Edge Functions
2. Select `send-expiry-notifications`
3. Check "Invocations" tab for scheduled runs

## Monitor

```bash
# Real-time logs
supabase functions logs send-expiry-notifications --follow

# Check notification history in database
# Run this SQL in Supabase SQL Editor:
SELECT * FROM notification_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

## Troubleshooting

### Function not deploying?
```bash
# Check CLI version
supabase --version

# Update if needed
npm install -g supabase@latest
```

### No notifications sent?
1. Check VAPID keys: `supabase secrets list`
2. Verify expiring coupons exist
3. Check user preferences are enabled
4. Verify push subscriptions exist

### Need help?
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- See [functions/send-expiry-notifications/README.md](./functions/send-expiry-notifications/README.md) for function details
- Check function logs: `supabase functions logs send-expiry-notifications`

## That's it!

Your notification system is now deployed and will run automatically every day at 9 AM UTC.

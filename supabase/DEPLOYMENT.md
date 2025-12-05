# Supabase Edge Functions Deployment Guide

This guide explains how to deploy the Edge Functions for the Coupon Management application.

## Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked:**
   ```bash
   supabase link --project-ref fonwcqxjwuubnuaavgyr
   ```

3. **VAPID keys generated:**
   ```bash
   node apps/web/scripts/generate-vapid-keys.js
   ```

## Environment Setup

### 1. Configure Supabase Secrets

Set the VAPID keys as Supabase secrets:

```bash
# Set VAPID public key
supabase secrets set VAPID_PUBLIC_KEY=your-vapid-public-key-here

# Set VAPID private key
supabase secrets set VAPID_PRIVATE_KEY=your-vapid-private-key-here
```

### 2. Verify Secrets

List all configured secrets:

```bash
supabase secrets list
```

You should see:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `SUPABASE_URL` (automatically provided)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically provided)

## Deployment

### Deploy All Functions

Deploy all Edge Functions at once:

```bash
supabase functions deploy
```

### Deploy Specific Function

Deploy only the notification function:

```bash
supabase functions deploy send-expiry-notifications
```

### Verify Deployment

List all deployed functions:

```bash
supabase functions list
```

You should see:
- `send-expiry-notifications` with status `ACTIVE`
- Cron schedule: `0 9 * * *`

## Testing

### 1. Manual Invocation

Test the function manually:

```bash
supabase functions invoke send-expiry-notifications
```

### 2. Check Logs

View function logs:

```bash
supabase functions logs send-expiry-notifications
```

### 3. Verify Notifications

Check the notification_logs table:

```sql
SELECT * FROM notification_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

## Monitoring

### Function Logs

View real-time logs:

```bash
supabase functions logs send-expiry-notifications --follow
```

### Database Monitoring

Monitor notification delivery:

```sql
-- Total notifications sent today
SELECT COUNT(*) 
FROM notification_logs 
WHERE sent_at::date = CURRENT_DATE;

-- Notifications by type
SELECT 
  notification_type,
  status,
  COUNT(*) as count
FROM notification_logs 
WHERE sent_at::date = CURRENT_DATE
GROUP BY notification_type, status;

-- Failed notifications
SELECT 
  nl.*,
  c.merchant,
  c.title
FROM notification_logs nl
JOIN coupons c ON c.id = nl.coupon_id
WHERE nl.status = 'failed'
  AND nl.sent_at::date = CURRENT_DATE;
```

### Cron Job Status

Check if the cron job is running:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select `send-expiry-notifications`
4. Check "Invocations" tab for scheduled runs

## Troubleshooting

### Function Not Deploying

1. **Check Supabase CLI version:**
   ```bash
   supabase --version
   ```
   Update if needed: `npm install -g supabase@latest`

2. **Verify project link:**
   ```bash
   supabase projects list
   ```

3. **Check for syntax errors:**
   ```bash
   deno check supabase/functions/send-expiry-notifications/index.ts
   ```

### Cron Job Not Running

1. **Verify cron schedule in config.toml:**
   ```toml
   [functions.send-expiry-notifications.cron]
   schedule = "0 9 * * *"
   ```

2. **Check function logs for errors:**
   ```bash
   supabase functions logs send-expiry-notifications
   ```

3. **Manually invoke to test:**
   ```bash
   supabase functions invoke send-expiry-notifications
   ```

### Notifications Not Sending

1. **Verify VAPID keys are set:**
   ```bash
   supabase secrets list
   ```

2. **Check for expiring coupons:**
   ```sql
   SELECT * FROM coupons 
   WHERE valid_until BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7;
   ```

3. **Verify user preferences:**
   ```sql
   SELECT * FROM reminder_preferences;
   ```

4. **Check push subscriptions:**
   ```sql
   SELECT * FROM push_subscriptions;
   ```

5. **Review function logs:**
   ```bash
   supabase functions logs send-expiry-notifications --follow
   ```

## Updating the Function

### 1. Make Changes

Edit the function code in `supabase/functions/send-expiry-notifications/index.ts`

### 2. Test Locally

Run the function locally:

```bash
supabase functions serve send-expiry-notifications
```

Invoke it:

```bash
curl -X POST http://localhost:54321/functions/v1/send-expiry-notifications
```

### 3. Deploy Changes

Deploy the updated function:

```bash
supabase functions deploy send-expiry-notifications
```

### 4. Verify

Check logs to ensure the update is working:

```bash
supabase functions logs send-expiry-notifications --follow
```

## Rollback

If you need to rollback to a previous version:

1. **View deployment history:**
   ```bash
   supabase functions list --show-versions
   ```

2. **Rollback to specific version:**
   ```bash
   supabase functions deploy send-expiry-notifications --version <version-id>
   ```

## Production Checklist

Before deploying to production:

- [ ] VAPID keys are configured as secrets
- [ ] Cron schedule is correct (9 AM UTC)
- [ ] Function has been tested manually
- [ ] Database tables have proper indexes
- [ ] RLS policies are enabled on all tables
- [ ] Notification logs are being created
- [ ] Failed subscriptions are being disabled
- [ ] Function logs are being monitored
- [ ] Error alerting is configured

## Security Best Practices

1. **Never commit secrets:**
   - VAPID keys should only be in Supabase secrets
   - Never in code or environment files

2. **Use service role key carefully:**
   - Only use in Edge Functions
   - Never expose to client-side code

3. **Validate all inputs:**
   - Check subscription format before sending
   - Validate coupon data before processing

4. **Monitor for abuse:**
   - Track notification frequency per user
   - Implement rate limiting if needed

## Performance Optimization

1. **Database Indexes:**
   Ensure these indexes exist:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_coupons_valid_until 
   ON coupons(valid_until);
   
   CREATE INDEX IF NOT EXISTS idx_notification_logs_dedup 
   ON notification_logs(coupon_id, notification_type, sent_at);
   ```

2. **Batch Processing:**
   The function processes all notifications in one execution. For large datasets, consider:
   - Adding pagination
   - Processing in smaller batches
   - Implementing timeout handling

3. **Connection Pooling:**
   The function uses a single Supabase client instance for all queries.

## Cost Considerations

### Edge Function Costs

- Free tier: 500,000 invocations/month
- Paid tier: $2 per 1 million invocations

### Cron Job Frequency

Current schedule: Daily at 9 AM UTC
- Monthly invocations: ~30
- Well within free tier

### Database Queries

Each execution performs:
- 3 queries for expiring coupons (7, 3, 1 days)
- 1 query per user for preferences
- 1 query per user for subscriptions
- 1 query per notification for deduplication
- 1 insert per notification for logging

Optimize by:
- Using proper indexes
- Batching queries where possible
- Caching user preferences

## Support

For issues or questions:

1. Check function logs: `supabase functions logs send-expiry-notifications`
2. Review Supabase documentation: https://supabase.com/docs/guides/functions
3. Check Edge Function status: https://status.supabase.com
4. Contact Supabase support: https://supabase.com/support

## Related Documentation

- [Edge Function README](./functions/send-expiry-notifications/README.md)
- [Web Push Notifications Setup](../apps/web/docs/PUSH_NOTIFICATIONS.md)
- [Supabase Setup Guide](../SUPABASE_SETUP.md)

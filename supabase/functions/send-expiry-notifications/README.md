# Send Expiry Notifications Edge Function

This Supabase Edge Function sends web push notifications to users about expiring coupons.

## Overview

The function runs daily at 9 AM UTC via a cron job and:
1. Queries coupons expiring in 7, 3, and 1 days
2. Matches coupons against user reminder preferences
3. Sends web push notifications with merchant, title, and days until expiry
4. Logs notification delivery in the notification_logs table
5. Implements deduplication to prevent duplicate notifications
6. Handles failed notifications and disables invalid subscriptions

## Requirements

### Environment Variables

The following environment variables must be configured in Supabase:

- `SUPABASE_URL` - Automatically provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided by Supabase
- `VAPID_PUBLIC_KEY` - Your VAPID public key for web push
- `VAPID_PRIVATE_KEY` - Your VAPID private key for web push

### VAPID Keys Setup

Generate VAPID keys using the provided script:

```bash
node apps/web/scripts/generate-vapid-keys.js
```

Then add the keys to Supabase secrets:

```bash
# Set VAPID keys as Supabase secrets
supabase secrets set VAPID_PUBLIC_KEY=your-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-private-key
```

## Deployment

### Using Supabase CLI

1. Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

2. Link to your Supabase project:
```bash
supabase link --project-ref fonwcqxjwuubnuaavgyr
```

3. Deploy the function:
```bash
supabase functions deploy send-expiry-notifications
```

4. Verify the cron job is configured:
```bash
supabase functions list
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click "Deploy new function"
4. Upload the function code
5. Configure the cron schedule: `0 9 * * *` (9 AM UTC daily)
6. Add the required environment variables (VAPID keys)

## Testing

### Manual Invocation

You can manually invoke the function for testing:

```bash
supabase functions invoke send-expiry-notifications
```

Or via HTTP:

```bash
curl -X POST \
  https://fonwcqxjwuubnuaavgyr.supabase.co/functions/v1/send-expiry-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Local Testing

Run the function locally:

```bash
supabase functions serve send-expiry-notifications
```

Then invoke it:

```bash
curl -X POST http://localhost:54321/functions/v1/send-expiry-notifications
```

## Function Logic

### 1. Query Expiring Coupons

The function queries coupons expiring in exactly 7, 3, or 1 days from now:

```typescript
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + days);
```

### 2. Match User Preferences

For each coupon, the function checks if the user has enabled notifications for that interval:

```typescript
if (days === 7 && preferences.remind_7_days) {
  shouldNotify = true;
  notificationType = "7_day";
}
```

### 3. Deduplication

Before sending, the function checks if a notification was already sent in the last 24 hours:

```typescript
const alreadySent = await wasNotificationSent(
  supabase,
  coupon.id,
  notificationType
);
```

### 4. Send Notifications

Notifications are sent to all of the user's registered push subscriptions:

```typescript
const payload = {
  title: "Coupon Expiring Soon",
  body: `Your ${merchant} coupon "${title}" expires in ${days} days!`,
  icon: "/icon-192x192.png",
  badge: "/badge-72x72.png",
  tag: `coupon-expiry-${couponId}`,
  data: {
    url: "/dashboard",
    couponId: couponId,
  },
};
```

### 5. Handle Failures

If a push subscription fails (e.g., user uninstalled browser), it's automatically disabled:

```typescript
if (!success) {
  await disableSubscription(supabase, subscription.endpoint);
}
```

### 6. Logging

All notification attempts are logged in the `notification_logs` table:

```typescript
await logNotification(
  supabase,
  userId,
  couponId,
  notificationType,
  notificationSent ? "sent" : "failed"
);
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Notification job completed",
  "sent": 15,
  "failed": 2
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Monitoring

### Logs

View function logs in the Supabase dashboard:
1. Go to Edge Functions
2. Select `send-expiry-notifications`
3. Click on "Logs" tab

Or via CLI:

```bash
supabase functions logs send-expiry-notifications
```

### Notification Logs Table

Query the `notification_logs` table to see notification history:

```sql
SELECT 
  nl.*,
  c.merchant,
  c.title,
  c.valid_until
FROM notification_logs nl
JOIN coupons c ON c.id = nl.coupon_id
ORDER BY nl.sent_at DESC
LIMIT 100;
```

### Failed Notifications

Check for failed notifications:

```sql
SELECT 
  nl.*,
  c.merchant,
  c.title
FROM notification_logs nl
JOIN coupons c ON c.id = nl.coupon_id
WHERE nl.status = 'failed'
ORDER BY nl.sent_at DESC;
```

## Troubleshooting

### No Notifications Sent

1. **Check VAPID keys are configured:**
   ```bash
   supabase secrets list
   ```

2. **Verify cron job is running:**
   - Check function logs for execution
   - Ensure cron schedule is correct in `config.toml`

3. **Check for expiring coupons:**
   ```sql
   SELECT * FROM coupons 
   WHERE valid_until BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7;
   ```

4. **Verify user preferences:**
   ```sql
   SELECT * FROM reminder_preferences 
   WHERE remind_7_days = true OR remind_3_days = true OR remind_1_day = true;
   ```

5. **Check push subscriptions:**
   ```sql
   SELECT COUNT(*) FROM push_subscriptions;
   ```

### Notifications Failing

1. **Check web-push library version:**
   - Ensure `npm:web-push@3.6.7` is correctly imported

2. **Verify VAPID key format:**
   - Keys should be base64-encoded strings
   - Public key should start with `B`

3. **Check subscription format:**
   - Endpoint should be a valid URL
   - p256dh and auth should be base64-encoded

### Duplicate Notifications

The function includes deduplication logic that checks if a notification was sent in the last 24 hours. If you're still seeing duplicates:

1. **Check notification_logs table:**
   ```sql
   SELECT coupon_id, notification_type, COUNT(*) 
   FROM notification_logs 
   WHERE sent_at > NOW() - INTERVAL '24 hours'
   GROUP BY coupon_id, notification_type
   HAVING COUNT(*) > 1;
   ```

2. **Verify cron job isn't running multiple times:**
   - Check function logs for multiple executions

## Performance Considerations

### Batch Processing

The function processes all users and coupons in a single execution. For large datasets:

1. Consider adding pagination
2. Implement rate limiting for push notifications
3. Add timeout handling for long-running jobs

### Database Queries

The function uses efficient queries with proper indexes:
- `coupons` table has index on `valid_until`
- `notification_logs` has composite index on `(coupon_id, notification_type, sent_at)`

### Error Handling

The function includes comprehensive error handling:
- Failed push subscriptions are automatically disabled
- Errors are logged for debugging
- The function continues processing even if individual notifications fail

## Security

### Service Role Key

The function uses the service role key to bypass RLS policies. This is necessary to:
- Query all users' coupons
- Access all push subscriptions
- Write to notification_logs for all users

### VAPID Keys

VAPID keys are stored as Supabase secrets and never exposed to clients. The private key is only accessible to the Edge Function.

### Push Subscriptions

Push subscriptions are validated before sending notifications. Invalid subscriptions are automatically removed from the database.

## Future Enhancements

1. **Notification Preferences:**
   - Add quiet hours (don't send notifications at night)
   - Add notification frequency limits
   - Add per-merchant notification preferences

2. **Advanced Scheduling:**
   - Support custom reminder intervals
   - Support timezone-aware scheduling
   - Support recurring reminders

3. **Analytics:**
   - Track notification open rates
   - Track coupon usage after notifications
   - Generate notification effectiveness reports

4. **Retry Logic:**
   - Implement exponential backoff for failed notifications
   - Add dead letter queue for persistent failures
   - Support manual retry of failed notifications

## Related Documentation

- [Web Push Notifications Setup](../../../apps/web/docs/PUSH_NOTIFICATIONS.md)
- [Push Notifications Integration](../../../apps/web/docs/PUSH_NOTIFICATIONS_INTEGRATION.md)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)

# Supabase Database Setup

## Project Information

- **Project Name**: cuponsapp
- **Project ID**: fonwcqxjwuubnuaavgyr
- **Region**: us-west-1
- **Status**: ACTIVE_HEALTHY
- **URL**: https://fonwcqxjwuubnuaavgyr.supabase.co

## Database Schema

### Tables Created

1. **coupons** - Stores user coupon data
   - RLS enabled with user-specific policies
   - Indexes on `user_id` and `valid_until` for performance
   - Automatic `updated_at` timestamp trigger

2. **reminder_preferences** - User notification preferences
   - RLS enabled with user-specific policies
   - Unique constraint on `user_id`
   - Default values: all reminders enabled

3. **push_subscriptions** - Web push notification subscriptions
   - RLS enabled with user-specific policies
   - Unique constraint on `endpoint`

4. **notification_logs** - Tracks sent notifications
   - RLS enabled with user-specific policies
   - Indexes for efficient querying and deduplication
   - Composite index on `(coupon_id, notification_type, sent_at)`

### Custom Types

- `discount_type`: ENUM ('percent', 'amount', 'bogo', 'other')
- `coupon_source`: ENUM ('text', 'image')
- `notification_type`: ENUM ('7_day', '3_day', '1_day')
- `notification_status`: ENUM ('sent', 'failed', 'clicked')

### Storage

- **Bucket**: `coupon-images`
  - Private bucket (not public)
  - File size limit: 5MB
  - Allowed types: JPEG, PNG, WebP, GIF
  - RLS policies enforce user-specific access

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:
- **SELECT**: Users can only view their own data
- **INSERT**: Users can only insert data with their own user_id
- **UPDATE**: Users can only update their own data
- **DELETE**: Users can only delete their own data

Storage policies ensure users can only access images in their own folder (organized by user_id).

## Authentication

Supabase Auth is configured for magic link authentication:
- Email-based authentication
- No password required
- Magic links sent via email

## Environment Variables

The following environment variables have been configured in `apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://fonwcqxjwuubnuaavgyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
```

## Migrations Applied

1. `create_coupons_table` - Creates coupons table with RLS
2. `create_reminder_preferences_table` - Creates reminder preferences with RLS
3. `create_push_subscriptions_table` - Creates push subscriptions with RLS
4. `create_notification_logs_table` - Creates notification logs with RLS

## Next Steps

1. Configure OpenAI API key in `.env.local`
2. Generate VAPID keys for web push notifications
3. Configure Supabase Auth email templates (optional)
4. Set up Edge Function for notification cron job (Task 15)

## Security Notes

- All tables use Row Level Security (RLS) to ensure data isolation
- Authentication tokens are validated on every request
- Storage bucket uses RLS to prevent unauthorized access
- API keys are stored in environment variables (never in code)
- User data is automatically deleted on account deletion (CASCADE)

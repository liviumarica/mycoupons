# Manual Edge Function Deployment Guide

Since the Supabase CLI cannot be installed via npm on Windows, you have two options for deploying the Edge Function:

## Option 1: Deploy via Supabase Dashboard (Recommended)

### Step 1: Prepare the Function Code

The function code is ready in: `supabase/functions/send-expiry-notifications/index-standalone.ts`

This is a standalone version with all dependencies inline (no external imports).

### Step 2: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **cuponsapp** (fonwcqxjwuubnuaavgyr)
3. Navigate to **Edge Functions** in the left sidebar

### Step 3: Create New Function

1. Click **"Create a new function"** or **"Deploy new function"**
2. Function name: `send-expiry-notifications`
3. Copy the entire content from `supabase/functions/send-expiry-notifications/index-standalone.ts`
4. Paste it into the code editor
5. Click **"Deploy function"**

### Step 4: Configure Environment Variables

After deployment, configure the VAPID keys:

1. In the Edge Functions dashboard, select `send-expiry-notifications`
2. Go to **"Settings"** or **"Secrets"** tab
3. Add the following secrets:
   - `VAPID_PUBLIC_KEY`: (generate using the script below)
   - `VAPID_PRIVATE_KEY`: (generate using the script below)

### Step 5: Generate VAPID Keys

Run this command in your project root:

```bash
node apps/web/scripts/generate-vapid-keys.js
```

Copy the output keys and add them to Supabase secrets.

### Step 6: Configure Cron Schedule

1. In the function settings, find **"Cron Jobs"** or **"Triggers"**
2. Add a new cron trigger:
   - Schedule: `0 9 * * *` (9 AM UTC daily)
   - Or use the UI to select: Daily at 9:00 AM UTC

### Step 7: Test the Function

1. Click **"Invoke"** or **"Test"** button in the dashboard
2. Check the **"Logs"** tab for output
3. Verify the response shows success

## Option 2: Install Supabase CLI via Scoop (Windows)

If you want to use the CLI, install Scoop first:

### Step 1: Install Scoop

Open PowerShell and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Step 2: Install Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

### Step 4: Link to Project

```powershell
supabase link --project-ref fonwcqxjwuubnuaavgyr
```

### Step 5: Set VAPID Keys

```powershell
# Generate keys first
node apps/web/scripts/generate-vapid-keys.js

# Set as secrets
supabase secrets set VAPID_PUBLIC_KEY=your-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-private-key
```

### Step 6: Deploy Function

```powershell
supabase functions deploy send-expiry-notifications
```

### Step 7: Verify Deployment

```powershell
supabase functions list
```

## Option 3: Use MCP Server (Already Attempted)

The Supabase MCP server has limitations with Edge Functions that require external file imports. The dashboard method (Option 1) is more reliable.

## Verification Steps

After deployment (regardless of method):

### 1. Check Function Exists

- Go to Supabase Dashboard → Edge Functions
- Verify `send-expiry-notifications` is listed
- Status should be **ACTIVE**

### 2. Check Secrets

- Verify VAPID keys are configured
- Both `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` should be set

### 3. Test Manually

- Click "Invoke" in the dashboard
- Expected response:
  ```json
  {
    "success": true,
    "message": "No coupons expiring soon" or "Notification job completed",
    "sent": 0,
    "failed": 0
  }
  ```

### 4. Check Logs

- View function logs in the dashboard
- Look for: "Starting notification cron job..."
- Check for any errors

### 5. Verify Cron Schedule

- Ensure cron job is configured: `0 9 * * *`
- Check "Invocations" tab for scheduled runs

## Troubleshooting

### Function Won't Deploy

- **Issue**: Import errors or module not found
- **Solution**: Use the standalone version (`index-standalone.ts`) which has all types inline

### VAPID Keys Not Working

- **Issue**: Notifications not sending
- **Solution**: 
  1. Regenerate keys: `node apps/web/scripts/generate-vapid-keys.js`
  2. Ensure keys are base64-encoded strings
  3. Public key should start with 'B'

### Cron Job Not Running

- **Issue**: Function not executing at scheduled time
- **Solution**:
  1. Verify cron schedule in dashboard
  2. Check function logs for errors
  3. Manually invoke to test

### No Notifications Sent

- **Issue**: Function runs but no notifications
- **Solution**:
  1. Check if coupons are expiring in 7, 3, or 1 days
  2. Verify users have reminder preferences enabled
  3. Check users have push subscriptions
  4. Review function logs for details

## Next Steps

After successful deployment:

1. ✅ Function is deployed and active
2. ✅ VAPID keys are configured
3. ✅ Cron schedule is set (9 AM UTC daily)
4. ✅ Manual test passes
5. ⏳ Wait for first scheduled run
6. ⏳ Monitor logs and notification_logs table
7. ⏳ Implement Task 16 (notification click handling)

## Support

If you encounter issues:

1. Check function logs in Supabase Dashboard
2. Review the README: `supabase/functions/send-expiry-notifications/README.md`
3. Check deployment guide: `supabase/DEPLOYMENT.md`
4. Verify database tables exist and have data

## Summary

**Recommended Approach**: Use Option 1 (Supabase Dashboard) for the easiest deployment experience on Windows.

The function code is ready in `supabase/functions/send-expiry-notifications/index-standalone.ts` - just copy and paste it into the Supabase Dashboard!

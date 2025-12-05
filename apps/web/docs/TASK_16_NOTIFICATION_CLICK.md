# Task 16: Notification Click Handling Implementation

## Overview

This document describes the implementation of notification click handling for the Coupon Management Platform. When users click on push notifications, the application now:

1. Opens/focuses the dashboard
2. Highlights the relevant coupon
3. Updates the notification log status to 'clicked'

## Implementation Details

### 1. Service Worker Updates (`apps/web/public/sw.js`)

**Changes:**
- Enhanced `notificationclick` event handler to:
  - Extract `notificationLogId` from notification data
  - Call `/api/notifications/click` endpoint to update log status
  - Navigate to dashboard with `?highlight={couponId}` query parameter
  - Handle both opening new windows and focusing existing ones

**Key Features:**
- Asynchronous notification log update (doesn't block navigation)
- Graceful error handling for failed API calls
- Proper window management (focus existing or open new)

### 2. API Endpoint (`apps/web/src/app/api/notifications/click/route.ts`)

**New Endpoint:** `POST /api/notifications/click`

**Request Body:**
```json
{
  "notificationLogId": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Features:**
- Authentication required (checks user session)
- Validates user owns the notification log (RLS enforcement)
- Updates notification_logs.status to 'clicked'
- Returns appropriate error codes (401, 400, 500)

### 3. Dashboard Client Updates (`apps/web/src/app/(dashboard)/dashboard/DashboardClient.tsx`)

**Changes:**
- Added `highlightedCouponId` state to track which coupon to highlight
- Added effect to read `highlight` query parameter from URL
- Implements smooth scroll to highlighted coupon
- Applies visual highlight effect (blue shadow) for 3 seconds
- Cleans up URL after highlighting

**User Experience:**
1. User clicks notification
2. Dashboard opens/focuses
3. Page scrolls to the relevant coupon
4. Coupon has blue shadow highlight for 3 seconds
5. Highlight fades away, URL is cleaned

### 4. Edge Function Updates (`supabase/functions/send-expiry-notifications/index.ts`)

**Changes:**
- Modified `logNotification` to return the created notification log ID
- Updated notification payload to include `notificationLogId` in data
- Changed flow to log notification BEFORE sending (to get ID)
- Updates log status to 'failed' if sending fails

**Notification Payload Structure:**
```typescript
{
  title: "Coupon Expiring Soon",
  body: "Your {merchant} coupon \"{title}\" expires in {days} day(s)!",
  icon: "/icon-192x192.png",
  badge: "/badge-72x72.png",
  tag: "coupon-expiry-{couponId}",
  data: {
    url: "/dashboard",
    couponId: "uuid",
    notificationLogId: "uuid"  // NEW
  }
}
```

## Database Schema

The `notification_logs` table already supports the 'clicked' status:

```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('7_day', '3_day', '1_day')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'clicked'))
);
```

## Testing the Implementation

### Manual Testing Steps

1. **Setup:**
   - Ensure you have push notifications enabled
   - Create a coupon expiring in 1, 3, or 7 days
   - Configure reminder preferences

2. **Trigger Notification:**
   - Wait for cron job to run, OR
   - Manually invoke the Edge Function

3. **Test Click Handling:**
   - Click the notification
   - Verify dashboard opens/focuses
   - Verify coupon is highlighted with blue shadow
   - Verify smooth scroll to coupon
   - Verify highlight disappears after 3 seconds

4. **Verify Database:**
   ```sql
   SELECT * FROM notification_logs 
   WHERE status = 'clicked' 
   ORDER BY sent_at DESC 
   LIMIT 10;
   ```

### Expected Behavior

**Scenario 1: Dashboard Already Open**
- Dashboard window gains focus
- Navigates to dashboard (if on different page)
- Scrolls to and highlights the coupon

**Scenario 2: No Window Open**
- Opens new browser window/tab
- Loads dashboard
- Scrolls to and highlights the coupon

**Scenario 3: Multiple Windows Open**
- Focuses the first matching window
- Navigates and highlights as above

## Error Handling

### Service Worker
- Logs errors to console if API call fails
- Continues with navigation even if log update fails
- Handles missing notification data gracefully

### API Endpoint
- Returns 401 if user not authenticated
- Returns 400 if notificationLogId missing
- Returns 500 for database errors
- Enforces RLS (user can only update their own logs)

### Dashboard
- Handles missing highlight parameter gracefully
- Continues normal operation if coupon not found
- Cleans up URL even if scroll fails

## Security Considerations

1. **Authentication Required:** API endpoint requires valid user session
2. **RLS Enforcement:** Users can only update their own notification logs
3. **Input Validation:** notificationLogId is validated before use
4. **No Sensitive Data:** Notification payload contains only IDs and display text

## Performance Considerations

1. **Async Updates:** Notification log update doesn't block navigation
2. **Efficient Queries:** Uses indexed columns (id, user_id)
3. **Minimal Payload:** Only necessary data in notification
4. **Smooth Animations:** Uses CSS transforms for highlight effect

## Requirements Validation

✅ **Requirement 8.4:** "WHEN a user clicks a notification THEN the CouponApp SHALL open the browser to the Coupon Dashboard with the relevant coupon highlighted"

**Implementation:**
- ✅ Opens browser to dashboard
- ✅ Highlights relevant coupon (blue shadow + scroll)
- ✅ Updates notification_logs with click status

## Future Enhancements

1. **Analytics:** Track click-through rates
2. **A/B Testing:** Test different highlight styles
3. **Notification Actions:** Add "Dismiss" or "Remind Later" buttons
4. **Deep Linking:** Support direct navigation to coupon details page
5. **Offline Support:** Queue log updates when offline

## Related Files

- `apps/web/public/sw.js` - Service worker with click handler
- `apps/web/src/app/api/notifications/click/route.ts` - API endpoint
- `apps/web/src/app/(dashboard)/dashboard/DashboardClient.tsx` - Dashboard with highlighting
- `supabase/functions/send-expiry-notifications/index.ts` - Edge function
- `packages/supabase/src/types.ts` - Database types

## Deployment Notes

1. **Service Worker:** Automatically updated on next page load
2. **API Endpoint:** Deployed with Next.js app
3. **Edge Function:** Requires redeployment to Supabase
4. **Database:** No schema changes required

## Troubleshooting

### Notification Click Not Working
1. Check browser console for errors
2. Verify service worker is registered
3. Check notification data includes notificationLogId
4. Verify API endpoint is accessible

### Coupon Not Highlighting
1. Check URL has `?highlight={couponId}` parameter
2. Verify coupon exists in filtered list
3. Check browser console for errors
4. Verify coupon ID matches exactly

### Log Status Not Updating
1. Check user is authenticated
2. Verify notificationLogId is valid
3. Check RLS policies on notification_logs table
4. Review API endpoint logs

## Conclusion

Task 16 is now complete. The notification click handling provides a seamless user experience by:
- Opening the dashboard when notifications are clicked
- Highlighting the relevant coupon with smooth animations
- Tracking user engagement in the database

This implementation satisfies Requirement 8.4 and provides a foundation for future notification enhancements.

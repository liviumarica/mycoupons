# Web Push Notifications Setup

This document explains how to set up and use web push notifications in the Coupon Management application.

## Overview

The application uses the Web Push API to send browser notifications to users about expiring coupons. This requires:

1. VAPID keys for authentication
2. Service worker for handling push events
3. User permission to show notifications
4. Push subscriptions stored in the database

## Generating VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required to authenticate push notifications from your server.

### Step 1: Generate Keys

Run the key generation script:

```bash
node apps/web/scripts/generate-vapid-keys.js
```

This will output two keys:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public key (safe to expose to clients)
- `VAPID_PRIVATE_KEY` - Private key (keep secret!)

### Step 2: Add to Environment Variables

Add the generated keys to your `.env.local` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
```

**Important:** Never commit the private key to version control!

## Architecture

### Client-Side Components

1. **Service Worker** (`public/sw.js`)
   - Handles incoming push notifications
   - Manages notification display
   - Handles notification clicks
   - Automatically resubscribes on subscription changes

2. **Push Notification Utilities** (`src/lib/push-notifications.ts`)
   - `isPushNotificationSupported()` - Check browser support
   - `requestNotificationPermission()` - Request user permission
   - `subscribeToPushNotifications()` - Subscribe to push notifications
   - `unsubscribeFromPushNotifications()` - Unsubscribe from notifications
   - `savePushSubscription()` - Save subscription to server
   - `removePushSubscription()` - Remove subscription from server

### Server-Side Components

1. **API Route** (`src/app/api/notifications/subscribe/route.ts`)
   - `POST` - Store new push subscription
   - `DELETE` - Remove push subscription

2. **Database Table** (`push_subscriptions`)
   - Stores user push subscriptions
   - Fields: `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`

## Usage

### Subscribing to Notifications

```typescript
import {
  subscribeToPushNotifications,
  savePushSubscription,
} from '@/lib/push-notifications';

async function enableNotifications() {
  try {
    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications();
    
    // Save subscription to server
    const result = await savePushSubscription(subscription);
    
    if (result.success) {
      console.log('Successfully subscribed to notifications');
    } else {
      console.error('Failed to save subscription:', result.error);
    }
  } catch (error) {
    console.error('Failed to subscribe:', error);
  }
}
```

### Unsubscribing from Notifications

```typescript
import {
  unsubscribeFromPushNotifications,
  getCurrentPushSubscription,
  removePushSubscription,
} from '@/lib/push-notifications';

async function disableNotifications() {
  try {
    // Get current subscription
    const subscription = await getCurrentPushSubscription();
    
    if (subscription) {
      // Unsubscribe from browser
      await unsubscribeFromPushNotifications();
      
      // Remove from server
      await removePushSubscription(subscription.endpoint);
      
      console.log('Successfully unsubscribed from notifications');
    }
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
  }
}
```

### Checking Subscription Status

```typescript
import { getCurrentPushSubscription } from '@/lib/push-notifications';

async function checkSubscriptionStatus() {
  const subscription = await getCurrentPushSubscription();
  
  if (subscription) {
    console.log('User is subscribed to notifications');
  } else {
    console.log('User is not subscribed');
  }
}
```

## Notification Payload Format

When sending push notifications from the server (e.g., from Supabase Edge Functions), use this payload format:

```json
{
  "title": "Coupon Expiring Soon",
  "body": "Your Amazon coupon expires in 3 days!",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "tag": "coupon-expiry-123",
  "requireInteraction": false,
  "data": {
    "url": "/dashboard",
    "couponId": "123"
  }
}
```

### Payload Fields

- `title` - Notification title (required)
- `body` - Notification message (required)
- `icon` - Large icon displayed in notification
- `badge` - Small icon for notification badge
- `tag` - Unique identifier (prevents duplicate notifications)
- `requireInteraction` - Whether notification stays until user interacts
- `data` - Custom data passed to click handler
  - `url` - URL to open when notification is clicked
  - `couponId` - ID of the coupon (for highlighting)

## Browser Support

Web Push notifications are supported in:
- Chrome 50+
- Firefox 44+
- Edge 17+
- Safari 16+ (macOS 13+)
- Opera 37+

Mobile support:
- Chrome for Android
- Firefox for Android
- Safari for iOS 16.4+ (limited support)

## Security Considerations

1. **VAPID Private Key**
   - Never expose the private key to clients
   - Store securely in environment variables
   - Rotate keys periodically

2. **User Permission**
   - Always request permission before subscribing
   - Handle permission denial gracefully
   - Provide clear explanation of why notifications are needed

3. **Subscription Management**
   - Clean up invalid subscriptions
   - Handle subscription changes (e.g., browser reinstall)
   - Implement unsubscribe functionality

## Testing

### Local Testing

1. Ensure VAPID keys are configured in `.env.local`
2. Start the development server: `pnpm dev`
3. Open the app in a supported browser
4. Grant notification permission when prompted
5. Subscribe to notifications through the settings page

### Testing Notifications

You can test notifications using the browser's DevTools:

1. Open DevTools → Application → Service Workers
2. Find your service worker
3. Click "Push" to simulate a push event
4. Or use the "Notification" section to test notification display

## Troubleshooting

### Notifications Not Working

1. **Check browser support**
   ```typescript
   import { isPushNotificationSupported } from '@/lib/push-notifications';
   console.log('Supported:', isPushNotificationSupported());
   ```

2. **Check permission status**
   ```typescript
   console.log('Permission:', Notification.permission);
   ```

3. **Check service worker registration**
   ```typescript
   navigator.serviceWorker.getRegistration().then(reg => {
     console.log('Service Worker:', reg);
   });
   ```

4. **Check subscription**
   ```typescript
   import { getCurrentPushSubscription } from '@/lib/push-notifications';
   const sub = await getCurrentPushSubscription();
   console.log('Subscription:', sub);
   ```

### Common Issues

- **"Service worker registration failed"** - Check that `sw.js` exists in the `public` directory
- **"VAPID public key not configured"** - Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
- **"Notification permission denied"** - User must grant permission; provide UI to request again
- **"Failed to subscribe"** - Check browser console for specific error messages

## Next Steps

After implementing basic push notifications:

1. Implement the Supabase Edge Function for sending notifications (Task 15)
2. Add notification click handling to highlight specific coupons (Task 16)
3. Implement notification deduplication logic
4. Add notification preferences (frequency, quiet hours, etc.)

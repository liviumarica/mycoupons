/**
 * Service Worker for handling push notifications
 */

// Service worker version - increment to force update
const SW_VERSION = '1.0.0';

// Install event
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${SW_VERSION} installing...`);
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${SW_VERSION} activated`);
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Coupon Expiring Soon',
    body: 'One of your coupons is expiring soon!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'coupon-expiry',
    requireInteraction: false,
    data: {
      url: '/dashboard',
    },
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      
      if (payload.title) notificationData.title = payload.title;
      if (payload.body) notificationData.body = payload.body;
      if (payload.icon) notificationData.icon = payload.icon;
      if (payload.badge) notificationData.badge = payload.badge;
      if (payload.tag) notificationData.tag = payload.tag;
      if (payload.data) notificationData.data = { ...notificationData.data, ...payload.data };
      if (payload.requireInteraction !== undefined) {
        notificationData.requireInteraction = payload.requireInteraction;
      }
    } catch (error) {
      console.error('Failed to parse push notification data:', error);
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
    })
  );
});

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/dashboard';
  const couponId = event.notification.data?.couponId;
  const notificationLogId = event.notification.data?.notificationLogId;

  // Build the full URL
  let targetUrl = urlToOpen;
  if (couponId) {
    targetUrl += `?highlight=${couponId}`;
  }

  // Update notification log status to 'clicked'
  const updateNotificationLog = async () => {
    if (notificationLogId) {
      try {
        await fetch('/api/notifications/click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationLogId: notificationLogId,
          }),
        });
      } catch (error) {
        console.error('Failed to update notification log:', error);
      }
    }
  };

  // Open or focus the app
  event.waitUntil(
    Promise.all([
      updateNotificationLog(),
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            const clientUrl = new URL(client.url);
            
            // If we find a window with the app, focus it and navigate
            if (clientUrl.origin === self.location.origin) {
              return client.focus().then((client) => {
                if ('navigate' in client) {
                  return client.navigate(targetUrl);
                }
              });
            }
          }
          
          // If no window is open, open a new one
          if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl);
          }
        })
    ])
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  
  // Resubscribe to push notifications
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options.applicationServerKey,
      })
      .then((subscription) => {
        console.log('Resubscribed to push notifications:', subscription);
        
        // Send new subscription to server
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });
      })
      .catch((error) => {
        console.error('Failed to resubscribe to push notifications:', error);
      })
  );
});

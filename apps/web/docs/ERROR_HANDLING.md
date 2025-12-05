# Error Handling and User Feedback Implementation

This document describes the comprehensive error handling and user feedback system implemented in the Coupon Management application.

## Overview

The application now includes:
- React Error Boundaries for component-level error handling
- Automatic retry logic for failed API calls
- Toast notifications for user feedback
- Offline state detection and handling
- User-friendly error messages

## Components

### 1. Error Boundary (`/src/components/ErrorBoundary.tsx`)

A React Error Boundary component that catches JavaScript errors anywhere in the component tree and displays a fallback UI.

**Features:**
- Catches and logs component errors
- Displays user-friendly error message
- Provides "Try Again" and "Go to Dashboard" actions
- Prevents entire app from crashing

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Implemented in:**
- Dashboard layout (`/app/(dashboard)/layout.tsx`)
- Auth layout (`/app/(auth)/layout.tsx`)

### 2. API Client with Retry Logic (`/src/lib/api-client.ts`)

A utility module that provides automatic retry logic for API calls with exponential backoff.

**Features:**
- Automatic retry on network errors and specific HTTP status codes (408, 429, 500, 502, 503, 504)
- Exponential backoff strategy (1s, 2s, 4s)
- Configurable retry options
- User-friendly error messages for common HTTP status codes
- Online/offline detection

**Usage:**
```tsx
import { fetchWithRetry } from '@/lib/api-client';

const result = await fetchWithRetry('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

if (!result.success) {
  // Handle error
  console.error(result.error);
}
```

**Configuration:**
```tsx
const result = await fetchWithRetry('/api/endpoint', options, {
  maxRetries: 3,           // Number of retry attempts
  retryDelay: 1000,        // Initial delay in ms
  retryableStatuses: [408, 429, 500, 502, 503, 504]
});
```

### 3. Offline Indicator (`/src/components/OfflineIndicator.tsx`)

A banner component that displays when the user loses internet connectivity.

**Features:**
- Automatically detects online/offline status
- Animated slide-in/slide-out banner
- Prominent yellow warning banner
- Uses Framer Motion for smooth animations

**Usage:**
Automatically included in the root layout - no additional setup required.

### 4. Online Status Hook (`/src/hooks/useOnlineStatus.ts`)

A React hook that tracks the user's online/offline status.

**Usage:**
```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  if (!isOnline) {
    return <div>You are offline</div>;
  }
  
  return <div>You are online</div>;
}
```

### 5. Toast Notifications

Toast notifications are used throughout the app for user feedback.

**Features:**
- Success messages (green)
- Error messages (red)
- Auto-dismiss after 5 seconds
- Animated entrance/exit
- Accessible

**Usage:**
```tsx
import { useToast } from '@coupon-management/ui';

function MyComponent() {
  const { toast } = useToast();
  
  const handleAction = async () => {
    try {
      // ... perform action
      toast({
        title: 'Success',
        description: 'Action completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Action failed. Please try again.',
        variant: 'destructive',
      });
    }
  };
}
```

## Implementation Details

### Updated Components

#### 1. Root Layout (`/src/app/layout.tsx`)
- Added `<Providers />` wrapper component for client-side providers
- Includes `<Toaster />` component for global toast notifications
- Includes `<OfflineIndicator />` for network status

#### 2. Dashboard Client (`/src/app/(dashboard)/dashboard/DashboardClient.tsx`)
- Uses `fetchWithRetry` for fetching coupons
- Checks online status before API calls
- Displays user-friendly error messages
- Implements retry logic for failed requests

#### 3. Add Coupon Form (`/src/app/(dashboard)/add-coupon/AddCouponForm.tsx`)
- Uses `fetchWithRetry` for extraction API calls
- Better error messages for extraction failures
- Handles network errors gracefully

#### 4. Extraction Review (`/src/app/(dashboard)/add-coupon/ExtractionReview.tsx`)
- Uses `fetchWithRetry` for saving coupons
- Checks online status before saving
- Improved error display

#### 5. Settings Client (`/src/app/(dashboard)/settings/SettingsClient.tsx`)
- Uses `fetchWithRetry` for loading and saving preferences
- Checks online status before API calls
- Better error handling for notification permissions

## Error Messages

### HTTP Status Code Messages

The application provides user-friendly messages for common HTTP status codes:

- **400**: "Invalid request. Please check your input."
- **401**: "You need to be logged in to perform this action."
- **403**: "You do not have permission to perform this action."
- **404**: "The requested resource was not found."
- **408**: "Request timeout. Please try again."
- **429**: "Too many requests. Please wait a moment and try again."
- **500**: "Server error. Please try again later."
- **502**: "Service temporarily unavailable. Please try again."
- **503**: "Service temporarily unavailable. Please try again."
- **504**: "Request timeout. Please try again."

### Network Error Messages

- **Offline**: "You are offline. Please check your internet connection."
- **Network Error**: "Network error. Please check your connection."

## Best Practices

### 1. Always Check Online Status
Before making API calls, check if the user is online:

```tsx
const { isOnline } = await import('@/lib/api-client');

if (!isOnline()) {
  throw new Error('You are offline. Please check your internet connection.');
}
```

### 2. Use fetchWithRetry for API Calls
Replace standard `fetch` calls with `fetchWithRetry`:

```tsx
// ❌ Don't do this
const response = await fetch('/api/endpoint');
const data = await response.json();

// ✅ Do this instead
const result = await fetchWithRetry('/api/endpoint');
if (!result.success) {
  throw new Error(result.error);
}
```

### 3. Provide User Feedback
Always show toast notifications for important actions:

```tsx
// Success
toast({
  title: 'Success',
  description: 'Your changes have been saved.',
});

// Error
toast({
  title: 'Error',
  description: errorMessage,
  variant: 'destructive',
});
```

### 4. Wrap Components in Error Boundaries
Wrap major sections of your app in Error Boundaries:

```tsx
<ErrorBoundary>
  <YourFeature />
</ErrorBoundary>
```

## Testing

### Manual Testing Checklist

- [ ] Test offline behavior by disabling network
- [ ] Test API retry logic by simulating network failures
- [ ] Test error boundary by throwing errors in components
- [ ] Test toast notifications for various actions
- [ ] Test error messages for different HTTP status codes
- [ ] Test form validation errors
- [ ] Test notification permission handling

### Simulating Errors

#### Simulate Network Failure
1. Open DevTools
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Try performing actions

#### Simulate API Errors
Modify API routes to return specific status codes for testing.

## Future Improvements

1. **Error Tracking Service**: Integrate with Sentry or similar service for production error tracking
2. **Retry UI**: Show retry progress to users during automatic retries
3. **Offline Queue**: Queue actions when offline and sync when back online
4. **Better Error Recovery**: Implement more sophisticated error recovery strategies
5. **Error Analytics**: Track error rates and patterns to identify issues

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 4.3**: Display user-friendly error messages and prevent saving with validation errors
- **Requirement 7.4**: Handle permission denied gracefully for notifications

### Task Completion

✅ Add error boundaries for React components
✅ Implement toast notifications for errors and success
✅ Add retry logic for failed API calls
✅ Display user-friendly error messages
✅ Handle offline state gracefully

# @coupon-management/supabase

Supabase client and database utilities for the Coupon Management Platform.

## Features

- TypeScript types generated from database schema
- Browser client factory for Client Components
- Query helpers for coupons and reminder preferences
- Type-safe database operations

## Installation

This package is part of the monorepo and is automatically available to other packages.

## Usage

### Browser Client (Client Components)

```typescript
import { createBrowserClient } from '@coupon-management/supabase';

const supabase = createBrowserClient();
```

### Server Client (Server Components, Route Handlers, Server Actions)

For server-side usage, create the client directly in your Next.js app using `@supabase/ssr`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@coupon-management/supabase';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing user sessions.
          }
        },
      },
    }
  );
}
```

### Query Helpers

#### Coupon Queries

```typescript
import { couponQueries } from '@coupon-management/supabase';

// Get all coupons for a user
const { data, error } = await couponQueries.getUserCoupons(supabase, userId);

// Get a single coupon
const { data, error } = await couponQueries.getCouponById(supabase, couponId, userId);

// Create a coupon
const { data, error } = await couponQueries.createCoupon(supabase, couponData);

// Update a coupon
const { data, error } = await couponQueries.updateCoupon(supabase, couponId, userId, updates);

// Delete a coupon
const { error } = await couponQueries.deleteCoupon(supabase, couponId, userId);

// Get coupons expiring in N days
const { data, error } = await couponQueries.getCouponsExpiringInDays(supabase, userId, 7);
```

#### Reminder Preferences Queries

```typescript
import { reminderQueries } from '@coupon-management/supabase';

// Get reminder preferences
const { data, error } = await reminderQueries.getReminderPreferences(supabase, userId);

// Create or update reminder preferences
const { data, error } = await reminderQueries.upsertReminderPreferences(supabase, userId, {
  remind7Days: true,
  remind3Days: true,
  remind1Day: false,
});

// Delete reminder preferences
const { error } = await reminderQueries.deleteReminderPreferences(supabase, userId);
```

## Database Schema

The package includes TypeScript types for the following tables:

- `coupons` - User coupons with discount information
- `reminder_preferences` - User notification preferences
- `push_subscriptions` - Web push notification subscriptions
- `notification_logs` - Notification delivery history

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Type Safety

All query helpers return typed responses that match the core domain types from `@coupon-management/core`. Database rows are automatically converted to the appropriate TypeScript types with proper date handling.

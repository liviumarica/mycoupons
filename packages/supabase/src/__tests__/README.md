# RLS Policy Tests

This directory contains tests for Row Level Security (RLS) policies in Supabase.

## Overview

These tests verify that:
- Users can only access their own coupons (Requirement 9.1)
- Authentication tokens are properly validated (Requirement 9.2)
- Storage RLS policies prevent unauthorized access to images (Requirement 9.4)

## Prerequisites

### 1. Environment Variables

Create a `.env.local` file in the root of the project with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Test Users

The tests require two test users to be created in your Supabase project:
- `test-user-1@example.com`
- `test-user-2@example.com`

Both with password: `test-password-123`

The tests will attempt to create these users automatically if they don't exist.

### 3. Database Setup

Ensure your Supabase database has the following tables with RLS enabled:
- `coupons`
- `reminder_preferences`
- `push_subscriptions`
- `notification_logs`

And a storage bucket:
- `coupon-images`

## Running the Tests

From the root of the monorepo:

```bash
# Install dependencies
pnpm install

# Run RLS tests
cd packages/supabase
pnpm test
```

Or from the root:

```bash
pnpm --filter @coupon-management/supabase test
```

## Test Structure

### Coupon Table RLS Tests
- ✅ Users can create coupons with their own user_id
- ✅ Users can read only their own coupons
- ✅ Users cannot read other users' coupons
- ✅ Users cannot access specific coupons by ID that belong to others
- ✅ Users can update only their own coupons
- ✅ Users cannot update other users' coupons
- ✅ Users can delete only their own coupons
- ✅ Users cannot delete other users' coupons

### Authentication Token Validation Tests
- ✅ Requests without authentication token are rejected
- ✅ Valid tokens return user's data

### Reminder Preferences RLS Tests
- ✅ Users can create and read their own preferences
- ✅ Users cannot read other users' preferences

### Push Subscriptions RLS Tests
- ✅ Users can create and read their own subscriptions
- ✅ Users cannot read other users' subscriptions

### Storage RLS Tests
- ✅ Users can upload images to their own storage path
- ✅ Users cannot upload to other users' storage paths
- ✅ Users can read their own images
- ✅ Users cannot read other users' images
- ✅ Users cannot delete other users' images

## Troubleshooting

### "Missing required environment variables"
Make sure your `.env.local` file is properly configured with all three required variables.

### "Failed to authenticate user"
The test users may not exist in your Supabase project. The tests will try to create them, but if email confirmation is required, you may need to manually create and confirm these users in the Supabase dashboard.

### Tests timeout
RLS tests interact with a real database and may take longer than typical unit tests. The timeout is set to 30 seconds per test. If tests consistently timeout, check your network connection and Supabase project status.

### Storage tests fail
Ensure the `coupon-images` storage bucket exists in your Supabase project and has appropriate RLS policies configured.

## Important Notes

⚠️ **These tests require a real Supabase instance** - They cannot be run against mocks or local databases without proper RLS configuration.

⚠️ **Test data cleanup** - The tests clean up after themselves, but if tests fail unexpectedly, you may need to manually clean up test data in your Supabase dashboard.

⚠️ **Production safety** - Never run these tests against a production database. Always use a dedicated test/development Supabase project.

# RLS Testing Implementation Guide

## Overview

This package now includes comprehensive Row Level Security (RLS) policy tests that verify:

- **Requirement 9.1**: RLS policies restrict access to coupon owner
- **Requirement 9.2**: Authentication token verification before returning data  
- **Requirement 9.4**: Storage RLS policies ensure only owner can access images

## What Was Implemented

### Test Suite Structure

The RLS test suite (`src/__tests__/rls-policies.test.ts`) includes:

1. **Coupon Table RLS Tests** (8 tests)
   - User isolation for CREATE operations
   - User isolation for READ operations
   - User isolation for UPDATE operations
   - User isolation for DELETE operations
   - Prevention of cross-user data access

2. **Authentication Token Validation Tests** (2 tests)
   - Rejection of unauthenticated requests
   - Validation of authenticated requests

3. **Reminder Preferences RLS Tests** (2 tests)
   - User-specific preference management
   - Prevention of cross-user preference access

4. **Push Subscriptions RLS Tests** (2 tests)
   - User-specific subscription management
   - Prevention of cross-user subscription access

5. **Storage RLS Tests** (5 tests)
   - User-specific image upload permissions
   - User-specific image read permissions
   - User-specific image delete permissions
   - Prevention of cross-user storage access

**Total: 19 comprehensive RLS policy tests**

## Setup Instructions

### Step 1: Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

### Step 2: Configure Environment Variables

You need to add the `SUPABASE_SERVICE_ROLE_KEY` to your environment. This key is required for test setup and cleanup operations.

#### Option A: Add to `.env.local` (Development Only)

Create or update `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **IMPORTANT**: Never commit the service role key to version control. Add `.env.local` to `.gitignore`.

#### Option B: Set Environment Variable Temporarily

**Windows (PowerShell):**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
pnpm --filter @coupon-management/supabase test
```

**macOS/Linux:**
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
pnpm --filter @coupon-management/supabase test
```

### Step 3: Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Find the **service_role** key under "Project API keys"
4. Copy the key (it starts with `eyJ...`)

### Step 4: Create Test Users (Optional)

The tests will automatically attempt to create these users:
- Email: `test-user-1@example.com`
- Email: `test-user-2@example.com`
- Password: `test-password-123`

If your Supabase project requires email confirmation:
1. Go to **Authentication** → **Users** in Supabase dashboard
2. Manually create these two users
3. Confirm their email addresses

### Step 5: Verify Database Schema

Ensure your Supabase database has these tables with RLS enabled:
- `coupons`
- `reminder_preferences`
- `push_subscriptions`
- `notification_logs`

And this storage bucket:
- `coupon-images`

These should already exist if you've completed the previous setup tasks.

## Running the Tests

### Run All RLS Tests

From the root of the monorepo:

```bash
pnpm --filter @coupon-management/supabase test
```

Or from the `packages/supabase` directory:

```bash
cd packages/supabase
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm --filter @coupon-management/supabase test:watch
```

### Run Specific Test File

```bash
pnpm --filter @coupon-management/supabase test rls-policies
```

## Expected Test Output

When all tests pass, you should see:

```
✓ packages/supabase/src/__tests__/rls-policies.test.ts (19)
  ✓ RLS Policy Tests (19)
    ✓ Coupon Table RLS Policies (8)
      ✓ should allow users to create coupons with their own user_id
      ✓ should allow users to read only their own coupons
      ✓ should prevent users from reading other users coupons
      ✓ should prevent users from accessing specific coupons by ID
      ✓ should allow users to update only their own coupons
      ✓ should prevent users from updating other users coupons
      ✓ should allow users to delete only their own coupons
      ✓ should prevent users from deleting other users coupons
    ✓ Authentication Token Validation (2)
      ✓ should reject requests without authentication token
      ✓ should validate token and return data for authenticated requests
    ✓ Reminder Preferences RLS Policies (2)
      ✓ should allow users to create and read their own preferences
      ✓ should prevent users from reading other users preferences
    ✓ Push Subscriptions RLS Policies (2)
      ✓ should allow users to create and read their own subscriptions
      ✓ should prevent users from reading other users subscriptions
    ✓ Storage RLS Policies (5)
      ✓ should allow users to upload images to their own storage path
      ✓ should prevent users from uploading to other users storage paths
      ✓ should allow users to read their own images
      ✓ should prevent users from reading other users images
      ✓ should prevent users from deleting other users images

Test Files  1 passed (1)
Tests  19 passed (19)
```

## Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Ensure all three environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Failed to authenticate user"

**Possible causes**:
1. Email confirmation is required in your Supabase project
2. Test users don't exist yet

**Solution**: Manually create and confirm the test users in Supabase dashboard.

### Tests timeout or hang

**Possible causes**:
1. Network connectivity issues
2. Supabase project is paused or unavailable
3. RLS policies are not properly configured

**Solution**: 
- Check your internet connection
- Verify your Supabase project is active
- Review RLS policies in Supabase dashboard

### Storage tests fail

**Possible causes**:
1. `coupon-images` bucket doesn't exist
2. Storage RLS policies are not configured

**Solution**:
1. Create the bucket in Supabase dashboard: **Storage** → **New bucket**
2. Name it `coupon-images`
3. Configure RLS policies for the bucket

### "Cannot find module 'vitest'"

**Solution**: Run `pnpm install` from the root directory.

## Test Architecture

### Why Real Database Tests?

RLS policies can only be properly tested against a real Supabase instance because:
1. RLS is enforced at the PostgreSQL level
2. Mock databases don't implement RLS
3. Authentication tokens must be validated by Supabase Auth

### Test Isolation

Each test:
- Uses separate test users (user1 and user2)
- Creates its own test data
- Cleans up after itself
- Is independent of other tests

### Service Role Usage

The service role key is used only for:
- Test setup (creating test users if needed)
- Test cleanup (removing test data)
- Verifying that RLS policies work correctly

Regular operations use the anon key with user authentication, just like in production.

## Security Considerations

⚠️ **Never run these tests against a production database**

These tests:
- Create and delete test data
- Use test user accounts
- Perform operations that could affect real data

Always use a dedicated development or test Supabase project.

## CI/CD Integration

To run these tests in CI/CD:

1. Add environment variables to your CI/CD secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Add test command to your CI pipeline:
   ```yaml
   - name: Run RLS Tests
     run: pnpm --filter @coupon-management/supabase test
     env:
       NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
       SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   ```

3. Ensure test users exist in your test Supabase project

## What These Tests Verify

### Data Isolation (Requirement 9.1)
✅ Users can only see their own coupons  
✅ Users cannot modify other users' coupons  
✅ Users cannot delete other users' coupons  
✅ Users can only manage their own preferences  
✅ Users can only manage their own subscriptions  

### Authentication (Requirement 9.2)
✅ Unauthenticated requests are rejected  
✅ Valid authentication tokens grant access  
✅ Token validation happens before data access  

### Storage Security (Requirement 9.4)
✅ Users can upload to their own storage path  
✅ Users cannot upload to other users' paths  
✅ Users can read their own images  
✅ Users cannot read other users' images  
✅ Users cannot delete other users' images  

## Next Steps

After running these tests successfully:

1. ✅ Verify all 19 tests pass
2. ✅ Review any failures and fix RLS policies if needed
3. ✅ Integrate tests into your CI/CD pipeline
4. ✅ Document any project-specific RLS policy requirements
5. ✅ Consider adding more edge case tests as needed

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the test output for specific error messages
3. Verify your Supabase project configuration
4. Check that all required tables and buckets exist
5. Ensure RLS is enabled on all tables

For more information about RLS in Supabase:
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)

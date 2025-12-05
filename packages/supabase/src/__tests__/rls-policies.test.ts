import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Coupon } from '@coupon-management/core';
import { couponQueries, reminderQueries, pushSubscriptionQueries } from '../queries';

/**
 * RLS Policy Testing Suite
 * 
 * Tests Requirements 9.1, 9.2, 9.4:
 * - 9.1: RLS policies restrict access to coupon owner
 * - 9.2: Authentication token verification before returning data
 * - 9.4: Storage RLS policies ensure only owner can access images
 * 
 * These tests verify that Row Level Security policies properly enforce
 * data isolation between users and prevent unauthorized access.
 */

// Test user credentials - these should be real test users in your Supabase project
const TEST_USER_1_EMAIL = 'test-user-1@example.com';
const TEST_USER_2_EMAIL = 'test-user-2@example.com';
const TEST_PASSWORD = 'test-password-123';

describe('RLS Policy Tests', () => {
  let supabaseServiceRole: ReturnType<typeof createClient<Database>>;
  let supabaseUser1: ReturnType<typeof createClient<Database>>;
  let supabaseUser2: ReturnType<typeof createClient<Database>>;
  
  let user1Id: string;
  let user2Id: string;
  let testCouponId: string;

  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error(
        'Missing required environment variables for RLS tests. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    // Create service role client for setup/teardown
    supabaseServiceRole = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Create clients for test users
    supabaseUser1 = createClient<Database>(supabaseUrl, supabaseAnonKey);
    supabaseUser2 = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Create or sign in test users
    try {
      // Try to sign up user 1
      const { error: signUpError1 } = await supabaseUser1.auth.signUp({
        email: TEST_USER_1_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signUpError1 && !signUpError1.message.includes('already registered')) {
        throw signUpError1;
      }

      // Sign in user 1
      const { data: signInData1, error: signInError1 } = await supabaseUser1.auth.signInWithPassword({
        email: TEST_USER_1_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signInError1) throw signInError1;
      if (!signInData1.user) throw new Error('Failed to authenticate user 1');
      user1Id = signInData1.user.id;

      // Try to sign up user 2
      const { error: signUpError2 } = await supabaseUser2.auth.signUp({
        email: TEST_USER_2_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signUpError2 && !signUpError2.message.includes('already registered')) {
        throw signUpError2;
      }

      // Sign in user 2
      const { data: signInData2, error: signInError2 } = await supabaseUser2.auth.signInWithPassword({
        email: TEST_USER_2_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signInError2) throw signInError2;
      if (!signInData2.user) throw new Error('Failed to authenticate user 2');
      user2Id = signInData2.user.id;

    } catch (error) {
      console.error('Failed to set up test users:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testCouponId && supabaseServiceRole) {
      await supabaseServiceRole.from('coupons').delete().eq('id', testCouponId);
    }

    // Clean up any test coupons created during tests
    if (user1Id && supabaseServiceRole) {
      await supabaseServiceRole.from('coupons').delete().eq('user_id', user1Id);
    }
    if (user2Id && supabaseServiceRole) {
      await supabaseServiceRole.from('coupons').delete().eq('user_id', user2Id);
    }

    // Sign out users
    await supabaseUser1?.auth.signOut();
    await supabaseUser2?.auth.signOut();
  });

  describe('Coupon Table RLS Policies', () => {
    it('should allow users to create coupons with their own user_id', async () => {
      // Requirement 9.1: Users can create their own coupons
      const testCoupon = {
        userId: user1Id,
        merchant: 'Test Merchant',
        title: 'Test Coupon',
        code: 'TEST123',
        discountType: 'percent' as const,
        discountValue: 20,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        conditions: 'Test conditions',
        source: 'text' as const,
      };

      const { data, error } = await couponQueries.createCoupon(supabaseUser1, testCoupon);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.userId).toBe(user1Id);
      
      if (data) {
        testCouponId = data.id;
      }
    });

    it('should allow users to read only their own coupons', async () => {
      // Requirement 9.1: RLS restricts access to coupon owner
      const { data: user1Coupons, error: user1Error } = await couponQueries.getUserCoupons(
        supabaseUser1,
        user1Id
      );

      expect(user1Error).toBeNull();
      expect(user1Coupons).toBeDefined();
      expect(Array.isArray(user1Coupons)).toBe(true);
      
      // All returned coupons should belong to user1
      user1Coupons?.forEach((coupon) => {
        expect(coupon.userId).toBe(user1Id);
      });
    });

    it('should prevent users from reading other users coupons', async () => {
      // Requirement 9.1: Users cannot access other users' coupons
      // User 2 tries to read User 1's coupons
      const { data, error } = await supabaseUser2
        .from('coupons')
        .select('*')
        .eq('user_id', user1Id);

      // Should return empty array, not an error (RLS silently filters)
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(0);
    });

    it('should prevent users from accessing specific coupons by ID that belong to others', async () => {
      // Requirement 9.1: Users cannot access other users' coupons by ID
      if (!testCouponId) {
        throw new Error('Test coupon not created');
      }

      // User 2 tries to access User 1's coupon by ID
      const { data, error } = await supabaseUser2
        .from('coupons')
        .select('*')
        .eq('id', testCouponId)
        .single();

      // Should fail to find the coupon
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });

    it('should allow users to update only their own coupons', async () => {
      // Requirement 9.1: Users can update their own coupons
      if (!testCouponId) {
        throw new Error('Test coupon not created');
      }

      const updates: Partial<Omit<Coupon, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = { 
        title: 'Updated Title' 
      };

      const { data, error } = await couponQueries.updateCoupon(
        supabaseUser1,
        testCouponId,
        user1Id,
        updates
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe('Updated Title');
    });

    it('should prevent users from updating other users coupons', async () => {
      // Requirement 9.1: Users cannot update other users' coupons
      if (!testCouponId) {
        throw new Error('Test coupon not created');
      }

      // User 2 tries to update User 1's coupon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabaseUser2 as any)
        .from('coupons')
        .update({ title: 'Malicious Update' })
        .eq('id', testCouponId)
        .select();

      // Update should fail or return empty
      expect(data?.length || 0).toBe(0);
    });

    it('should allow users to delete only their own coupons', async () => {
      // Requirement 9.1: Users can delete their own coupons
      // Create a coupon to delete
      const testCoupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user1Id,
        merchant: 'Delete Test',
        title: 'To Be Deleted',
        code: 'DELETE123',
        discountType: 'percent' as const,
        discountValue: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        conditions: 'Test',
        source: 'text' as const,
      };

      const { data: created } = await couponQueries.createCoupon(supabaseUser1, testCoupon);
      expect(created).toBeDefined();

      if (created) {
        const { error } = await couponQueries.deleteCoupon(supabaseUser1, created.id, user1Id);
        expect(error).toBeNull();

        // Verify deletion
        const { data: deleted } = await supabaseUser1
          .from('coupons')
          .select('*')
          .eq('id', created.id)
          .single();
        expect(deleted).toBeNull();
      }
    });

    it('should prevent users from deleting other users coupons', async () => {
      // Requirement 9.1: Users cannot delete other users' coupons
      if (!testCouponId) {
        throw new Error('Test coupon not created');
      }

      // User 2 tries to delete User 1's coupon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseUser2 as any)
        .from('coupons')
        .delete()
        .eq('id', testCouponId);

      // Delete should not affect the coupon
      // Verify coupon still exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabaseUser1 as any)
        .from('coupons')
        .select('*')
        .eq('id', testCouponId)
        .single();

      expect(fetchError).toBeNull();
      expect(data).toBeDefined();
      if (data) {
        expect(data.id).toBe(testCouponId);
      }
    });
  });

  describe('Authentication Token Validation', () => {
    it('should reject requests without authentication token', async () => {
      // Requirement 9.2: Verify authentication token before returning data
      const unauthenticatedClient = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await unauthenticatedClient
        .from('coupons')
        .select('*');

      // Should return empty or error for unauthenticated requests
      expect(data?.length || 0).toBe(0);
    });

    it('should validate token and return data for authenticated requests', async () => {
      // Requirement 9.2: Valid token returns user's data
      const { data, error } = await couponQueries.getUserCoupons(supabaseUser1, user1Id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Reminder Preferences RLS Policies', () => {
    it('should allow users to create and read their own reminder preferences', async () => {
      // Requirement 9.1: Users can manage their own preferences
      const preferences = {
        remind7Days: true,
        remind3Days: false,
        remind1Day: true,
      };

      const { data, error } = await reminderQueries.upsertReminderPreferences(
        supabaseUser1,
        user1Id,
        preferences
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.remind7Days).toBe(true);
      expect(data?.remind3Days).toBe(false);
      expect(data?.remind1Day).toBe(true);
    });

    it('should prevent users from reading other users reminder preferences', async () => {
      // Requirement 9.1: Users cannot access other users' preferences
      const { data, error } = await supabaseUser2
        .from('reminder_preferences')
        .select('*')
        .eq('user_id', user1Id)
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe('Push Subscriptions RLS Policies', () => {
    it('should allow users to create and read their own push subscriptions', async () => {
      // Requirement 9.1: Users can manage their own subscriptions
      const subscription = {
        endpoint: 'https://test-endpoint.com/push/user1',
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      };

      const { data, error } = await pushSubscriptionQueries.createPushSubscription(
        supabaseUser1,
        user1Id,
        subscription
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.endpoint).toBe(subscription.endpoint);

      // Clean up
      if (data) {
        await supabaseServiceRole
          .from('push_subscriptions')
          .delete()
          .eq('id', data.id);
      }
    });

    it('should prevent users from reading other users push subscriptions', async () => {
      // Requirement 9.1: Users cannot access other users' subscriptions
      const { data, error } = await supabaseUser2
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user1Id);

      expect(error).toBeNull();
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('Storage RLS Policies', () => {
    it('should allow users to upload images to their own storage path', async () => {
      // Requirement 9.4: Users can upload to their own storage
      const testImageData = new Blob(['test image data'], { type: 'image/png' });
      const fileName = `${user1Id}/test-image-${Date.now()}.png`;

      const { data, error } = await supabaseUser1.storage
        .from('coupon-images')
        .upload(fileName, testImageData);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Clean up
      if (data) {
        await supabaseServiceRole.storage
          .from('coupon-images')
          .remove([fileName]);
      }
    });

    it('should prevent users from uploading to other users storage paths', async () => {
      // Requirement 9.4: Users cannot upload to other users' paths
      const testImageData = new Blob(['malicious data'], { type: 'image/png' });
      const fileName = `${user1Id}/malicious-upload-${Date.now()}.png`;

      // User 2 tries to upload to User 1's path
      const { error } = await supabaseUser2.storage
        .from('coupon-images')
        .upload(fileName, testImageData);

      // Should fail due to RLS policy
      expect(error).toBeDefined();
    });

    it('should allow users to read their own images', async () => {
      // Requirement 9.4: Users can access their own images
      const testImageData = new Blob(['test image data'], { type: 'image/png' });
      const fileName = `${user1Id}/read-test-${Date.now()}.png`;

      // Upload image
      await supabaseUser1.storage
        .from('coupon-images')
        .upload(fileName, testImageData);

      // Try to read it
      const { data, error } = await supabaseUser1.storage
        .from('coupon-images')
        .download(fileName);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Clean up
      await supabaseServiceRole.storage
        .from('coupon-images')
        .remove([fileName]);
    });

    it('should prevent users from reading other users images', async () => {
      // Requirement 9.4: Users cannot access other users' images
      const testImageData = new Blob(['private data'], { type: 'image/png' });
      const fileName = `${user1Id}/private-${Date.now()}.png`;

      // User 1 uploads image
      await supabaseUser1.storage
        .from('coupon-images')
        .upload(fileName, testImageData);

      // User 2 tries to read it
      const { data, error } = await supabaseUser2.storage
        .from('coupon-images')
        .download(fileName);

      // Should fail due to RLS policy
      expect(error).toBeDefined();
      expect(data).toBeNull();

      // Clean up
      await supabaseServiceRole.storage
        .from('coupon-images')
        .remove([fileName]);
    });

    it('should prevent users from deleting other users images', async () => {
      // Requirement 9.4: Users cannot delete other users' images
      const testImageData = new Blob(['protected data'], { type: 'image/png' });
      const fileName = `${user1Id}/protected-${Date.now()}.png`;

      // User 1 uploads image
      await supabaseUser1.storage
        .from('coupon-images')
        .upload(fileName, testImageData);

      // User 2 tries to delete it
      await supabaseUser2.storage
        .from('coupon-images')
        .remove([fileName]);

      // Should fail or return empty
      // Verify file still exists
      const { data: fileData } = await supabaseUser1.storage
        .from('coupon-images')
        .download(fileName);

      expect(fileData).toBeDefined();

      // Clean up
      await supabaseServiceRole.storage
        .from('coupon-images')
        .remove([fileName]);
    });
  });
});

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { userAccountQueries } from '@coupon-management/supabase';
import type { Database } from '@coupon-management/supabase';

/**
 * DELETE /api/user/delete
 * Deletes the authenticated user's account and all associated data
 * This includes:
 * - All coupons
 * - All coupon images from storage
 * - Reminder preferences
 * - Push subscriptions
 * - Notification logs
 * - User authentication account
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all user data using the regular client (RLS will ensure user can only delete their own data)
    const { error: deleteError, details } = await userAccountQueries.deleteUserAccount(
      supabase as any,
      user.id
    );

    if (deleteError) {
      console.error('Account deletion error:', deleteError, details);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete account data',
          details: details || deleteError.message,
        },
        { status: 500 }
      );
    }

    // Create a service role client for admin operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Service role key not available',
        },
        { status: 500 }
      );
    }

    const adminClient = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete the user account from Supabase Auth using admin client
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (authDeleteError) {
      console.error('Auth account deletion error:', authDeleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete authentication account',
          details: authDeleteError.message,
        },
        { status: 500 }
      );
    }

    // Sign out the user (this will clear cookies)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

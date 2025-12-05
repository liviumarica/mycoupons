import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/notifications/click
 * Update notification log status to 'clicked'
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { notificationLogId } = body;

    if (!notificationLogId) {
      return NextResponse.json(
        { success: false, error: 'Notification log ID is required' },
        { status: 400 }
      );
    }

    // Update notification log status
    const { error: updateError } = await supabase
      .from('notification_logs')
      .update({ status: 'clicked' })
      .eq('id', notificationLogId)
      .eq('user_id', user.id); // Ensure user owns this notification log

    if (updateError) {
      console.error('Error updating notification log:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notification click handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

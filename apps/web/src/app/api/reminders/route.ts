import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@coupon-management/supabase';

/**
 * GET /api/reminders
 * Retrieve user reminder preferences
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch reminder preferences
    const { data: preferences, error } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist yet, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          remind_7_days: true,
          remind_3_days: true,
          remind_1_day: true,
        });
      }
      console.error('Error fetching reminder preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Unexpected error in GET /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reminders
 * Update reminder preferences (7, 3, 1 day options)
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { remind_7_days, remind_3_days, remind_1_day } = body;

    // Validate input
    if (
      typeof remind_7_days !== 'boolean' ||
      typeof remind_3_days !== 'boolean' ||
      typeof remind_1_day !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid preference values' },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('reminder_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existing) {
      // Update existing preferences
      const { data, error } = await (supabase as any)
        .from('reminder_preferences')
        .update({
          remind_7_days,
          remind_3_days,
          remind_1_day,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reminder preferences:', error);
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Insert new preferences
      const { data, error } = await (supabase as any)
        .from('reminder_preferences')
        .insert({
          user_id: user.id,
          remind_7_days,
          remind_3_days,
          remind_1_day,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder preferences:', error);
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error in PUT /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

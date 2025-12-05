import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { Coupon, ReminderPreferences } from '@coupon-management/core';

type DbClient = SupabaseClient<any>;

// Helper to convert database row to Coupon type
function dbRowToCoupon(
  row: Database['public']['Tables']['coupons']['Row']
): Coupon {
  return {
    id: row.id,
    userId: row.user_id,
    merchant: row.merchant,
    title: row.title,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    validFrom: new Date(row.valid_from),
    validUntil: new Date(row.valid_until),
    conditions: row.conditions,
    source: row.source,
    imageUrl: row.image_url || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Helper to convert Coupon to database insert format
function couponToDbInsert(
  coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>
): Database['public']['Tables']['coupons']['Insert'] {
  return {
    user_id: coupon.userId,
    merchant: coupon.merchant,
    title: coupon.title,
    code: coupon.code,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    valid_from: coupon.validFrom.toISOString(),
    valid_until: coupon.validUntil.toISOString(),
    conditions: coupon.conditions,
    source: coupon.source,
    image_url: coupon.imageUrl || null,
  };
}

// Helper to convert database row to ReminderPreferences type
function dbRowToReminderPreferences(
  row: Database['public']['Tables']['reminder_preferences']['Row']
): ReminderPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    remind7Days: row.remind_7_days,
    remind3Days: row.remind_3_days,
    remind1Day: row.remind_1_day,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Coupon Query Helpers
export const couponQueries = {
  /**
   * Get all coupons for a specific user
   */
  async getUserCoupons(
    client: DbClient,
    userId: string
  ): Promise<{ data: Coupon[] | null; error: Error | null }> {
    const { data, error } = await client
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .order('valid_until', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data.map(dbRowToCoupon), error: null };
  },

  /**
   * Get a single coupon by ID
   */
  async getCouponById(
    client: DbClient,
    couponId: string,
    userId: string
  ): Promise<{ data: Coupon | null; error: Error | null }> {
    const { data, error } = await client
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: dbRowToCoupon(data), error: null };
  },

  /**
   * Create a new coupon
   */
  async createCoupon(
    client: DbClient,
    coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ data: Coupon | null; error: Error | null }> {
    const insertData = couponToDbInsert(coupon);
    const { data, error } = await client
      .from('coupons')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: dbRowToCoupon(data), error: null };
  },

  /**
   * Update an existing coupon
   */
  async updateCoupon(
    client: DbClient,
    couponId: string,
    userId: string,
    updates: Partial<Omit<Coupon, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ data: Coupon | null; error: Error | null }> {
    const dbUpdates: any = {};

    if (updates.merchant !== undefined) dbUpdates.merchant = updates.merchant;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.discountType !== undefined)
      dbUpdates.discount_type = updates.discountType;
    if (updates.discountValue !== undefined)
      dbUpdates.discount_value = updates.discountValue;
    if (updates.validFrom !== undefined)
      dbUpdates.valid_from = updates.validFrom.toISOString();
    if (updates.validUntil !== undefined)
      dbUpdates.valid_until = updates.validUntil.toISOString();
    if (updates.conditions !== undefined)
      dbUpdates.conditions = updates.conditions;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.imageUrl !== undefined)
      dbUpdates.image_url = updates.imageUrl || null;

    dbUpdates.updated_at = new Date().toISOString();

    // @ts-ignore - Supabase type inference issue with dynamic updates
    const { data, error } = await client
      .from('coupons')
      .update(dbUpdates)
      .eq('id', couponId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: dbRowToCoupon(data), error: null };
  },

  /**
   * Delete a coupon
   */
  async deleteCoupon(
    client: DbClient,
    couponId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { error } = await client
      .from('coupons')
      .delete()
      .eq('id', couponId)
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  },

  /**
   * Get coupons expiring within a specific number of days
   */
  async getCouponsExpiringInDays(
    client: DbClient,
    userId: string,
    days: number
  ): Promise<{ data: Coupon[] | null; error: Error | null }> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const { data, error } = await client
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('valid_until', targetDateStr);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data.map(dbRowToCoupon), error: null };
  },
};

// Reminder Preferences Query Helpers
export const reminderQueries = {
  /**
   * Get reminder preferences for a user
   */
  async getReminderPreferences(
    client: DbClient,
    userId: string
  ): Promise<{ data: ReminderPreferences | null; error: Error | null }> {
    const { data, error } = await client
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences exist, return default preferences
      if (error.code === 'PGRST116') {
        return {
          data: {
            id: '',
            userId,
            remind7Days: true,
            remind3Days: true,
            remind1Day: true,
          },
          error: null,
        };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data: dbRowToReminderPreferences(data), error: null };
  },

  /**
   * Create or update reminder preferences for a user
   */
  async upsertReminderPreferences(
    client: DbClient,
    userId: string,
    preferences: {
      remind7Days: boolean;
      remind3Days: boolean;
      remind1Day: boolean;
    }
  ): Promise<{ data: ReminderPreferences | null; error: Error | null }> {
    const upsertData: any = {
      user_id: userId,
      remind_7_days: preferences.remind7Days,
      remind_3_days: preferences.remind3Days,
      remind_1_day: preferences.remind1Day,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('reminder_preferences')
      .upsert(upsertData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: dbRowToReminderPreferences(data), error: null };
  },

  /**
   * Delete reminder preferences for a user
   */
  async deleteReminderPreferences(
    client: DbClient,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { error } = await client
      .from('reminder_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  },
};

// Push Subscription Query Helpers
export const pushSubscriptionQueries = {
  /**
   * Get all push subscriptions for a user
   */
  async getUserPushSubscriptions(
    client: DbClient,
    userId: string
  ): Promise<{
    data: Database['public']['Tables']['push_subscriptions']['Row'][] | null;
    error: Error | null;
  }> {
    const { data, error } = await client
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create a new push subscription
   */
  async createPushSubscription(
    client: DbClient,
    userId: string,
    subscription: {
      endpoint: string;
      p256dh: string;
      auth: string;
    }
  ): Promise<{
    data: Database['public']['Tables']['push_subscriptions']['Row'] | null;
    error: Error | null;
  }> {
    const { data, error } = await client
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Delete a push subscription by endpoint
   */
  async deletePushSubscription(
    client: DbClient,
    userId: string,
    endpoint: string
  ): Promise<{ error: Error | null }> {
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  },

  /**
   * Delete all push subscriptions for a user
   */
  async deleteAllUserPushSubscriptions(
    client: DbClient,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  },

  /**
   * Check if a subscription exists for a specific endpoint
   */
  async subscriptionExists(
    client: DbClient,
    userId: string,
    endpoint: string
  ): Promise<{ exists: boolean; error: Error | null }> {
    const { data, error } = await client
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .single();

    if (error) {
      // PGRST116 means no rows found
      if (error.code === 'PGRST116') {
        return { exists: false, error: null };
      }
      return { exists: false, error: new Error(error.message) };
    }

    return { exists: !!data, error: null };
  },
};

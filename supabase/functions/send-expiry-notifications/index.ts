import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { Database } from "../_shared/database.types.ts";

interface CouponWithUser {
  id: string;
  user_id: string;
  merchant: string;
  title: string;
  valid_until: string;
  days_until_expiry: number;
}

interface UserSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data: {
    url: string;
    couponId: string;
    notificationLogId?: string;
  };
}

/**
 * Send web push notification using Web Push API
 */
async function sendPushNotification(
  subscription: UserSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return false;
    }

    // Import web-push functionality - use default import
    const webpushModule = await import("npm:web-push@3.6.7");
    const webpush = webpushModule.default || webpushModule;

    webpush.setVapidDetails(
      "mailto:noreply@couponapp.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

/**
 * Get coupons expiring in specified days
 */
async function getCouponsExpiringIn(
  supabase: ReturnType<typeof createClient<Database>>,
  days: number
): Promise<CouponWithUser[]> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const { data, error } = await supabase
    .from("coupons")
    .select("id, user_id, merchant, title, valid_until")
    .gte("valid_until", targetDate.toISOString().split("T")[0])
    .lt("valid_until", nextDay.toISOString().split("T")[0]);

  if (error) {
    console.error(`Error fetching coupons expiring in ${days} days:`, error);
    return [];
  }

  return (data || []).map((coupon: any) => ({
    ...coupon,
    days_until_expiry: days,
  }));
}

/**
 * Check if notification was already sent for this coupon and interval
 */
async function wasNotificationSent(
  supabase: ReturnType<typeof createClient<Database>>,
  couponId: string,
  notificationType: "7_day" | "3_day" | "1_day"
): Promise<boolean> {
  // Check if notification was sent in the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data, error } = await supabase
    .from("notification_logs")
    .select("id")
    .eq("coupon_id", couponId)
    .eq("notification_type", notificationType)
    .gte("sent_at", yesterday.toISOString())
    .limit(1);

  if (error) {
    console.error("Error checking notification log:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Log notification delivery
 */
async function logNotification(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  couponId: string,
  notificationType: "7_day" | "3_day" | "1_day",
  status: "sent" | "failed"
): Promise<string | null> {
  const { data, error } = await supabase.from("notification_logs").insert({
    user_id: userId,
    coupon_id: couponId,
    notification_type: notificationType,
    status,
  }).select('id').single();

  if (error) {
    console.error("Error logging notification:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Disable invalid push subscription
 */
async function disableSubscription(
  supabase: ReturnType<typeof createClient<Database>>,
  endpoint: string
): Promise<void> {
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    console.error("Error disabling subscription:", error);
  }
}

/**
 * Main handler for the Edge Function
 */
Deno.serve(async (req: Request) => {
  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    console.log("Starting notification cron job...");

    // Get coupons expiring in 7, 3, and 1 days
    const [coupons7Days, coupons3Days, coupons1Day] = await Promise.all([
      getCouponsExpiringIn(supabase, 7),
      getCouponsExpiringIn(supabase, 3),
      getCouponsExpiringIn(supabase, 1),
    ]);

    const allCoupons = [...coupons7Days, ...coupons3Days, ...coupons1Day];
    console.log(`Found ${allCoupons.length} coupons expiring soon`);

    if (allCoupons.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No coupons expiring soon",
          sent: 0,
          failed: 0,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Group coupons by user
    const couponsByUser = new Map<string, CouponWithUser[]>();
    for (const coupon of allCoupons) {
      const userCoupons = couponsByUser.get(coupon.user_id) || [];
      userCoupons.push(coupon);
      couponsByUser.set(coupon.user_id, userCoupons);
    }

    let sentCount = 0;
    let failedCount = 0;

    // Process each user's coupons
    for (const [userId, userCoupons] of couponsByUser.entries()) {
      // Get user's reminder preferences
      const { data: preferences } = await supabase
        .from("reminder_preferences")
        .select("remind_7_days, remind_3_days, remind_1_day")
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        console.log(`No preferences found for user ${userId}`);
        continue;
      }

      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("user_id, endpoint, p256dh, auth")
        .eq("user_id", userId);

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions for user ${userId}`);
        continue;
      }

      // Process each coupon for this user
      for (const coupon of userCoupons) {
        const days = coupon.days_until_expiry;
        let notificationType: "7_day" | "3_day" | "1_day" | undefined;

        // Check if user wants notifications for this interval
        if (days === 7 && preferences.remind_7_days) {
          notificationType = "7_day";
        } else if (days === 3 && preferences.remind_3_days) {
          notificationType = "3_day";
        } else if (days === 1 && preferences.remind_1_day) {
          notificationType = "1_day";
        } else {
          continue;
        }

        // Skip if notification type is not set (shouldn't happen due to continue above)
        if (!notificationType) {
          continue;
        }

        // Check for duplicate notifications
        const alreadySent = await wasNotificationSent(
          supabase,
          coupon.id,
          notificationType
        );

        if (alreadySent) {
          console.log(
            `Notification already sent for coupon ${coupon.id} (${notificationType})`
          );
          continue;
        }

        // Log notification first to get the ID
        const notificationLogId = await logNotification(
          supabase,
          userId,
          coupon.id,
          notificationType,
          "sent" // Optimistically set as sent, will update if failed
        );

        // Create notification payload
        const payload: NotificationPayload = {
          title: "Coupon Expiring Soon",
          body: `Your ${coupon.merchant} coupon "${coupon.title}" expires in ${days} day${days > 1 ? "s" : ""}!`,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: `coupon-expiry-${coupon.id}`,
          data: {
            url: "/dashboard",
            couponId: coupon.id,
            notificationLogId: notificationLogId || undefined,
          },
        };

        // Send notification to all user's subscriptions
        let notificationSent = false;
        for (const subscription of subscriptions) {
          const success = await sendPushNotification(subscription, payload);

          if (success) {
            notificationSent = true;
          } else {
            // Disable invalid subscription
            await disableSubscription(supabase, subscription.endpoint);
          }
        }

        // Update notification log if sending failed
        if (!notificationSent && notificationLogId) {
          await supabase
            .from("notification_logs")
            .update({ status: "failed" })
            .eq("id", notificationLogId);
        }

        if (notificationSent) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
    }

    console.log(
      `Notification job complete: ${sentCount} sent, ${failedCount} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification job completed",
        sent: sentCount,
        failed: failedCount,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notification cron job:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

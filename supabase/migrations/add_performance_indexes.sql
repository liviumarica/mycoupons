-- Performance optimization indexes for coupon management

-- Index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);

-- Index on valid_until for expiration queries (used in notifications and filtering)
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);

-- Composite index for user_id and valid_until (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_coupons_user_valid_until ON coupons(user_id, valid_until);

-- Index on merchant for filtering
CREATE INDEX IF NOT EXISTS idx_coupons_merchant ON coupons(merchant);

-- Index on discount_type for filtering
CREATE INDEX IF NOT EXISTS idx_coupons_discount_type ON coupons(discount_type);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- Indexes for reminder_preferences
CREATE INDEX IF NOT EXISTS idx_reminder_preferences_user_id ON reminder_preferences(user_id);

-- Indexes for push_subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Indexes for notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_coupon_id ON notification_logs(coupon_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

-- Composite index for notification deduplication queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_coupon_type ON notification_logs(coupon_id, notification_type);

-- Add comments for documentation
COMMENT ON INDEX idx_coupons_user_id IS 'Optimizes user-specific coupon queries';
COMMENT ON INDEX idx_coupons_valid_until IS 'Optimizes expiration date queries for notifications';
COMMENT ON INDEX idx_coupons_user_valid_until IS 'Optimizes combined user and expiration queries';
COMMENT ON INDEX idx_coupons_merchant IS 'Optimizes merchant filtering';
COMMENT ON INDEX idx_coupons_discount_type IS 'Optimizes discount type filtering';

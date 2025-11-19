-- Add push notification columns to notification_preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS push_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS push_subscription text;
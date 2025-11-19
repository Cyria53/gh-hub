-- Create notification_history table to track all notifications sent
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_id UUID NOT NULL REFERENCES maintenance_alerts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'pending', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notification history"
  ON notification_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification history"
  ON notification_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update notification history"
  ON notification_history
  FOR UPDATE
  USING (true);

-- Indexes for performance
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_alert_id ON notification_history(alert_id);
CREATE INDEX idx_notification_history_created_at ON notification_history(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_notification_history_updated_at
  BEFORE UPDATE ON notification_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
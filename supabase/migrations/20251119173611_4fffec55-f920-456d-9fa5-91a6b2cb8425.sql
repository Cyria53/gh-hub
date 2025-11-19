-- Add validation fields to pointage table
ALTER TABLE pointage 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN validated_by uuid REFERENCES auth.users(id),
ADD COLUMN validated_at timestamptz,
ADD COLUMN validation_comment text;

-- Create pointage_history table for audit trail
CREATE TABLE pointage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pointage_id uuid NOT NULL REFERENCES pointage(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  change_type text NOT NULL CHECK (change_type IN ('created', 'updated', 'validated', 'rejected', 'modified')),
  old_values jsonb,
  new_values jsonb,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on pointage_history
ALTER TABLE pointage_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for pointage_history
CREATE POLICY "Users can view history of their own pointages"
ON pointage_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pointage 
    WHERE pointage.id = pointage_history.pointage_id 
    AND pointage.user_id = auth.uid()
  )
);

CREATE POLICY "RH can view all history"
ON pointage_history FOR SELECT
USING (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);

CREATE POLICY "RH can insert history"
ON pointage_history FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);

-- Create function to log pointage changes
CREATE OR REPLACE FUNCTION log_pointage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO pointage_history (pointage_id, changed_by, change_type, new_values)
    VALUES (NEW.id, NEW.user_id, 'created', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log validation changes
    IF OLD.status != NEW.status THEN
      INSERT INTO pointage_history (pointage_id, changed_by, change_type, old_values, new_values, comment)
      VALUES (
        NEW.id, 
        COALESCE(NEW.validated_by, auth.uid()), 
        CASE WHEN NEW.status = 'approved' THEN 'validated' ELSE 'rejected' END,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status),
        NEW.validation_comment
      );
    ELSE
      -- Log other modifications
      INSERT INTO pointage_history (pointage_id, changed_by, change_type, old_values, new_values)
      VALUES (NEW.id, auth.uid(), 'modified', to_jsonb(OLD), to_jsonb(NEW));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic history logging
CREATE TRIGGER pointage_history_trigger
AFTER INSERT OR UPDATE ON pointage
FOR EACH ROW EXECUTE FUNCTION log_pointage_change();

-- Create index for better performance
CREATE INDEX idx_pointage_status ON pointage(status);
CREATE INDEX idx_pointage_history_pointage_id ON pointage_history(pointage_id);
CREATE INDEX idx_pointage_history_created_at ON pointage_history(created_at DESC);
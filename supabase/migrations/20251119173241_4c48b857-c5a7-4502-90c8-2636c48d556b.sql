-- Add RLS policy for RH, managers and admins to view all pointages
CREATE POLICY "RH can view all time records"
ON pointage FOR SELECT
USING (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);

-- Add RLS policy for RH to update pointages (for validation/corrections)
CREATE POLICY "RH can update all time records"
ON pointage FOR UPDATE
USING (
  public.has_role(auth.uid(), 'rh') OR 
  public.has_role(auth.uid(), 'gerant') OR 
  public.has_role(auth.uid(), 'admin_gh2')
);

-- Create index for better performance on date filtering
CREATE INDEX IF NOT EXISTS idx_pointage_check_in ON pointage(check_in DESC);
CREATE INDEX IF NOT EXISTS idx_pointage_user_id ON pointage(user_id);
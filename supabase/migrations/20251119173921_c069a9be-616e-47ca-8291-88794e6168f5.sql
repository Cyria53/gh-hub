-- Create vehicle_maintenance table for maintenance history
CREATE TABLE vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  maintenance_type text NOT NULL,
  description text,
  mileage integer,
  cost numeric,
  performed_by text,
  performed_at date NOT NULL,
  next_maintenance_date date,
  documents_urls text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on vehicle_maintenance
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle_maintenance
CREATE POLICY "Users can view maintenance of their vehicles"
ON vehicle_maintenance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert maintenance for their vehicles"
ON vehicle_maintenance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update maintenance of their vehicles"
ON vehicle_maintenance FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete maintenance of their vehicles"
ON vehicle_maintenance FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vehicles.id = vehicle_maintenance.vehicle_id 
    AND vehicles.user_id = auth.uid()
  )
);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_vehicle_maintenance_updated_at
BEFORE UPDATE ON vehicle_maintenance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_vehicle_maintenance_vehicle_id ON vehicle_maintenance(vehicle_id);
CREATE INDEX idx_vehicle_maintenance_performed_at ON vehicle_maintenance(performed_at DESC);

-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-documents', 'vehicle-documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for vehicle documents storage
CREATE POLICY "Users can upload their vehicle documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their vehicle documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their vehicle documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their vehicle documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
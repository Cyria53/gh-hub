-- Table pour les alertes de maintenance
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_id UUID REFERENCES public.vehicle_maintenance(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'date_based' ou 'mileage_based'
  alert_reason TEXT NOT NULL, -- Description de l'alerte
  threshold_date DATE, -- Date limite pour alerte basée sur date
  threshold_mileage INTEGER, -- Kilométrage limite pour alerte basée sur km
  current_mileage INTEGER, -- Kilométrage actuel du véhicule
  days_until_due INTEGER, -- Jours restants (pour date)
  km_until_due INTEGER, -- Km restants (pour kilométrage)
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'dismissed'
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_maintenance_alerts_user_id ON public.maintenance_alerts(user_id);
CREATE INDEX idx_maintenance_alerts_vehicle_id ON public.maintenance_alerts(vehicle_id);
CREATE INDEX idx_maintenance_alerts_status ON public.maintenance_alerts(status);
CREATE INDEX idx_maintenance_alerts_threshold_date ON public.maintenance_alerts(threshold_date);

-- Trigger pour updated_at
CREATE TRIGGER update_maintenance_alerts_updated_at
BEFORE UPDATE ON public.maintenance_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
ON public.maintenance_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
ON public.maintenance_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.maintenance_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.maintenance_alerts FOR DELETE
USING (auth.uid() = user_id);

-- Table pour les préférences de notification
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_days_before JSONB DEFAULT '[7, 14, 30]'::jsonb, -- Alertes X jours avant
  mileage_enabled BOOLEAN DEFAULT true,
  mileage_threshold_km INTEGER DEFAULT 1000, -- Alerte X km avant
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Trigger
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Créer des préférences par défaut pour tous les utilisateurs existants
INSERT INTO public.notification_preferences (user_id)
SELECT DISTINCT user_id FROM public.vehicles
ON CONFLICT (user_id) DO NOTHING;
-- ====================================
-- SCHEMA GH₂ V1 - Base de données complète
-- ====================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- ENUMS
-- ====================================

CREATE TYPE app_role AS ENUM ('client', 'technicien', 'gerant', 'admin_gh2', 'rh', 'invite');
CREATE TYPE mission_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE diagnostic_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE technician_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ====================================
-- TABLE ROLES
-- ====================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.roles FOR SELECT
  USING (auth.uid() = user_id);

-- ====================================
-- TABLE PROFILES
-- ====================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ====================================
-- TABLE AGENCIES
-- ====================================

CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies are viewable by everyone"
  ON public.agencies FOR SELECT
  USING (true);

-- ====================================
-- TABLE VEHICLES
-- ====================================

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vin TEXT,
  license_plate TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  first_registration_date DATE,
  fuel_type TEXT,
  color TEXT,
  mileage INTEGER,
  carte_grise_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);

-- ====================================
-- TABLE CARTE_GRISE_SCANS
-- ====================================

CREATE TABLE public.carte_grise_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  extracted_data JSONB,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.carte_grise_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans"
  ON public.carte_grise_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.carte_grise_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- TABLE DIAGNOSTICS
-- ====================================

CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  symptom_photo_url TEXT,
  symptom_video_url TEXT,
  ai_diagnosis TEXT,
  severity diagnostic_severity,
  estimated_cost_min DECIMAL(10, 2),
  estimated_cost_max DECIMAL(10, 2),
  recommendations TEXT,
  pdf_report_url TEXT,
  is_guest BOOLEAN DEFAULT false,
  guest_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostics"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id OR is_guest = true);

CREATE POLICY "Users can insert their own diagnostics"
  ON public.diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_guest = true);

CREATE INDEX idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX idx_diagnostics_created_at ON public.diagnostics(created_at DESC);

-- ====================================
-- TABLE TECHNICIANS
-- ====================================

CREATE TABLE public.technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  specialties TEXT[],
  certification_level TEXT,
  hourly_rate DECIMAL(10, 2),
  status technician_status DEFAULT 'offline',
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMPTZ,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_missions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view their own profile"
  ON public.technicians FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Technicians can update their own profile"
  ON public.technicians FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view available technicians"
  ON public.technicians FOR SELECT
  USING (is_available = true);

-- ====================================
-- TABLE MISSIONS
-- ====================================

CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  diagnostic_id UUID REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  status mission_status DEFAULT 'pending',
  scheduled_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  client_latitude DECIMAL(10, 8),
  client_longitude DECIMAL(11, 8),
  client_address TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  client_signature_url TEXT,
  technician_report TEXT,
  photos_urls TEXT[],
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own missions"
  ON public.missions FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Technicians can view their missions"
  ON public.missions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.technicians 
    WHERE technicians.id = missions.technician_id 
    AND technicians.user_id = auth.uid()
  ));

CREATE POLICY "Clients can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE INDEX idx_missions_client_id ON public.missions(client_id);
CREATE INDEX idx_missions_technician_id ON public.missions(technician_id);
CREATE INDEX idx_missions_status ON public.missions(status);

-- ====================================
-- TABLE MARKETPLACE_ITEMS
-- ====================================

CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stripe_price_id TEXT,
  images_urls TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view available items"
  ON public.marketplace_items FOR SELECT
  USING (is_available = true);

CREATE INDEX idx_marketplace_category ON public.marketplace_items(category);

-- ====================================
-- TABLE MARKETPLACE_ORDERS
-- ====================================

CREATE TABLE public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.marketplace_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.marketplace_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_orders_user_id ON public.marketplace_orders(user_id);

-- ====================================
-- TABLE FIDELITE
-- ====================================

CREATE TABLE public.fidelite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.fidelite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty points"
  ON public.fidelite FOR SELECT
  USING (auth.uid() = user_id);

-- ====================================
-- TABLE PAIEMENTS
-- ====================================

CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.paiements FOR SELECT
  USING (auth.uid() = user_id);

-- ====================================
-- TABLE POINTAGE
-- ====================================

CREATE TABLE public.pointage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  hours_worked DECIMAL(5, 2),
  is_billable BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pointage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time records"
  ON public.pointage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time records"
  ON public.pointage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pointage_user_id ON public.pointage(user_id);
CREATE INDEX idx_pointage_date ON public.pointage(check_in DESC);

-- ====================================
-- TABLE HORAIRES_TECH
-- ====================================

CREATE TABLE public.horaires_tech (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.horaires_tech ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage their schedules"
  ON public.horaires_tech FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.technicians 
    WHERE technicians.id = horaires_tech.technician_id 
    AND technicians.user_id = auth.uid()
  ));

-- ====================================
-- TABLE NOTIFICATIONS
-- ====================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ====================================
-- FUNCTIONS
-- ====================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  INSERT INTO public.fidelite (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostics_updated_at BEFORE UPDATE ON public.diagnostics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
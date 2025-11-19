export type AppRole = 'client' | 'technicien' | 'gerant' | 'admin_gh2' | 'rh' | 'invite';

export type MissionStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type DiagnosticSeverity = 'low' | 'medium' | 'high' | 'critical';

export type TechnicianStatus = 'available' | 'busy' | 'offline';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vin?: string;
  license_plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  first_registration_date?: string;
  fuel_type?: string;
  color?: string;
  mileage?: number;
  carte_grise_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Diagnostic {
  id: string;
  user_id?: string;
  vehicle_id?: string;
  symptom_photo_url?: string;
  symptom_video_url?: string;
  ai_diagnosis?: string;
  severity?: DiagnosticSeverity;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  recommendations?: string;
  pdf_report_url?: string;
  is_guest: boolean;
  guest_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  user_id: string;
  agency_id?: string;
  specialties?: string[];
  certification_level?: string;
  hourly_rate?: number;
  status: TechnicianStatus;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  is_available: boolean;
  rating: number;
  total_missions: number;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  client_id: string;
  technician_id?: string;
  diagnostic_id?: string;
  vehicle_id?: string;
  service_type: string;
  description?: string;
  status: MissionStatus;
  scheduled_date?: string;
  completion_date?: string;
  client_latitude?: number;
  client_longitude?: number;
  client_address?: string;
  estimated_duration?: number;
  actual_duration?: number;
  estimated_cost?: number;
  final_cost?: number;
  client_signature_url?: string;
  technician_report?: string;
  photos_urls?: string[];
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  stripe_price_id?: string;
  images_urls?: string[];
  stock_quantity: number;
  is_available: boolean;
  specifications?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceOrder {
  id: string;
  user_id: string;
  items: Record<string, any>;
  total_amount: number;
  status: OrderStatus;
  stripe_payment_intent_id?: string;
  shipping_address?: Record<string, any>;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Pointage {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  hours_worked: number | null;
  is_billable: boolean;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  validated_by: string | null;
  validated_at: string | null;
  validation_comment: string | null;
  created_at: string;
}

export interface PointageHistory {
  id: string;
  pointage_id: string;
  changed_by: string;
  change_type: 'created' | 'updated' | 'validated' | 'rejected' | 'modified';
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  comment: string | null;
  created_at: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  user_id: string;
  maintenance_type: string;
  description: string | null;
  mileage: number | null;
  cost: number | null;
  performed_by: string | null;
  performed_at: string;
  next_maintenance_date: string | null;
  documents_urls: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

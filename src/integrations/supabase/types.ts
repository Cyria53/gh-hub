export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          address: string
          city: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      carte_grise_scans: {
        Row: {
          created_at: string | null
          extracted_data: Json | null
          id: string
          image_url: string
          scan_date: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          image_url: string
          scan_date?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          image_url?: string
          scan_date?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carte_grise_scans_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          ai_diagnosis: string | null
          created_at: string | null
          estimated_cost_max: number | null
          estimated_cost_min: number | null
          guest_email: string | null
          id: string
          is_guest: boolean | null
          pdf_report_url: string | null
          recommendations: string | null
          severity: Database["public"]["Enums"]["diagnostic_severity"] | null
          symptom_photo_url: string | null
          symptom_video_url: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          ai_diagnosis?: string | null
          created_at?: string | null
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          guest_email?: string | null
          id?: string
          is_guest?: boolean | null
          pdf_report_url?: string | null
          recommendations?: string | null
          severity?: Database["public"]["Enums"]["diagnostic_severity"] | null
          symptom_photo_url?: string | null
          symptom_video_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          ai_diagnosis?: string | null
          created_at?: string | null
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          guest_email?: string | null
          id?: string
          is_guest?: boolean | null
          pdf_report_url?: string | null
          recommendations?: string | null
          severity?: Database["public"]["Enums"]["diagnostic_severity"] | null
          symptom_photo_url?: string | null
          symptom_video_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fidelite: {
        Row: {
          created_at: string | null
          id: string
          points: number | null
          tier: string | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      horaires_tech: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          technician_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          technician_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horaires_tech_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          images_urls: string[] | null
          is_available: boolean | null
          name: string
          price: number
          specifications: Json | null
          stock_quantity: number | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          images_urls?: string[] | null
          is_available?: boolean | null
          name: string
          price: number
          specifications?: Json | null
          stock_quantity?: number | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images_urls?: string[] | null
          is_available?: boolean | null
          name?: string
          price?: number
          specifications?: Json | null
          stock_quantity?: number | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          actual_duration: number | null
          client_address: string | null
          client_id: string
          client_latitude: number | null
          client_longitude: number | null
          client_signature_url: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          diagnostic_id: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          final_cost: number | null
          id: string
          photos_urls: string[] | null
          rating: number | null
          review: string | null
          scheduled_date: string | null
          service_type: string
          status: Database["public"]["Enums"]["mission_status"] | null
          technician_id: string | null
          technician_report: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_duration?: number | null
          client_address?: string | null
          client_id: string
          client_latitude?: number | null
          client_longitude?: number | null
          client_signature_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          diagnostic_id?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          final_cost?: number | null
          id?: string
          photos_urls?: string[] | null
          rating?: number | null
          review?: string | null
          scheduled_date?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          technician_id?: string | null
          technician_report?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_duration?: number | null
          client_address?: string | null
          client_id?: string
          client_latitude?: number | null
          client_longitude?: number | null
          client_signature_url?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          diagnostic_id?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          final_cost?: number | null
          id?: string
          photos_urls?: string[] | null
          rating?: number | null
          review?: string | null
          scheduled_date?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["mission_status"] | null
          technician_id?: string | null
          technician_report?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      paiements: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mission_id: string | null
          order_id: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mission_id?: string | null
          order_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mission_id?: string | null
          order_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pointage: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string | null
          hours_worked: number | null
          id: string
          is_billable: boolean | null
          notes: string | null
          user_id: string
        }
        Insert: {
          check_in: string
          check_out?: string | null
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          is_billable?: boolean | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          agency_id: string | null
          certification_level: string | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          last_location_update: string | null
          rating: number | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["technician_status"] | null
          total_missions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          certification_level?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_missions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          certification_level?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_missions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          carte_grise_url: string | null
          color: string | null
          created_at: string | null
          first_registration_date: string | null
          fuel_type: string | null
          id: string
          license_plate: string | null
          mileage: number | null
          model: string | null
          updated_at: string | null
          user_id: string
          vin: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          carte_grise_url?: string | null
          color?: string | null
          created_at?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage?: number | null
          model?: string | null
          updated_at?: string | null
          user_id: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          carte_grise_url?: string | null
          color?: string | null
          created_at?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage?: number | null
          model?: string | null
          updated_at?: string | null
          user_id?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "client"
        | "technicien"
        | "gerant"
        | "admin_gh2"
        | "rh"
        | "invite"
      diagnostic_severity: "low" | "medium" | "high" | "critical"
      mission_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      order_status: "pending" | "processing" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      technician_status: "available" | "busy" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "technicien", "gerant", "admin_gh2", "rh", "invite"],
      diagnostic_severity: ["low", "medium", "high", "critical"],
      mission_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      order_status: ["pending", "processing", "completed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      technician_status: ["available", "busy", "offline"],
    },
  },
} as const

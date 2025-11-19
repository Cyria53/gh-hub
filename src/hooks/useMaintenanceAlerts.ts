import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceAlert {
  id: string;
  user_id: string;
  vehicle_id: string;
  maintenance_id: string | null;
  alert_type: 'date_based' | 'mileage_based';
  alert_reason: string;
  threshold_date: string | null;
  threshold_mileage: number | null;
  current_mileage: number | null;
  days_until_due: number | null;
  km_until_due: number | null;
  status: 'pending' | 'sent' | 'dismissed';
  sent_at: string | null;
  dismissed_at: string | null;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  email_days_before: number[];
  mileage_enabled: boolean;
  mileage_threshold_km: number;
  created_at: string;
  updated_at: string;
}

export const useMaintenanceAlerts = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('maintenance_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as MaintenanceAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les alertes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Créer des préférences par défaut
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_enabled: true,
            email_days_before: [7, 14, 30],
            mileage_enabled: true,
            mileage_threshold_km: 1000,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPrefs as NotificationPreferences);
      } else {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !preferences) return;

      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPreferences();

      toast({
        title: 'Succès',
        description: 'Préférences mises à jour',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les préférences',
        variant: 'destructive',
      });
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_alerts')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;

      await fetchAlerts();

      toast({
        title: 'Alerte ignorée',
        description: 'L\'alerte a été marquée comme ignorée',
      });
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ignorer l\'alerte',
        variant: 'destructive',
      });
    }
  };

  const triggerManualCheck = async () => {
    try {
      const { error } = await supabase.functions.invoke('check-maintenance-alerts');

      if (error) throw error;

      await fetchAlerts();

      toast({
        title: 'Vérification effectuée',
        description: 'Les alertes ont été mises à jour',
      });
    } catch (error) {
      console.error('Error triggering manual check:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier les maintenances',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchPreferences();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('maintenance-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_alerts',
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    alerts,
    preferences,
    loading,
    dismissAlert,
    updatePreferences,
    triggerManualCheck,
    refetch: fetchAlerts,
  };
};

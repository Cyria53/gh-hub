import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VehicleMaintenance } from '@/types/gh2';
import { useToast } from '@/hooks/use-toast';

export function useVehicleMaintenance(vehicleId?: string) {
  const [maintenances, setMaintenances] = useState<VehicleMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vehicleId) {
      fetchMaintenances();

      const channel = supabase
        .channel(`maintenance-${vehicleId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vehicle_maintenance',
            filter: `vehicle_id=eq.${vehicleId}`,
          },
          () => {
            fetchMaintenances();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [vehicleId]);

  async function fetchMaintenances() {
    if (!vehicleId) return;

    try {
      const { data, error } = await supabase
        .from('vehicle_maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('performed_at', { ascending: false });

      if (error) throw error;
      setMaintenances((data || []) as VehicleMaintenance[]);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function addMaintenance(maintenance: Partial<VehicleMaintenance>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vehicle_maintenance')
        .insert({
          vehicle_id: vehicleId!,
          user_id: user.id,
          maintenance_type: maintenance.maintenance_type!,
          description: maintenance.description,
          mileage: maintenance.mileage,
          cost: maintenance.cost,
          performed_by: maintenance.performed_by,
          performed_at: maintenance.performed_at!,
          next_maintenance_date: maintenance.next_maintenance_date,
          documents_urls: maintenance.documents_urls,
          notes: maintenance.notes,
        } as any);

      if (error) throw error;

      toast({
        title: 'Maintenance ajoutée',
        description: 'L\'intervention a été enregistrée',
      });

      fetchMaintenances();
      return { success: true };
    } catch (error) {
      console.error('Error adding maintenance:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la maintenance',
        variant: 'destructive',
      });
      return { success: false };
    }
  }

  async function deleteMaintenance(id: string) {
    try {
      const { error } = await supabase
        .from('vehicle_maintenance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Maintenance supprimée',
        description: 'L\'intervention a été retirée',
      });

      fetchMaintenances();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la maintenance',
        variant: 'destructive',
      });
    }
  }

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
  const upcomingMaintenances = maintenances.filter(
    m => m.next_maintenance_date && new Date(m.next_maintenance_date) > new Date()
  );

  return {
    maintenances,
    loading,
    addMaintenance,
    deleteMaintenance,
    refetch: fetchMaintenances,
    totalCost,
    upcomingMaintenances,
  };
}

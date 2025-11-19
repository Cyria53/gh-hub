import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/gh2';
import { useToast } from '@/hooks/use-toast';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();

    const channel = supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchVehicles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles((data || []) as Vehicle[]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les véhicules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function addVehicle(vehicle: Partial<Vehicle>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicle,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Véhicule ajouté',
        description: 'Le véhicule a été enregistré avec succès',
      });

      fetchVehicles();
      return { success: true };
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le véhicule',
        variant: 'destructive',
      });
      return { success: false };
    }
  }

  async function updateVehicle(id: string, updates: Partial<Vehicle>) {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Véhicule modifié',
        description: 'Les informations ont été mises à jour',
      });

      fetchVehicles();
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le véhicule',
        variant: 'destructive',
      });
      return { success: false };
    }
  }

  async function deleteVehicle(id: string) {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Véhicule supprimé',
        description: 'Le véhicule a été retiré de votre liste',
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le véhicule',
        variant: 'destructive',
      });
    }
  }

  return {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles,
  };
}

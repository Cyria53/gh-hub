import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mission } from '@/types/gh2';
import { toast } from 'sonner';

export function useMissions(technicianId?: string) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();

    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
        },
        () => {
          fetchMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technicianId]);

  async function fetchMissions() {
    try {
      let query = supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (technicianId) {
        query = query.eq('technician_id', technicianId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  }

  const acceptMission = async (missionId: string, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({
          technician_id: technicianId,
          status: 'accepted',
        })
        .eq('id', missionId);

      if (error) throw error;

      toast.success('Mission acceptée');
      await fetchMissions();
    } catch (error) {
      console.error('Error accepting mission:', error);
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const rejectMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({
          technician_id: null,
          status: 'pending',
        })
        .eq('id', missionId);

      if (error) throw error;

      toast.success('Mission refusée');
      await fetchMissions();
    } catch (error) {
      console.error('Error rejecting mission:', error);
      toast.error('Erreur lors du refus');
    }
  };

  const startMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ status: 'in_progress' })
        .eq('id', missionId);

      if (error) throw error;

      toast.success('Mission démarrée');
      await fetchMissions();
    } catch (error) {
      console.error('Error starting mission:', error);
      toast.error('Erreur lors du démarrage');
    }
  };

  const completeMission = async (
    missionId: string,
    report: string,
    signatureUrl: string,
    photosUrls: string[],
    finalCost?: number,
    actualDuration?: number
  ) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({
          status: 'completed',
          completion_date: new Date().toISOString(),
          technician_report: report,
          client_signature_url: signatureUrl,
          photos_urls: photosUrls,
          final_cost: finalCost,
          actual_duration: actualDuration,
        })
        .eq('id', missionId);

      if (error) throw error;

      toast.success('Mission terminée');
      await fetchMissions();
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error('Erreur lors de la finalisation');
    }
  };

  return {
    missions,
    loading,
    acceptMission,
    rejectMission,
    startMission,
    completeMission,
    refetch: fetchMissions,
  };
}

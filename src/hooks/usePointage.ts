import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pointage } from '@/types/gh2';
import { useToast } from '@/hooks/use-toast';

export function usePointage() {
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [currentPointage, setCurrentPointage] = useState<Pointage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPointages();
    fetchCurrentPointage();

    const channel = supabase
      .channel('pointage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pointage',
        },
        () => {
          fetchPointages();
          fetchCurrentPointage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPointages() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pointage')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in', { ascending: false });

      if (error) throw error;
      setPointages((data || []) as Pointage[]);
    } catch (error) {
      console.error('Error fetching pointages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les pointages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentPointage() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pointage')
        .select('*')
        .eq('user_id', user.id)
        .is('check_out', null)
        .order('check_in', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentPointage((data || null) as Pointage | null);
    } catch (error) {
      console.error('Error fetching current pointage:', error);
    }
  }

  async function checkIn(isBillable: boolean = true, notes?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pointage')
        .insert({
          user_id: user.id,
          check_in: new Date().toISOString(),
          is_billable: isBillable,
          notes: notes,
        });

      if (error) throw error;

      toast({
        title: 'Pointage effectué',
        description: 'Votre arrivée a été enregistrée',
      });

      fetchPointages();
      fetchCurrentPointage();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le pointage',
        variant: 'destructive',
      });
    }
  }

  async function checkOut(notes?: string) {
    try {
      if (!currentPointage) throw new Error('No active pointage');

      const checkInTime = new Date(currentPointage.check_in);
      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('pointage')
        .update({
          check_out: checkOutTime.toISOString(),
          hours_worked: hoursWorked,
          notes: notes || currentPointage.notes,
        })
        .eq('id', currentPointage.id);

      if (error) throw error;

      toast({
        title: 'Pointage terminé',
        description: `Durée: ${hoursWorked.toFixed(2)}h`,
      });

      fetchPointages();
      fetchCurrentPointage();
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer le pointage',
        variant: 'destructive',
      });
    }
  }

  function exportToCSV() {
    const headers = ['Date', 'Arrivée', 'Départ', 'Heures', 'Facturable', 'Notes'];
    const rows = pointages.map(p => [
      new Date(p.check_in).toLocaleDateString('fr-FR'),
      new Date(p.check_in).toLocaleTimeString('fr-FR'),
      p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR') : 'En cours',
      p.hours_worked?.toFixed(2) || '-',
      p.is_billable ? 'Oui' : 'Non',
      p.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pointages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé',
    });
  }

  return {
    pointages,
    currentPointage,
    loading,
    checkIn,
    checkOut,
    exportToCSV,
  };
}

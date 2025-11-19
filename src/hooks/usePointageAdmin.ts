import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pointage } from '@/types/gh2';
import { useToast } from '@/hooks/use-toast';

interface PointageWithProfile extends Pointage {
  profile?: {
    full_name: string;
    email: string;
  };
}

interface PointageFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  isBillable?: boolean;
}

interface PointageStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalRecords: number;
  employeeCount: number;
}

export function usePointageAdmin() {
  const [pointages, setPointages] = useState<PointageWithProfile[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PointageFilters>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchPointages();

    const channel = supabase
      .channel('admin-pointage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pointage',
        },
        () => {
          fetchPointages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  async function fetchPointages() {
    try {
      let query = supabase
        .from('pointage')
        .select('*')
        .order('check_in', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.startDate) {
        query = query.gte('check_in', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('check_in', endOfDay.toISOString());
      }

      if (filters.isBillable !== undefined) {
        query = query.eq('is_billable', filters.isBillable);
      }

      const { data: pointagesData, error: pointagesError } = await query;

      if (pointagesError) throw pointagesError;

      // Fetch profiles for all user_ids
      if (pointagesData && pointagesData.length > 0) {
        const userIds = [...new Set(pointagesData.map(p => p.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles
        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        // Merge pointages with profiles
        const pointagesWithProfiles = pointagesData.map(p => ({
          ...p,
          profile: profilesMap.get(p.user_id),
        }));

        setPointages(pointagesWithProfiles);
      } else {
        setPointages([]);
      }
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

  async function updatePointage(id: string, updates: Partial<Pointage>) {
    try {
      const { error } = await supabase
        .from('pointage')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Modification enregistrée',
        description: 'Le pointage a été mis à jour',
      });

      fetchPointages();
    } catch (error) {
      console.error('Error updating pointage:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le pointage',
        variant: 'destructive',
      });
    }
  }

  function calculateStats(): PointageStats {
    const completedPointages = pointages.filter(p => p.hours_worked !== null);
    
    const totalHours = completedPointages.reduce((sum, p) => sum + (p.hours_worked || 0), 0);
    const billableHours = completedPointages
      .filter(p => p.is_billable)
      .reduce((sum, p) => sum + (p.hours_worked || 0), 0);
    
    const uniqueEmployees = new Set(pointages.map(p => p.user_id));

    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalRecords: pointages.length,
      employeeCount: uniqueEmployees.size,
    };
  }

  function exportToCSV() {
    const headers = ['Employé', 'Email', 'Date', 'Arrivée', 'Départ', 'Heures', 'Facturable', 'Notes'];
    const rows = pointages.map(p => [
      p.profile?.full_name || 'N/A',
      p.profile?.email || 'N/A',
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

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pointages_admin_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé',
    });
  }

  return {
    pointages,
    employees,
    loading,
    filters,
    setFilters,
    updatePointage,
    calculateStats,
    exportToCSV,
  };
}

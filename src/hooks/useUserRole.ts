import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/gh2';

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();

    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles',
          filter: `user_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`,
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchUserRoles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRoles([]);
        setPrimaryRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = data?.map(r => r.role as AppRole) || [];
      setRoles(userRoles);
      
      // Priorité: admin_gh2 > gerant > technicien > rh > client > invite
      const priority: AppRole[] = ['admin_gh2', 'gerant', 'technicien', 'rh', 'client', 'invite'];
      const primary = priority.find(role => userRoles.includes(role)) || userRoles[0] || null;
      setPrimaryRole(primary);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  }

  const hasRole = (role: AppRole) => roles.includes(role);
  
  const hasAnyRole = (...checkRoles: AppRole[]) => 
    checkRoles.some(role => roles.includes(role));

  return {
    roles,
    primaryRole,
    loading,
    hasRole,
    hasAnyRole,
  };
}

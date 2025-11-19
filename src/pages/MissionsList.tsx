import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useMissions } from '@/hooks/useMissions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MissionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const { missions, loading, acceptMission, rejectMission } = useMissions(technicianId || undefined);

  useEffect(() => {
    if (user && hasRole('technicien')) {
      fetchTechnicianId();
    }
  }, [user, hasRole]);

  const fetchTechnicianId = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('technicians')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setTechnicianId(data.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'En attente' },
      accepted: { variant: 'default', label: 'Acceptée' },
      in_progress: { variant: 'default', label: 'En cours' },
      completed: { variant: 'outline', label: 'Terminée' },
      cancelled: { variant: 'destructive', label: 'Annulée' },
    };

    const { variant, label } = variants[status] || variants.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleAccept = async (missionId: string) => {
    if (technicianId) {
      await acceptMission(missionId, technicianId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Missions Disponibles</h1>
            <p className="text-muted-foreground">Gérez vos interventions techniques</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Retour
          </Button>
        </div>

        {missions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-lg">Aucune mission disponible</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {missions.map((mission) => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{mission.service_type}</CardTitle>
                      <CardDescription>{mission.description || 'Pas de description'}</CardDescription>
                    </div>
                    {getStatusBadge(mission.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mission.client_address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{mission.client_address}</span>
                    </div>
                  )}

                  {mission.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(mission.scheduled_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}

                  {mission.estimated_duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{mission.estimated_duration} minutes</span>
                    </div>
                  )}

                  {mission.estimated_cost && (
                    <div className="text-lg font-semibold text-primary">
                      {mission.estimated_cost}€
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {mission.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAccept(mission.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => rejectMission(mission.id)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {(mission.status === 'accepted' || mission.status === 'in_progress') && (
                      <Button
                        onClick={() => navigate(`/missions/${mission.id}`)}
                        className="w-full"
                        size="sm"
                      >
                        Voir les détails
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

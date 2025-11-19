import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMissions } from '@/hooks/useMissions';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { Mission } from '@/types/gh2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MapPin, Navigation, Play, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import MissionReport from '@/components/missions/MissionReport';

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startMission } = useMissions();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const { position, tracking, startTracking, stopTracking } = useGPSTracking(user?.id, id);

  useEffect(() => {
    if (id) {
      fetchMission();
    }
  }, [id]);

  const fetchMission = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMission(data);
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast.error('Erreur lors du chargement de la mission');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = async () => {
    if (!id) return;
    await startMission(id);
    startTracking();
    await fetchMission();
  };

  const handleCompleteClick = () => {
    stopTracking();
    setShowReport(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-96 max-w-4xl mx-auto" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Mission introuvable</p>
            <Button onClick={() => navigate('/missions')} className="mt-4">
              Retour aux missions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showReport) {
    return <MissionReport mission={mission} onBack={() => setShowReport(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Détail Mission</h1>
          <Button variant="outline" onClick={() => navigate('/missions')}>
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{mission.service_type}</CardTitle>
                <p className="text-muted-foreground mt-1">{mission.description}</p>
              </div>
              <Badge variant={mission.status === 'in_progress' ? 'default' : 'secondary'}>
                {mission.status === 'accepted' && 'Acceptée'}
                {mission.status === 'in_progress' && 'En cours'}
                {mission.status === 'pending' && 'En attente'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {mission.client_address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-muted-foreground">{mission.client_address}</p>
                </div>
              </div>
            )}

            {mission.scheduled_date && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date prévue</p>
                  <p className="text-muted-foreground">
                    {new Date(mission.scheduled_date).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {mission.estimated_duration && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Durée estimée</p>
                  <p className="text-muted-foreground">{mission.estimated_duration} minutes</p>
                </div>
              </div>
            )}

            {mission.estimated_cost && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Coût estimé</p>
                  <p className="text-muted-foreground text-lg font-semibold text-primary">
                    {mission.estimated_cost}€
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {tracking && position && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="h-5 w-5 text-primary animate-pulse" />
                  <p className="font-medium">Tracking GPS actif</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Position: {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dernière mise à jour: {new Date(position.timestamp).toLocaleTimeString('fr-FR')}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {mission.status === 'accepted' && (
                <Button onClick={handleStartMission} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer la mission
                </Button>
              )}

              {mission.status === 'in_progress' && (
                <Button onClick={handleCompleteClick} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer la mission
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

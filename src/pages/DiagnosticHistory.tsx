import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Diagnostic } from '@/types/gh2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const severityLabels = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  critical: 'Critique',
};

const severityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function DiagnosticHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDiagnostics();
    }
  }, [user]);

  const loadDiagnostics = async () => {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiagnostics(data || []);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gh2-blue" />
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Historique des diagnostics</h1>
            <p className="text-muted-foreground mt-2">Consultez vos analyses précédentes</p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/diagnostic')}
            className="bg-gh2-blue hover:bg-gh2-blue/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau diagnostic
          </Button>
        </div>

        {diagnostics.length === 0 ? (
          <Card className="shadow-premium">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <FileText className="w-16 h-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Aucun diagnostic</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore effectué de diagnostic
                </p>
              </div>
              <Button
                onClick={() => navigate('/dashboard/diagnostic')}
                className="bg-gh2-blue hover:bg-gh2-blue/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un diagnostic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {diagnostics.map((diagnostic) => (
              <Card
                key={diagnostic.id}
                className="shadow-premium hover:shadow-glow transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/diagnostic-result/${diagnostic.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-gh2-blue" />
                        Diagnostic du{' '}
                        {format(new Date(diagnostic.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(diagnostic.created_at), 'HH:mm', { locale: fr })}
                      </CardDescription>
                    </div>
                    {diagnostic.severity && (
                      <Badge className={`${severityColors[diagnostic.severity]} text-white`}>
                        {severityLabels[diagnostic.severity]}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {diagnostic.ai_diagnosis || 'Analyse en cours...'}
                  </div>
                  
                  {diagnostic.estimated_cost_min && diagnostic.estimated_cost_max && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Estimation :</span>
                      <span className="font-semibold text-gh2-blue">
                        {diagnostic.estimated_cost_min}€ - {diagnostic.estimated_cost_max}€
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/diagnostic-result/${diagnostic.id}`);
                      }}
                    >
                      Voir le détail
                    </Button>
                    {diagnostic.pdf_report_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(diagnostic.pdf_report_url!, '_blank');
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        PDF
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

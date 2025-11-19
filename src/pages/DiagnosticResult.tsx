import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Info, ArrowRight, Download, MapPin } from 'lucide-react';
import { Diagnostic } from '@/types/gh2';

const severityConfig = {
  low: {
    label: 'Faible',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  medium: {
    label: 'Moyen',
    color: 'bg-yellow-500',
    icon: Info,
  },
  high: {
    label: 'Élevé',
    color: 'bg-orange-500',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critique',
    color: 'bg-red-500',
    icon: AlertTriangle,
  },
};

export default function DiagnosticResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDiagnostic(id);
    }
  }, [id]);

  const loadDiagnostic = async (diagnosticId: string) => {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', diagnosticId)
        .single();

      if (error) throw error;
      setDiagnostic(data);
    } catch (error) {
      console.error('Error loading diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMission = () => {
    // TODO: Implement mission creation
    navigate('/dashboard/missions/new', { state: { diagnosticId: id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gh2-blue" />
          <p className="text-muted-foreground">Chargement du diagnostic...</p>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background flex items-center justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic introuvable</CardTitle>
            <CardDescription>Ce diagnostic n'existe pas ou a été supprimé</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severity = diagnostic.severity || 'medium';
  const SeverityIcon = severityConfig[severity].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Résultat du Diagnostic</h1>
          <p className="text-muted-foreground">Analyse IA de votre véhicule</p>
        </div>

        {/* Gravité */}
        <Card className="shadow-premium border-l-4" style={{ borderLeftColor: `hsl(var(--${severityConfig[severity].color}))` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <SeverityIcon className="w-6 h-6" />
              Niveau de gravité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${severityConfig[severity].color} text-white text-lg px-4 py-2`}>
              {severityConfig[severity].label}
            </Badge>
          </CardContent>
        </Card>

        {/* Diagnostic IA */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Diagnostic IA</CardTitle>
            <CardDescription>Analyse automatique basée sur vos symptômes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {diagnostic.ai_diagnosis || 'Analyse en cours...'}
            </p>
            
            {diagnostic.recommendations && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-foreground">Recommandations :</h4>
                <p className="text-sm text-muted-foreground">{diagnostic.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estimation coût */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Estimation du coût</CardTitle>
            <CardDescription>Fourchette indicative de réparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 text-3xl font-bold text-gh2-blue">
              {diagnostic.estimated_cost_min && diagnostic.estimated_cost_max ? (
                <>
                  <span>{diagnostic.estimated_cost_min}€</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{diagnostic.estimated_cost_max}€</span>
                </>
              ) : (
                <span className="text-muted-foreground">À déterminer</span>
              )}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Prix TTC indicatif incluant main d'œuvre et pièces
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-premium bg-gradient-premium">
          <CardHeader>
            <CardTitle className="text-foreground">Prochaines étapes</CardTitle>
            <CardDescription>Réservez une intervention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={createMission}
                className="w-full bg-gh2-blue hover:bg-gh2-blue/90 h-auto py-6 flex-col gap-2"
              >
                <MapPin className="w-6 h-6" />
                <span className="text-base">Intervention mobile</span>
                <span className="text-xs opacity-80">Technicien à domicile</span>
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard/agencies')}
                variant="outline"
                className="w-full h-auto py-6 flex-col gap-2"
              >
                <ArrowRight className="w-6 h-6" />
                <span className="text-base">Atelier GH₂</span>
                <span className="text-xs opacity-80">Rendez-vous en agence</span>
              </Button>
            </div>

            {diagnostic.pdf_report_url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(diagnostic.pdf_report_url!, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le rapport PDF
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}

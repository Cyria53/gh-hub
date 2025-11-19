import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GH2Logo } from '@/components/GH2Logo';
import { RoleBadge } from '@/components/RoleBadge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  FileText, 
  History, 
  Briefcase,
  Car, 
  Wrench, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  LogOut,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { primaryRole, hasAnyRole, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
      navigate('/');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen carbon-fiber">
        <header className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <GH2Logo />
            <div className="flex items-center gap-4">
              {!roleLoading && primaryRole && (
                <RoleBadge role={primaryRole} />
              )}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">
                Bienvenue sur GH₂
              </h1>
              <p className="text-muted-foreground text-lg">
                Votre plateforme automobile hydrogène tout-en-un
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/diagnostic')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Diagnostic IA
                  </CardTitle>
                  <CardDescription>
                    Analysez votre véhicule avec notre IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload une photo de votre voyant moteur pour un diagnostic instantané
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/diagnostic-history')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historique Diagnostics
                  </CardTitle>
                  <CardDescription>
                    Consultez vos analyses passées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Accédez à tous vos diagnostics et rapports
                  </p>
                </CardContent>
              </Card>

              {hasAnyRole('technicien', 'gerant', 'admin_gh2') && (
                <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/missions')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Missions Techniciens
                    </CardTitle>
                    <CardDescription>
                      Gérez vos interventions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acceptez et gérez vos missions en temps réel
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-premium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Mes Véhicules
                  </CardTitle>
                  <CardDescription>
                    Gérez votre parc automobile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez et gérez vos véhicules
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-premium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Services
                  </CardTitle>
                  <CardDescription>
                    Réservez un service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Entretien, réparation, dépannage
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/marketplace')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Marketplace
                  </CardTitle>
                  <CardDescription>
                    Boutique en ligne
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Pièces, accessoires, kits HHO
                  </p>
                </CardContent>
              </Card>

              {hasAnyRole('technicien', 'gerant', 'rh', 'admin_gh2') && (
                <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/pointage')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Pointage RH
                    </CardTitle>
                    <CardDescription>
                      Gestion du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Pointez vos heures de travail
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-premium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Nos Agences
                  </CardTitle>
                  <CardDescription>
                    Trouvez une agence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Localisez l'agence la plus proche
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-premium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Fidélité
                  </CardTitle>
                  <CardDescription>
                    Programme de récompenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gagnez des points à chaque achat
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

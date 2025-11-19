import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GH2Logo } from '@/components/GH2Logo';
import { RoleBadge } from '@/components/RoleBadge';
import { 
  Car, 
  Wrench, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  LogOut,
  FileText,
  Star,
  History
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { primaryRole, loading: roleLoading } = useUserRole();
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
        {/* Header */}
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">
                Bienvenue sur GH₂
              </h1>
              <p className="text-muted-foreground text-lg">
                Votre plateforme automobile hydrogène tout-en-un
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Diagnostic */}
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

              {/* Historique Diagnostics */}
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

              {/* Véhicules */}
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/vehicles')}>
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
                    Ajoutez et suivez vos véhicules
                  </p>
                </CardContent>
              </Card>

              {/* Missions */}
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/missions')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Mes Interventions
                  </CardTitle>
                  <CardDescription>
                    Suivez vos réparations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Historique et interventions en cours
                  </p>
                </CardContent>
              </Card>

              {/* Marketplace */}
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/marketplace')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Marketplace
                  </CardTitle>
                  <CardDescription>
                    Achetez véhicules et accessoires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kits HHO, accessoires et véhicules d'occasion
                  </p>
                </CardContent>
              </Card>

              {/* Fidélité */}
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/loyalty')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Programme Fidélité
                  </CardTitle>
                  <CardDescription>
                    Vos points et récompenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gagnez des points à chaque intervention
                  </p>
                </CardContent>
              </Card>

              {/* Historique */}
              <Card className="hover:shadow-premium transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/history')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Historique
                  </CardTitle>
                  <CardDescription>
                    Toutes vos activités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Diagnostics, interventions et achats
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

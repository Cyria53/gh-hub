import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GH2Logo } from '@/components/GH2Logo';
import { Car, Zap, Shield, Sparkles } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen carbon-fiber">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-premium opacity-50" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="animate-glow">
              <GH2Logo className="h-20 mx-auto mb-6" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              L'avenir de l'automobile
              <span className="block text-primary">hydrogène</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Diagnostic IA, interventions mobiles, marketplace premium
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg"
                onClick={() => navigate('/auth/signup')}
              >
                Commencer gratuitement
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg"
                onClick={() => navigate('/guest/diagnostic')}
              >
                Diagnostic gratuit
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg hover:bg-card transition-colors">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Diagnostic IA</h3>
              <p className="text-muted-foreground">
                Analysez vos problèmes avec notre intelligence artificielle avancée
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg hover:bg-card transition-colors">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Interventions Mobiles</h3>
              <p className="text-muted-foreground">
                Techniciens certifiés qui viennent chez vous
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg hover:bg-card transition-colors">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Kits HHO</h3>
              <p className="text-muted-foreground">
                Solutions hydrogène pour optimiser votre véhicule
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg hover:bg-card transition-colors">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Garantie Premium</h3>
              <p className="text-muted-foreground">
                Service après-vente et satisfaction garantie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-gradient-premium border border-primary/20">
            <h2 className="text-4xl font-bold">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez des milliers d'utilisateurs qui font confiance à GH₂
            </p>
            <Button 
              size="lg" 
              className="text-lg"
              onClick={() => navigate('/auth/signup')}
            >
              Créer mon compte gratuitement
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

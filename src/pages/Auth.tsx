import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GH2Logo } from '@/components/GH2Logo';

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center carbon-fiber">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-2xl shadow-premium">
        <div className="text-center space-y-2">
          <GH2Logo className="h-16 mx-auto" />
          <h1 className="text-3xl font-bold">Bienvenue sur GH₂</h1>
          <p className="text-muted-foreground">
            Votre assistant automobile hydrogène intelligent
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth/signin')}
            className="w-full"
            size="lg"
          >
            Se connecter
          </Button>

          <Button
            onClick={() => navigate('/auth/signup')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Créer un compte
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou continuer en tant qu'invité
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/guest/diagnostic')}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Mode invité
          </Button>
        </div>
      </div>
    </div>
  );
}

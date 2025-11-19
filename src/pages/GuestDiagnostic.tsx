import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GH2Logo } from '@/components/GH2Logo';
import { Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function GuestDiagnostic() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !photo) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // TODO: Implement AI diagnostic upload
    toast.success('Diagnostic en cours d\'analyse...');
    toast.info('Fonctionnalité IA à implémenter avec l\'API externe');
  };

  return (
    <div className="min-h-screen carbon-fiber">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <GH2Logo />
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Diagnostic Gratuit</h1>
            <p className="text-muted-foreground">
              Obtenez un diagnostic IA instantané de votre véhicule
            </p>
          </div>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Mode Invité</CardTitle>
              <CardDescription>
                Pas besoin de compte pour un diagnostic rapide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Pour recevoir les résultats du diagnostic
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo du voyant moteur</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      {photo ? (
                        <p className="text-sm text-primary">{photo.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour uploader une photo
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Lancer le diagnostic
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez un compte ?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => navigate('/auth/signin')}
              >
                Se connecter
              </Button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Scan, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CarteGriseScan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    setScanning(true);

    try {
      // TODO: Appeler l'edge function OCR pour extraire les données
      // Pour l'instant, simulons un délai
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Fonctionnalité en développement',
        description: 'Le scan OCR de carte grise sera disponible prochainement',
      });

      // Après le scan réussi, rediriger vers le formulaire avec les données
      // navigate('/vehicles/add', { state: { extractedData: data } });
    } catch (error) {
      console.error('Error scanning:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de scanner la carte grise',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/vehicles/add')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scanner une carte grise</h1>
          <p className="text-muted-foreground">
            Importez une photo de votre carte grise pour extraire les informations automatiquement
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            OCR Carte Grise
          </CardTitle>
          <CardDescription>
            Prenez une photo claire de votre carte grise (recto)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="carte-grise">Photo de la carte grise</Label>
            <Input
              id="carte-grise"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={scanning}
            />
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, WEBP. Taille max: 10MB
            </p>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Aperçu carte grise"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Conseils pour une meilleure extraction
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Assurez-vous que la carte grise est bien éclairée</li>
              <li>Évitez les reflets et les ombres</li>
              <li>Cadrez la carte grise en entier dans le photo</li>
              <li>Utilisez une surface plane</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vehicles/add')}
              className="flex-1"
              disabled={scanning}
            >
              Saisir manuellement
            </Button>
            <Button
              onClick={handleScan}
              className="flex-1"
              disabled={!selectedFile || scanning}
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scan en cours...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Scanner
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

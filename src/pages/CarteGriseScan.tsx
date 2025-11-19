import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Scan, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function CarteGriseScan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10MB)');
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setExtractedData(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
    setError('');

    try {
      // Convertir l'image en base64
      const imageData = await convertToBase64(selectedFile);

      // Appeler l'edge function OCR
      const { data, error: functionError } = await supabase.functions.invoke('carte-grise-ocr', {
        body: { imageData }
      });

      if (functionError) throw functionError;

      if (!data.success) {
        throw new Error(data.error || 'Échec de l\'extraction');
      }

      setExtractedData(data.data);

      toast({
        title: 'Extraction réussie',
        description: 'Les données ont été extraites. Vérifiez-les avant de continuer.',
      });

    } catch (error: any) {
      console.error('Error scanning:', error);
      
      let errorMessage = 'Impossible de scanner la carte grise';
      
      if (error.message?.includes('429')) {
        errorMessage = 'Trop de requêtes. Veuillez réessayer dans quelques instants.';
      } else if (error.message?.includes('402')) {
        errorMessage = 'Crédits AI insuffisants. Veuillez contacter le support.';
      } else if (error.message?.includes('No relevant data')) {
        errorMessage = 'Aucune donnée exploitable trouvée. Assurez-vous que l\'image est claire et bien cadrée.';
      }

      setError(errorMessage);
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleContinue = () => {
    if (extractedData) {
      navigate('/vehicles/add', { state: { extractedData } });
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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {extractedData && (
            <div className="space-y-2">
              <Label>Données extraites</Label>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
                {extractedData.license_plate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Immatriculation:</span>
                    <span className="font-medium">{extractedData.license_plate}</span>
                  </div>
                )}
                {extractedData.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marque:</span>
                    <span className="font-medium">{extractedData.brand}</span>
                  </div>
                )}
                {extractedData.model && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle:</span>
                    <span className="font-medium">{extractedData.model}</span>
                  </div>
                )}
                {extractedData.vin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VIN:</span>
                    <span className="font-medium font-mono text-xs">{extractedData.vin}</span>
                  </div>
                )}
                {extractedData.fuel_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carburant:</span>
                    <span className="font-medium capitalize">{extractedData.fuel_type}</span>
                  </div>
                )}
                {extractedData.year && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Année:</span>
                    <span className="font-medium">{extractedData.year}</span>
                  </div>
                )}
                {extractedData.color && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Couleur:</span>
                    <span className="font-medium">{extractedData.color}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Vérifiez les données avant de continuer
              </p>
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
            
            {!extractedData ? (
              <Button
                onClick={handleScan}
                className="flex-1"
                disabled={!selectedFile || scanning}
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extraction en cours...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Extraire les données
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleContinue}
                className="flex-1"
              >
                Continuer avec ces données
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

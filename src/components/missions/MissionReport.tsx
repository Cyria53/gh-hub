import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Mission } from '@/types/gh2';
import { useMissions } from '@/hooks/useMissions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Trash2, CheckCircle } from 'lucide-react';

interface MissionReportProps {
  mission: Mission;
  onBack: () => void;
}

export default function MissionReport({ mission, onBack }: MissionReportProps) {
  const navigate = useNavigate();
  const { completeMission } = useMissions();
  const signatureRef = useRef<SignatureCanvas>(null);
  
  const [report, setReport] = useState('');
  const [finalCost, setFinalCost] = useState<string>(mission.estimated_cost?.toString() || '');
  const [actualDuration, setActualDuration] = useState<string>(mission.estimated_duration?.toString() || '');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${mission.id}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('mission-photos')
        .upload(fileName, photo);

      if (error) {
        console.error('Error uploading photo:', error);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(fileName);

      urls.push(publicUrlData.publicUrl);
    }

    return urls;
  };

  const uploadSignature = async (): Promise<string> => {
    if (!signatureRef.current) return '';

    const signatureData = signatureRef.current.toDataURL();
    const blob = await (await fetch(signatureData)).blob();
    const fileName = `${mission.id}/signature-${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from('mission-signatures')
      .upload(fileName, blob);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('mission-signatures')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!report.trim()) {
      toast.error('Veuillez rédiger un rapport');
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      toast.error('La signature du client est requise');
      return;
    }

    setUploading(true);

    try {
      const [photosUrls, signatureUrl] = await Promise.all([
        uploadPhotos(),
        uploadSignature(),
      ]);

      await completeMission(
        mission.id,
        report,
        signatureUrl,
        photosUrls,
        finalCost ? parseFloat(finalCost) : undefined,
        actualDuration ? parseInt(actualDuration) : undefined
      );

      toast.success('Mission terminée avec succès');
      navigate('/missions');
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error('Erreur lors de la finalisation');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Rapport d'Intervention</h1>
          <Button variant="outline" onClick={onBack} disabled={uploading}>
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mission: {mission.service_type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report">Rapport d'intervention *</Label>
              <Textarea
                id="report"
                placeholder="Décrivez les travaux effectués, les pièces remplacées, les observations..."
                value={report}
                onChange={(e) => setReport(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="finalCost">Coût final (€)</Label>
                <Input
                  id="finalCost"
                  type="number"
                  step="0.01"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualDuration">Durée réelle (minutes)</Label>
                <Input
                  id="actualDuration"
                  type="number"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photos de l'intervention</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter des photos
                    </p>
                  </div>
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Signature du client *</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-48 bg-white',
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer la signature
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                'Finalisation en cours...'
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finaliser la mission
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Video, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DiagnosticForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [symptomPhoto, setSymptomPhoto] = useState<File | null>(null);
  const [symptomVideo, setSymptomVideo] = useState<File | null>(null);
  const [carteGrisePhoto, setCarteGrisePhoto] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSymptomPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSymptomVideo(e.target.files[0]);
    }
  };

  const handleCarteGriseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCarteGrisePhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptomPhoto) {
      toast({
        title: "Photo requise",
        description: "Veuillez ajouter au moins une photo du voyant moteur",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload files to Supabase Storage
      // TODO: Call OCR API for carte grise
      // TODO: Call AI diagnostic API
      
      // For now, create a basic diagnostic entry
      const { data: diagnostic, error: diagnosticError } = await supabase
        .from('diagnostics')
        .insert({
          user_id: user?.id,
          is_guest: !user,
          ai_diagnosis: 'Analyse en cours...',
          severity: 'medium',
          estimated_cost_min: 150,
          estimated_cost_max: 350,
        })
        .select()
        .single();

      if (diagnosticError) throw diagnosticError;

      toast({
        title: "Diagnostic créé",
        description: "Votre diagnostic a été envoyé pour analyse",
      });

      navigate(`/dashboard/diagnostic-result/${diagnostic.id}`);
    } catch (error) {
      console.error('Error creating diagnostic:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le diagnostic",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gh2-carbon to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Diagnostic IA</h1>
          <p className="text-muted-foreground">Analysez votre véhicule en quelques clics</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-gh2-blue" />
                Symptômes du véhicule
              </CardTitle>
              <CardDescription>
                Prenez une photo du voyant moteur et décrivez le problème
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo voyant moteur */}
              <div className="space-y-2">
                <Label htmlFor="symptom-photo" className="text-base font-semibold">
                  Photo du voyant moteur *
                </Label>
                <div className="border-2 border-dashed border-gh2-blue/30 rounded-lg p-8 text-center hover:border-gh2-blue/60 transition-colors">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={photoPreview} 
                        alt="Aperçu" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSymptomPhoto(null);
                          setPhotoPreview(null);
                        }}
                      >
                        Changer la photo
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="symptom-photo" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gh2-blue" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Cliquez pour ajouter une photo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG jusqu'à 10MB
                      </p>
                      <input
                        id="symptom-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Vidéo optionnelle */}
              <div className="space-y-2">
                <Label htmlFor="symptom-video" className="text-base font-semibold">
                  Vidéo du moteur (optionnel)
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-gh2-blue/60 transition-colors">
                  <label htmlFor="symptom-video" className="cursor-pointer">
                    <Video className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    {symptomVideo ? (
                      <p className="text-sm text-foreground">{symptomVideo.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">
                          Ajoutez une vidéo du moteur en marche
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MP4, MOV jusqu'à 50MB
                        </p>
                      </>
                    )}
                    <input
                      id="symptom-video"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description du problème
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez les symptômes : bruits, comportement du véhicule, depuis quand..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-gh2-blue" />
                Carte grise (optionnel)
              </CardTitle>
              <CardDescription>
                Pour une analyse plus précise, ajoutez votre carte grise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-gh2-blue/60 transition-colors">
                <label htmlFor="carte-grise" className="cursor-pointer">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  {carteGrisePhoto ? (
                    <p className="text-sm text-foreground">{carteGrisePhoto.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">
                        Cliquez pour scanner votre carte grise
                      </p>
                      <p className="text-xs text-muted-foreground">
                        OCR automatique pour extraction des données
                      </p>
                    </>
                  )}
                  <input
                    id="carte-grise"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCarteGriseChange}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gh2-blue hover:bg-gh2-blue/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                'Lancer le diagnostic'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

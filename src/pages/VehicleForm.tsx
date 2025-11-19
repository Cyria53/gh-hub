import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Car, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, addVehicle, updateVehicle } = useVehicles();
  const { toast } = useToast();

  const isEditMode = Boolean(id);
  const existingVehicle = vehicles.find(v => v.id === id);

  const [formData, setFormData] = useState({
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    fuel_type: '',
    color: '',
    mileage: 0,
    first_registration_date: '',
  });

  useEffect(() => {
    if (isEditMode && existingVehicle) {
      setFormData({
        license_plate: existingVehicle.license_plate || '',
        brand: existingVehicle.brand || '',
        model: existingVehicle.model || '',
        year: existingVehicle.year || new Date().getFullYear(),
        vin: existingVehicle.vin || '',
        fuel_type: existingVehicle.fuel_type || '',
        color: existingVehicle.color || '',
        mileage: existingVehicle.mileage || 0,
        first_registration_date: existingVehicle.first_registration_date || '',
      });
    }
  }, [isEditMode, existingVehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.model) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir au moins la marque et le modèle',
        variant: 'destructive',
      });
      return;
    }

    const result = isEditMode
      ? await updateVehicle(id!, formData)
      : await addVehicle(formData);

    if (result.success) {
      navigate('/vehicles');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Modifiez les informations' : 'Enregistrez un nouveau véhicule'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Informations du véhicule
          </CardTitle>
          <CardDescription>
            Renseignez les détails de votre véhicule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vehicles/scan')}
              >
                <Scan className="mr-2 h-4 w-4" />
                Scanner carte grise
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Renault, Peugeot..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modèle *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Clio, 308..."
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">Immatriculation</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                  placeholder="AB-123-CD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">Numéro VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="VF1XXXXXXXXXXXXXX"
                  maxLength={17}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_registration_date">Date 1ère immatriculation</Label>
                <Input
                  id="first_registration_date"
                  type="date"
                  value={formData.first_registration_date}
                  onChange={(e) => setFormData({ ...formData, first_registration_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Carburant</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger id="fuel_type">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essence">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="hydrogene">Hydrogène</SelectItem>
                    <SelectItem value="gpl">GPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Noir, Blanc, Gris..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Kilométrage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                min={0}
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {isEditMode ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

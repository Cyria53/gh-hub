import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, Edit, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VehiclesList() {
  const navigate = useNavigate();
  const { vehicles, loading, deleteVehicle } = useVehicles();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Véhicules</h1>
            <p className="text-muted-foreground">Gérez votre parc automobile</p>
          </div>
        </div>
        <Button onClick={() => navigate('/vehicles/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un véhicule
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Commencez par ajouter votre premier véhicule pour suivre son entretien et son historique
            </p>
            <Button onClick={() => navigate('/vehicles/add')}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter mon premier véhicule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {vehicle.license_plate && (
                        <Badge variant="outline" className="mt-1">
                          {vehicle.license_plate}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                <div className="space-y-2 text-sm">
                  {vehicle.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Année</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kilométrage</span>
                      <span className="font-medium">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                    </div>
                  )}
                  {vehicle.fuel_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carburant</span>
                      <span className="font-medium capitalize">{vehicle.fuel_type}</span>
                    </div>
                  )}
                  {vehicle.first_registration_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        1ère immat.
                      </span>
                      <span className="font-medium">
                        {new Date(vehicle.first_registration_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le véhicule</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action supprimera également tout l'historique de maintenance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteVehicle(vehicle.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

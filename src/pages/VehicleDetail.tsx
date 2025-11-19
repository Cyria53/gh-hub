import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleMaintenance } from '@/hooks/useVehicleMaintenance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Car, Edit, Plus, Wrench, Calendar, Euro, AlertCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
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

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { maintenances, loading, addMaintenance, deleteMaintenance, totalCost, upcomingMaintenances } = useVehicleMaintenance(id);

  const vehicle = vehicles.find(v => v.id === id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: '',
    description: '',
    mileage: vehicle?.mileage || 0,
    cost: 0,
    performed_by: '',
    performed_at: new Date().toISOString().split('T')[0],
    next_maintenance_date: '',
    notes: '',
  });

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Véhicule non trouvé</p>
            <Button onClick={() => navigate('/vehicles')} className="mt-4">
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddMaintenance = async () => {
    if (!maintenanceForm.maintenance_type || !maintenanceForm.performed_at) {
      return;
    }

    const result = await addMaintenance(maintenanceForm);
    if (result.success) {
      setDialogOpen(false);
      setMaintenanceForm({
        maintenance_type: '',
        description: '',
        mileage: vehicle.mileage || 0,
        cost: 0,
        performed_by: '',
        performed_at: new Date().toISOString().split('T')[0],
        next_maintenance_date: '',
        notes: '',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex gap-2 mt-2">
              {vehicle.license_plate && (
                <Badge variant="outline">{vehicle.license_plate}</Badge>
              )}
              {vehicle.year && <Badge variant="secondary">{vehicle.year}</Badge>}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/vehicles/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Coût total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCost.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">{maintenances.length} intervention{maintenances.length > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Dernière maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenances[0] ? (
              <>
                <div className="text-2xl font-bold text-primary">
                  {formatDistanceToNow(new Date(maintenances[0].performed_at), { addSuffix: true, locale: fr })}
                </div>
                <p className="text-xs text-muted-foreground">{maintenances[0].maintenance_type}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune maintenance</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Prochaines maintenances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{upcomingMaintenances.length}</div>
            <p className="text-xs text-muted-foreground">intervention{upcomingMaintenances.length > 1 ? 's' : ''} prévue{upcomingMaintenances.length > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Informations du véhicule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {vehicle.vin && (
              <div>
                <span className="text-sm text-muted-foreground">Numéro VIN</span>
                <p className="font-medium">{vehicle.vin}</p>
              </div>
            )}
            {vehicle.fuel_type && (
              <div>
                <span className="text-sm text-muted-foreground">Carburant</span>
                <p className="font-medium capitalize">{vehicle.fuel_type}</p>
              </div>
            )}
            {vehicle.color && (
              <div>
                <span className="text-sm text-muted-foreground">Couleur</span>
                <p className="font-medium">{vehicle.color}</p>
              </div>
            )}
            {vehicle.mileage !== null && (
              <div>
                <span className="text-sm text-muted-foreground">Kilométrage</span>
                <p className="font-medium">{vehicle.mileage.toLocaleString('fr-FR')} km</p>
              </div>
            )}
            {vehicle.first_registration_date && (
              <div>
                <span className="text-sm text-muted-foreground">Date 1ère immatriculation</span>
                <p className="font-medium">
                  {new Date(vehicle.first_registration_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Historique de maintenance
              </CardTitle>
              <CardDescription>
                Toutes les interventions effectuées sur ce véhicule
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une intervention
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouvelle intervention</DialogTitle>
                  <DialogDescription>
                    Enregistrez une maintenance effectuée sur le véhicule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maintenance_type">Type d'intervention *</Label>
                      <Select
                        value={maintenanceForm.maintenance_type}
                        onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: value })}
                      >
                        <SelectTrigger id="maintenance_type">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vidange">Vidange</SelectItem>
                          <SelectItem value="Révision">Révision</SelectItem>
                          <SelectItem value="Pneus">Pneus</SelectItem>
                          <SelectItem value="Freins">Freins</SelectItem>
                          <SelectItem value="Batterie">Batterie</SelectItem>
                          <SelectItem value="Climatisation">Climatisation</SelectItem>
                          <SelectItem value="Contrôle technique">Contrôle technique</SelectItem>
                          <SelectItem value="Réparation">Réparation</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performed_at">Date *</Label>
                      <Input
                        id="performed_at"
                        type="date"
                        value={maintenanceForm.performed_at}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_at: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                      placeholder="Détails de l'intervention..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Kilométrage</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={maintenanceForm.mileage}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, mileage: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Coût (€)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={maintenanceForm.cost}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next_maintenance_date">Prochain entretien</Label>
                      <Input
                        id="next_maintenance_date"
                        type="date"
                        value={maintenanceForm.next_maintenance_date}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_maintenance_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="performed_by">Intervenant</Label>
                      <Input
                        id="performed_by"
                        value={maintenanceForm.performed_by}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_by: e.target.value })}
                        placeholder="Garage, technicien..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={maintenanceForm.notes}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                        placeholder="Remarques diverses..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddMaintenance}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Aucune maintenance enregistrée</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter la première intervention
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Kilométrage</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Prochain</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell>
                      {new Date(maintenance.performed_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{maintenance.maintenance_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {maintenance.description || '-'}
                    </TableCell>
                    <TableCell>
                      {maintenance.mileage ? `${maintenance.mileage.toLocaleString('fr-FR')} km` : '-'}
                    </TableCell>
                    <TableCell>
                      {maintenance.cost ? `${maintenance.cost.toFixed(2)}€` : '-'}
                    </TableCell>
                    <TableCell>
                      {maintenance.next_maintenance_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(maintenance.next_maintenance_date).toLocaleDateString('fr-FR')}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'intervention</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette intervention ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMaintenance(maintenance.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

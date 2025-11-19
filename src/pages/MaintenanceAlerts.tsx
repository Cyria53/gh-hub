import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenanceAlerts } from '@/hooks/useMaintenanceAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Gauge,
  Car,
  CheckCircle2,
  XCircle,
  Settings,
  RefreshCw,
  Mail,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MaintenanceAlerts() {
  const navigate = useNavigate();
  const {
    alerts,
    preferences,
    loading,
    dismissAlert,
    updatePreferences,
    triggerManualCheck,
  } = useMaintenanceAlerts();

  const [prefsDialogOpen, setPrefsDialogOpen] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(preferences?.email_enabled ?? true);
  const [mileageEnabled, setMileageEnabled] = useState(preferences?.mileage_enabled ?? true);
  const [mileageThreshold, setMileageThreshold] = useState(
    preferences?.mileage_threshold_km?.toString() ?? '1000'
  );
  const [checking, setChecking] = useState(false);

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const sentAlerts = alerts.filter(a => a.status === 'sent');
  const dismissedAlerts = alerts.filter(a => a.status === 'dismissed');

  const handleSavePreferences = async () => {
    await updatePreferences({
      email_enabled: emailEnabled,
      mileage_enabled: mileageEnabled,
      mileage_threshold_km: parseInt(mileageThreshold, 10),
    });
    setPrefsDialogOpen(false);
  };

  const handleManualCheck = async () => {
    setChecking(true);
    await triggerManualCheck();
    setChecking(false);
  };

  const getAlertIcon = (type: string) => {
    return type === 'date_based' ? <Calendar className="h-5 w-5" /> : <Gauge className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Envoyée</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Ignorée</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Alertes de Maintenance
            </h1>
            <p className="text-muted-foreground">
              Gérez vos rappels de maintenance automatiques
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleManualCheck}
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Vérifier maintenant
              </>
            )}
          </Button>
          <Dialog open={prefsDialogOpen} onOpenChange={setPrefsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Préférences
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Préférences de notification</DialogTitle>
                <DialogDescription>
                  Configurez comment vous souhaitez recevoir les alertes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-enabled">Alertes par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des emails pour les maintenances à venir
                    </p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mileage-enabled">Alertes kilométrage</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes basées sur le kilométrage du véhicule
                    </p>
                  </div>
                  <Switch
                    id="mileage-enabled"
                    checked={mileageEnabled}
                    onCheckedChange={setMileageEnabled}
                  />
                </div>

                {mileageEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="mileage-threshold">
                      Seuil d'alerte (km avant maintenance)
                    </Label>
                    <Input
                      id="mileage-threshold"
                      type="number"
                      min="100"
                      step="100"
                      value={mileageThreshold}
                      onChange={(e) => setMileageThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Vous serez alerté X km avant la maintenance prévue
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setPrefsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Chargement des alertes...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingAlerts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alertes à traiter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Envoyées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sentAlerts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Emails envoyés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ignorées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dismissedAlerts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alertes ignorées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des alertes */}
          <Card>
            <CardHeader>
              <CardTitle>Toutes les alertes</CardTitle>
              <CardDescription>
                Historique complet de vos alertes de maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucune alerte de maintenance pour le moment
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Les alertes apparaîtront automatiquement quand une maintenance approche
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getAlertIcon(alert.alert_type)}
                          </div>
                          <div>
                            <p className="font-medium">{alert.alert_reason}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Car className="h-4 w-4" />
                              <span>Véhicule ID: {alert.vehicle_id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(alert.status)}
                          {alert.email_sent && (
                            <Badge variant="outline" className="gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {alert.days_until_due !== null && (
                          <div>
                            <p className="text-muted-foreground">Échéance</p>
                            <p className="font-medium">Dans {alert.days_until_due} jours</p>
                          </div>
                        )}
                        {alert.km_until_due !== null && (
                          <div>
                            <p className="text-muted-foreground">Kilométrage</p>
                            <p className="font-medium">Dans {alert.km_until_due} km</p>
                          </div>
                        )}
                        {alert.sent_at && (
                          <div>
                            <p className="text-muted-foreground">Envoyée le</p>
                            <p className="font-medium">
                              {new Date(alert.sent_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        )}
                      </div>

                      {alert.status !== 'dismissed' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Ignorer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info automatisation */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Vérification automatique active
                  </h3>
                  <p className="text-sm text-blue-800">
                    Vos maintenances sont vérifiées quotidiennement. Les alertes par email sont
                    envoyées automatiquement selon vos préférences (par défaut : 30, 14 et 7 jours
                    avant l'échéance).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

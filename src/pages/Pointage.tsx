import { useState } from 'react';
import { usePointage } from '@/hooks/usePointage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Download, LogIn, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Pointage() {
  const { pointages, currentPointage, loading, checkIn, checkOut, exportToCSV } = usePointage();
  const [notes, setNotes] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  const handleCheckIn = () => {
    checkIn(isBillable, notes);
    setNotes('');
  };

  const handleCheckOut = () => {
    checkOut(notes);
    setNotes('');
  };

  const totalHours = pointages.reduce((sum, p) => sum + (p.hours_worked || 0), 0);
  const billableHours = pointages.filter(p => p.is_billable).reduce((sum, p) => sum + (p.hours_worked || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pointage RH</h1>
          <p className="text-muted-foreground">Gestion des heures de travail</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total heures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalHours.toFixed(2)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Heures facturables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{billableHours.toFixed(2)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Heures non facturables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{(totalHours - billableHours).toFixed(2)}h</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pointage en cours
          </CardTitle>
          {currentPointage && (
            <CardDescription>
              Commencé {formatDistanceToNow(new Date(currentPointage.check_in), { addSuffix: true, locale: fr })}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPointage ? (
            <>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Arrivée</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(currentPointage.check_in).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">En cours...</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-notes">Notes (optionnel)</Label>
                <Textarea
                  id="checkout-notes"
                  placeholder="Ajouter des notes sur votre journée..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleCheckOut} className="w-full" size="lg">
                <LogOut className="mr-2 h-4 w-4" />
                Pointer la sortie
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="billable">Heures facturables</Label>
                  <Switch
                    id="billable"
                    checked={isBillable}
                    onCheckedChange={setIsBillable}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkin-notes">Notes (optionnel)</Label>
                  <Textarea
                    id="checkin-notes"
                    placeholder="Projet, tâche, ou notes diverses..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCheckIn} className="w-full" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Pointer l'arrivée
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des pointages</CardTitle>
          <CardDescription>
            {pointages.length} enregistrement{pointages.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : pointages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun pointage enregistré</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointages.map((pointage) => (
                  <TableRow key={pointage.id}>
                    <TableCell className="font-medium">
                      {new Date(pointage.check_in).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Date(pointage.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      {pointage.check_out ? (
                        new Date(pointage.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-primary font-medium">En cours</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pointage.hours_worked ? `${pointage.hours_worked.toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      {pointage.is_billable ? (
                        <span className="text-primary font-medium">Facturable</span>
                      ) : (
                        <span className="text-muted-foreground">Non facturable</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {pointage.notes || '-'}
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

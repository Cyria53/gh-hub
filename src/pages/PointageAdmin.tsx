import { useState } from 'react';
import { usePointageAdmin } from '@/hooks/usePointageAdmin';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Users, Clock, DollarSign, ArrowLeft, CheckCircle2, XCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ValidationDialog } from '@/components/pointage/ValidationDialog';
import { HistoryDialog } from '@/components/pointage/HistoryDialog';

export default function PointageAdmin() {
  const navigate = useNavigate();
  const { hasAnyRole } = useUserRole();
  const { 
    pointages, 
    employees, 
    loading, 
    filters, 
    setFilters, 
    validatePointage,
    fetchHistory,
    calculateStats, 
    exportToCSV 
  } = usePointageAdmin();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    pointageId: string;
    employeeName: string;
  }>({ open: false, action: 'approve', pointageId: '', employeeName: '' });
  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    pointageId: string;
    employeeName: string;
  }>({ open: false, pointageId: '', employeeName: '' });

  // Redirect if not authorized
  if (!hasAnyRole('rh', 'gerant', 'admin_gh2')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setFilters({ ...filters, startDate: value ? new Date(value) : undefined });
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setFilters({ ...filters, endDate: value ? new Date(value) : undefined });
  };

  const handleEmployeeChange = (value: string) => {
    setFilters({ ...filters, userId: value === 'all' ? undefined : value });
  };

  const handleBillableChange = (value: string) => {
    setFilters({ 
      ...filters, 
      isBillable: value === 'all' ? undefined : value === 'billable' 
    });
  };

  const clearFilters = () => {
    setFilters({});
    setStartDate('');
    setEndDate('');
  };

  const handleValidation = (
    pointageId: string, 
    action: 'approve' | 'reject', 
    employeeName: string
  ) => {
    setValidationDialog({
      open: true,
      action,
      pointageId,
      employeeName,
    });
  };

  const handleValidationConfirm = (comment: string) => {
    validatePointage(
      validationDialog.pointageId, 
      validationDialog.action === 'approve' ? 'approved' : 'rejected',
      comment
    );
  };

  const handleShowHistory = (pointageId: string, employeeName: string) => {
    setHistoryDialog({
      open: true,
      pointageId,
      employeeName,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-primary">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pointage')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion RH - Pointages</h1>
            <p className="text-muted-foreground">Vue administrative de tous les employés</p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.employeeCount}</div>
            <p className="text-xs text-muted-foreground">{stats.totalRecords} pointages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total heures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalHours.toFixed(2)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Facturables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.billableHours.toFixed(2)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHours > 0 ? ((stats.billableHours / stats.totalHours) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Non facturables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.nonBillableHours.toFixed(2)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHours > 0 ? ((stats.nonBillableHours / stats.totalHours) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Moyenne/jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.employeeCount > 0 ? (stats.totalHours / stats.employeeCount).toFixed(1) : 0}h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <Select onValueChange={handleEmployeeChange} defaultValue="all">
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Tous les employés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les employés</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name || emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Date fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billable">Type</Label>
              <Select onValueChange={handleBillableChange} defaultValue="all">
                <SelectTrigger id="billable">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="billable">Facturable</SelectItem>
                  <SelectItem value="non-billable">Non facturable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" onClick={clearFilters} size="sm">
            Réinitialiser les filtres
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pointages ({pointages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : pointages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun pointage trouvé pour les filtres sélectionnés
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointages.map((pointage) => (
                  <TableRow key={pointage.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{pointage.profile?.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {pointage.profile?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(pointage.check_in).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Date(pointage.check_in).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      {pointage.check_out ? (
                        new Date(pointage.check_out).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      ) : (
                        <span className="text-primary font-medium">En cours</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pointage.hours_worked ? (
                        <span className="font-medium">{pointage.hours_worked.toFixed(2)}h</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {pointage.is_billable ? (
                        <span className="text-primary font-medium">Facturable</span>
                      ) : (
                        <span className="text-muted-foreground">Non facturable</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pointage.status)}
                      {pointage.validation_comment && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {pointage.validation_comment}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pointage.status === 'pending' && pointage.check_out && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidation(
                                pointage.id, 
                                'approve', 
                                pointage.profile?.full_name || pointage.profile?.email || 'Employé'
                              )}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidation(
                                pointage.id, 
                                'reject', 
                                pointage.profile?.full_name || pointage.profile?.email || 'Employé'
                              )}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowHistory(
                            pointage.id,
                            pointage.profile?.full_name || pointage.profile?.email || 'Employé'
                          )}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ValidationDialog
        open={validationDialog.open}
        onOpenChange={(open) => setValidationDialog({ ...validationDialog, open })}
        action={validationDialog.action}
        employeeName={validationDialog.employeeName}
        onConfirm={handleValidationConfirm}
      />

      <HistoryDialog
        open={historyDialog.open}
        onOpenChange={(open) => setHistoryDialog({ ...historyDialog, open })}
        pointageId={historyDialog.pointageId}
        employeeName={historyDialog.employeeName}
        fetchHistory={fetchHistory}
      />
    </div>
  );
}

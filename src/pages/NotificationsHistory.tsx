import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Smartphone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationHistory {
  id: string;
  user_id: string;
  alert_id: string;
  notification_type: 'email' | 'push';
  status: 'sent' | 'pending' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  maintenance_alerts: {
    alert_reason: string;
    alert_type: string;
    vehicle_id: string;
  } | null;
}

export default function NotificationsHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_history',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_history' as any)
        .select(`
          *,
          maintenance_alerts (
            alert_reason,
            alert_type,
            vehicle_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as any);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (typeFilter !== 'all' && notif.notification_type !== typeFilter) return false;
    if (statusFilter !== 'all' && notif.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Envoyée
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Échec
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? (
      <Mail className="h-4 w-4" />
    ) : (
      <Smartphone className="h-4 w-4" />
    );
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    pending: notifications.filter((n) => n.status === 'pending').length,
    failed: notifications.filter((n) => n.status === 'failed').length,
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/maintenance-alerts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Historique des Notifications
            </h1>
            <p className="text-muted-foreground">
              Consultez toutes les notifications envoyées
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Envoyées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">
              Échecs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Type de notification</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
          <CardDescription>
            Historique complet des notifications envoyées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune notification trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {notification.maintenance_alerts?.alert_reason || 'Alerte de maintenance'}
                          </h3>
                          {getStatusBadge(notification.status)}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          Type: {notification.notification_type === 'email' ? 'Email' : 'Notification Push'}
                        </p>
                        {notification.maintenance_alerts && (
                          <p className="text-sm text-muted-foreground">
                            Alerte: {notification.maintenance_alerts.alert_type === 'date_based' ? 'Basée sur la date' : 'Basée sur le kilométrage'}
                          </p>
                        )}
                        {notification.error_message && (
                          <p className="text-sm text-destructive mt-2">
                            Erreur: {notification.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      <div>
                        {notification.sent_at
                          ? format(new Date(notification.sent_at), 'dd MMM yyyy', { locale: fr })
                          : format(new Date(notification.created_at), 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div>
                        {notification.sent_at
                          ? format(new Date(notification.sent_at), 'HH:mm', { locale: fr })
                          : format(new Date(notification.created_at), 'HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

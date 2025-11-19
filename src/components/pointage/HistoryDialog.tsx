import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PointageHistory } from '@/types/gh2';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Edit, Plus, History as HistoryIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointageId: string;
  employeeName: string;
  fetchHistory: (pointageId: string) => Promise<PointageHistory[]>;
}

export function HistoryDialog({ 
  open, 
  onOpenChange, 
  pointageId,
  employeeName,
  fetchHistory 
}: HistoryDialogProps) {
  const [history, setHistory] = useState<PointageHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && pointageId) {
      loadHistory();
    }
  }, [open, pointageId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Fetch history
      const historyData = await fetchHistory(pointageId);
      
      // Fetch profiles for all changed_by users
      if (historyData.length > 0) {
        const userIds = [...new Set(historyData.map(h => h.changed_by))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        // Merge history with profiles
        const enrichedHistory = historyData.map(h => ({
          ...h,
          profile: profilesMap.get(h.changed_by),
        }));

        setHistory(enrichedHistory as any);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4" />;
      case 'validated':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'modified':
        return <Edit className="h-4 w-4" />;
      default:
        return <HistoryIcon className="h-4 w-4" />;
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'created':
        return 'Créé';
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'modified':
        return 'Modifié';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Historique du pointage
          </DialogTitle>
          <DialogDescription>
            Toutes les modifications de {employeeName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun historique</div>
          ) : (
            <div className="space-y-4">
              {history.map((entry: any) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(entry.change_type)}
                      <Badge variant="outline">
                        {getChangeLabel(entry.change_type)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">
                      {entry.profile?.full_name || entry.profile?.email || 'Utilisateur'}
                    </span>
                  </div>

                  {entry.comment && (
                    <div className="bg-muted p-2 rounded text-sm">
                      <span className="font-medium">Commentaire: </span>
                      {entry.comment}
                    </div>
                  )}

                  {entry.change_type === 'modified' && entry.old_values && entry.new_values && (
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>Modifications apportées</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

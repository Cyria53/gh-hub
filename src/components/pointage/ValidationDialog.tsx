import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'approve' | 'reject';
  employeeName: string;
  onConfirm: (comment: string) => void;
}

export function ValidationDialog({ 
  open, 
  onOpenChange, 
  action, 
  employeeName,
  onConfirm 
}: ValidationDialogProps) {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Valider le pointage
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Rejeter le pointage
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' 
              ? `Approuver le pointage de ${employeeName}`
              : `Rejeter le pointage de ${employeeName}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="comment">
            Commentaire {action === 'reject' && '(requis)'}
          </Label>
          <Textarea
            id="comment"
            placeholder={
              action === 'approve' 
                ? "Ajouter un commentaire (optionnel)..."
                : "Expliquez la raison du rejet..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={action === 'reject' && !comment.trim()}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {action === 'approve' ? 'Valider' : 'Rejeter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

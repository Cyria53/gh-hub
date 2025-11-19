import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Vider le panier après un paiement réussi
    localStorage.removeItem('gh2-cart');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Paiement Réussi !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            </p>
            {sessionId && (
              <p className="text-sm text-muted-foreground">
                Référence: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Un email de confirmation vous a été envoyé avec les détails de votre commande.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Button>
            <Button onClick={() => navigate('/marketplace')} variant="outline" className="w-full">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continuer mes achats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

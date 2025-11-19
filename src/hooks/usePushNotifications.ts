import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        await saveSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeUser();
        toast({
          title: 'Notifications activées',
          description: 'Vous recevrez des alertes pour vos maintenances',
        });
      } else {
        toast({
          title: 'Notifications refusées',
          description: 'Vous ne recevrez pas d\'alertes push',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer les notifications',
        variant: 'destructive',
      });
      return 'denied';
    }
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, you would need a VAPID public key
      // For now, we'll use a placeholder
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrp0IhHkBqxqK6aaLpxj6v4GJM3qIPOdY8M8F5kBwi7SfvU1cJk';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(subscription);
      await saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de s\'abonner aux notifications',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveSubscription = async (subscription: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscriptionData = JSON.stringify(subscription);

      // Save to notification_preferences
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          push_subscription: subscriptionData,
          push_enabled: true,
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('notification_preferences')
            .update({
              push_subscription: null,
              push_enabled: false,
            } as any)
            .eq('user_id', user.id);
        }

        toast({
          title: 'Notifications désactivées',
          description: 'Vous ne recevrez plus d\'alertes push',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de se désabonner',
        variant: 'destructive',
      });
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  };
};

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

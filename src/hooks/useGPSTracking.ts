import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GPSPosition {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function useGPSTracking(technicianId?: string, missionId?: string) {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!technicianId) return;

    const channel = supabase
      .channel(`gps-tracking-${technicianId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'technicians',
          filter: `id=eq.${technicianId}`,
        },
        (payload: any) => {
          if (payload.new.current_latitude && payload.new.current_longitude) {
            setPosition({
              latitude: payload.new.current_latitude,
              longitude: payload.new.current_longitude,
              timestamp: payload.new.last_location_update,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [technicianId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPosition: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        setPosition(newPosition);
        setTracking(true);
        setError(null);

        if (technicianId) {
          try {
            await supabase
              .from('technicians')
              .update({
                current_latitude: newPosition.latitude,
                current_longitude: newPosition.longitude,
                last_location_update: newPosition.timestamp,
                status: 'busy',
              })
              .eq('user_id', technicianId);
          } catch (err) {
            console.error('Error updating GPS position:', err);
          }
        }
      },
      (err) => {
        setError(`Erreur GPS: ${err.message}`);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const stopTracking = async () => {
    setTracking(false);
    
    if (technicianId) {
      try {
        await supabase
          .from('technicians')
          .update({
            status: 'available',
          })
          .eq('user_id', technicianId);
      } catch (err) {
        console.error('Error stopping tracking:', err);
      }
    }
  };

  return {
    position,
    tracking,
    error,
    startTracking,
    stopTracking,
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrp0IhHkBqxqK6aaLpxj6v4GJM3qIPOdY8M8F5kBwi7SfvU1cJk';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@gh2.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  license_plate: string;
  mileage: number;
}

interface Maintenance {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  next_maintenance_date: string | null;
  mileage: number | null;
}

interface Profile {
  email: string;
  full_name: string;
}

interface NotificationPreference {
  user_id: string;
  email_enabled: boolean;
  email_days_before: number[];
  mileage_enabled: boolean;
  mileage_threshold_km: number;
  push_enabled?: boolean;
  push_subscription?: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

async function sendPushNotification(
  subscription: PushSubscription,
  payload: any
): Promise<boolean> {
  try {
    if (!VAPID_PRIVATE_KEY) {
      console.warn('VAPID_PRIVATE_KEY not configured, skipping push notification');
      return false;
    }

    // Encoder le payload en JSON
    const payloadString = JSON.stringify(payload);
    
    // Créer les headers VAPID pour l'authentification
    const vapidHeaders = await createVapidAuthHeaders(
      subscription.endpoint,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
      VAPID_SUBJECT
    );

    // Envoyer la notification push
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        ...vapidHeaders,
      },
      body: payloadString,
    });

    if (!response.ok) {
      console.error('Push notification failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

async function createVapidAuthHeaders(
  endpoint: string,
  publicKey: string,
  privateKey: string,
  subject: string
): Promise<Record<string, string>> {
  // Pour simplifier, on utilise une authentification basique
  // En production, il faudrait utiliser une bibliothèque complète comme web-push
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  // JWT header
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };
  
  // JWT payload avec expiration dans 12 heures
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 43200, // 12 heures
    sub: subject,
  };
  
  // Note: Pour une implémentation complète, il faudrait signer le JWT avec la clé privée VAPID
  // Ici on retourne juste les headers de base
  return {
    'Authorization': `vapid t=${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.signature, k=${publicKey}`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting maintenance alerts check...');

    // Récupérer toutes les maintenances à venir
    const { data: maintenances, error: maintenanceError } = await supabase
      .from('vehicle_maintenance')
      .select('id, vehicle_id, maintenance_type, next_maintenance_date, mileage')
      .not('next_maintenance_date', 'is', null);

    if (maintenanceError) {
      console.error('Error fetching maintenances:', maintenanceError);
      throw maintenanceError;
    }

    console.log(`Found ${maintenances?.length || 0} maintenances with future dates`);

    // Récupérer tous les véhicules
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, user_id, brand, model, license_plate, mileage');

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      throw vehiclesError;
    }

    // Récupérer toutes les préférences
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*');

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError);
      throw preferencesError;
    }

    const preferencesMap = new Map(
      preferences?.map(p => [p.user_id, p]) || []
    );

    const vehiclesMap = new Map(
      vehicles?.map(v => [v.id, v]) || []
    );

    let alertsCreated = 0;
    let emailsSent = 0;
    let pushNotificationsSent = 0;

    // Vérifier chaque maintenance
    for (const maintenance of maintenances || []) {
      const vehicle = vehiclesMap.get(maintenance.vehicle_id);
      if (!vehicle) continue;

      const prefs = preferencesMap.get(vehicle.user_id);
      if (!prefs) continue;

      const alerts = [];

      // Vérification basée sur la date
      if (maintenance.next_maintenance_date && prefs.email_enabled) {
        const nextDate = new Date(maintenance.next_maintenance_date);
        const today = new Date();
        const daysUntil = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        for (const dayThreshold of prefs.email_days_before) {
          if (daysUntil === dayThreshold) {
            // Vérifier si une alerte existe déjà
            const { data: existingAlert } = await supabase
              .from('maintenance_alerts')
              .select('id')
              .eq('maintenance_id', maintenance.id)
              .eq('alert_type', 'date_based')
              .eq('days_until_due', daysUntil)
              .eq('status', 'sent')
              .single();

            if (!existingAlert) {
              alerts.push({
                user_id: vehicle.user_id,
                vehicle_id: vehicle.id,
                maintenance_id: maintenance.id,
                alert_type: 'date_based',
                alert_reason: `Maintenance ${maintenance.maintenance_type} prévue dans ${daysUntil} jours`,
                threshold_date: maintenance.next_maintenance_date,
                days_until_due: daysUntil,
                status: 'pending',
              });
            }
          }
        }
      }

      // Vérification basée sur le kilométrage
      if (
        prefs.mileage_enabled &&
        maintenance.mileage &&
        vehicle.mileage
      ) {
        const kmUntil = maintenance.mileage - vehicle.mileage;
        
        if (kmUntil > 0 && kmUntil <= prefs.mileage_threshold_km) {
          // Vérifier si une alerte existe déjà
          const { data: existingAlert } = await supabase
            .from('maintenance_alerts')
            .select('id')
            .eq('maintenance_id', maintenance.id)
            .eq('alert_type', 'mileage_based')
            .eq('status', 'sent')
            .gte('km_until_due', kmUntil - 100) // Tolérance de 100 km
            .lte('km_until_due', kmUntil + 100)
            .single();

          if (!existingAlert) {
            alerts.push({
              user_id: vehicle.user_id,
              vehicle_id: vehicle.id,
              maintenance_id: maintenance.id,
              alert_type: 'mileage_based',
              alert_reason: `Maintenance ${maintenance.maintenance_type} prévue dans ${kmUntil} km`,
              threshold_mileage: maintenance.mileage,
              current_mileage: vehicle.mileage,
              km_until_due: kmUntil,
              status: 'pending',
            });
          }
        }
      }

      // Créer les alertes et envoyer les emails
      for (const alert of alerts) {
        const { data: createdAlert, error: alertError } = await supabase
          .from('maintenance_alerts')
          .insert(alert)
          .select()
          .single();

        if (alertError) {
          console.error('Error creating alert:', alertError);
          continue;
        }

        alertsCreated++;

        // Récupérer le profil utilisateur pour l'email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', vehicle.user_id)
          .single();

        if (profile?.email) {
          // Créer une entrée dans l'historique des notifications
          const { data: notificationHistoryEntry } = await supabase
            .from('notification_history')
            .insert({
              user_id: vehicle.user_id,
              alert_id: createdAlert.id,
              notification_type: 'email',
              status: 'pending',
            })
            .select()
            .single();

          try {
            // Envoyer l'email via l'API Resend directement
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'GH₂ Maintenance <onboarding@resend.dev>',
                to: [profile.email],
                subject: `🔔 Rappel de maintenance - ${vehicle.brand} ${vehicle.model}`,
                html: `
                  <h1>Rappel de maintenance</h1>
                  <p>Bonjour ${profile.full_name || 'cher client'},</p>
                  <p><strong>${alert.alert_reason}</strong></p>
                  <h3>Détails du véhicule :</h3>
                  <ul>
                    <li><strong>Véhicule :</strong> ${vehicle.brand} ${vehicle.model}</li>
                    <li><strong>Immatriculation :</strong> ${vehicle.license_plate}</li>
                    <li><strong>Kilométrage actuel :</strong> ${vehicle.mileage} km</li>
                  </ul>
                  <h3>Maintenance à effectuer :</h3>
                  <ul>
                    <li><strong>Type :</strong> ${maintenance.maintenance_type}</li>
                    ${alert.alert_type === 'date_based' ? `<li><strong>Date prévue :</strong> ${new Date(maintenance.next_maintenance_date!).toLocaleDateString('fr-FR')}</li>` : ''}
                    ${alert.alert_type === 'mileage_based' ? `<li><strong>Kilométrage prévu :</strong> ${maintenance.mileage} km</li>` : ''}
                  </ul>
                  <p>N'oubliez pas de prendre rendez-vous pour cette maintenance !</p>
                  <p>Cordialement,<br>L'équipe GH₂</p>
                `,
              }),
            });

            const emailData = await emailResponse.json();

            if (!emailResponse.ok) {
              console.error('Resend API error:', emailData);
              
              // Mettre à jour l'historique avec le statut échec
              if (notificationHistoryEntry) {
                await supabase
                  .from('notification_history')
                  .update({
                    status: 'failed',
                    error_message: JSON.stringify(emailData),
                  })
                  .eq('id', notificationHistoryEntry.id);
              }
            } else {
              emailsSent++;
              
              // Marquer l'alerte comme envoyée
              await supabase
                .from('maintenance_alerts')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  email_sent: true,
                })
                .eq('id', createdAlert.id);
              
              // Mettre à jour l'historique avec le statut succès
              if (notificationHistoryEntry) {
                await supabase
                  .from('notification_history')
                  .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                  })
                  .eq('id', notificationHistoryEntry.id);
              }
              
              console.log(`Email sent successfully to ${profile.email} for alert ${createdAlert.id}`);
            }
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            
            // Mettre à jour l'historique avec le statut échec
            if (notificationHistoryEntry) {
              await supabase
                .from('notification_history')
                .update({
                  status: 'failed',
                  error_message: emailError instanceof Error ? emailError.message : String(emailError),
                })
                .eq('id', notificationHistoryEntry.id);
            }
          }
        }

        // Envoyer une notification push si activée
        if (prefs.push_enabled && prefs.push_subscription) {
          // Créer une entrée dans l'historique des notifications
          const { data: pushHistoryEntry } = await supabase
            .from('notification_history')
            .insert({
              user_id: vehicle.user_id,
              alert_id: createdAlert.id,
              notification_type: 'push',
              status: 'pending',
            })
            .select()
            .single();

          try {
            const subscription = JSON.parse(prefs.push_subscription);
            
            const pushPayload = {
              title: `🔔 Rappel de maintenance`,
              body: alert.alert_reason,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              data: {
                url: '/maintenance-alerts',
                alertId: createdAlert.id,
                vehicleId: vehicle.id,
              },
              tag: `maintenance-${createdAlert.id}`,
            };

            const pushSent = await sendPushNotification(subscription, pushPayload);

            if (pushSent) {
              pushNotificationsSent++;
              
              // Mettre à jour l'historique avec le statut succès
              if (pushHistoryEntry) {
                await supabase
                  .from('notification_history')
                  .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                  })
                  .eq('id', pushHistoryEntry.id);
              }
              
              console.log(`Push notification sent successfully for alert ${createdAlert.id}`);
            } else {
              // Mettre à jour l'historique avec le statut échec
              if (pushHistoryEntry) {
                await supabase
                  .from('notification_history')
                  .update({
                    status: 'failed',
                    error_message: 'Failed to send push notification',
                  })
                  .eq('id', pushHistoryEntry.id);
              }
            }
          } catch (pushError) {
            console.error('Error sending push notification:', pushError);
            
            // Mettre à jour l'historique avec le statut échec
            if (pushHistoryEntry) {
              await supabase
                .from('notification_history')
                .update({
                  status: 'failed',
                  error_message: pushError instanceof Error ? pushError.message : String(pushError),
                })
                .eq('id', pushHistoryEntry.id);
            }
          }
        }
      }
    }

    console.log(`Check completed: ${alertsCreated} alerts created, ${emailsSent} emails sent, ${pushNotificationsSent} push notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsCreated,
        emailsSent,
        pushNotificationsSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-maintenance-alerts:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

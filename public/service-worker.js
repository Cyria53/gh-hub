self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GH2 - Alerte Maintenance';
  const options = {
    body: data.body || 'Une maintenance est à prévoir prochainement',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url || '/',
    actions: [
      { action: 'view', title: 'Voir les détails' },
      { action: 'dismiss', title: 'Ignorer' }
    ],
    requireInteraction: true,
    tag: data.tag || 'maintenance-alert'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/maintenance-alerts')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action: open the app
    event.waitUntil(
      clients.openWindow(event.notification.data || '/maintenance-alerts')
    );
  }
});

// ✅ FIREBASE CONFIGURADO PARA OMKO REAL ESTATE
// 
// Proyecto: omko-c9ce7
// Dominio: https://realestate.omko.do
// 
// CONFIGURACIÓN COMPLETADA:
// ✅ Firebase config actualizada
// ⚠️  Pendiente: Agregar dominio en Authentication > Authorized domains
// ⚠️  Pendiente: Configurar Cloud Messaging para dominio web

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// ✅ CONFIGURACIÓN FIREBASE ACTUALIZADA
const firebaseConfig = {
  apiKey: "AIzaSyD640W_80U9-hBRnMKG8ngDyzc8Y98wj_8",
  authDomain: "omko-c9ce7.firebaseapp.com",
  projectId: "omko-c9ce7",
  storageBucket: "omko-c9ce7.firebasestorage.app",
  messagingSenderId: "188737881983",
  appId: "1:188737881983:web:015612151f003e88d67c4a",
  measurementId: "G-HH52RHHPER"
};

firebase?.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
  console.log('OMKO Real Estate Service Worker installed 🚀');
});

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('🔔 Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'OMKO Real Estate';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación disponible',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'omko-notification',
    requireInteraction: true,
    data: {
      url: payload.data?.url || 'https://realestate.omko.do/',
      propertyId: payload.data?.propertyId,
      type: payload.data?.type
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Propiedad',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('🔗 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the URL from notification data
    const urlToOpen = event.notification.data?.url || 'https://realestate.omko.do/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  } else if (event.action !== 'close') {
    // Default action (clicking notification body)
    const urlToOpen = event.notification.data?.url || 'https://realestate.omko.do/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
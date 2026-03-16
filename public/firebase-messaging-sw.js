importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyBVA6W-pGxM5fgLhV5QSDmOMmoDxLM1xgg",
    authDomain: "omko-84083.firebaseapp.com",
    projectId: "omko-84083",
    storageBucket: "omko-84083.firebasestorage.app",
    messagingSenderId: "492235670371",
    appId: "1:492235670371:web:f11d972faeaba6df0c0956"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image || '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'omko-notification',
      requireInteraction: false,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  });
} catch (error) {
  console.error('Error initializing Firebase Messaging Service Worker:', error);
}

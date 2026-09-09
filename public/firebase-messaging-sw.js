importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyD640W_80U9-hBRnMKG8ngDyzc8Y98wj_8",
  authDomain: "omko-c9ce7.firebaseapp.com",
  projectId: "omko-c9ce7",
  storageBucket: "omko-c9ce7.firebasestorage.app",
  messagingSenderId: "188737881983",
  appId: "1:188737881983:web:015612151f003e88d67c4a",
  measurementId: "G-HH52RHHPER",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage(async (payload) => {
  try {
    const title = payload.notification?.title || "Notification";
    const targetOrigin = self.location.origin;

    let clickAction = targetOrigin;
    if (payload?.data?.chat_message_type) {
      clickAction += `/user/chat?propertyId=${payload.data.property_id}&userId=${payload.data.sender_id}`;
    }

    const notificationOptions = {
      body: payload.notification?.body,
      icon: payload.data?.property_title_image || "/favicon.ico",
      image: payload.notification?.image || payload.data?.image,
      requireInteraction: true,
      data: {
        url: clickAction,
      },
    };

    const clientList = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    clientList.forEach((client) => {
      client.postMessage({
        type: "NOTIFICATION_RECEIVED",
        payload,
      });
    });

    self.registration.showNotification(title, notificationOptions);
  } catch (error) {
    console.error("Push event error:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(handleNotificationClick(event));
});

async function handleNotificationClick(event) {
  try {
    const targetUrl = event.notification.data?.url || self.location.origin;

    const clientList = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of clientList) {
      if ("focus" in client) {
        await client.navigate(targetUrl).catch(() => { });
        return client.focus();
      }
    }

    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  } catch (error) {
    console.error("Notification click error:", error);

    if (self.clients.openWindow) {
      return self.clients.openWindow(
        event.notification.data?.url || self.location.origin,
      );
    }
  }
}
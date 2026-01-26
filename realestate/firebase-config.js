// ✅ FIREBASE CONFIGURATION - OMKO Real Estate
// Project: omko-c9ce7
// Domain: https://realestate.omko.do

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD640W_80U9-hBRnMKG8ngDyzc8Y98wj_8",
  authDomain: "omko-c9ce7.firebaseapp.com",
  projectId: "omko-c9ce7",
  storageBucket: "omko-c9ce7.firebasestorage.app",
  messagingSenderId: "188737881983",
  appId: "1:188737881983:web:015612151f003e88d67c4a",
  measurementId: "G-HH52RHHPER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// Messaging functions
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted.');
      
      // Get registration token
      // VAPID Key obtenida de Firebase Console > Cloud Messaging > Web Push certificates
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BKKOLKvAGJ3KjGfW_R_RDOT4YVNVXstkxmM-2og0f86TJfIPOyFPTtBgU8haOdu3MVw9B1CWErqS-0r0T0'; // ✅ VAPID Key configurada
      
      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });
      
      if (token) {
        console.log('📱 Registration token:', token);
        
        // Enviar token al backend para guardar en base de datos
        try {
          const backendUrl = 'https://adminrealestate.omko.do/public';
          const response = await fetch(`${backendUrl}/api/save-fcm-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token,
              device_type: 'web',
              domain: 'realestate.omko.do'
            })
          });
          
          if (response.ok) {
            console.log('✅ Token saved to backend successfully');
          } else {
            console.log('⚠️ Failed to save token to backend:', response.status);
          }
        } catch (error) {
          console.log('⚠️ Error saving token to backend:', error);
        }
        
        return token;
      } else {
        console.log('❌ No registration token available.');
        return null;
      }
    } else {
      console.log('❌ Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('❌ An error occurred while retrieving token:', error);
  }
};

// Handle foreground messages
export const handleForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('📨 Message received. ', payload);
    
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'OMKO Real Estate';
    const notificationOptions = {
      body: payload.notification?.body || 'Nueva notificación',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'omko-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/favicon.ico'
        }
      ]
    };
    
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};

export default app;
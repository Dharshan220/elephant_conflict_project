/* Firebase Cloud Messaging service worker for the Elephant Early Warning System.
 *
 * To go live with FCM:
 *   1. Create a Firebase project and add a web app.
 *   2. Paste your config into firebase/firebase-config.js (loaded by the app
 *      only when VITE_FIREBASE_CONFIG is set — see src/services/push.ts).
 *   3. Replace the placeholder sender ID below with your own.
 *   4. Deploy this file at the PUBLIC root (/firebase-messaging-sw.js).
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const data = payload.data || {};
  const title = payload.notification?.title || '\u26A0 Elephant Alert';
  const body =
    payload.notification?.body ||
    'Elephant detected near a village. Avoid the area and stay indoors.';
  const options = {
    body: body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: data.url || '/app/live', alert_id: data.alert_id || '' },
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/app/live';
  event.waitUntil(self.clients.openWindow(url));
});

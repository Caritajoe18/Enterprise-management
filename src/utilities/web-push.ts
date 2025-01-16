import WebSocket from "ws";
//import webpush, { PushSubscription } from "web-push";

export const connectedAdmins = new Map<string, WebSocket>();

export const addAdminConnection = (adminId: string, ws: WebSocket) => {
  connectedAdmins.set(adminId, ws);
};

export const removeAdminConnection = (adminId: string) => {
  connectedAdmins.delete(adminId);
};

export const getAdminConnection = (adminId: string) => {
  return connectedAdmins.get(adminId);
};

// const vapidKeys = {
//   publicKey: "YOUR_PUBLIC_VAPID_KEY",
//   privateKey: "YOUR_PRIVATE_VAPID_KEY",
// };

// webpush.setVapidDetails(
//   "mailto:your-email@example.com",
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );

// const subscription: PushSubscription = {
//   endpoint: "https://example.com/push-endpoint",
//   keys: {
//     auth: "YOUR_AUTH_KEY",
//     p256dh: "YOUR_P256DH_KEY",
//   },
// };

// const payload = JSON.stringify({
//   title: "Notification Title",
//   body: "This is the notification body!",
//   icon: "icon-url",
// });

// webpush
//   .sendNotification(subscription, payload)
//   .then((response) => {
//     console.log("Push notification sent:", response);
//   })
//   .catch((error) => {
//     console.error("Error sending push notification:", error);
//   });

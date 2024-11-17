import webpush from 'web-push';
import admin from 'firebase-admin';
import User from '../models/User.js';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// Configure web push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (userId, notification) => {
  const user = await User.findById(userId);
  if (!user.pushSubscription) return;

  try {
    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(notification)
    );
  } catch (error) {
    console.error('Push notification failed:', error);
  }
};

export const sendMobileNotification = async (userId, notification) => {
  const user = await User.findById(userId);
  if (!user.fcmToken) return;

  try {
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data
    });
  } catch (error) {
    console.error('Mobile notification failed:', error);
  }
};

export const notifyLowStock = async (product) => {
  const admins = await User.find({ role: 'admin' });
  
  const notification = {
    title: 'Low Stock Alert',
    body: `${product.name} is running low on stock (${product.stockQuantity} remaining)`,
    data: {
      type: 'low_stock',
      productId: product._id.toString()
    }
  };
  
  admins.forEach(admin => {
    sendPushNotification(admin._id, notification);
    sendMobileNotification(admin._id, notification);
  });
};

export const notifyOrderStatus = async (order) => {
  const notification = {
    title: 'Order Update',
    body: `Your order #${order.orderNumber} is ${order.status}`,
    data: {
      type: 'order_update',
      orderId: order._id.toString()
    }
  };
  
  await sendPushNotification(order.user, notification);
  await sendMobileNotification(order.user, notification);
};
'use strict';

const { Expo } = require('expo-server-sdk');

const expo = new Expo();

/**
 * Send a push notification via Expo Push Notification Service.
 * @param {string} expoPushToken - The recipient's Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<void>}
 */
async function sendPushNotification(expoPushToken, title, body) {
  if (!expoPushToken) return;

  // Validate the token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.warn(`Invalid Expo push token: ${expoPushToken}`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { title, body },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of ticketChunk) {
        if (ticket.status === 'error') {
          console.error('Expo push error:', ticket.message, ticket.details);
        }
      }
    }
  } catch (err) {
    // Do not let push notification failures affect the main response
    console.error('Failed to send push notification:', err.message);
  }
}

module.exports = { sendPushNotification };


export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return false;
  }

  let permission = Notification.permission;

  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  return permission === 'granted';
};

export const sendPushNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/800px-Seventh-day_Adventist_Church_logo.svg.png',
        badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/96px-Seventh-day_Adventist_Church_logo.svg.png',
        tag: 'sda-social-notification', // Prevents stacking too many notifications
      });
    } catch (e) {
      console.error("Notification error:", e);
    }
  }
};

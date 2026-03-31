import type { Order } from '../types'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
}

export function useNotifications() {
  const isSupported = 'Notification' in window

  async function requestPermission(): Promise<NotificationPermission> {
    if (!isSupported) return 'denied'
    if (Notification.permission !== 'default') return Notification.permission
    return await Notification.requestPermission()
  }

  function sendPushNotification(opts: NotificationOptions): void {
    if (!isSupported || Notification.permission !== 'granted') return
    new Notification(opts.title, {
      body: opts.body,
      icon: opts.icon ?? '/icon-192.png',
    })
  }

  function scheduleReminder(order: Order, minutesBefore = 30): void {
    sendPushNotification({
      title: `⏰ Promemoria ritiro tra ${minutesBefore} min`,
      body: `${order.mealTime} · ${order.timeSlotId} – ricordati di ritirare il tuo ordine!`,
    })
  }

  return { isSupported, requestPermission, sendPushNotification, scheduleReminder }
}

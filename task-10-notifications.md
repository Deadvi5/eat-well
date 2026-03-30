# Task 10 — Notifications and toast system

## Goal

Centralize all notification logic into a reusable hook and integrate push + in-app toasts across the app consistently.

## Steps

### 1. Hook — `src/hooks/useNotifications.ts`

```ts
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
    // For demo: send immediately with a note that it's a simulated reminder
    sendPushNotification({
      title: `⏰ Promemoria ritiro tra ${minutesBefore} min`,
      body: `${order.mealTime} · ${order.timeSlotId} – ricordati di ritirare il tuo ordine!`,
    })
  }

  return { isSupported, requestPermission, sendPushNotification, scheduleReminder }
}
```

### 2. Toast context — `src/context/ToastContext.tsx`

```ts
type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}
```

- Max 3 toasts visible at once (oldest auto-dismissed first if exceeded)
- Auto-dismiss after 4 seconds each
- Toasts stack bottom-up

Wrap the app with `<ToastProvider>` in `main.tsx`.

### 3. Toast UI — `src/components/ToastContainer.tsx`

Fixed position, z-index high enough to overlay everything:
- Desktop: bottom-right, 16px from edges
- Mobile: bottom-center, above the bottom nav (bottom: 72px)

Each toast:
```
┌──────────────────────────────────┐
│  ✓  Ordine confermato!      [×]  │   ← success (green left border)
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  ℹ  Filtri applicati        [×]  │   ← info (blue left border)
└──────────────────────────────────┘
```

- White background, 4px left border in variant color
- Slide-up + fade-in on enter (CSS `@keyframes`)
- Fade-out on dismiss

### 4. Integration points

Wire up the notification + toast systems everywhere they're triggered:

| Event | Push notification | In-app toast |
|-------|-------------------|--------------|
| Order confirmed (task-07) | ✓ "Ordine confermato · Ritiro 12:30" | ✓ success "Ordine confermato!" |
| Order status → `ready` (task-12 admin) | ✓ "Il tuo pasto è pronto" | — (admin side) |
| Profile saved (task-09) | — | ✓ success "Preferenze salvate ✓" |
| Cart item replaced | — | ✓ info "Piatto sostituito: Pasta al ragù" |
| Payment error (mock) | — | ✓ error "Pagamento non riuscito. Riprova." |
| Dish marked unavailable by admin | — | ✓ warning "Aggiornamento disponibilità salvato" |

### 5. `useToast` hook — `src/hooks/useToast.ts`

A thin wrapper so any component can call `showToast` without importing the context directly:

```ts
export function useToast() {
  return useContext(ToastContext)
}
```

### 6. Verify

- Place an order → green toast appears bottom-right + browser push notification fires
- Add a dish to cart then replace it → info toast "Piatto sostituito: ..."
- Save profile → green toast "Preferenze salvate ✓"
- Multiple toasts: trigger 4 in quick succession → max 3 visible, oldest dismissed
- Toasts auto-dismiss after 4 seconds
- Manual dismiss (×) works

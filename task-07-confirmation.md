# Task 07 — Order confirmation and QR code

## Goal

Build the post-checkout confirmation screen with animated success feedback, a scannable QR code, and a browser push notification.

## Steps

### 1. Page — `src/pages/OrderConfirmationPage.tsx`

Route: `/order/:orderId/confirmation`

On mount: look up the order by `orderId` from AppContext. If not found, redirect to `/orders`.

#### Success animation

At the top of the page, a large animated checkmark:
- Circle that draws itself (CSS `stroke-dasharray` + `stroke-dashoffset` animation, 600ms)
- Checkmark that appears after the circle (CSS opacity + transform, 200ms delay)
- Green color (#2E9E6B)
- Size: 80×80px, centered

Below: heading "Ordine confermato!" + subtext "Il tuo pasto è stato prenotato con successo."

#### Order summary card

```
📅 Data          Lunedì 16 Gennaio · Pranzo
⏰ Orario ritiro  12:30
📍 Punto ritiro   Mensa Principale – Piano 0
💳 Pagamento      Wallet interno

Piatti ordinati:
  🍝 Pasta al ragù
  🍗 Pollo arrosto
  🥗 Insalata mista
  🍊 Frutta fresca

Totale: €11,50
```

#### QR code section

Heading: "QR code per il ritiro"

Render the QR code using `qrcode.react`:
```tsx
import { QRCodeSVG } from 'qrcode.react'

<QRCodeSVG
  value={order.qrCode}   // e.g. "ORDER-1705412345678-u1"
  size={200}
  bgColor="#ffffff"
  fgColor="#1E6FBF"
  level="M"
/>
```

Below the QR: `order.qrCode` string in monospace, small text (for manual entry if scanner fails).

Instruction text: "Mostra questo codice al momento del ritiro. Il personale scansionerà il QR per confermare la consegna."

**Download button:** "⬇ Salva QR code" — uses the canvas rendered by QRCodeCanvas to produce a data URL and triggers a download as `ordine-{orderId}.png`. Use `QRCodeCanvas` (hidden, ref-based) alongside the visible `QRCodeSVG` for this.

#### Action buttons

```
[Torna al menu]        → /menu
[Vedi i miei ordini]   → /orders
```

### 2. Push notification

On page mount (after the order is confirmed):

```ts
if ('Notification' in window) {
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  if (Notification.permission === 'granted') {
    new Notification('Ordine confermato! 🍽️', {
      body: `Ritiro alle ${timeSlot.time} – ${pickupPoint.name}`,
      icon: '/icon-192.png',
    })
  }
}
```

### 3. Verify

- Complete a full order as `u1`
- Confirmation page shows the correct order data
- QR code is visible and contains the correct string
- Download button produces a PNG file
- Browser notification appears (allow when prompted)
- "Torna al menu" navigates to `/menu`
- "Vedi i miei ordini" navigates to `/orders`

# Task 08 — Order history page

## Goal

Build the order history view where users see all their past and current orders, with status badges, expandable detail, and QR code access.

## Steps

### 1. Page — `src/pages/OrderHistoryPage.tsx`

Route: `/orders`

Filter `AppContext.orders` by `order.userId === currentUser.id`, sorted newest first.

#### Filter bar (top)

Two filter controls in a row:

**Status filter** (pill buttons):
```
Tutti  |  In corso  |  Completati  |  Annullati
```
- "In corso" = status `pending` or `confirmed` or `ready`
- "Completati" = status `collected`
- "Annullati" = status `cancelled`

**Meal time filter** (select dropdown):
```
Tutti i pasti  |  Colazione  |  Spuntino  |  Pranzo
```

#### Order cards

Each order is a card with two states: **collapsed** (default) and **expanded**.

**Collapsed:**
```
┌───────────────────────────────────────────────────┐
│  📅 Lun 13 Gen · Pranzo          [🟢 Pronto]      │
│  ⏰ 13:00  📍 Mensa Principale                    │
│  3 piatti                          €9,50    [›]   │
└───────────────────────────────────────────────────┘
```

**Expanded** (click anywhere on card to toggle):
```
┌───────────────────────────────────────────────────┐
│  📅 Lun 13 Gen · Pranzo          [🟢 Pronto]      │
│  ⏰ 13:00  📍 Mensa Principale                    │
│  ─────────────────────────────────────────────    │
│  Primo     Pasta al ragù           €3,50          │
│  Secondo   Pollo arrosto           €4,50          │
│  Bevanda   Acqua naturale          €0,50          │
│  ─────────────────────────────────────────────    │
│  Pagamento: Wallet interno                        │
│  TOTALE: €8,50                                    │
│                                                   │
│  [Mostra QR code]    ← only if status allows      │
└───────────────────────────────────────────────────┘
```

"Mostra QR code" is visible for status `confirmed` or `ready`.

#### Status badges

| Status | Badge style |
|--------|-------------|
| `pending` | Yellow background "⏳ In attesa" |
| `confirmed` | Blue background "✅ Confermato" |
| `ready` | Green background "🔔 Pronto" |
| `collected` | Gray background "☑️ Ritirato" |
| `cancelled` | Red background "✖ Annullato" |

#### QR modal

When "Mostra QR code" is clicked, open a centered modal overlay (not a page navigation):

```
┌──────────────────────────────────┐
│  QR code per il ritiro      [×]  │
│                                  │
│         [QR CODE 200px]          │
│                                  │
│   ORDER-1705412345678-u1         │
│   Ritiro: 13:00                  │
│   Mensa Principale               │
│                                  │
│         [⬇ Salva QR]            │
└──────────────────────────────────┘
```

Backdrop click closes the modal.

#### Empty state

If no orders match the active filters:
```
📋
Nessun ordine trovato
Cambia i filtri o ordina il tuo primo pasto!

[Vai al menu →]
```

If the user has no orders at all:
```
🍽️
Non hai ancora ordinato nulla
Il tuo primo pasto è a un click di distanza.

[Ordina ora →]
```

### 2. Verify

Log in as `u1` (Marco Rossi). Confirm:
- 5 historic orders are visible (from mock data)
- Status badges have the correct colors
- Expanding a card shows dish details
- "Mostra QR code" appears only for `confirmed` and `ready` orders
- Modal opens and closes correctly
- Filters narrow down the list correctly
- Place a new order and confirm it appears at the top of the list

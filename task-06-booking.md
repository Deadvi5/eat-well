# Task 06 — 3-step booking flow

## Goal

Build the order creation wizard: a 3-step stepper that collects order summary, pickup preferences, and payment, then saves the order.

## Steps

### 1. Page — `src/pages/OrderNewPage.tsx`

#### Stepper header

Fixed at top of page, shows 3 steps with connecting line:

```
① Riepilogo  ──  ② Ritiro  ──  ③ Pagamento
```

- Completed steps: filled blue circle + checkmark
- Current step: filled blue circle + number
- Future steps: gray circle + number

#### Step 1 — Order summary

Display:
- Selected date + meal time (e.g. "Pranzo · Lunedì 16 Gennaio")
- List of selected dishes, grouped by course:
  ```
  Primo      Pasta al ragù           €3,50
  Secondo    Pollo arrosto           €4,50
  Contorno   Insalata mista          €1,50
  Dessert    Frutta fresca           €1,50
  Bevanda    Acqua naturale          €0,50
  ─────────────────────────────────────────
             TOTALE                  €11,50
  ```
- If cart is empty: redirect back to `/menu` with a toast "Nessun piatto selezionato"
- CTA: "Avanti →" button (blue, full width on mobile)

#### Step 2 — Pickup point and time slot

**Pickup point selection:** 3 cards in a grid:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🏪          │  │  🏥          │  │  ⚡          │
│  Mensa       │  │  Distribuz.  │  │  Ritiro      │
│  Principale  │  │  Reparto     │  │  Veloce      │
│  Piano 0     │  │  Piano 2     │  │  Ingresso    │
└──────────────┘  └──────────────┘  └──────────────┘
```
Selected card gets a blue border + checkmark badge.

**Time slot selection** (shown after pickup point is selected):
4 pill buttons in a row: `12:00  12:30  13:00  13:30`
- Each shows available seats: "12:30 · 12 posti"
- If 0 seats: disabled + strikethrough
- Selected pill: blue background

CTA: "Avanti →" enabled only when both pickup point and slot are selected. "← Indietro" goes back to step 1.

#### Step 3 — Payment

Show a compact order recap at the top (date, pickup, time, total).

Payment options depend on user role:

**Employee (`u1`):**
```
○ 💳 Carta di credito
    [Numero carta    ] [MM/AA] [CVV]   ← mock form, no real validation
○ 👛 Wallet interno
    Saldo disponibile: €45,50
○ 💼 Addebito busta paga
    L'importo sarà detratto dallo stipendio del mese
```

**Patient (`u2`):**
```
○ 💳 Carta di credito
    [Numero carta    ] [MM/AA] [CVV]
○ 🏥 Addebito degenza
    L'importo sarà aggiunto al conto della stanza 307-B
```

Card form fields are mock (no real validation — just check they are non-empty if card is selected).

CTA: "Conferma ordine" button. "← Indietro" goes to step 2.

### 2. Order creation

On "Conferma ordine":

1. Show a 1.5s loading spinner overlay ("Elaborazione pagamento...")
2. Create an `Order` object:
   ```ts
   {
     id: `ORD-${Date.now()}`,
     userId: currentUser.id,
     date: cart.selectedDate,
     mealTime: cart.selectedMealTime,
     items: cart.items,
     totalPrice: cart.totalPrice,
     status: 'confirmed',
     pickupPointId: selectedPickupPoint.id,
     timeSlotId: selectedTimeSlot.id,
     paymentMethod: selectedPayment,
     qrCode: `ORDER-${Date.now()}-${currentUser.id}`,
     createdAt: new Date().toISOString(),
   }
   ```
3. Call `addOrder(order)` from AppContext
4. Call `clearCart()`
5. Navigate to `/order/${order.id}/confirmation`

### 3. Verify

Complete the full flow as both the employee and patient user. Confirm:
- Step 1 shows the correct cart items and total
- Step 2 requires both pickup and slot before enabling "Avanti"
- Step 3 shows the correct payment options for each role
- After confirm, the new order appears in AppContext orders
- Navigation redirects to the confirmation page

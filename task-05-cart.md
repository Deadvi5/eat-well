# Task 05 — Cart context and dish selection UX

## Goal

Implement the cart state management and connect it to the dish cards, including a cart drawer/bottom-sheet summary.

## Steps

### 1. Cart context — `src/context/CartContext.tsx`

```ts
interface CartState {
  items: CartItem[]          // max 1 item per MealCourse
  selectedDate: string       // ISO date
  selectedMealTime: MealTime
}

interface CartContextValue extends CartState {
  addItem: (dish: Dish) => void      // replaces existing item of same course
  removeItem: (dishId: string) => void
  clearCart: () => void
  setDate: (date: string) => void
  setMealTime: (mt: MealTime) => void
  totalPrice: number                 // computed
  itemCount: number                  // computed
}
```

Rules:
- Only one dish per `MealCourse` allowed. Adding a second dish of the same course silently replaces the first.
- Persist cart in `sessionStorage` (clears when browser tab closes, intentional).
- `selectedDate` and `selectedMealTime` default to today and `'pranzo'`.

Wrap `<App />` (inside `<AppProvider>`) with `<CartProvider>`.

### 2. Connect DishCard

Update `src/components/DishCard.tsx`:

- Import `useCart`
- If this dish is already in the cart:
  - Show a filled blue circle with a checkmark instead of the "+" button
  - Add a small "Rimuovi" text link below
- If a different dish of the same course is in the cart:
  - Show the "+" button normally but add a tooltip: "Sostituirà [nome piatto attuale]"
- Animate the add action: brief scale pulse (CSS keyframe, 150ms) on the card when added

### 3. Cart badge

In `src/components/Layout.tsx`:
- Show a red badge with `itemCount` on the "Ordina" nav link (both sidebar and bottom nav)
- Hide badge when `itemCount === 0`

### 4. Cart drawer — `src/components/CartDrawer.tsx`

**Desktop (≥768px):** Slide-in drawer from the right, 320px wide, overlays content.

**Mobile (<768px):** Bottom sheet that slides up from the bottom, max-height 70vh, scrollable.

Trigger: clicking the "Ordina" nav link opens the drawer if cart has items; navigates to `/order/new` if already viewing the drawer. Alternatively add a floating cart button that appears when `itemCount > 0`.

Drawer content:
```
Header: "Il tuo ordine" + close button (×)

For each MealCourse that has an item:
  [emoji] Dish name          €3,50
          [Rimuovi]

Separator

Subtotal breakdown (optional, nice to have)
TOTALE                       €9,00

[Procedi alla prenotazione →]   ← navigates to /order/new
[Svuota carrello]               ← clearCart() + close drawer
```

If cart is empty and drawer is open: show "Nessun piatto selezionato" + a button "Vai al menu".

### 5. Sync cart date/mealtime with MenuPage

When the user changes the date or meal time in `MenuPage`, call `setDate` / `setMealTime` on the cart context. If the cart already has items from a different date/mealtime, show a confirmation dialog:

> "Hai già piatti nel carrello per [data/pasto]. Vuoi svuotare il carrello e cambiare?"
> [Annulla] [Sì, cambia]

### 6. Verify

- Add a primo dish → checkmark appears, badge shows "1"
- Add a secondo dish → badge shows "2", drawer lists both
- Add another primo → old primo is replaced, count stays "2"
- Open drawer on mobile → bottom sheet slides up
- Click "Procedi" → navigates to `/order/new` (placeholder for now)
- Clear cart → badge disappears, drawer shows empty state

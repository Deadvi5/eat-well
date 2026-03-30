# Task 04 — Daily menu page

## Goal

Build the main menu browsing experience: date selector, meal time tabs, dish cards grouped by course, and dietary filters.

## Steps

### 1. Page — `src/pages/MenuPage.tsx`

#### Date selector (top of page)

- Display 7 dates as a horizontal scrollable pill row: today + 6 days
- Format: "Oggi", "Dom 16", "Lun 17", etc.
- Selected date has blue background + white text
- Arrow buttons (‹ ›) to scroll the row if needed on small screens
- Default: today selected

#### Meal time tabs

Below the date selector, three tabs: `Colazione | Spuntino | Pranzo`

- Active tab: blue underline + bold text
- Default: `Pranzo`

#### Filter panel

Collapsible panel (open by default on desktop, collapsed on mobile with a "Filtri" toggle button):

Checkboxes for dietary filters:
```
🌱 Vegetariano   🌿 Vegano   🌾 Senza glutine
🥛 Senza lattosio   🩸 Diabetico   🧂 Basso sodio
```

When `currentUser.allergies` is non-empty, show an info banner:
> "Stai visualizzando i piatti con evidenza per le tue allergie: Glutine, Latticini"

#### Dish grid

Group dishes by course in this order: Primo → Secondo → Contorno → Dessert → Bevanda.

Only show course sections that have at least one dish for the selected date + meal time.

Section header: course name in caps, subtle separator line.

Each `DishCard` component (`src/components/DishCard.tsx`):

```
┌────────────────────────────────┐
│  🍝   Pasta al ragù            │
│       Pasta fresca con ragù    │
│       di carne alla bolognese  │
│                                │
│  🌱 Vegetariano  🌾 Senza G.   │  ← dietary tag badges (green)
│  ⚠️ Glutine  ⚠️ Uova           │  ← allergen badges (red/orange)
│                                │
│  280 kcal          3,50 €      │
│                          [+]   │  ← add to cart button
└────────────────────────────────┘
```

- If dish is NOT available: overlay with "Esaurito" badge, card grayed out, button disabled
- If dish allergens intersect with `currentUser.allergies`: highlight card border in orange + show allergen badges
- If active dietary filters exclude this dish: dim the card to 40% opacity (don't hide, just dim)
- Add to cart button: "+" icon, calls CartContext (stubbed for now, implement fully in task-05)

### 2. Components

Create `src/components/DishCard.tsx` — receives a `Dish` prop plus an `onAdd` callback.

Create `src/components/FilterPanel.tsx` — receives active filters and an `onChange` callback.

Create `src/components/MealTimeTabs.tsx` — receives selected meal time and `onChange`.

### 3. State

Keep selected date, selected meal time, and active filters as local state inside `MenuPage.tsx`. No need for context for these.

### 4. Verify

Run `npm run dev`. Navigate to `/menu` as the patient user (Anna, gluten allergy). Confirm:
- Gluten dishes have orange border and allergen badge
- Selecting "Senza glutine" filter dims non-GF dishes
- Switching dates shows the correct dishes
- Switching meal time tabs shows the right courses
- Unavailable dishes show the "Esaurito" overlay

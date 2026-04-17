# Task 03 — Auth context and login page

## Goal

Build the authentication layer with a context that manages the current user, and a login page that lets you switch between the three mock roles.

## Steps

### 1. App context — `src/context/AppContext.tsx`

Create a single top-level context that holds:

```ts
interface AppState {
  currentUser: User | null
  orders: Order[]
  dishes: Dish[]           // mutable copy of mockData dishes (admin can edit)
  dailyMenus: DailyMenu[]
  pickupPoints: PickupPoint[]
  timeSlots: TimeSlot[]
}

interface AppContextValue extends AppState {
  login: (userId: string) => void
  logout: () => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateDishAvailability: (dishId: string, available: boolean) => void
  updateUserPreferences: (prefs: DietaryTag[], allergies: Allergen[]) => void
}
```

Seed initial state from `mockData.ts`.

Persist `currentUser.id` and `orders` to `localStorage` so a page refresh keeps the session. On mount, rehydrate from localStorage if present.

Wrap `<App />` in `<AppProvider>` in `main.tsx`.

### 2. Login page — `src/pages/LoginPage.tsx`

Full-screen centered layout. Show:

- Hospital logo emoji 🏥 + app name "Mensa Ospedale Sant'Orsola" as heading
- Subtitle: "Seleziona il tuo profilo per accedere"

Three large clickable cards, one per mock user:

```
Card 1 — Dipendente
  Icon: 👔
  Name: Marco Rossi
  Sub: Badge EMP-4421 · Accesso SSO aziendale
  Color accent: blue

Card 2 — Paziente
  Icon: 🛏️
  Name: Anna Bianchi
  Sub: Stanza 307-B · Account degenza
  Color accent: green

Card 3 — Admin Mensa
  Icon: 👩‍💼
  Name: Giulia Ferrari
  Sub: Pannello di amministrazione
  Color accent: amber/orange
```

Each card has a hover effect (shadow + slight scale). On click: call `login(userId)` then navigate to `/menu`.

Add a small footer note: "Ambiente demo — nessuna credenziale richiesta"

### 3. Route guard

In `src/components/ProtectedRoute.tsx`:

```tsx
// If not authenticated → redirect to /login
// If authenticated but role is not 'admin' and route starts with /admin → redirect to /menu
// Otherwise render children
```

Wrap all non-login routes in `<ProtectedRoute>` inside `App.tsx`.

### 4. Header update

In `src/components/Layout.tsx`, use `currentUser` from AppContext to display:
- User name
- Role badge: "Dipendente" (blue) / "Paziente" (green) / "Admin" (amber)
- Logout button → calls `logout()` and navigates to `/login`

### 5. Verify

Run `npm run dev`. Click each login card, confirm the header updates with the correct name and badge, and confirm the logout button returns to `/login`. Confirm that navigating to `/menu` without logging in redirects to `/login`.

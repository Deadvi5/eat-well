# Task 14 — Polish, demo data, and final QA

## Goal

Add onboarding, empty states, skeleton loaders, and any missing UX details to make the demo flow smooth and impressive.

## Steps

### 1. Onboarding modal — `src/components/OnboardingModal.tsx`

Show on first login only (flag: `localStorage.getItem('onboarding_done')`).

A centered modal overlay (max-width 480px) with a 3-slide carousel:

```
Slide 1
  🍽️
  "Benvenuto nella Mensa Digitale"
  Consulta il menu del giorno, filtra per
  allergie e preferenze dietetiche.

Slide 2
  📅
  "Prenota il tuo pasto"
  Scegli data, orario e punto di ritiro.
  Paga con carta, wallet o busta paga.

Slide 3
  📲
  "Ritiro veloce con QR code"
  Il tuo QR personale è sempre disponibile
  nella sezione I miei ordini.
```

Navigation: dot indicators at the bottom (● ○ ○), "Avanti" button, "Salta" link top-right.

On last slide: "Inizia" button (blue, full width) → sets `onboarding_done=true` in localStorage → closes modal.

Add `<OnboardingModal />` inside `Layout.tsx` (rendered outside the main content area so it overlays everything).

### 2. Skeleton loaders

#### Menu page (`MenuPage.tsx`)

On mount, simulate an 800ms data load: set `isLoading = true`, `setTimeout(() => setIsLoading(false), 800)`.

While loading, render 6 `<DishCardSkeleton />` components instead of real dish cards.

```tsx
// src/components/DishCardSkeleton.tsx
// A gray animated placeholder that matches DishCard's dimensions.
// Use Tailwind's animate-pulse class on gray div blocks.
export function DishCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded-lg w-8" />
      </div>
    </div>
  )
}
```

#### Payment step (OrderNewPage.tsx)

When "Conferma ordine" is clicked, show a full-page spinner overlay for 1500ms before navigating to confirmation:

```tsx
<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  <p className="mt-4 text-gray-600 text-sm">Elaborazione pagamento...</p>
</div>
```

### 3. Empty states

#### Order history — no orders at all

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <span className="text-6xl">🍽️</span>
  <h3 className="mt-4 text-lg font-medium text-gray-800">Non hai ancora ordinato nulla</h3>
  <p className="mt-2 text-gray-500 max-w-xs">
    Il tuo primo pasto è a un click di distanza.
  </p>
  <Link to="/menu" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
    Ordina ora
  </Link>
</div>
```

#### Order history — no results for active filter

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <span className="text-5xl">📋</span>
  <h3 className="mt-4 text-lg font-medium text-gray-800">Nessun ordine trovato</h3>
  <p className="mt-2 text-gray-500">Prova a cambiare i filtri.</p>
  <button onClick={resetFilters} className="mt-4 text-blue-600 hover:underline text-sm">
    Reimposta filtri
  </button>
</div>
```

#### Menu page — no dishes match active filters

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
  <span className="text-5xl">🔍</span>
  <h3 className="mt-4 text-lg font-medium text-gray-800">Nessun piatto corrisponde ai filtri</h3>
  <p className="mt-2 text-gray-500 max-w-xs">
    Prova a rimuovere qualche filtro per vedere più opzioni.
  </p>
  <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline text-sm">
    Rimuovi filtri
  </button>
</div>
```

### 4. Demo data top-up

Add to `mockData.ts` (in AppContext initial state, not just the raw array):

- 2 orders in status `ready` for `u1` (today) — so the demo can immediately show the "Mostra QR" flow
- 1 order in status `pending` for `u1` (today, 30 minutes ago) — for the kanban demo

Make sure these have realistic items and realistic QR strings (`ORDER-{timestamp}-u1`).

### 5. Responsive final check

Test and fix layout at these three breakpoints:

**375px (iPhone SE — mobile)**
- Bottom nav is visible and not overlapping content
- Cart bottom sheet opens correctly
- All form inputs are large enough to tap (min 44px height)
- Admin table scrolls horizontally, not clipped
- Kanban board scrolls horizontally

**768px (iPad — tablet)**
- Sidebar replaces bottom nav
- Menu dish grid: 2 columns
- Stepper steps visible without truncation

**1280px (desktop)**
- Sidebar is always visible (not collapsible)
- Menu dish grid: 3 columns
- Cart drawer slides in from right without overlapping sidebar

### 6. Final navigation check

Walk through every route and confirm:
- `/login` — all 3 login cards work
- `/menu` — date selector, tabs, filters all work end-to-end
- `/order/new` — full 3-step flow completes without errors
- `/order/:id/confirmation` — QR visible, download works, notification fires
- `/orders` — history visible, QR modal opens
- `/profile` — preferences save and persist across login/logout
- `/admin/menu` — only visible when logged in as admin
- `/admin/orders` — table and kanban both work, status changes persist

Fix any broken links, missing imports, or console errors found during this walkthrough.

### 7. Verify

Run `npm run dev`. Complete the following demo script end-to-end without errors:

1. Open app → onboarding modal appears → click through to "Inizia"
2. Log in as Marco Rossi (employee)
3. Menu loads with skeleton then real dishes; filter by "Senza glutine"
4. Add a primo + secondo to cart; cart badge shows 2
5. Open cart drawer, proceed to booking
6. Complete 3-step order flow with wallet payment
7. Confirmation page: QR visible, notification fires
8. Navigate to orders: new order at top, 2 ready orders with QR access
9. Open a ready order's QR modal
10. Navigate to profile: toggle vegetarian, save → toast appears
11. Log out → redirected to login
12. Log in as admin
13. Admin menu: mark a dish as esaurito
14. Admin orders: move an order from "Confermati" to "Pronti" via kanban
15. Log out

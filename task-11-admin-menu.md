# Task 11 — Admin: menu management panel

## Goal

Build the admin panel for managing dishes and daily availability. Only accessible to users with role `admin`.

## Steps

### 1. Route guard

`/admin/menu` and `/admin/orders` must redirect to `/menu` if `currentUser.role !== 'admin'`. This should already be handled by `ProtectedRoute` from task-03 — verify it works.

### 2. Page — `src/pages/admin/AdminMenuPage.tsx`

Route: `/admin/menu`

Three tabs at the top: `Menu oggi | Tutti i piatti | Aggiungi piatto`

---

#### Tab 1 — Menu oggi

Shows today's dishes organized by meal time (Colazione / Spuntino / Pranzo) and then by course within each meal time.

Each dish row:
```
🍝  Pasta al ragù             Primo · Pranzo    €3,50    [Disponibile ▼]
🌱 Vegetariano
```

The `[Disponibile ▼]` is a select/toggle:
- Options: "Disponibile" / "Esaurito"
- Changing it calls `updateDishAvailability(dishId, available)` in AppContext
- Show a success toast: "Disponibilità aggiornata"

Group rows under collapsible section headers (Colazione, Spuntino, Pranzo) — open by default.

---

#### Tab 2 — Tutti i piatti

Full table of all dishes in the mock dataset.

Columns: Piatto | Portata | Pasto | Prezzo | Tag dietetici | Status | Azioni

**Filtering row** above the table:
- Search input: filter by dish name (live, no submit)
- Course select: all / primo / secondo / contorno / dessert / bevanda
- Meal time select: all / colazione / spuntino / pranzo

Each row has two action buttons:
- ✏️ **Modifica** → opens the edit modal (same form as "Aggiungi piatto", pre-populated)
- 🗑️ **Elimina** → shows an inline confirmation: "Sicuro? [Annulla] [Elimina]" — on confirm, removes the dish from AppContext state (not from the original mockData file)

---

#### Tab 3 — Aggiungi piatto

A form to add a new dish. Fields:

```
Nome piatto *         [text input]
Descrizione           [textarea, max 120 chars]
Emoji                 [text input, 1 character, default 🍽️]
Portata *             [select: primo/secondo/contorno/dessert/bevanda]
Disponibile per *     [multi-checkbox: colazione / spuntino / pranzo]
Prezzo (€) *          [number input, step 0.10, min 0.10]
Calorie               [number input]
Tag dietetici         [checkbox group: vegetariano/vegano/senza glutine/...]
Allergeni             [checkbox group: glutine/latticini/...]
Disponibile           [toggle, default ON]
```

Validation (show inline red messages):
- Nome is required
- Portata is required
- Almeno un pasto must be selected
- Prezzo must be > 0

On valid submit:
1. Create a new `Dish` with `id: crypto.randomUUID()`
2. Add to AppContext `dishes`
3. Show success toast "Piatto aggiunto al menu ✓"
4. Switch to the "Tutti i piatti" tab

### 3. Edit modal — `src/components/admin/DishFormModal.tsx`

Shared form used for both add and edit. Receives an optional `dish` prop (pre-populates when editing). A modal overlay (centered, 600px max-width, scrollable on small screens). Backdrop click does NOT close (prevent accidental loss of input). Only the ✕ button or "Annulla" close it.

### 4. Verify

Log in as `u3` (Giulia Ferrari, admin):
- Navigate to `/admin/menu` via the sidebar link
- Tab 1: toggle a dish to "Esaurito" → switch to the user view (`/menu`) → confirm the dish is grayed out
- Tab 2: search for "pasta" → only pasta dishes appear
- Tab 2: delete a dish → confirm it disappears from the list and from the menu
- Tab 3: add a new dish → confirm it appears in "Tutti i piatti" and in the menu
- Tab 2: edit that dish → change the price → confirm the update

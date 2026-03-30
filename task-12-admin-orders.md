# Task 12 — Admin: orders dashboard and kanban

## Goal

Build the admin order management dashboard with KPI cards, a filterable table, and a kanban board with drag-and-drop status management.

## Steps

### 1. Page — `src/pages/admin/AdminOrdersPage.tsx`

Route: `/admin/orders`

---

#### KPI bar (top)

4 stat cards in a row (2×2 on mobile):

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  📋 12     │ │  ✅ 8      │ │  🔔 3      │ │  💰 €94,50 │
│  Ordini    │ │  Confermati│ │  Pronti    │ │  Incasso   │
│  oggi      │ │            │ │            │ │  oggi      │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Compute from `AppContext.orders` filtered to today's date.

Add a subtle "aggiornato adesso" timestamp that refreshes every 30 seconds using `setInterval`. The counts themselves are reactive to AppContext state changes (no real polling needed).

---

#### View toggle

Two buttons, top right: `[☰ Tabella]  [▦ Kanban]`

---

#### Table view

Columns:
```
ID | Utente | Pasto | Orario | Punto ritiro | Totale | Status | Azione
```

- **ID**: `ORD-...` in monospace, truncated to 12 chars
- **Utente**: full name (look up from mockData users by `order.userId`)
- **Status column**: colored badge (same style as task-08)
- **Azione column**: a `<select>` to change the status

```
select options: In attesa | Confermato | Pronto | Ritirato | Annullato
```

When status changes via the select:
1. Call `updateOrderStatus(orderId, newStatus)` in AppContext
2. If new status is `ready`: send a push notification simulating alerting the user: `"Il tuo pasto è pronto! Ritira entro 15 minuti."`
3. Show success toast "Stato aggiornato"

**Filter row** above the table:
- Search input: filter by user name or order ID
- Status filter: select (tutti / pending / confirmed / ready / collected / cancelled)
- Pickup point filter: select (tutti / p1 / p2 / p3)

**Pagination**: show 10 rows per page, simple prev/next buttons.

---

#### Kanban view

4 columns side by side (horizontal scroll on mobile):

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ⏳ In attesa │ │ ✅ Conferm.  │ │ 🔔 Pronti    │ │ ☑️ Ritirati  │
│   (3)        │ │    (5)       │ │    (2)       │ │    (7)       │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ ORD-001      │ │ ORD-004      │ │ ORD-009      │ │ ORD-002      │
│ Marco Rossi  │ │ Anna B.      │ │ Marco R.     │ │ ...          │
│ Pranzo 12:30 │ │ Pranzo 13:00 │ │ Pranzo 12:00 │ │              │
│ €9,50    [→] │ │ €7,00    [→] │ │ €11,50   [→] │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Drag and drop** (no external library — use native HTML5 drag API):

- `draggable={true}` on each card
- `onDragStart`: store the order ID in `dataTransfer`
- `onDragOver`: allow drop, highlight column with a blue dashed border
- `onDrop`: read order ID, call `updateOrderStatus` with the column's status

The "Annullati" column is shown in the table view only (not in kanban).

Each kanban card also has a small `[→]` button to advance to the next status (shortcut without dragging):
- pending → confirmed
- confirmed → ready
- ready → collected

### 2. Verify

Log in as admin:
- KPI cards show correct counts for today's orders
- Table: change an order's status via select → badge updates immediately
- Table: filter by "Pronti" → only ready orders visible
- Kanban: drag a card from "Confermati" to "Pronti" → card moves column
- Kanban: click `[→]` on a "In attesa" card → moves to "Confermati"
- Status change to `ready` → push notification fires

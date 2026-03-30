# Task 02 — TypeScript types and mock data
 
## Goal

Define all TypeScript types and populate a rich mock dataset used throughout the app.

## Steps

### 1. Types — `src/types/index.ts`

Define and export all of these:

```ts
export type UserRole = 'employee' | 'patient' | 'admin'

export type DietaryTag =
  | 'vegetarian' | 'vegan' | 'gluten_free'
  | 'lactose_free' | 'diabetic' | 'low_sodium'

export type Allergen =
  | 'gluten' | 'dairy' | 'nuts'
  | 'eggs' | 'shellfish' | 'soy'

export type MealCourse =
  | 'primo' | 'secondo' | 'contorno' | 'dessert' | 'bevanda'

export type MealTime = 'colazione' | 'spuntino' | 'pranzo'

export type OrderStatus =
  | 'pending' | 'confirmed' | 'ready' | 'collected' | 'cancelled'

export type PaymentMethod = 'card' | 'wallet' | 'payroll' | 'room_charge'

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
  badge?: string          // employee only
  roomNumber?: string     // patient only
  walletBalance?: number  // employee only
  dietaryPreferences: DietaryTag[]
  allergies: Allergen[]
}

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  course: MealCourse
  mealTime: MealTime[]    // a dish can appear in multiple meal times
  calories: number
  allergens: Allergen[]
  dietaryTags: DietaryTag[]
  available: boolean
  imageEmoji: string
}

export interface DailyMenu {
  date: string            // ISO date string YYYY-MM-DD
  dishes: Dish[]
}

export interface PickupPoint {
  id: string
  name: string
  location: string
  emoji: string
}

export interface TimeSlot {
  id: string
  time: string            // e.g. "12:30"
  availableSeats: number
}

export interface CartItem {
  dish: Dish
  quantity: 1
}

export interface Order {
  id: string
  userId: string
  date: string            // ISO date
  mealTime: MealTime
  items: CartItem[]
  totalPrice: number
  status: OrderStatus
  pickupPointId: string
  timeSlotId: string
  paymentMethod: PaymentMethod
  qrCode: string
  createdAt: string       // ISO datetime
}
```

### 2. Mock data — `src/data/mockData.ts`

#### Users (3)

```
employee: id "u1", name "Marco Rossi", badge "EMP-4421",
  walletBalance: 45.50, dietaryPreferences: [], allergies: []

patient: id "u2", name "Anna Bianchi", roomNumber "307-B",
  dietaryPreferences: ['gluten_free'], allergies: ['gluten']

admin: id "u3", name "Giulia Ferrari", role "admin",
  dietaryPreferences: [], allergies: []
```

#### Dishes (at least 20 total)

Cover all combinations of `mealTime` and `course`. Examples:

**Colazione:**
- Cornetto alla marmellata (colazione, bevanda not applicable) 1.20€ 🥐
- Yogurt con granola (colazione, contorno-style) 2.50€ 🥣
- Cappuccino (colazione, bevanda) 1.10€ ☕
- Pane e burro senza glutine (colazione) gluten_free 1.80€ 🍞

**Spuntino:**
- Frutta di stagione (spuntino, contorno) vegetarian vegan 1.50€ 🍎
- Crackers e formaggio (spuntino) 2.00€ 🧀
- Succo di frutta (spuntino, bevanda) 1.20€ 🧃

**Pranzo:**
- Risotto al pomodoro (pranzo, primo) vegetarian 3.50€ 🍚
- Pasta al ragù (pranzo, primo) 3.50€ 🍝
- Pasta senza glutine al pesto (pranzo, primo) gluten_free vegetarian 4.00€ 🌿
- Pollo arrosto (pranzo, secondo) 4.50€ 🍗
- Filetto di merluzzo (pranzo, secondo) 5.00€ 🐟
- Cotoletta di tofu (pranzo, secondo) vegan vegetarian 4.00€ 🌱
- Patate al forno (pranzo, contorno) vegetarian vegan gluten_free 1.50€ 🥔
- Insalata mista (pranzo, contorno) vegetarian vegan gluten_free 1.50€ 🥗
- Verdure grigliate (pranzo, contorno) vegetarian vegan gluten_free 1.80€ 🥦
- Tiramisù (pranzo, dessert) 2.50€ contains dairy eggs 🍮
- Panna cotta senza lattosio (pranzo, dessert) lactose_free 2.50€ 🍮
- Frutta fresca (pranzo, dessert) vegan vegetarian gluten_free 1.50€ 🍊
- Acqua naturale 0.5L (bevanda) 0.50€ 💧
- Acqua frizzante 0.5L (bevanda) 0.50€ 💧
- Succo di frutta (bevanda) 1.20€ 🧃

#### Daily menus

Generate `DailyMenu` entries for today and the next 6 days. Each day uses the same dish pool but vary availability randomly — mark 2–3 dishes as `available: false` each day.

#### Pickup points (3)

```
{ id: "p1", name: "Mensa Principale", location: "Piano 0 – Ala Nord", emoji: "🏪" }
{ id: "p2", name: "Distribuzione Reparto", location: "Piano 2 – Corridoio B", emoji: "🏥" }
{ id: "p3", name: "Ritiro Veloce", location: "Ingresso Principale", emoji: "⚡" }
```

#### Time slots (4 for lunch)

```
{ id: "t1", time: "12:00", availableSeats: 8 }
{ id: "t2", time: "12:30", availableSeats: 12 }
{ id: "t3", time: "13:00", availableSeats: 5 }
{ id: "t4", time: "13:30", availableSeats: 15 }
```

#### Historic orders (5 for user "u1")

Create 5 orders in various statuses:
- 1 × `collected` (3 days ago)
- 1 × `collected` (yesterday)
- 1 × `confirmed` (today, time slot 12:30)
- 1 × `ready` (today, time slot 13:00)
- 1 × `pending` (today, time slot 13:30)

Each with realistic items and totals.

### 3. Verify

Import types in App.tsx (no-op, just to check) and run `npm run dev`. No TypeScript errors.

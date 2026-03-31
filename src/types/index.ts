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
  badge?: string
  roomNumber?: string
  walletBalance?: number
  dietaryPreferences: DietaryTag[]
  allergies: Allergen[]
}

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  course: MealCourse
  mealTime: MealTime[]
  calories: number
  allergens: Allergen[]
  dietaryTags: DietaryTag[]
  available: boolean
  imageEmoji: string
}

export interface DailyMenu {
  date: string
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
  time: string
  availableSeats: number
}

export interface CartItem {
  dish: Dish
  quantity: 1
}

export interface Order {
  id: string
  userId: string
  date: string
  mealTime: MealTime
  items: CartItem[]
  totalPrice: number
  status: OrderStatus
  pickupPointId: string
  timeSlotId: string
  paymentMethod: PaymentMethod
  qrCode: string
  createdAt: string
}


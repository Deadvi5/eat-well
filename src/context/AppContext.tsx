import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type {
  User,
  Order,
  Dish,
  DailyMenu,
  PickupPoint,
  TimeSlot,
  OrderStatus,
  DietaryTag,
  Allergen,
} from '../types'
import { users, dishes as mockDishes, pickupPoints, timeSlots, orders as mockOrders } from '../data/mockData'

interface AppState {
  currentUser: User | null
  orders: Order[]
  dishes: Dish[]
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
  addDish: (dish: Dish) => void
  updateDish: (dish: Dish) => void
  removeDish: (dishId: string) => void
  updateUserPreferences: (prefs: DietaryTag[], allergies: Allergen[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = loadFromStorage<string | null>('currentUserId', null)
    if (savedId) return users.find((u) => u.id === savedId) ?? null
    return null
  })

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = loadFromStorage<Order[] | null>('orders', null)
    if (!stored) return mockOrders
    // Merge: keep user-created orders from storage + fresh mock orders (whose dates are dynamic)
    const mockIds = new Set(mockOrders.map((o) => o.id))
    const userOrders = stored.filter((o) => !mockIds.has(o.id))
    return [...mockOrders, ...userOrders]
  })

  const [dishes, setDishes] = useState<Dish[]>(() => [...mockDishes])

  // Derive dailyMenus from current dishes so admin additions are reflected
  const menus = useMemo<DailyMenu[]>(() => {
    const today = new Date()
    const unavailableByDay: number[][] = [
      [2, 9, 17], [4, 11, 20], [1, 13, 18],
      [6, 8, 15], [3, 12, 19], [5, 10, 16], [7, 14, 21],
    ]
    const result: DailyMenu[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const unavailableIndices = unavailableByDay[i]
      const dayDishes = dishes.map((dish, idx) => ({
        ...dish,
        available: dish.available && !unavailableIndices.includes(idx + 1),
      }))
      result.push({ date: date.toISOString().split('T')[0], dishes: dayDishes })
    }
    return result
  }, [dishes])

  // Persist currentUser id
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', JSON.stringify(currentUser.id))
    } else {
      localStorage.removeItem('currentUserId')
    }
  }, [currentUser])

  // Persist orders
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  const login = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [...prev, order])
  }, [])

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
  }, [])

  const updateDishAvailability = useCallback((dishId: string, available: boolean) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, available } : d))
    )
  }, [])

  const addDish = useCallback((dish: Dish) => {
    setDishes((prev) => [...prev, dish])
  }, [])

  const updateDish = useCallback((dish: Dish) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? dish : d))
    )
  }, [])

  const removeDish = useCallback((dishId: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== dishId))
  }, [])

  const updateUserPreferences = useCallback((prefs: DietaryTag[], allergies: Allergen[]) => {
    setCurrentUser((prev) =>
      prev ? { ...prev, dietaryPreferences: prefs, allergies } : null
    )
  }, [])

  const value: AppContextValue = {
    currentUser,
    orders,
    dishes,
    dailyMenus: menus,
    pickupPoints,
    timeSlots,
    login,
    logout,
    addOrder,
    updateOrderStatus,
    updateDishAvailability,
    addDish,
    updateDish,
    removeDish,
    updateUserPreferences,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

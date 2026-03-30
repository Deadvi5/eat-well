import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
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
import { users, dishes as mockDishes, dailyMenus, pickupPoints, timeSlots, orders as mockOrders } from '../data/mockData'

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

  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>('orders', mockOrders)
  )

  const [dishes, setDishes] = useState<Dish[]>(() => [...mockDishes])
  const [menus] = useState<DailyMenu[]>(() => [...dailyMenus])

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
    updateUserPreferences,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Dish, MealTime, CartItem } from '../types'

interface CartState {
  items: CartItem[]
  selectedDate: string
  selectedMealTime: MealTime
}

interface CartContextValue extends CartState {
  addItem: (dish: Dish) => void
  removeItem: (dishId: string) => void
  clearCart: () => void
  setDate: (date: string) => void
  setMealTime: (mt: MealTime) => void
  totalPrice: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function loadCart(): CartState {
  try {
    const raw = sessionStorage.getItem('cart')
    if (raw) return JSON.parse(raw) as CartState
  } catch { /* ignore */ }
  return { items: [], selectedDate: todayISO(), selectedMealTime: 'pranzo' }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(loadCart)

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const addItem = useCallback((dish: Dish) => {
    setState((prev) => {
      // Replace existing item of the same course
      const filtered = prev.items.filter((item) => item.dish.course !== dish.course)
      return { ...prev, items: [...filtered, { dish, quantity: 1 }] }
    })
  }, [])

  const removeItem = useCallback((dishId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.dish.id !== dishId),
    }))
  }, [])

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }))
  }, [])

  const setDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date }))
  }, [])

  const setMealTime = useCallback((mt: MealTime) => {
    setState((prev) => ({ ...prev, selectedMealTime: mt }))
  }, [])

  const totalPrice = useMemo(
    () => state.items.reduce((sum, item) => sum + item.dish.price, 0),
    [state.items]
  )

  const itemCount = state.items.length

  const value: CartContextValue = {
    ...state,
    addItem,
    removeItem,
    clearCart,
    setDate,
    setMealTime,
    totalPrice,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

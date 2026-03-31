import { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import MealTimeTabs from '../components/MealTimeTabs'
import FilterPanel from '../components/FilterPanel'
import DishCard from '../components/DishCard'
import DishCardSkeleton from '../components/DishCardSkeleton'
import type { MealTime, DietaryTag, MealCourse, Dish } from '../types'

const COURSE_ORDER: MealCourse[] = ['primo', 'secondo', 'contorno', 'dessert', 'bevanda']

const COURSE_LABELS: Record<MealCourse, string> = {
  primo: 'Primo',
  secondo: 'Secondo',
  contorno: 'Contorno',
  dessert: 'Dessert',
  bevanda: 'Bevanda',
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function buildDateList(): { date: string; label: string }[] {
  const today = new Date()
  const result: { date: string; label: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const label = i === 0
      ? 'Oggi'
      : `${DAY_NAMES[d.getDay()]} ${d.getDate()}`
    result.push({ date: iso, label })
  }
  return result
}

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Glutine',
  dairy: 'Latticini',
  nuts: 'Frutta a guscio',
  eggs: 'Uova',
  shellfish: 'Crostacei',
  soy: 'Soia',
}

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
}

export default function MenuPage() {
  const { dailyMenus, currentUser } = useApp()
  const cart = useCart()
  const dates = useMemo(buildDateList, [])

  const [selectedDate, setSelectedDate] = useState(cart.selectedDate)
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>(cart.selectedMealTime)
  const [activeFilters, setActiveFilters] = useState<DietaryTag[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{ date?: string; mealTime?: MealTime } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Simulate initial data load
  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const userAllergies = currentUser?.allergies ?? []

  // Get dishes for selected date and meal time
  const dayMenu = dailyMenus.find((m) => m.date === selectedDate)
  const filteredDishes = useMemo(() => {
    if (!dayMenu) return []
    return dayMenu.dishes.filter((d) => d.mealTime.includes(selectedMealTime))
  }, [dayMenu, selectedMealTime])

  // Group by course
  const groupedDishes = useMemo(() => {
    const groups: Partial<Record<MealCourse, Dish[]>> = {}
    for (const dish of filteredDishes) {
      if (!groups[dish.course]) groups[dish.course] = []
      groups[dish.course]!.push(dish)
    }
    return groups
  }, [filteredDishes])

  // Check if all visible dishes are dimmed (filters too restrictive)
  const allDimmed = activeFilters.length > 0 &&
    filteredDishes.every((d) => !activeFilters.every((f) => d.dietaryTags.includes(f)))

  function isDimmed(dish: Dish): boolean {
    if (activeFilters.length === 0) return false
    return !activeFilters.every((f) => dish.dietaryTags.includes(f))
  }

  function scrollDates(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }

  function handleDateChange(date: string) {
    if (cart.itemCount > 0 && date !== cart.selectedDate) {
      setConfirmDialog({ date })
      return
    }
    setSelectedDate(date)
    cart.setDate(date)
  }

  function handleMealTimeChange(mt: MealTime) {
    if (cart.itemCount > 0 && mt !== cart.selectedMealTime) {
      setConfirmDialog({ mealTime: mt })
      return
    }
    setSelectedMealTime(mt)
    cart.setMealTime(mt)
  }

  function confirmChange() {
    if (!confirmDialog) return
    cart.clearCart()
    if (confirmDialog.date) {
      setSelectedDate(confirmDialog.date)
      cart.setDate(confirmDialog.date)
    }
    if (confirmDialog.mealTime) {
      setSelectedMealTime(confirmDialog.mealTime)
      cart.setMealTime(confirmDialog.mealTime)
    }
    setConfirmDialog(null)
  }

  function cancelChange() {
    setConfirmDialog(null)
  }

  function clearFilters() {
    setActiveFilters([])
  }

  const dialogMessage = confirmDialog
    ? `Hai già piatti nel carrello per ${
        confirmDialog.date
          ? dates.find((d) => d.date === cart.selectedDate)?.label ?? cart.selectedDate
          : ''
      }${confirmDialog.date && confirmDialog.mealTime ? ' / ' : ''}${
        confirmDialog.mealTime ? MEAL_TIME_LABELS[cart.selectedMealTime] : ''
      }${!confirmDialog.date ? ' (' + MEAL_TIME_LABELS[cart.selectedMealTime] + ')' : ''}. Vuoi svuotare il carrello e cambiare?`
    : ''

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => scrollDates(-1)}
          className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          aria-label="Scorri indietro"
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
        >
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => handleDateChange(d.date)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDate === d.date
                  ? 'bg-[#1E6FBF] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollDates(1)}
          className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          aria-label="Scorri avanti"
        >
          ›
        </button>
      </div>

      {/* Meal time tabs */}
      <MealTimeTabs selected={selectedMealTime} onChange={handleMealTimeChange} />

      {/* Filter panel */}
      <FilterPanel activeFilters={activeFilters} onChange={setActiveFilters} />

      {/* Allergy info banner */}
      {userAllergies.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800">
          Stai visualizzando i piatti con evidenza per le tue allergie:{' '}
          <strong>{userAllergies.map((a) => ALLERGEN_LABELS[a] ?? a).join(', ')}</strong>
        </div>
      )}

      {/* Skeleton loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DishCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          Nessun piatto disponibile per questo giorno e pasto.
        </div>
      ) : allDimmed ? (
        /* All dishes dimmed — filter too restrictive */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl">🔍</span>
          <h3 className="mt-4 text-lg font-medium text-gray-800">Nessun piatto corrisponde ai filtri</h3>
          <p className="mt-2 text-gray-500 max-w-xs">
            Prova a rimuovere qualche filtro per vedere più opzioni.
          </p>
          <button onClick={clearFilters} className="mt-4 text-[#1E6FBF] hover:underline text-sm">
            Rimuovi filtri
          </button>
        </div>
      ) : (
        <div className="space-y-6 pb-4">
          {COURSE_ORDER.map((course) => {
            const courseDishes = groupedDishes[course]
            if (!courseDishes || courseDishes.length === 0) return null
            return (
              <section key={course}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">
                  {COURSE_LABELS[course]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {courseDishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      userAllergies={userAllergies}
                      dimmed={isDimmed(dish)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <p className="text-sm text-gray-700">{dialogMessage}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelChange}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={confirmChange}
                className="px-4 py-2 text-sm text-white bg-[#1E6FBF] rounded-lg hover:bg-[#1859a0]"
              >
                Sì, cambia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

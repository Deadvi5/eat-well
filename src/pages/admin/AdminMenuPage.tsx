import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../hooks/useToast'
import DishFormModal from '../../components/admin/DishFormModal'
import type { Dish, MealCourse, MealTime } from '../../types'

type Tab = 'today' | 'all' | 'add'

const TAB_ITEMS: { value: Tab; label: string }[] = [
  { value: 'today', label: 'Menu oggi' },
  { value: 'all', label: 'Tutti i piatti' },
  { value: 'add', label: 'Aggiungi piatto' },
]

const COURSE_LABELS: Record<MealCourse, string> = {
  primo: 'Primo',
  secondo: 'Secondo',
  contorno: 'Contorno',
  dessert: 'Dessert',
  bevanda: 'Bevanda',
}

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
}

const COURSE_ORDER: MealCourse[] = ['primo', 'secondo', 'contorno', 'dessert', 'bevanda']
const MEAL_ORDER: MealTime[] = ['colazione', 'spuntino', 'pranzo']

export default function AdminMenuPage() {
  const { dishes, dailyMenus, updateDishAvailability, addDish, updateDish, removeDish } = useApp()
  const { showToast } = useToast()

  const [tab, setTab] = useState<Tab>('today')
  const [editDish, setEditDish] = useState<Dish | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Filters for "all" tab
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<MealCourse | 'all'>('all')
  const [mealFilter, setMealFilter] = useState<MealTime | 'all'>('all')

  // Today's menu
  const todayISO = new Date().toISOString().split('T')[0]
  const todayMenu = dailyMenus.find((m) => m.date === todayISO)

  // Group today's dishes by meal time then course
  const todayGrouped = useMemo(() => {
    if (!todayMenu) return []
    return MEAL_ORDER.map((mt) => {
      const mtDishes = todayMenu.dishes.filter((d) => d.mealTime.includes(mt))
      const byCourse = COURSE_ORDER
        .map((c) => ({
          course: c,
          dishes: mtDishes.filter((d) => d.course === c),
        }))
        .filter((g) => g.dishes.length > 0)
      return { mealTime: mt, groups: byCourse }
    }).filter((g) => g.groups.length > 0)
  }, [todayMenu])

  // Filtered dishes for "all" tab
  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
      if (courseFilter !== 'all' && d.course !== courseFilter) return false
      if (mealFilter !== 'all' && !d.mealTime.includes(mealFilter)) return false
      return true
    })
  }, [dishes, search, courseFilter, mealFilter])

  function handleAvailabilityChange(dishId: string, available: boolean) {
    updateDishAvailability(dishId, available)
    showToast('Disponibilità aggiornata', 'warning')
  }

  function handleAddDish(dish: Dish) {
    addDish(dish)
    showToast('Piatto aggiunto al menu ✓', 'success')
    setTab('all')
  }

  function handleEditSave(dish: Dish) {
    updateDish(dish)
    showToast('Piatto aggiornato ✓', 'success')
    setEditDish(null)
  }

  function handleDelete(dishId: string) {
    removeDish(dishId)
    setDeleteConfirmId(null)
    showToast('Piatto eliminato', 'info')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Gestione Menu</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TAB_ITEMS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === t.value ? 'text-[#1E6FBF]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {tab === t.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E6FBF]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Menu oggi */}
      {tab === 'today' && (
        <div className="space-y-6">
          {todayGrouped.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Nessun menu per oggi.</p>
          ) : (
            todayGrouped.map((mtGroup) => (
              <section key={mtGroup.mealTime}>
                <h2 className="text-sm font-bold text-gray-700 mb-3">
                  {MEAL_TIME_LABELS[mtGroup.mealTime]}
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {mtGroup.groups.map((cg) =>
                    cg.dishes.map((dish) => (
                      <div key={dish.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xl shrink-0">{dish.imageEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{dish.name}</p>
                          <p className="text-xs text-gray-400">
                            {COURSE_LABELS[dish.course]} · {dish.mealTime.map((m) => MEAL_TIME_LABELS[m]).join(', ')}
                          </p>
                          {dish.dietaryTags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {dish.dietaryTags.map((t) => (
                                <span key={t} className="text-xs text-green-600">{t === 'vegetarian' ? '🌱' : t === 'vegan' ? '🌿' : t === 'gluten_free' ? '🌾' : t === 'lactose_free' ? '🥛' : ''}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 shrink-0">
                          {dish.price.toFixed(2).replace('.', ',')} €
                        </span>
                        <select
                          value={dish.available ? 'available' : 'unavailable'}
                          onChange={(e) => handleAvailabilityChange(dish.id, e.target.value === 'available')}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                            dish.available
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="available">Disponibile</option>
                          <option value="unavailable">Esaurito</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Tutti i piatti */}
      {tab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Cerca piatto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
            />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value as MealCourse | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1E6FBF]"
            >
              <option value="all">Tutte le portate</option>
              {COURSE_ORDER.map((c) => (
                <option key={c} value={c}>{COURSE_LABELS[c]}</option>
              ))}
            </select>
            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value as MealTime | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1E6FBF]"
            >
              <option value="all">Tutti i pasti</option>
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>{MEAL_TIME_LABELS[m]}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Piatto</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 hidden sm:table-cell">Portata</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 hidden sm:table-cell">Pasto</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Prezzo</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-500 hidden md:table-cell">Tag</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{dish.imageEmoji}</span>
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">{dish.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{COURSE_LABELS[dish.course]}</td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">
                      {dish.mealTime.map((m) => MEAL_TIME_LABELS[m]).join(', ')}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-700">
                      {dish.price.toFixed(2).replace('.', ',')} €
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <div className="flex justify-center gap-0.5">
                        {dish.dietaryTags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                            {t === 'vegetarian' ? '🌱' : t === 'vegan' ? '🌿' : t === 'gluten_free' ? '🌾' : t === 'lactose_free' ? '🥛' : t === 'diabetic' ? '🩸' : '🧂'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        dish.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {dish.available ? 'Attivo' : 'Esaurito'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirmId === dish.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs text-gray-500">Sicuro?</span>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-1"
                          >
                            Annulla
                          </button>
                          <button
                            onClick={() => handleDelete(dish.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-1"
                          >
                            Elimina
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditDish(dish)}
                            className="text-xs text-[#1E6FBF] hover:underline"
                          >
                            ✏️ Modifica
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(dish.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            🗑️ Elimina
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDishes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">
                      Nessun piatto trovato.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Aggiungi piatto */}
      {tab === 'add' && (
        <DishFormModal
          onSave={handleAddDish}
          onClose={() => setTab('all')}
        />
      )}

      {/* Edit modal */}
      {editDish && (
        <DishFormModal
          dish={editDish}
          onSave={handleEditSave}
          onClose={() => setEditDish(null)}
        />
      )}
    </div>
  )
}

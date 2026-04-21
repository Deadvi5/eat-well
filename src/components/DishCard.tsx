import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../hooks/useToast'
import type { Dish, Allergen } from '../types'

interface DishCardProps {
  dish: Dish
  userAllergies: Allergen[]
  dimmed: boolean
}

const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'Glutine',
  dairy: 'Latticini',
  nuts: 'Frutta a guscio',
  eggs: 'Uova',
  shellfish: 'Crostacei',
  soy: 'Soia',
}

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: '🌱 Vegetariano',
  vegan: '🌿 Vegano',
  gluten_free: '🌾 Senza glutine',
  lactose_free: '🥛 Senza lattosio',
  low_sodium: '🧂 Basso sodio',
}

export default function DishCard({ dish, userAllergies, dimmed }: DishCardProps) {
  const [pulse, setPulse] = useState(false)
  const { items, addItem, removeItem } = useCart()
  const { showToast } = useToast()

  const isInCart = items.some((item) => item.dish.id === dish.id)
  const sameCourseItem = items.find(
    (item) => item.dish.course === dish.course && item.dish.id !== dish.id
  )

  const hasAllergenConflict = userAllergies.length > 0 &&
    dish.allergens.some((a) => userAllergies.includes(a))

  const conflictingAllergens = dish.allergens.filter((a) => userAllergies.includes(a))

  function handleAdd() {
    if (!dish.available) return
    if (sameCourseItem) {
      showToast(`Piatto sostituito: ${sameCourseItem.dish.name}`, 'info')
    }
    addItem(dish)
    setPulse(true)
    setTimeout(() => setPulse(false), 150)
  }

  function handleRemove() {
    removeItem(dish.id)
  }

  return (
    <div
      className={`relative bg-white rounded-xl border p-4 transition-all ${
        pulse ? 'animate-pulse-card' : ''
      } ${
        isInCart
          ? 'border-[#1E6FBF] border-2 ring-1 ring-[#1E6FBF]/20'
          : !dish.available
            ? 'opacity-50 border-gray-200'
            : hasAllergenConflict
              ? 'border-orange-400 border-2'
              : 'border-gray-200'
      } ${dimmed ? 'opacity-40' : ''}`}
    >
      {/* Esaurito overlay */}
      {!dish.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl z-10">
          <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Esaurito
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-3xl shrink-0">{dish.imageEmoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{dish.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{dish.description}</p>
        </div>
      </div>

      {/* Dietary tags */}
      {dish.dietaryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {dish.dietaryTags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
            >
              {DIETARY_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>
      )}

      {/* Allergen badges (only if user has matching allergies) */}
      {conflictingAllergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {conflictingAllergens.map((a) => (
            <span
              key={a}
              className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
            >
              ⚠️ {ALLERGEN_LABELS[a]}
            </span>
          ))}
        </div>
      )}

      {/* Footer: calories, price, add/remove button */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{dish.calories} kcal</span>
          <span className="text-sm font-semibold text-gray-900">
            {dish.price.toFixed(2).replace('.', ',')} €
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          {isInCart ? (
            <>
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1E6FBF] text-white text-sm">
                ✓
              </span>
              <button
                onClick={handleRemove}
                className="text-[10px] text-red-500 hover:text-red-700"
              >
                Rimuovi
              </button>
            </>
          ) : (
            <div className="relative group">
              <button
                onClick={handleAdd}
                disabled={!dish.available}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1E6FBF] text-white text-lg font-bold transition-colors hover:bg-[#1859a0] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                +
              </button>
              {sameCourseItem && dish.available && (
                <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  Sostituirà {sameCourseItem.dish.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

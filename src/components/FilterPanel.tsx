import { useState } from 'react'
import type { DietaryTag } from '../types'

interface FilterPanelProps {
  activeFilters: DietaryTag[]
  onChange: (filters: DietaryTag[]) => void
}

const DIETARY_OPTIONS: { value: DietaryTag; label: string; emoji: string }[] = [
  { value: 'vegetarian', label: 'Vegetariano', emoji: '🌱' },
  { value: 'vegan', label: 'Vegano', emoji: '🌿' },
  { value: 'gluten_free', label: 'Senza glutine', emoji: '🌾' },
  { value: 'lactose_free', label: 'Senza lattosio', emoji: '🥛' },
  { value: 'low_sodium', label: 'Basso sodio', emoji: '🧂' },
]

export default function FilterPanel({ activeFilters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)
  const [isDesktop] = useState(() => window.innerWidth >= 768)

  const isOpen = isDesktop || open

  function toggle(tag: DietaryTag) {
    if (activeFilters.includes(tag)) {
      onChange(activeFilters.filter((f) => f !== tag))
    } else {
      onChange([...activeFilters, tag])
    }
  }

  return (
    <div>
      {!isDesktop && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-2"
        >
          <span>🔍</span>
          <span>Filtri</span>
          <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
          {activeFilters.length > 0 && (
            <span className="bg-[#1E6FBF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      )}
      {isOpen && (
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const active = activeFilters.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-[#2E9E6B] text-white border-[#2E9E6B]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

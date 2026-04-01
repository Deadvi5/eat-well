import type { MealTime } from '../types'

interface MealTimeTabsProps {
  selected: MealTime
  onChange: (mt: MealTime) => void
}

const TABS: { value: MealTime; label: string }[] = [
  { value: 'colazione', label: 'Colazione' },
  { value: 'spuntino', label: 'Spuntino' },
  { value: 'pranzo', label: 'Pranzo' },
  { value: 'cena', label: 'Cena' },
]

export default function MealTimeTabs({ selected, onChange }: MealTimeTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors relative ${
            selected === tab.value
              ? 'text-[#1E6FBF]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {selected === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E6FBF]" />
          )}
        </button>
      ))}
    </div>
  )
}

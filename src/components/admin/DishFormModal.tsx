import { useState } from 'react'
import type { Dish, MealCourse, MealTime, DietaryTag, Allergen } from '../../types'

interface DishFormModalProps {
  dish?: Dish
  onSave: (dish: Dish) => void
  onClose: () => void
}

const COURSE_OPTIONS: { value: MealCourse; label: string }[] = [
  { value: 'primo', label: 'Primo' },
  { value: 'secondo', label: 'Secondo' },
  { value: 'contorno', label: 'Contorno' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'bevanda', label: 'Bevanda' },
]

const MEAL_OPTIONS: { value: MealTime; label: string }[] = [
  { value: 'colazione', label: 'Colazione' },
  { value: 'spuntino', label: 'Spuntino' },
  { value: 'pranzo', label: 'Pranzo' },
  { value: 'cena', label: 'Cena' },
]

const DIETARY_OPTIONS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetarian', label: '🌱 Vegetariano' },
  { value: 'vegan', label: '🌿 Vegano' },
  { value: 'gluten_free', label: '🌾 Senza glutine' },
  { value: 'lactose_free', label: '🥛 Senza lattosio' },
  { value: 'low_sodium', label: '🧂 Basso sodio' },
]

const ALLERGEN_OPTIONS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Glutine' },
  { value: 'dairy', label: 'Latticini' },
  { value: 'nuts', label: 'Frutta a guscio' },
  { value: 'eggs', label: 'Uova' },
  { value: 'shellfish', label: 'Crostacei' },
  { value: 'soy', label: 'Soia' },
]

export default function DishFormModal({ dish, onSave, onClose }: DishFormModalProps) {
  const isEdit = !!dish

  const [name, setName] = useState(dish?.name ?? '')
  const [description, setDescription] = useState(dish?.description ?? '')
  const [imageEmoji, setImageEmoji] = useState(dish?.imageEmoji ?? '🍽️')
  const [course, setCourse] = useState<MealCourse | ''>(dish?.course ?? '')
  const [mealTime, setMealTime] = useState<MealTime[]>(dish?.mealTime ?? [])
  const [price, setPrice] = useState(dish?.price?.toString() ?? '')
  const [calories, setCalories] = useState(dish?.calories?.toString() ?? '')
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(dish?.dietaryTags ?? [])
  const [allergens, setAllergens] = useState<Allergen[]>(dish?.allergens ?? [])
  const [available, setAvailable] = useState(dish?.available ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleMealTime(mt: MealTime) {
    setMealTime((prev) =>
      prev.includes(mt) ? prev.filter((m) => m !== mt) : [...prev, mt]
    )
  }

  function toggleDietary(tag: DietaryTag) {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function toggleAllergen(a: Allergen) {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nome è obbligatorio'
    if (!course) errs.course = 'Portata è obbligatoria'
    if (mealTime.length === 0) errs.mealTime = 'Almeno un pasto deve essere selezionato'
    if (!price || parseFloat(price) <= 0) errs.price = 'Prezzo deve essere > 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const result: Dish = {
      id: dish?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      imageEmoji: imageEmoji || '🍽️',
      course: course as MealCourse,
      mealTime,
      price: parseFloat(price),
      calories: calories ? parseInt(calories) : 0,
      dietaryTags,
      allergens,
      available,
    }
    onSave(result)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Modifica piatto' : 'Aggiungi piatto'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <Field label="Nome piatto *" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
            />
          </Field>

          {/* Description */}
          <Field label="Descrizione">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 120))}
              maxLength={120}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF] resize-none"
            />
            <span className="text-xs text-gray-400">{description.length}/120</span>
          </Field>

          {/* Emoji */}
          <Field label="Emoji">
            <input
              type="text"
              value={imageEmoji}
              onChange={(e) => setImageEmoji(e.target.value.slice(0, 2))}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-lg focus:outline-none focus:border-[#1E6FBF]"
            />
          </Field>

          {/* Course */}
          <Field label="Portata *" error={errors.course}>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value as MealCourse)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1E6FBF]"
            >
              <option value="">Seleziona...</option>
              {COURSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* Meal times */}
          <Field label="Disponibile per *" error={errors.mealTime}>
            <div className="flex gap-3">
              {MEAL_OPTIONS.map((o) => (
                <label key={o.value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={mealTime.includes(o.value)}
                    onChange={() => toggleMealTime(o.value)}
                    className="accent-[#1E6FBF]"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </Field>

          {/* Price + Calories */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prezzo (€) *" error={errors.price}>
              <input
                type="number"
                step="0.10"
                min="0.10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
              />
            </Field>
            <Field label="Calorie">
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
              />
            </Field>
          </div>

          {/* Dietary tags */}
          <Field label="Tag dietetici">
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-colors ${
                    dietaryTags.includes(o.value)
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={dietaryTags.includes(o.value)}
                    onChange={() => toggleDietary(o.value)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </Field>

          {/* Allergens */}
          <Field label="Allergeni">
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-colors ${
                    allergens.includes(o.value)
                      ? 'bg-orange-50 border-orange-400 text-orange-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allergens.includes(o.value)}
                    onChange={() => toggleAllergen(o.value)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </Field>

          {/* Available toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Disponibile</span>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                available ? 'bg-[#2E9E6B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  available ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm text-white bg-[#1E6FBF] rounded-lg hover:bg-[#1859a0]"
            >
              {isEdit ? 'Salva modifiche' : 'Aggiungi piatto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

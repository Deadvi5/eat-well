import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import type { DietaryTag, Allergen, PaymentMethod } from '../types'

const DIETARY_OPTIONS: { value: DietaryTag; label: string; emoji: string }[] = [
  { value: 'vegetarian', label: 'Vegetariano', emoji: '🌱' },
  { value: 'vegan', label: 'Vegano', emoji: '🌿' },
  { value: 'gluten_free', label: 'Senza glutine', emoji: '🌾' },
  { value: 'lactose_free', label: 'Senza lattosio', emoji: '🥛' },
  { value: 'diabetic', label: 'Dieta diabetica', emoji: '🩸' },
  { value: 'low_sodium', label: 'Basso contenuto di sodio', emoji: '🧂' },
]

const ALLERGEN_OPTIONS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Glutine' },
  { value: 'dairy', label: 'Latticini' },
  { value: 'nuts', label: 'Frutta a guscio' },
  { value: 'eggs', label: 'Uova' },
  { value: 'shellfish', label: 'Crostacei' },
  { value: 'soy', label: 'Soia' },
]

const ROLE_LABELS: Record<string, string> = {
  employee: 'Dipendente',
  patient: 'Paziente',
  admin: 'Amministratore',
}

const AVATAR_COLORS = ['#1E6FBF', '#2E9E6B', '#E67E22', '#9B59B6', '#E74C3C']

function getInitials(name: string): string {
  const parts = name.split(' ')
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = hash * 31 + id.charCodeAt(i)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface NotifPrefs {
  orders: boolean
  reminder: boolean
}

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem('notifPrefs')
    if (raw) return JSON.parse(raw) as NotifPrefs
  } catch { /* ignore */ }
  return { orders: true, reminder: true }
}

export default function ProfilePage() {
  const { currentUser, updateUserPreferences } = useApp()
  const { showToast } = useToast()

  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryTag[]>([])
  const [allergies, setAllergies] = useState<Allergen[]>([])
  const [paymentPref, setPaymentPref] = useState<PaymentMethod>('card')
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(loadNotifPrefs)
  const [notifBlocked, setNotifBlocked] = useState(false)

  // Sync state from currentUser
  useEffect(() => {
    if (!currentUser) return
    setDietaryPrefs(currentUser.dietaryPreferences)
    setAllergies(currentUser.allergies)
    const savedPayment = localStorage.getItem('paymentPref')
    if (savedPayment) setPaymentPref(savedPayment as PaymentMethod)
  }, [currentUser])

  if (!currentUser) return null

  const isEmployee = currentUser.role === 'employee'
  const isPatient = currentUser.role === 'patient'

  function toggleDietary(tag: DietaryTag) {
    setDietaryPrefs((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function toggleAllergen(a: Allergen) {
    setAllergies((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  async function toggleNotifOrders() {
    if (!notifPrefs.orders) {
      // Enabling
      if ('Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        if (result === 'denied') {
          setNotifBlocked(true)
          return
        }
      }
      if ('Notification' in window && Notification.permission === 'denied') {
        setNotifBlocked(true)
        return
      }
      setNotifBlocked(false)
    }
    setNotifPrefs((prev) => ({ ...prev, orders: !prev.orders }))
  }

  function toggleNotifReminder() {
    setNotifPrefs((prev) => ({ ...prev, reminder: !prev.reminder }))
  }

  function handleSave() {
    updateUserPreferences(dietaryPrefs, allergies)
    localStorage.setItem('paymentPref', paymentPref)
    localStorage.setItem('notifPrefs', JSON.stringify(notifPrefs))
    showToast('Preferenze salvate ✓', 'success')
  }

  const paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'card', label: 'Carta di credito', icon: '💳' },
    ...(isEmployee
      ? [
          { value: 'wallet' as PaymentMethod, label: 'Wallet interno', icon: '👛' },
          { value: 'payroll' as PaymentMethod, label: 'Busta paga', icon: '💼' },
        ]
      : []),
    ...(isPatient
      ? [{ value: 'room_charge' as PaymentMethod, label: 'Addebito degenza', icon: '🏥' }]
      : []),
  ]

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8 space-y-6">
      {/* Section 1: User info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ backgroundColor: getAvatarColor(currentUser.id) }}
        >
          {getInitials(currentUser.name)}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{currentUser.name}</h2>
          <p className="text-sm text-gray-500">{ROLE_LABELS[currentUser.role]}</p>
          <p className="text-sm text-gray-400">{currentUser.email}</p>
          {currentUser.badge && (
            <p className="text-xs text-gray-400 mt-0.5">Badge: {currentUser.badge}</p>
          )}
          {currentUser.roomNumber && (
            <div className="mt-0.5">
              <p className="text-xs text-gray-400">Stanza: {currentUser.roomNumber}</p>
              <p className="text-xs text-green-600 font-medium">Degenza attiva</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Dietary preferences */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Dieta e stile alimentare
        </h3>
        <div className="space-y-2">
          {DIETARY_OPTIONS.map((opt) => {
            const active = dietaryPrefs.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggleDietary(opt.value)}
                className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </span>
                <ToggleSwitch on={active} />
              </button>
            )
          })}
        </div>
      </section>

      {/* Section 3: Allergies */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Le mie allergie
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ALLERGEN_OPTIONS.map((opt) => {
            const checked = allergies.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  checked
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAllergen(opt.value)}
                  className="accent-orange-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            )
          })}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          Le allergie selezionate saranno evidenziate nel menu con un bordo arancione.
        </div>
      </section>

      {/* Section 4: Payment preference */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Pagamento predefinito
        </h3>
        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                paymentPref === opt.value
                  ? 'border-[#1E6FBF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentPref === opt.value}
                onChange={() => setPaymentPref(opt.value)}
                className="accent-[#1E6FBF]"
              />
              <span className="text-lg">{opt.icon}</span>
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Section 5: Notifications */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Notifiche push
        </h3>
        <div className="space-y-3">
          <button
            onClick={toggleNotifOrders}
            className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="text-left">
              <p className="text-sm text-gray-700 font-medium">Notifiche ordini</p>
              <p className="text-xs text-gray-400">Conferma e aggiornamenti di stato</p>
            </div>
            <ToggleSwitch on={notifPrefs.orders} />
          </button>
          <button
            onClick={toggleNotifReminder}
            className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="text-left">
              <p className="text-sm text-gray-700 font-medium">Promemoria ritiro</p>
              <p className="text-xs text-gray-400">30 minuti prima dell'orario scelto</p>
            </div>
            <ToggleSwitch on={notifPrefs.reminder} />
          </button>
        </div>
        {notifBlocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
            Le notifiche sono bloccate dal browser. Abilitale nelle impostazioni.
          </div>
        )}
      </section>

      {/* Save button — sticky on mobile */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:p-0 md:border-0 md:bg-transparent">
        <button
          onClick={handleSave}
          className="w-full md:w-auto px-8 py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
        >
          Salva modifiche
        </button>
      </div>

    </div>
  )
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
        on ? 'bg-[#2E9E6B]' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import type { MealCourse, PaymentMethod } from '../types'

const COURSE_ORDER: MealCourse[] = ['primo', 'secondo', 'contorno', 'dessert', 'bevanda']

const COURSE_LABELS: Record<MealCourse, string> = {
  primo: 'Primo',
  secondo: 'Secondo',
  contorno: 'Contorno',
  dessert: 'Dessert',
  bevanda: 'Bevanda',
}

const MEAL_TIME_LABELS: Record<string, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
  cena: 'Cena',
}

const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const MONTH_NAMES = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

const STEP_LABELS = ['Riepilogo', 'Ritiro', 'Pagamento']

export default function OrderNewPage() {
  const navigate = useNavigate()
  const { currentUser, pickupPoints, timeSlots, addOrder } = useApp()
  const cart = useCart()

  const [step, setStep] = useState(0)
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.itemCount === 0) {
      navigate('/menu', { replace: true })
    }
  }, [cart.itemCount, navigate])

  if (!currentUser || cart.itemCount === 0) return null

  // Sort cart items by course order
  const sortedItems = [...cart.items].sort(
    (a, b) => COURSE_ORDER.indexOf(a.dish.course) - COURSE_ORDER.indexOf(b.dish.course)
  )

  const isEmployee = currentUser.role === 'employee'
  const isPatient = currentUser.role === 'patient'

  const canProceedStep2 = selectedPickup !== null && selectedSlot !== null
  const canConfirm = selectedPayment !== null && (
    selectedPayment !== 'card' || (cardNumber.trim() !== '' && cardExpiry.trim() !== '' && cardCvv.trim() !== '')
  )

  function handleConfirm() {
    if (!selectedPickup || !selectedSlot || !selectedPayment) return
    setLoading(true)
    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`
      const order = {
        id: orderId,
        userId: currentUser!.id,
        date: cart.selectedDate,
        mealTime: cart.selectedMealTime,
        items: cart.items,
        totalPrice: cart.totalPrice,
        status: 'confirmed' as const,
        pickupPointId: selectedPickup,
        timeSlotId: selectedSlot,
        paymentMethod: selectedPayment,
        qrCode: `ORDER-${Date.now()}-${currentUser!.id}`,
        createdAt: new Date().toISOString(),
      }
      addOrder(order)
      cart.clearCart()
      navigate(`/order/${orderId}/confirmation`, { replace: true })
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 gap-3">
          <div className="w-12 h-12 border-4 border-[#1E6FBF] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-600">Elaborazione pagamento...</p>
        </div>
      )}

      {/* Stepper header */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div className={`w-10 sm:w-16 h-0.5 ${i <= step ? 'bg-[#1E6FBF]' : 'bg-gray-300'}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < step
                    ? 'bg-[#1E6FBF] text-white'
                    : i === step
                      ? 'bg-[#1E6FBF] text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i <= step ? 'text-[#1E6FBF] font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 — Order summary */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-4">
              {MEAL_TIME_LABELS[cart.selectedMealTime]} · {formatDateLong(cart.selectedDate)}
            </p>
            <div className="space-y-2">
              {sortedItems.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 shrink-0 uppercase">
                      {COURSE_LABELS[item.dish.course]}
                    </span>
                    <span className="text-gray-900">{item.dish.name}</span>
                  </div>
                  <span className="text-gray-700 font-medium shrink-0 ml-2">
                    {item.dish.price.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 uppercase">Totale</span>
              <span className="text-base font-bold text-gray-900">
                {cart.totalPrice.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
          >
            Avanti →
          </button>
        </div>
      )}

      {/* Step 2 — Pickup point + time slot */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Pickup points */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Punto di ritiro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pickupPoints.map((pp) => (
                <button
                  key={pp.id}
                  onClick={() => setSelectedPickup(pp.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-colors ${
                    selectedPickup === pp.id
                      ? 'border-[#1E6FBF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {selectedPickup === pp.id && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#1E6FBF] text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                  <span className="text-2xl block mb-2">{pp.emoji}</span>
                  <p className="text-sm font-semibold text-gray-900">{pp.name}</p>
                  <p className="text-xs text-gray-500">{pp.location}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          {selectedPickup && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Fascia oraria</h3>
              <div className="flex flex-wrap gap-2">
                {timeSlots.filter((ts) => ts.mealTime === cart.selectedMealTime).map((ts) => {
                  const isFull = ts.availableSeats === 0
                  const isSelected = selectedSlot === ts.id
                  return (
                    <button
                      key={ts.id}
                      onClick={() => !isFull && setSelectedSlot(ts.id)}
                      disabled={isFull}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#1E6FBF] text-white'
                          : isFull
                            ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ts.time} · {ts.availableSeats} posti
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Indietro
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep2}
              className="px-6 py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Avanti →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Compact recap */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>{MEAL_TIME_LABELS[cart.selectedMealTime]} · {formatDateLong(cart.selectedDate)}</span>
            <span>{pickupPoints.find((p) => p.id === selectedPickup)?.name}</span>
            <span>{timeSlots.find((t) => t.id === selectedSlot)?.time}</span>
            <span className="font-semibold text-gray-900">
              {cart.totalPrice.toFixed(2).replace('.', ',')} €
            </span>
          </div>

          {/* Payment options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Metodo di pagamento</h3>

            {/* Card — always available */}
            <PaymentOption
              value="card"
              selected={selectedPayment === 'card'}
              onSelect={() => setSelectedPayment('card')}
              icon="💳"
              label="Carta di credito"
            >
              {selectedPayment === 'card' && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Numero carta"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
                  />
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
                  />
                </div>
              )}
            </PaymentOption>

            {/* Employee: wallet */}
            {isEmployee && (
              <PaymentOption
                value="wallet"
                selected={selectedPayment === 'wallet'}
                onSelect={() => setSelectedPayment('wallet')}
                icon="👛"
                label="Wallet interno"
              >
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponibile: {currentUser.walletBalance?.toFixed(2).replace('.', ',')} €
                </p>
              </PaymentOption>
            )}

            {/* Employee: payroll */}
            {isEmployee && (
              <PaymentOption
                value="payroll"
                selected={selectedPayment === 'payroll'}
                onSelect={() => setSelectedPayment('payroll')}
                icon="💼"
                label="Addebito busta paga"
              >
                <p className="text-xs text-gray-500 mt-1">
                  L'importo sarà detratto dallo stipendio del mese
                </p>
              </PaymentOption>
            )}

            {/* Patient: room charge */}
            {isPatient && (
              <PaymentOption
                value="room_charge"
                selected={selectedPayment === 'room_charge'}
                onSelect={() => setSelectedPayment('room_charge')}
                icon="🏥"
                label="Addebito degenza"
              >
                <p className="text-xs text-gray-500 mt-1">
                  L'importo sarà aggiunto al conto della stanza {currentUser.roomNumber}
                </p>
              </PaymentOption>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Indietro
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#2E9E6B] text-white text-sm font-medium rounded-lg hover:bg-[#268a5c] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Conferma ordine
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface PaymentOptionProps {
  value: PaymentMethod
  selected: boolean
  onSelect: () => void
  icon: string
  label: string
  children?: React.ReactNode
}

function PaymentOption({ selected, onSelect, icon, label, children }: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
        selected ? 'border-[#1E6FBF] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-[#1E6FBF]' : 'border-gray-300'
        }`}>
          {selected && <span className="w-2 h-2 rounded-full bg-[#1E6FBF]" />}
        </span>
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      {children}
    </button>
  )
}

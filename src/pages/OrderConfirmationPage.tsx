import { useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useNotifications } from '../hooks/useNotifications'
import type { MealTime } from '../types'

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
  cena: 'Cena',
}

const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const MONTH_NAMES = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

const PAYMENT_LABELS: Record<string, string> = {
  card: '💳 Carta di credito',
  wallet: '👛 Wallet interno',
  payroll: '💼 Addebito busta paga',
  room_charge: '🏥 Addebito degenza',
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders, pickupPoints, timeSlots } = useApp()
  const { showToast } = useToast()
  const { sendPushNotification, requestPermission } = useNotifications()
  const canvasRef = useRef<HTMLDivElement>(null)

  const order = orders.find((o) => o.id === id)

  // Send push notification + toast on mount
  useEffect(() => {
    if (!order) return
    const pp = pickupPoints.find((p) => p.id === order.pickupPointId)
    const ts = timeSlots.find((t) => t.id === order.timeSlotId)
    if (!pp || !ts) return

    showToast('Ordine confermato!', 'success')

    async function notify() {
      await requestPermission()
      sendPushNotification({
        title: 'Ordine confermato! 🍽️',
        body: `Ritiro alle ${ts!.time} – ${pp!.name}`,
      })
    }
    notify()
  }, [order, pickupPoints, timeSlots])

  // Redirect if order not found
  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true })
    }
  }, [order, navigate])

  if (!order) return null

  const pickupPoint = pickupPoints.find((p) => p.id === order.pickupPointId)
  const timeSlot = timeSlots.find((t) => t.id === order.timeSlotId)

  function handleDownloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `ordine-${order!.id}.png`
    a.click()
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-8">
      {/* Success animation */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#2E9E6B"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-draw-circle"
              style={{
                strokeDasharray: 226,
                strokeDashoffset: 226,
              }}
            />
            <path
              d="M24 42 L35 53 L56 30"
              fill="none"
              stroke="#2E9E6B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-check"
              style={{ opacity: 0 }}
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Ordine confermato!</h1>
        <p className="text-sm text-gray-500 text-center">
          Il tuo pasto è stato prenotato con successo.
        </p>
      </div>

      {/* Order summary card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="shrink-0">📅</span>
            <span className="text-gray-500 w-28 shrink-0">Data</span>
            <span className="text-gray-900 font-medium">
              {formatDateLong(order.date)} · {MEAL_TIME_LABELS[order.mealTime]}
            </span>
          </div>
          {timeSlot && (
            <div className="flex gap-2">
              <span className="shrink-0">⏰</span>
              <span className="text-gray-500 w-28 shrink-0">Orario ritiro</span>
              <span className="text-gray-900 font-medium">{timeSlot.time}</span>
            </div>
          )}
          {pickupPoint && (
            <div className="flex gap-2">
              <span className="shrink-0">📍</span>
              <span className="text-gray-500 w-28 shrink-0">Punto ritiro</span>
              <span className="text-gray-900 font-medium">
                {pickupPoint.name} – {pickupPoint.location}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="shrink-0">💳</span>
            <span className="text-gray-500 w-28 shrink-0">Pagamento</span>
            <span className="text-gray-900 font-medium">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Piatti ordinati</p>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.dish.id} className="flex items-center gap-2 text-sm">
                <span>{item.dish.imageEmoji}</span>
                <span className="text-gray-900">{item.dish.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900 uppercase">Totale</span>
          <span className="text-lg font-bold text-gray-900">
            {order.totalPrice.toFixed(2).replace('.', ',')} €
          </span>
        </div>
      </div>

      {/* QR code section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
        <h2 className="text-sm font-semibold text-gray-700">QR code per il ritiro</h2>

        <QRCodeSVG
          value={order.qrCode}
          size={200}
          bgColor="#ffffff"
          fgColor="#1E6FBF"
          level="M"
        />

        {/* Hidden canvas for download */}
        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas
            value={order.qrCode}
            size={400}
            bgColor="#ffffff"
            fgColor="#1E6FBF"
            level="M"
          />
        </div>

        <code className="text-xs text-gray-400 font-mono">{order.qrCode}</code>

        <p className="text-xs text-gray-500 text-center max-w-xs">
          Mostra questo codice al momento del ritiro. Il personale scansionerà il QR per confermare la consegna.
        </p>

        <button
          onClick={handleDownloadQR}
          className="text-sm text-[#1E6FBF] font-medium hover:underline"
        >
          ⬇ Salva QR code
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/menu"
          className="flex-1 text-center px-6 py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
        >
          Torna al menu
        </Link>
        <Link
          to="/orders"
          className="flex-1 text-center px-6 py-2.5 text-gray-600 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Vedi i miei ordini
        </Link>
      </div>
    </div>
  )
}

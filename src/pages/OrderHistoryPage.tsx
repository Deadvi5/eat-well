import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { useApp } from '../context/AppContext'
import type { Order, OrderStatus, MealTime, MealCourse } from '../types'

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled'

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '⏳ In attesa', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '✅ Confermato', className: 'bg-blue-100 text-blue-800' },
  ready: { label: '🔔 Pronto', className: 'bg-green-100 text-green-800' },
  collected: { label: '☑️ Ritirato', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '✖ Annullato', className: 'bg-red-100 text-red-800' },
}

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
}

const COURSE_LABELS: Record<MealCourse, string> = {
  primo: 'Primo',
  secondo: 'Secondo',
  contorno: 'Contorno',
  dessert: 'Dessert',
  bevanda: 'Bevanda',
}

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Carta di credito',
  wallet: 'Wallet interno',
  payroll: 'Addebito busta paga',
  room_charge: 'Addebito degenza',
}

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
const MONTH_NAMES_SHORT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${DAY_NAMES_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`
}

function matchesStatusFilter(status: OrderStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'active') return status === 'pending' || status === 'confirmed' || status === 'ready'
  if (filter === 'completed') return status === 'collected'
  return status === 'cancelled'
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tutti' },
  { value: 'active', label: 'In corso' },
  { value: 'completed', label: 'Completati' },
  { value: 'cancelled', label: 'Annullati' },
]

export default function OrderHistoryPage() {
  const { currentUser, orders, pickupPoints, timeSlots } = useApp()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [mealFilter, setMealFilter] = useState<MealTime | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [qrOrderId, setQrOrderId] = useState<string | null>(null)
  const qrCanvasRef = useRef<HTMLDivElement>(null)

  const userOrders = useMemo(() => {
    if (!currentUser) return []
    return orders
      .filter((o) => o.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, currentUser])

  const filteredOrders = useMemo(() => {
    return userOrders.filter((o) => {
      if (!matchesStatusFilter(o.status, statusFilter)) return false
      if (mealFilter !== 'all' && o.mealTime !== mealFilter) return false
      return true
    })
  }, [userOrders, statusFilter, mealFilter])

  const qrOrder = qrOrderId ? orders.find((o) => o.id === qrOrderId) : null

  function getPickupName(id: string) {
    const pp = pickupPoints.find((p) => p.id === id)
    return pp?.name ?? ''
  }

  function getTimeSlotTime(id: string) {
    const ts = timeSlots.find((t) => t.id === id)
    return ts?.time ?? ''
  }

  function handleDownloadQR() {
    const canvas = qrCanvasRef.current?.querySelector('canvas')
    if (!canvas || !qrOrder) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `ordine-${qrOrder.id}.png`
    a.click()
  }

  if (!currentUser) return null

  // No orders at all
  if (userOrders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl">🍽️</span>
        <p className="text-gray-700 font-medium">Non hai ancora ordinato nulla</p>
        <p className="text-sm text-gray-400">Il tuo primo pasto è a un click di distanza.</p>
        <Link
          to="/menu"
          className="px-6 py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
        >
          Ordina ora →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-lg font-bold text-gray-900">I miei ordini</h1>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#1E6FBF] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value as MealTime | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-[#1E6FBF]"
        >
          <option value="all">Tutti i pasti</option>
          <option value="colazione">Colazione</option>
          <option value="spuntino">Spuntino</option>
          <option value="pranzo">Pranzo</option>
        </select>
      </div>

      {/* Empty filtered state */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="text-4xl">📋</span>
          <p className="text-gray-700 font-medium">Nessun ordine trovato</p>
          <p className="text-sm text-gray-400">Cambia i filtri o ordina il tuo primo pasto!</p>
          <Link
            to="/menu"
            className="text-sm text-[#1E6FBF] font-medium hover:underline"
          >
            Vai al menu →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              pickupName={getPickupName(order.pickupPointId)}
              timeSlotTime={getTimeSlotTime(order.timeSlotId)}
              onShowQR={() => setQrOrderId(order.id)}
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrOrder && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setQrOrderId(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">QR code per il ritiro</h3>
              <button
                onClick={() => setQrOrderId(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <QRCodeSVG
                value={qrOrder.qrCode}
                size={200}
                bgColor="#ffffff"
                fgColor="#1E6FBF"
                level="M"
              />
              <div ref={qrCanvasRef} className="hidden">
                <QRCodeCanvas
                  value={qrOrder.qrCode}
                  size={400}
                  bgColor="#ffffff"
                  fgColor="#1E6FBF"
                  level="M"
                />
              </div>
              <code className="text-xs text-gray-400 font-mono">{qrOrder.qrCode}</code>
              <p className="text-xs text-gray-500">
                Ritiro: {getTimeSlotTime(qrOrder.timeSlotId)}
              </p>
              <p className="text-xs text-gray-500">
                {getPickupName(qrOrder.pickupPointId)}
              </p>
              <button
                onClick={handleDownloadQR}
                className="text-sm text-[#1E6FBF] font-medium hover:underline"
              >
                ⬇ Salva QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface OrderCardProps {
  order: Order
  expanded: boolean
  onToggle: () => void
  pickupName: string
  timeSlotTime: string
  onShowQR: () => void
}

function OrderCard({ order, expanded, onToggle, pickupName, timeSlotTime, onShowQR }: OrderCardProps) {
  const badge = STATUS_BADGE[order.status]
  const showQR = order.status === 'confirmed' || order.status === 'ready'

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
      onClick={onToggle}
    >
      {/* Collapsed content — always visible */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900">
            📅 {formatDateShort(order.date)} · {MEAL_TIME_LABELS[order.mealTime]}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          ⏰ {timeSlotTime}  📍 {pickupName}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{order.items.length} piatti</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {order.totalPrice.toFixed(2).replace('.', ',')} €
            </span>
            <span className={`text-gray-400 text-xs transition-transform ${expanded ? 'rotate-90' : ''}`}>
              ›
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-1.5">
            {order.items.map((item) => (
              <div key={item.dish.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16 shrink-0 uppercase">
                    {COURSE_LABELS[item.dish.course]}
                  </span>
                  <span className="text-gray-900">{item.dish.name}</span>
                </div>
                <span className="text-gray-600 shrink-0 ml-2">
                  {item.dish.price.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2 space-y-1">
            <p className="text-xs text-gray-500">
              Pagamento: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 uppercase">Totale</span>
              <span className="text-sm font-bold text-gray-900">
                {order.totalPrice.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>
          {showQR && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShowQR()
              }}
              className="text-sm text-[#1E6FBF] font-medium hover:underline"
            >
              Mostra QR code
            </button>
          )}
        </div>
      )}
    </div>
  )
}

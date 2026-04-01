import { useState, useMemo, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../hooks/useToast'
import { useNotifications } from '../../hooks/useNotifications'
import { users } from '../../data/mockData'
import type { Order, OrderStatus, MealTime } from '../../types'

type ViewMode = 'table' | 'kanban'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'In attesa' },
  { value: 'confirmed', label: 'Confermato' },
  { value: 'ready', label: 'Pronto' },
  { value: 'collected', label: 'Ritirato' },
  { value: 'cancelled', label: 'Annullato' },
]

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '⏳ In attesa', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '✅ Confermato', className: 'bg-blue-100 text-blue-800' },
  ready: { label: '🔔 Pronto', className: 'bg-green-100 text-green-800' },
  collected: { label: '☑️ Ritirato', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '✖ Annullato', className: 'bg-red-100 text-red-800' },
}

const KANBAN_COLUMNS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'In attesa', icon: '⏳' },
  { status: 'confirmed', label: 'Confermati', icon: '✅' },
  { status: 'ready', label: 'Pronti', icon: '🔔' },
  { status: 'collected', label: 'Ritirati', icon: '☑️' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'collected',
}

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  colazione: 'Colazione',
  spuntino: 'Spuntino',
  pranzo: 'Pranzo',
  cena: 'Cena',
}

const PAGE_SIZE = 10

function getUserName(userId: string): string {
  return users.find((u) => u.id === userId)?.name ?? userId
}

export default function AdminOrdersPage() {
  const { orders, pickupPoints, timeSlots, updateOrderStatus } = useApp()
  const { showToast } = useToast()
  const { sendPushNotification } = useNotifications()

  const [view, setView] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [pickupFilter, setPickupFilter] = useState<string | 'all'>('all')
  const [page, setPage] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null)

  // Refresh timestamp every 30s
  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const todayISO = new Date().toISOString().split('T')[0]

  const todayOrders = useMemo(
    () => orders.filter((o) => o.date === todayISO),
    [orders, todayISO]
  )

  // KPIs
  const kpis = useMemo(() => ({
    total: todayOrders.length,
    confirmed: todayOrders.filter((o) => o.status === 'confirmed').length,
    ready: todayOrders.filter((o) => o.status === 'ready').length,
    revenue: todayOrders.reduce((s, o) => s + o.totalPrice, 0),
  }), [todayOrders])

  // Table filtered orders
  const filteredOrders = useMemo(() => {
    return todayOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (pickupFilter !== 'all' && o.pickupPointId !== pickupFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = getUserName(o.userId).toLowerCase()
        if (!name.includes(q) && !o.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [todayOrders, statusFilter, pickupFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const pagedOrders = filteredOrders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page when filters change
  useEffect(() => setPage(0), [search, statusFilter, pickupFilter])

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
    if (newStatus === 'ready') {
      sendPushNotification({
        title: 'Il tuo pasto è pronto! 🔔',
        body: 'Ritira entro 15 minuti.',
      })
    }
    showToast('Stato aggiornato', 'success')
  }, [updateOrderStatus, sendPushNotification, showToast])

  function getTimeSlotTime(id: string) {
    return timeSlots.find((t) => t.id === id)?.time ?? ''
  }

  function getPickupName(id: string) {
    return pickupPoints.find((p) => p.id === id)?.name ?? ''
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, orderId: string) {
    e.dataTransfer.setData('text/plain', orderId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, status: OrderStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(status)
  }

  function handleDragLeave() {
    setDragOverCol(null)
  }

  function handleDrop(e: React.DragEvent, status: OrderStatus) {
    e.preventDefault()
    setDragOverCol(null)
    const orderId = e.dataTransfer.getData('text/plain')
    if (orderId) handleStatusChange(orderId, status)
  }

  function handleAdvance(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (next) handleStatusChange(order.id, next)
  }

  const timeStr = lastUpdated.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-gray-900">Ordini</h1>
        <span className="text-xs text-gray-400">Aggiornato alle {timeStr}</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon="📋" value={kpis.total} label="Ordini oggi" />
        <KPICard icon="✅" value={kpis.confirmed} label="Confermati" />
        <KPICard icon="🔔" value={kpis.ready} label="Pronti" />
        <KPICard icon="💰" value={`${kpis.revenue.toFixed(2).replace('.', ',')} €`} label="Incasso oggi" />
      </div>

      {/* View toggle */}
      <div className="flex justify-end gap-1">
        <button
          onClick={() => setView('table')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            view === 'table' ? 'bg-[#1E6FBF] text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          ☰ Tabella
        </button>
        <button
          onClick={() => setView('kanban')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            view === 'kanban' ? 'bg-[#1E6FBF] text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          ▦ Kanban
        </button>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Cerca utente o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E6FBF]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1E6FBF]"
            >
              <option value="all">Tutti gli stati</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={pickupFilter}
              onChange={(e) => setPickupFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1E6FBF]"
            >
              <option value="all">Tutti i punti</option>
              {pickupPoints.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">ID</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500">Utente</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 hidden sm:table-cell">Pasto</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 hidden sm:table-cell">Orario</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-500 hidden md:table-cell">Ritiro</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-500">Totale</th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-500">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedOrders.map((order) => {
                  const badge = STATUS_BADGE[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-[100px]">
                        {order.id.slice(0, 12)}
                      </td>
                      <td className="px-3 py-3 text-gray-900">{getUserName(order.userId)}</td>
                      <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">
                        {MEAL_TIME_LABELS[order.mealTime]}
                      </td>
                      <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">
                        {getTimeSlotTime(order.timeSlotId)}
                      </td>
                      <td className="px-3 py-3 text-gray-500 hidden md:table-cell">
                        {getPickupName(order.pickupPointId)}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-gray-700">
                        {order.totalPrice.toFixed(2).replace('.', ',')} €
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#1E6FBF]"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
                {pagedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-8">
                      Nessun ordine trovato.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                ← Prec
              </button>
              <span className="text-xs text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Succ →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colOrders = todayOrders.filter((o) => o.status === col.status)
            const isDragOver = dragOverCol === col.status
            return (
              <div
                key={col.status}
                className={`shrink-0 w-64 bg-gray-50 rounded-xl border-2 transition-colors ${
                  isDragOver ? 'border-[#1E6FBF] border-dashed' : 'border-gray-200'
                }`}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                {/* Column header */}
                <div className="px-3 py-2.5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {col.icon} {col.label}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[100px]">
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-gray-400 truncate">{order.id.slice(0, 12)}</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{getUserName(order.userId)}</p>
                          <p className="text-xs text-gray-500">
                            {MEAL_TIME_LABELS[order.mealTime]} {getTimeSlotTime(order.timeSlotId)}
                          </p>
                        </div>
                        {NEXT_STATUS[order.status] && (
                          <button
                            onClick={() => handleAdvance(order)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[#1E6FBF] hover:text-white text-xs transition-colors"
                            title="Avanza stato"
                          >
                            →
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{getPickupName(order.pickupPointId)}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {order.totalPrice.toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Nessun ordine</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function KPICard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

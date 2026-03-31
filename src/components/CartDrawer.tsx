import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import type { MealCourse } from '../types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

const COURSE_ORDER: MealCourse[] = ['primo', 'secondo', 'contorno', 'dessert', 'bevanda']

const COURSE_EMOJI: Record<MealCourse, string> = {
  primo: '🍝',
  secondo: '🥩',
  contorno: '🥗',
  dessert: '🍮',
  bevanda: '🥤',
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, clearCart, totalPrice, itemCount } = useCart()
  const navigate = useNavigate()

  // Sort items by course order
  const sortedItems = [...items].sort(
    (a, b) => COURSE_ORDER.indexOf(a.dish.course) - COURSE_ORDER.indexOf(b.dish.course)
  )

  function handleProceed() {
    onClose()
    navigate('/order/new')
  }

  function handleClear() {
    clearCart()
    onClose()
  }

  function handleGoToMenu() {
    onClose()
    navigate('/menu')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Desktop: slide-in from right */}
      <div className="hidden md:block fixed top-0 right-0 bottom-0 w-80 bg-white shadow-xl z-50 animate-slide-in-right">
        <DrawerContent
          sortedItems={sortedItems}
          itemCount={itemCount}
          totalPrice={totalPrice}
          removeItem={removeItem}
          onProceed={handleProceed}
          onClear={handleClear}
          onGoToMenu={handleGoToMenu}
          onClose={onClose}
        />
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 max-h-[70vh] bg-white rounded-t-2xl shadow-xl z-50 animate-slide-in-up overflow-y-auto">
        <DrawerContent
          sortedItems={sortedItems}
          itemCount={itemCount}
          totalPrice={totalPrice}
          removeItem={removeItem}
          onProceed={handleProceed}
          onClear={handleClear}
          onGoToMenu={handleGoToMenu}
          onClose={onClose}
        />
      </div>
    </>
  )
}

interface DrawerContentProps {
  sortedItems: { dish: { id: string; name: string; price: number; course: MealCourse }; quantity: 1 }[]
  itemCount: number
  totalPrice: number
  removeItem: (dishId: string) => void
  onProceed: () => void
  onClear: () => void
  onGoToMenu: () => void
  onClose: () => void
}

function DrawerContent({
  sortedItems,
  itemCount,
  totalPrice,
  removeItem,
  onProceed,
  onClear,
  onGoToMenu,
  onClose,
}: DrawerContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Handle bar (mobile) */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Il tuo ordine</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {itemCount === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-400 text-sm">Nessun piatto selezionato</p>
            <button
              onClick={onGoToMenu}
              className="text-sm text-[#1E6FBF] font-medium hover:underline"
            >
              Vai al menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div key={item.dish.id} className="flex items-start justify-between">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-lg shrink-0">{COURSE_EMOJI[item.dish.course]}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.dish.name}</p>
                    <button
                      onClick={() => removeItem(item.dish.id)}
                      className="text-[11px] text-red-500 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 shrink-0 ml-2">
                  {item.dish.price.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {itemCount > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 uppercase">Totale</span>
            <span className="text-base font-bold text-gray-900">
              {totalPrice.toFixed(2).replace('.', ',')} €
            </span>
          </div>
          <button
            onClick={onProceed}
            className="w-full py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
          >
            Procedi alla prenotazione →
          </button>
          <button
            onClick={onClear}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Svuota carrello
          </button>
        </div>
      )}
    </div>
  )
}

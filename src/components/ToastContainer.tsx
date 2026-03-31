import { useToast } from '../hooks/useToast'
import type { ToastVariant } from '../context/ToastContext'

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string }> = {
  success: { border: 'border-l-green-500', icon: '✓' },
  error: { border: 'border-l-red-500', icon: '✗' },
  info: { border: 'border-l-[#1E6FBF]', icon: 'ℹ' },
  warning: { border: 'border-l-amber-500', icon: '⚠' },
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-[72px] md:bottom-4 right-4 left-4 md:left-auto md:w-80 z-[60] flex flex-col gap-2 items-center md:items-end pointer-events-none">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full bg-white shadow-lg rounded-lg border border-gray-200 border-l-4 ${style.border} px-4 py-3 flex items-center gap-3 animate-slide-in-up`}
          >
            <span className="text-sm font-bold shrink-0">{style.icon}</span>
            <span className="text-sm text-gray-700 flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 text-lg shrink-0"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

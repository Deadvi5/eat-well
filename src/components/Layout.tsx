import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'
import InstallBanner from './InstallBanner'
import OnboardingModal from './OnboardingModal'
import type { UserRole } from '../types'

interface NavItem {
  to: string
  icon: string
  label: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/menu', icon: '🍽️', label: 'Menu' },
  { to: '/order/new', icon: '🛒', label: 'Ordina' },
  { to: '/orders', icon: '📋', label: 'I miei ordini' },
  { to: '/profile', icon: '👤', label: 'Profilo' },
  { to: '/admin/menu', icon: '📝', label: 'Admin Menu', adminOnly: true },
  { to: '/admin/orders', icon: '📊', label: 'Admin Ordini', adminOnly: true },
]

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Dipendente',
  patient: 'Paziente',
  admin: 'Admin',
}

const ROLE_COLORS: Record<UserRole, string> = {
  employee: 'bg-blue-100 text-blue-800',
  patient: 'bg-green-100 text-green-800',
  admin: 'bg-amber-100 text-amber-800',
}

function getVisibleItems(role: UserRole) {
  return NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')
}

export default function Layout() {
  const { currentUser, logout } = useApp()
  const { itemCount } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  // ProtectedRoute handles redirects, but guard for type safety
  if (!currentUser) return null

  const items = getVisibleItems(currentUser.role)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 text-[#1E6FBF] font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs transition-colors ${
      isActive ? 'text-[#1E6FBF] font-medium' : 'text-gray-500'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏥</span>
          <span className="text-[#1E6FBF] font-semibold text-sm md:text-base">
            Mensa Ospedale San Marco
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 hidden sm:inline">{currentUser.name}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[currentUser.role]}`}>
            {ROLE_LABELS[currentUser.role]}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 ml-2"
          >
            Esci
          </button>
        </div>
      </header>

      <InstallBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <nav className="hidden md:flex flex-col w-[220px] bg-white border-r border-gray-200 p-3 gap-1 shrink-0">
          {items.map((item) =>
            item.to === '/order/new' ? (
              <button
                key={item.to}
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 text-left relative"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {itemCount > 0 && (
                  <span className="absolute top-1 left-7 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            ) : (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden flex justify-around items-center bg-white border-t border-gray-200 py-2 shrink-0">
        {items.map((item) =>
          item.to === '/order/new' ? (
            <button
              key={item.to}
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center gap-0.5 text-xs text-gray-500 relative"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 right-0 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          ) : (
            <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* Cart drawer */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Onboarding */}
      <OnboardingModal />
    </div>
  )
}

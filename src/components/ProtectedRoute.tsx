import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== 'admin' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/menu" replace />
  }

  return <>{children}</>
}

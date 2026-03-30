import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import OrderNewPage from './pages/OrderNewPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import ProfilePage from './pages/ProfilePage'
import AdminMenuPage from './pages/admin/AdminMenuPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order/new" element={<OrderNewPage />} />
        <Route path="/order/:id/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  )
}

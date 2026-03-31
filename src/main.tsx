import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <AppProvider>
          <CartProvider>
            <App />
            <ToastContainer />
          </CartProvider>
        </AppProvider>
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
)

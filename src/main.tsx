import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { CartProvider } from './context/CartContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AppProvider>
    </HashRouter>
  </StrictMode>,
)

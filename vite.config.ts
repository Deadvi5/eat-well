import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/eat-well/',
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' })
  ]
})

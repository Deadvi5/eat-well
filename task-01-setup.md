# Task 01 — Project setup

## Goal

Scaffold the Vite + React + TypeScript project with all dependencies configured and a working layout shell.

## Steps

### 1. Initialize project

```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install dependencies

```bash
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D vite-plugin-pwa
npm install qrcode.react
npx tailwindcss init -p
```

### 3. Configure Tailwind

In `tailwind.config.js`, set content paths:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

In `src/index.css`, replace content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Configure Vite

In `vite.config.ts`, add the PWA plugin (minimal config for now — full config comes in task-13):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' })
  ]
})
```

### 5. Folder structure

Create these empty folders under `src/`:

```
src/
  assets/
  components/
  context/
  data/
  hooks/
  pages/
    admin/
  types/
  utils/
```

### 6. Router setup

Create `src/main.tsx` with `BrowserRouter` wrapping `<App />`.

Create `src/App.tsx` with `<Routes>`:

```
/login          → LoginPage (placeholder)
/menu           → MenuPage (placeholder)
/order/new      → OrderNewPage (placeholder)
/order/:id/confirmation → OrderConfirmationPage (placeholder)
/orders         → OrderHistoryPage (placeholder)
/profile        → ProfilePage (placeholder)
/admin/menu     → AdminMenuPage (placeholder)
/admin/orders   → AdminOrdersPage (placeholder)
/               → redirect to /menu
```

All placeholder pages just render a `<div>` with the page name for now.

### 7. Layout shell

Create `src/components/Layout.tsx` used as the wrapper for all authenticated routes. It must include:

**Header** (top bar, full width):
- Left: hospital icon (🏥) + text "Mensa Ospedale Sant'Orsola" in primary blue
- Right: user name + role badge + logout button
- Height: 56px, white background, bottom border

**Sidebar** (desktop ≥768px, left side, 220px wide):
- Navigation links: Menu (🍽️), Ordina (🛒), I miei ordini (📋), Profilo (👤)
- If role is `admin`: additional links Admin Menu and Admin Ordini
- Active link highlighted in blue
- White background, right border

**Bottom navigation** (mobile <768px):
- Same links as sidebar, icons only + label
- Fixed at bottom, white background, top border

**Main content area**: takes remaining space, scrollable, padding 16px.

Add a redirect: any route that is not `/login` and has no authenticated user → redirect to `/login`.

### 8. Verify

Run `npm run dev`. App should load at localhost:5173 with the layout shell visible and placeholder pages navigable via the nav links. No TypeScript or console errors.

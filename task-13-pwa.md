# Task 13 — PWA manifest, service worker, and install banner

## Goal

Make the app fully installable as a PWA with offline support and a native install prompt.

## Steps

### 1. Icons

Create `public/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#1E6FBF"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white">🍽️</text>
</svg>
```

Generate PNG icons using a small script:

```bash
npm install -D sharp
node scripts/generateIcons.mjs
```

```js
// scripts/generateIcons.mjs
import sharp from 'sharp'

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#1E6FBF"/>
  <text x="256" y="360" font-size="300" text-anchor="middle" font-family="serif" fill="white">🍽</text>
</svg>`)

await sharp(svg).resize(192).toFile('public/icon-192.png')
await sharp(svg).resize(512).toFile('public/icon-512.png')
await sharp(svg).resize(180).toFile('public/apple-touch-icon.png')
await sharp(svg).resize(32).toFile('public/favicon.png')
```

### 2. Vite PWA config — `vite.config.ts`

Replace the minimal PWA config from task-01 with the full version:

```ts
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
  manifest: {
    name: "Mensa Ospedale Sant'Orsola",
    short_name: 'MensaSantOrsola',
    description: 'Prenota i pasti della mensa ospedaliera',
    theme_color: '#1E6FBF',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/offline.html',
    navigateFallbackDenylist: [/^\/api/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
})
```

### 3. Offline fallback — `public/offline.html`

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline – Mensa Sant'Orsola</title>
  <style>
    body {
      font-family: sans-serif; display: flex; flex-direction: column;
      align-items: center; justify-content: center; min-height: 100vh;
      margin: 0; background: #f8f9fa; color: #333; text-align: center; padding: 24px;
    }
    h1 { font-size: 1.5rem; margin-top: 16px; }
    p  { color: #666; max-width: 320px; line-height: 1.6; }
    a  { color: #1E6FBF; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div style="font-size:4rem">📡</div>
  <h1>Sei offline</h1>
  <p>Non è stato possibile caricare la pagina. Controlla la connessione e <a href="/">riprova</a>.</p>
  <p>Le tue ultime prenotazioni sono disponibili nella sezione <a href="/orders">I miei ordini</a>.</p>
</body>
</html>
```

### 4. Install banner — `src/components/InstallBanner.tsx`

Listen for the `beforeinstallprompt` event. When fired, save the event and show a dismissible banner between the header and the main content in `Layout.tsx`.

```tsx
// InstallBanner.tsx
export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already standalone or dismissed recently
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between gap-4">
      <span className="text-sm text-blue-800">
        📲 Installa l'app per accedere più velocemente
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
        >
          Installa ora
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          aria-label="Chiudi"
        >
          ×
        </button>
      </div>
    </div>
  )
}
```

Add `declare global { interface Window { BeforeInstallPromptEvent: any } }` or create a type declaration for `BeforeInstallPromptEvent` in `src/types/index.ts`.

Add `<InstallBanner />` inside `Layout.tsx`, just below the `<header>` element.

### 5. Verify

```bash
npm run build
npm run preview
```

- DevTools → Application → Manifest: verify name, icons, theme_color are populated correctly
- DevTools → Application → Service Workers: SW is registered and activated
- Throttle network to Offline → navigate to a cached route → loads from cache
- Throttle to Offline → navigate to an uncached route → offline.html is shown
- Run Lighthouse → PWA score ≥ 90

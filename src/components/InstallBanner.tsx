import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setPrompt(e)
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

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    emoji: '🍽️',
    title: 'Benvenuto nella Mensa Digitale',
    body: 'Consulta il menu del giorno, filtra per allergie e preferenze dietetiche.',
  },
  {
    emoji: '📅',
    title: 'Prenota il tuo pasto',
    body: 'Scegli data, orario e punto di ritiro. Paga con carta, wallet o busta paga.',
  },
  {
    emoji: '📲',
    title: 'Ritiro veloce con QR code',
    body: 'Il tuo QR personale è sempre disponibile nella sezione I miei ordini.',
  },
]

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem('onboarding_done')) {
      setVisible(true)
    }
  }, [])

  function close() {
    localStorage.setItem('onboarding_done', 'true')
    setVisible(false)
  }

  function next() {
    if (slide === SLIDES.length - 1) {
      close()
    } else {
      setSlide((s) => s + 1)
    }
  }

  if (!visible) return null

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[480px] w-full p-8 text-center relative">
        {/* Skip */}
        {!isLast && (
          <button
            onClick={close}
            className="absolute top-4 right-4 text-sm text-gray-400 hover:text-gray-600"
          >
            Salta
          </button>
        )}

        <span className="text-6xl block mb-4">{current.emoji}</span>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">{current.body}</p>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === slide ? 'bg-[#1E6FBF]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-2.5 bg-[#1E6FBF] text-white text-sm font-medium rounded-lg hover:bg-[#1859a0] transition-colors"
        >
          {isLast ? 'Inizia' : 'Avanti'}
        </button>
      </div>
    </div>
  )
}

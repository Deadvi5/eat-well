import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const profiles = [
  {
    userId: 'u1',
    icon: '👔',
    label: 'Dipendente',
    name: 'Marco Rossi',
    sub: 'Badge EMP-4421 · Accesso SSO aziendale',
    accent: 'border-[#1E6FBF] hover:shadow-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    userId: 'u2',
    icon: '🛏️',
    label: 'Paziente',
    name: 'Anna Bianchi',
    sub: 'Stanza 307-B · Account degenza',
    accent: 'border-[#2E9E6B] hover:shadow-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  {
    userId: 'u3',
    icon: '👩‍💼',
    label: 'Admin Mensa',
    name: 'Giulia Ferrari',
    sub: 'Pannello di amministrazione',
    accent: 'border-amber-400 hover:shadow-amber-200',
    badge: 'bg-amber-100 text-amber-800',
  },
] as const

export default function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()

  function handleLogin(userId: string) {
    login(userId)
    navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <span className="text-5xl">🏥</span>
        <h1 className="text-2xl font-bold text-[#1E6FBF] mt-3">
          Mensa Ospedale San Marco
        </h1>
        <p className="text-gray-500 mt-2">
          Seleziona il tuo profilo per accedere
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {profiles.map((p) => (
          <button
            key={p.userId}
            onClick={() => handleLogin(p.userId)}
            className={`flex items-center gap-4 w-full p-4 bg-white rounded-xl border-2 ${p.accent} shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all text-left cursor-pointer`}
          >
            <span className="text-3xl">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{p.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.badge}`}>
                  {p.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{p.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Ambiente demo — nessuna credenziale richiesta
      </p>
    </div>
  )
}

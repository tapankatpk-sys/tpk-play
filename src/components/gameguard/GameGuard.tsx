'use client'

import { useState, useEffect, ReactNode } from 'react'

// ============================================
// GAMEGUARD - Código TPK obligatorio para TODOS los juegos
// ============================================

interface UserInfo {
  code: string
  name: string
  teamSlug: string
  email: string
}

interface GameGuardProps {
  children: ReactNode
  gameName: string
  gameIcon?: string
  accentColor?: string
}

const PNG_ONLY_TEAMS = ['internacional-de-bogota']

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

const TEAM_NAMES: Record<string, string> = {
  'aguilas-doradas': 'Águilas Doradas', 'alianza-valledupar': 'Alianza Valledupar',
  'america-de-cali': 'América de Cali', 'atletico-bucaramanga': 'Atl. Bucaramanga',
  'atletico-junior': 'Atl. Junior', 'atletico-nacional': 'Atl. Nacional',
  'boyaca-chico': 'Boyacá Chicó', 'cucuta-deportivo': 'Cúcuta Deportivo',
  'deportes-tolima': 'Deportes Tolima', 'deportivo-cali': 'Deportivo Cali',
  'deportivo-pasto': 'Deportivo Pasto', 'deportivo-pereira': 'Deportivo Pereira',
  'fortaleza-ceif': 'Fortaleza CEIF', 'independiente-medellin': 'Ind. Medellín',
  'independiente-santa-fe': 'Ind. Santa Fe', 'internacional-de-bogota': 'Internacional',
  'jaguares-de-cordoba': 'Jaguares', 'llaneros': 'Llaneros',
  'millonarios': 'Millonarios', 'once-caldas': 'Once Caldas',
}

export default function GameGuard({ children, gameName, gameIcon = '🎮', accentColor = '#a855f7' }: GameGuardProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [tpkCode, setTpkCode] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showGuard, setShowGuard] = useState(true)

  // Check if user is already verified from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem('tpk_user_code')
    const savedName = localStorage.getItem('tpk_user_name')
    const savedTeam = localStorage.getItem('tpk_user_team')
    const savedEmail = localStorage.getItem('tpk_user_email')

    if (savedCode && savedName) {
      setUserInfo({
        code: savedCode,
        name: savedName,
        teamSlug: savedTeam || '',
        email: savedEmail || '',
      })
      setIsVerified(true)
      setShowGuard(false)
    }
  }, [])

  const handleVerify = async () => {
    setError('')
    if (!tpkCode.trim()) {
      setError('Ingresa tu código TPK')
      return
    }

    setVerifying(true)
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tpkCode.trim().toUpperCase() }),
      })
      if (res.ok) {
        const me = await res.json()

        const info: UserInfo = {
          code: me.code,
          name: me.name,
          teamSlug: me.teamSlug || '',
          email: me.email,
        }

        // Save to localStorage for persistence across games
        localStorage.setItem('tpk_user_code', info.code)
        localStorage.setItem('tpk_user_name', info.name)
        localStorage.setItem('tpk_user_team', info.teamSlug)
        localStorage.setItem('tpk_user_email', info.email)

        setUserInfo(info)
        setIsVerified(true)
        setTimeout(() => setShowGuard(false), 300)
      } else {
        const data = await res.json()
        setError(data.error || 'Código TPK no registrado. Regístrate primero.')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setVerifying(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('tpk_user_code')
    localStorage.removeItem('tpk_user_name')
    localStorage.removeItem('tpk_user_team')
    localStorage.removeItem('tpk_user_email')
    setIsVerified(false)
    setUserInfo(null)
    setShowGuard(true)
    setTpkCode('')
  }

  // If verified, render the game with user info context
  if (isVerified && !showGuard) {
    return (
      <div className="relative">
        {/* User info bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            {userInfo?.teamSlug && (
              <img
                src={getTeamShield(userInfo.teamSlug)}
                alt={userInfo.teamSlug}
                className="w-4 h-4 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <span className="text-[0.55rem] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              {userInfo?.name}
            </span>
            <span className="text-[0.5rem] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {userInfo?.code}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[0.5rem] uppercase tracking-wider cursor-pointer px-2 py-1 rounded transition-all hover:bg-white/5"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Salir
          </button>
        </div>
        {children}
      </div>
    )
  }

  // Guard overlay - locked state
  return (
    <div className="relative">
      {/* Blurred game preview behind */}
      <div style={{ filter: 'blur(4px) brightness(0.3)', pointerEvents: 'none' }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center z-50 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="max-w-sm w-full mx-4 p-6 rounded-2xl text-center space-y-4"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,5,20,0.98) 100%)',
            border: `2px solid ${accentColor}40`,
            boxShadow: `0 0 30px ${accentColor}15, 0 0 60px ${accentColor}08`,
          }}
        >
          {/* Lock icon */}
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              border: `2px solid ${accentColor}40`,
              boxShadow: `0 0 15px ${accentColor}25`,
            }}
          >
            <span className="text-3xl">{gameIcon}</span>
          </div>

          {/* Game name */}
          <div>
            <h4
              className="text-sm font-black uppercase tracking-wider"
              style={{
                color: accentColor,
                textShadow: `0 0 10px ${accentColor}50`,
              }}
            >
              {gameName}
            </h4>
            <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Debes estar registrado para participar
            </p>
          </div>

          {/* Info badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            <div className="px-2 py-1 rounded-md" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
              <span className="text-[0.5rem] font-bold" style={{ color: `${accentColor}99` }}>Registro obligatorio</span>
            </div>
            <div className="px-2 py-1 rounded-md" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-[0.5rem] font-bold" style={{ color: 'rgba(34,197,94,0.7)' }}>Código TPK requerido</span>
            </div>
          </div>

          {/* Code input */}
          {!isVerified && (
            <div className="space-y-3">
              <input
                type="text"
                value={tpkCode}
                onChange={(e) => setTpkCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código TPK"
                maxLength={9}
                className="w-full px-4 py-3 rounded-xl text-center text-sm font-mono font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `2px solid ${accentColor}25`,
                  color: accentColor,
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />

              {error && (
                <p className="text-[0.6rem] font-bold" style={{ color: '#ef4444' }}>{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: '#fff',
                  boxShadow: `0 0 15px ${accentColor}40`,
                }}
              >
                {verifying ? 'Verificando...' : 'Ingresar'}
              </button>

              <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Si no tienes código, regístrate abajo en la sección de registro
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

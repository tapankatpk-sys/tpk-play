'use client'

import { useState, useEffect, ReactNode } from 'react'

// ============================================
// GAMEGUARD - Código TPK obligatorio para TODOS los juegos
// OPTIMIZADO: No renderiza el juego cuando está bloqueado
// Solo renderiza un placeholder ligero en vez del juego completo difuminado
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
  const [mounted, setMounted] = useState(false)

  // Check if user is already verified from localStorage
  useEffect(() => {
    setMounted(true)
    try {
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
      }
    } catch {
      // localStorage not available
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

        try {
          localStorage.setItem('tpk_user_code', info.code)
          localStorage.setItem('tpk_user_name', info.name)
          localStorage.setItem('tpk_user_team', info.teamSlug)
          localStorage.setItem('tpk_user_email', info.email)
        } catch {
          // localStorage not available
        }

        setUserInfo(info)
        setIsVerified(true)
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
    try {
      localStorage.removeItem('tpk_user_code')
      localStorage.removeItem('tpk_user_name')
      localStorage.removeItem('tpk_user_team')
      localStorage.removeItem('tpk_user_email')
    } catch {
      // localStorage not available
    }
    setIsVerified(false)
    setUserInfo(null)
    setTpkCode('')
  }

  // If verified, render the game with user info context
  if (isVerified && mounted) {
    return (
      <div className="relative">
        {/* User info bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 md:gap-2">
            {userInfo?.teamSlug && (
              <img
                src={getTeamShield(userInfo.teamSlug)}
                alt={userInfo.teamSlug}
                className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <span className="text-[0.5rem] md:text-[0.55rem] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              {userInfo?.name}
            </span>
            <span className="text-[0.45rem] md:text-[0.5rem] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {userInfo?.code}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[0.45rem] md:text-[0.5rem] uppercase tracking-wider cursor-pointer px-1.5 md:px-2 py-0.5 md:py-1 rounded transition-all hover:bg-white/5"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Salir
          </button>
        </div>
        {children}
      </div>
    )
  }

  // Lock overlay - OPTIMIZED: lightweight placeholder instead of rendering full game blurred
  return (
    <div className="relative">
      {/* Lightweight blurred placeholder instead of rendering full game */}
      <div
        className="rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          border: `1px solid ${accentColor}15`,
          minHeight: '200px',
          filter: 'blur(2px) brightness(0.3)',
          pointerEvents: 'none',
        }}
      />

      {/* Lock overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center z-50 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="max-w-xs md:max-w-sm w-full mx-3 md:mx-4 p-4 md:p-6 rounded-2xl text-center space-y-3 md:space-y-4"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,5,20,0.98) 100%)',
            border: `2px solid ${accentColor}40`,
            boxShadow: `0 0 30px ${accentColor}15, 0 0 60px ${accentColor}08`,
          }}
        >
          {/* Lock icon */}
          <div
            className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              border: `2px solid ${accentColor}40`,
              boxShadow: `0 0 15px ${accentColor}25`,
            }}
          >
            <span className="text-2xl md:text-3xl">{gameIcon}</span>
          </div>

          {/* Game name */}
          <div>
            <h4
              className="text-xs md:text-sm font-black uppercase tracking-wider"
              style={{
                color: accentColor,
                textShadow: `0 0 10px ${accentColor}50`,
              }}
            >
              {gameName}
            </h4>
            <p className="text-[0.5rem] md:text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Debes estar registrado para participar
            </p>
          </div>

          {/* Info badges */}
          <div className="flex justify-center gap-1.5 md:gap-2 flex-wrap">
            <div className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-md" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
              <span className="text-[0.4rem] md:text-[0.5rem] font-bold" style={{ color: `${accentColor}99` }}>Registro obligatorio</span>
            </div>
            <div className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-md" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-[0.4rem] md:text-[0.5rem] font-bold" style={{ color: 'rgba(34,197,94,0.7)' }}>Código TPK requerido</span>
            </div>
          </div>

          {/* Code input */}
          {!isVerified && (
            <div className="space-y-2 md:space-y-3">
              <input
                type="text"
                value={tpkCode}
                onChange={(e) => setTpkCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código TPK"
                maxLength={9}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-center text-xs md:text-sm font-mono font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `2px solid ${accentColor}25`,
                  color: accentColor,
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />

              {error && (
                <p className="text-[0.5rem] md:text-[0.6rem] font-bold" style={{ color: '#ef4444' }}>{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: '#fff',
                  boxShadow: `0 0 15px ${accentColor}40`,
                }}
              >
                {verifying ? 'Verificando...' : 'Ingresar'}
              </button>

              <p className="text-[0.4rem] md:text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Si no tienes código, regístrate abajo en la sección de registro
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

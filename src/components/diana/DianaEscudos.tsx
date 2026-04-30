'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// 20 Liga BetPlay teams
const TEAMS = [
  { slug: 'aguilas-doradas', name: 'Águilas Doradas' },
  { slug: 'alianza-valledupar', name: 'Alianza Valledupar' },
  { slug: 'america-de-cali', name: 'América de Cali' },
  { slug: 'atletico-bucaramanga', name: 'Atl. Bucaramanga' },
  { slug: 'atletico-junior', name: 'Atl. Junior' },
  { slug: 'atletico-nacional', name: 'Atl. Nacional' },
  { slug: 'boyaca-chico', name: 'Boyacá Chicó' },
  { slug: 'cucuta-deportivo', name: 'Cúcuta Deportivo' },
  { slug: 'deportes-tolima', name: 'Deportes Tolima' },
  { slug: 'deportivo-cali', name: 'Deportivo Cali' },
  { slug: 'deportivo-pasto', name: 'Deportivo Pasto' },
  { slug: 'deportivo-pereira', name: 'Deportivo Pereira' },
  { slug: 'fortaleza-ceif', name: 'Fortaleza CEIF' },
  { slug: 'independiente-medellin', name: 'Ind. Medellín' },
  { slug: 'independiente-santa-fe', name: 'Ind. Santa Fe' },
  { slug: 'internacional-de-bogota', name: 'Internacional' },
  { slug: 'jaguares-de-cordoba', name: 'Jaguares de Córdoba' },
  { slug: 'llaneros', name: 'Llaneros' },
  { slug: 'millonarios', name: 'Millonarios' },
  { slug: 'once-caldas', name: 'Once Caldas' },
]

const PNG_ONLY = ['internacional-de-bogota']

function getTeamImage(slug: string): string {
  const ext = PNG_ONLY.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

// Deterministic team selection based on current hour
function getHourlyTeam(): { slug: string; name: string } {
  const now = new Date()
  const hourKey = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  const index = hourKey % TEAMS.length
  return TEAMS[index]
}

interface HitEffect {
  x: number
  y: number
  points: number
  zone: 'center' | 'middle' | 'edge'
  id: number
}

interface Config {
  roundsPerGame: number
  pointsCenter: number
  pointsMiddle: number
  pointsEdge: number
  speed: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

const ACCENT = '#ef4444'
const ACCENT_LIGHT = 'rgba(239,68,68,0.3)'
const ACCENT_GLOW = 'rgba(239,68,68,0.5)'

export default function DianaEscudos() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [currentRound, setCurrentRound] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timer, setTimer] = useState(0)
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([])
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
  const [isHitAnimating, setIsHitAnimating] = useState(false)
  const [speedDisplay, setSpeedDisplay] = useState(1)
  const targetRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animFrameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const posRef = useRef({ x: 50, y: 50 })
  const speedRef = useRef(1)
  const directionRef = useRef({ dx: 1, dy: 0.7 })
  const effectIdRef = useRef(0)

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_diana_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/diana')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching diana config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Update team every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTeam = getHourlyTeam()
      if (newTeam.slug !== team.slug) {
        setTeam(newTeam)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [team.slug])

  // Check if already played this hour
  useEffect(() => {
    const played = localStorage.getItem(getHourKey())
    if (played) {
      setPhase('played')
    }
  }, [getHourKey])

  // Timer management
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const next = prev + 1
          if (config?.timeLimit && config.timeLimit > 0 && next >= config.timeLimit) {
            setPhase('timeout')
            return config.timeLimit
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase, config?.timeLimit])

  // Target animation loop
  useEffect(() => {
    if (phase !== 'playing') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      return
    }

    const animate = () => {
      const speed = speedRef.current * 0.3
      let x = posRef.current.x + directionRef.current.dx * speed
      let y = posRef.current.y + directionRef.current.dy * speed

      // Bounce off walls (keep within 10-90% range)
      if (x <= 10 || x >= 90) {
        directionRef.current.dx *= -1
        x = Math.max(10, Math.min(90, x))
      }
      if (y <= 10 || y >= 90) {
        directionRef.current.dy *= -1
        y = Math.max(10, Math.min(90, y))
      }

      posRef.current = { x, y }
      setTargetPos({ x, y })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [phase])

  const handleStart = useCallback(() => {
    if (!config) return
    setCurrentRound(0)
    setTotalPoints(0)
    setHits(0)
    setMisses(0)
    setTimer(0)
    setHitEffects([])
    setIsHitAnimating(false)
    const initialSpeed = config.speed
    speedRef.current = initialSpeed
    setSpeedDisplay(initialSpeed)
    directionRef.current = { dx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.4), dy: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.4) }
    posRef.current = { x: 50, y: 50 }
    setTargetPos({ x: 50, y: 50 })
    setPhase('playing')
  }, [config])

  const handleShoot = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!config || phase !== 'playing' || isHitAnimating) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100

    // Calculate distance from target center
    const dx = clickX - targetPos.x
    const dy = clickY - targetPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Determine zone
    let zone: 'center' | 'middle' | 'edge'
    let points: number
    if (distance <= 8) {
      zone = 'center'
      points = config.pointsCenter
    } else if (distance <= 20) {
      zone = 'middle'
      points = config.pointsMiddle
    } else if (distance <= 35) {
      zone = 'edge'
      points = config.pointsEdge
    } else {
      // Miss
      setMisses(prev => prev + 1)
      const newRound = currentRound + 1
      setCurrentRound(newRound)
      if (newRound >= config.roundsPerGame) {
        setTimeout(() => setPhase('won'), 500)
      }
      // Increase speed each round
      const newSpeed = config.speed + (newRound * 0.5)
      speedRef.current = newSpeed
      setSpeedDisplay(newSpeed)
      return
    }

    setHits(prev => prev + 1)
    setTotalPoints(prev => prev + points)
    setIsHitAnimating(true)

    // Add hit effect
    const effect: HitEffect = {
      x: clickX,
      y: clickY,
      points,
      zone,
      id: effectIdRef.current++,
    }
    setHitEffects(prev => [...prev, effect])

    // Remove effect after animation
    setTimeout(() => {
      setHitEffects(prev => prev.filter(e => e.id !== effect.id))
    }, 1000)

    setTimeout(() => {
      setIsHitAnimating(false)
    }, 300)

    // Advance round
    const newRound = currentRound + 1
    setCurrentRound(newRound)
    if (newRound >= config.roundsPerGame) {
      setTimeout(() => setPhase('won'), 800)
    }
    // Increase speed each round
    const newSpeed = config.speed + (newRound * 0.5)
    speedRef.current = newSpeed
    setSpeedDisplay(newSpeed)
  }, [config, phase, isHitAnimating, targetPos, currentRound])

  // Save played state & points on win
  useEffect(() => {
    if (phase === 'won') {
      localStorage.setItem(getHourKey(), JSON.stringify({ hits, misses, points: totalPoints }))
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: totalPoints }),
        }).catch(() => {})
      }
    }
  }, [phase, getHourKey, hits, misses, totalPoints])

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Get next hour change time
  const getNextHourInfo = () => {
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
    const diff = nextHour.getTime() - now.getTime()
    const mins = Math.floor(diff / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const teamImage = team ? getTeamImage(team.slug) : ''
  const totalRounds = config?.roundsPerGame ?? 10
  const accuracy = currentRound > 0 ? Math.round((hits / currentRound) * 100) : 0

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(239,68,68,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})` }}>&#x1F3AF;</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #ff8844)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            La diana cambia cada hora con un escudo diferente
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(239,68,68,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo escudo en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }} />
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Escudo actual: {team.name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(239,68,68,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(239,68,68,0.1) 8px, rgba(239,68,68,0.1) 10px)`,
          animation: 'chase-lights 2s linear infinite',
        }} />

        <div className="text-center py-8 relative">
          {/* Neon title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2" style={{
              background: `linear-gradient(90deg, ${ACCENT}, #ff8844, ${ACCENT})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
            }}>
              &#x1F3AF; DIANA DE ESCUDOS
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: 'rgba(239,68,68,0.05)',
                border: `2px solid ${ACCENT_LIGHT}`,
                boxShadow: `0 0 30px ${ACCENT_LIGHT}`,
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px ${ACCENT_GLOW})` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${ACCENT}, #ff8844)`,
                color: '#fff',
                boxShadow: `0 0 10px ${ACCENT_GLOW}`,
              }}>
                BLANCO
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: ACCENT }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El escudo se mueve por la diana
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{totalRounds}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiros</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.pointsCenter || 50}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Pts/Centro</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>x{config?.speed || 3}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Velocidad</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: 'rgba(255,136,68,0.08)',
            border: '1px solid rgba(255,136,68,0.2)',
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: '#ff8844' }}>&#x1F4CB; Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>&#x2022; Un escudo se mueve por la diana</li>
              <li>&#x2022; Haz clic/tap para disparar</li>
              <li>&#x2022; Centro = más puntos, Borde = menos</li>
              <li>&#x2022; El escudo se mueve más rápido cada ronda</li>
              <li>&#x2022; ¡Apunta bien al centro para máximo puntaje!</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #ff8844)`,
              color: '#fff',
              boxShadow: `0 0 30px ${ACCENT_GLOW}, 0 0 60px rgba(255,136,68,0.2)`,
              border: 'none',
            }}
          >
            &#x1F3AF; ¡A DISPARAR!
          </button>
        </div>

        <style jsx>{`
          @keyframes gradient-shift {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes chase-lights {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
        `}</style>
      </div>
    )
  }

  // Timeout screen
  if (phase === 'timeout') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
        border: '2px solid rgba(255,50,50,0.4)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(255,50,50,0.2)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">&#x23F0;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            ¡Tiempo agotado!
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Acertaste {hits} de {currentRound} tiros ({accuracy}% precisión)
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            La diana cambia cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo escudo en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Win / Results screen
  if (phase === 'won') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #2e0a0a 50%, #0a0a0a 100%)',
        border: '2px solid rgba(239,68,68,0.4)',
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(239,68,68,0.3), 0 0 80px ${ACCENT_LIGHT}`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
          }}>&#x1F3C6;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #ff8844, ${ACCENT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡DIANA COMPLETADA!
          </h3>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: ACCENT }}>{hits}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Aciertos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#ff8844' }}>{misses}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Fallos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#ffcc00' }}>{accuracy}%</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Precisión</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(239,68,68,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo escudo en: {getNextHourInfo()}
            </span>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  // =================== PLAYING PHASE ===================
  const targetImage = getTeamImage(team.slug)

  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
      border: `2px solid ${ACCENT_LIGHT}`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(239,68,68,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}>&#x1F3AF;</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: ACCENT }}>
              Diana de Escudos
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: ACCENT,
              textShadow: `0 0 10px ${ACCENT_GLOW}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#ff8844' }}>{currentRound}/{totalRounds}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiro</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#ffcc00' }}>{totalPoints}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos</div>
          </div>
        </div>
      </div>

      {/* Target area */}
      <div
        ref={targetRef}
        className="relative mx-auto rounded-xl overflow-hidden select-none"
        style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '1',
          background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(0,0,0,0.3) 100%)',
          border: `2px solid ${ACCENT_LIGHT}`,
          cursor: 'crosshair',
        }}
        onClick={handleShoot}
      >
        {/* Target rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer ring */}
          <div className="absolute rounded-full" style={{
            width: '70%',
            height: '70%',
            border: '2px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.03)',
          }} />
          {/* Middle ring */}
          <div className="absolute rounded-full" style={{
            width: '40%',
            height: '40%',
            border: '2px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.05)',
          }} />
          {/* Center ring */}
          <div className="absolute rounded-full" style={{
            width: '16%',
            height: '16%',
            border: '2px solid rgba(239,68,68,0.5)',
            background: 'rgba(239,68,68,0.1)',
            boxShadow: `0 0 20px ${ACCENT_GLOW}`,
          }} />
        </div>

        {/* Crosshair */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(239,68,68,0.15)' }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(239,68,68,0.15)' }} />
        </div>

        {/* Moving escudo target */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${targetPos.x}%`,
            top: `${targetPos.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
            background: 'rgba(0,0,0,0.5)',
            border: `2px solid ${ACCENT}`,
            boxShadow: `0 0 15px ${ACCENT_GLOW}, 0 0 30px ${ACCENT_LIGHT}`,
            animation: isHitAnimating ? 'target-hit 0.3s ease-out' : 'none',
          }}>
            <img
              src={targetImage}
              alt={team.name}
              className="w-8 h-8 object-contain"
              style={{ filter: `drop-shadow(0 0 5px ${ACCENT_GLOW})` }}
            />
          </div>
        </div>

        {/* Hit effects */}
        {hitEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              transform: 'translate(-50%, -50%)',
              animation: 'hit-burst 0.8s ease-out forwards',
            }}
          >
            <div className="text-center">
              <div className="text-lg font-black" style={{
                color: effect.zone === 'center' ? '#00ff64' : effect.zone === 'middle' ? '#ffcc00' : '#ff8844',
                textShadow: `0 0 10px ${effect.zone === 'center' ? 'rgba(0,255,100,0.5)' : effect.zone === 'middle' ? 'rgba(255,204,0,0.5)' : 'rgba(255,136,68,0.5)'}`,
              }}>
                +{effect.points}
              </div>
              <div className="text-[0.5rem] uppercase font-bold" style={{
                color: effect.zone === 'center' ? '#00ff64' : effect.zone === 'middle' ? '#ffcc00' : '#ff8844',
              }}>
                {effect.zone === 'center' ? '¡CENTRO!' : effect.zone === 'middle' ? 'MEDIO' : 'BORDE'}
              </div>
            </div>
            {/* Particle burst */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: effect.zone === 'center' ? '#00ff64' : effect.zone === 'middle' ? '#ffcc00' : '#ff8844',
                  left: `${Math.cos((i / 6) * Math.PI * 2) * 30}px`,
                  top: `${Math.sin((i / 6) * Math.PI * 2) * 30}px`,
                  animation: `particle-${i} 0.6s ease-out forwards`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Precisión</span>
          <span className="text-sm font-black" style={{ color: '#ffcc00' }}>{accuracy}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Velocidad</span>
          <span className="text-sm font-black" style={{ color: ACCENT }}>x{speedDisplay.toFixed(1)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 px-2">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentRound / totalRounds) * 100}%`,
              background: `linear-gradient(90deg, ${ACCENT}, #ff8844)`,
              boxShadow: `0 0 10px ${ACCENT_GLOW}`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes chase-lights {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes target-hit {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes hit-burst {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }
      `}</style>
    </div>
  )
}

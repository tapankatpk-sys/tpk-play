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

type Direction = 'IZQUIERDA' | 'CENTRO' | 'DERECHA'

interface PenaltyResult {
  direction: Direction
  goalkeeper: Direction
  isGoal: boolean
}

interface Config {
  roundsPerGame: number
  pointsGoal: number
  pointsHatTrick: number
  pointsPerfect: number
  timeLimit: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

const ACCENT = '#ff4444'
const ACCENT_LIGHT = 'rgba(255,68,68,0.3)'
const ACCENT_GLOW = 'rgba(255,68,68,0.5)'

export default function PenalesFutboleros() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [rival, setRival] = useState<{ slug: string; name: string } | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [results, setResults] = useState<PenaltyResult[]>([])
  const [goals, setGoals] = useState(0)
  const [saves, setSaves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastResult, setLastResult] = useState<PenaltyResult | null>(null)
  const [consecutiveGoals, setConsecutiveGoals] = useState(0)
  const [hatTrickBonus, setHatTrickBonus] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_penales_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/penales')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching penales config:', err)
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

  // Pick a random rival (different from player's team)
  const getRandomRival = useCallback(() => {
    const others = TEAMS.filter(t => t.slug !== team.slug)
    return others[Math.floor(Math.random() * others.length)]
  }, [team.slug])

  const handleStart = useCallback(() => {
    if (!config) return
    const rivalTeam = getRandomRival()
    setRival(rivalTeam)
    setCurrentRound(0)
    setResults([])
    setGoals(0)
    setSaves(0)
    setTimer(0)
    setTotalPoints(0)
    setLastResult(null)
    setConsecutiveGoals(0)
    setHatTrickBonus(0)
    setIsAnimating(false)
    setPhase('playing')
  }, [config, getRandomRival])

  const handleKick = useCallback((direction: Direction) => {
    if (!config || isAnimating || phase !== 'playing') return

    setIsAnimating(true)

    // AI goalkeeper dives randomly
    const directions: Direction[] = ['IZQUIERDA', 'CENTRO', 'DERECHA']
    const goalkeeper = directions[Math.floor(Math.random() * 3)]
    const isGoal = direction !== goalkeeper

    const result: PenaltyResult = { direction, goalkeeper, isGoal }
    const newResults = [...results, result]

    let newGoals = goals
    let newSaves = saves
    let newConsecutive = consecutiveGoals
    let newHatTrick = hatTrickBonus
    let newPoints = totalPoints

    if (isGoal) {
      newGoals++
      newConsecutive++
      newPoints += config.pointsGoal

      // Hat-trick bonus (3 consecutive goals)
      if (newConsecutive === 3) {
        newHatTrick += config.pointsHatTrick
        newPoints += config.pointsHatTrick
      }
      // Additional hat-tricks at 6, 9, etc. (multiples of 3)
      if (newConsecutive > 3 && newConsecutive % 3 === 0) {
        newHatTrick += config.pointsHatTrick
        newPoints += config.pointsHatTrick
      }
    } else {
      newSaves++
      newConsecutive = 0
    }

    setResults(newResults)
    setGoals(newGoals)
    setSaves(newSaves)
    setConsecutiveGoals(newConsecutive)
    setHatTrickBonus(newHatTrick)
    setTotalPoints(newPoints)
    setLastResult(result)
    setCurrentRound(prev => prev + 1)

    // Animation delay before next round or end
    setTimeout(() => {
      setIsAnimating(false)
      if (newResults.length >= config.roundsPerGame) {
        // Perfect round bonus
        if (newGoals === config.roundsPerGame) {
          const finalPoints = newPoints + config.pointsPerfect
          setTotalPoints(finalPoints)
        }
        setPhase('won')
      }
    }, 1200)
  }, [config, isAnimating, phase, results, goals, saves, consecutiveGoals, hatTrickBonus, totalPoints])

  // Save played state & points on win
  useEffect(() => {
    if (phase === 'won') {
      localStorage.setItem(getHourKey(), JSON.stringify({ goals, saves, points: totalPoints }))
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: totalPoints }),
        }).catch(() => {})
      }
    }
  }, [phase, getHourKey, goals, saves, totalPoints])

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
  const rivalImage = rival ? getTeamImage(rival.slug) : ''
  const rounds = config?.roundsPerGame ?? 5

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(255,68,68,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})` }}>&#x26BD;</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #ff8844)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Los penales cambian cada hora con un equipo diferente
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,68,68,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo equipo en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }} />
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Equipo actual: {team.name}
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
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(255,68,68,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,68,68,0.1) 8px, rgba(255,68,68,0.1) 10px)`,
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
              &#x26BD; PENALES FUTBOLEROS
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: 'rgba(255,68,68,0.05)',
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
                TU EQUIPO
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: ACCENT }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El equipo cambia cada hora
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{rounds}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Penales</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.pointsGoal || 20}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Pts/Gol</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: 'rgba(255,136,68,0.08)',
            border: '1px solid rgba(255,136,68,0.2)',
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: '#ff8844' }}>&#x1F4CB; Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>&#x2022; Elige la dirección del penal: izquierda, centro o derecha</li>
              <li>&#x2022; Si el portero va al otro lado → ¡GOL!</li>
              <li>&#x2022; Si el portero adivina tu dirección → ATAJADA</li>
              <li>&#x2022; Hat-trick (3 goles seguidos) = bonus extra</li>
              <li>&#x2022; Ronda perfecta (todos goles) = gran bonus</li>
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
            &#x26BD; ¡A COBRAR PENALES!
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
        border: `2px solid rgba(255,50,50,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(255,50,50,0.2)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">&#x23F0;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            ¡Tiempo agotado!
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Anotaste {goals} de {currentRound} penales
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Los penales cambian cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo equipo en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Win / Results screen
  if (phase === 'won') {
    const perfectBonus = goals === rounds ? (config?.pointsPerfect || 100) : 0
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #2e0a0a 50%, #0a0a0a 100%)',
        border: '2px solid rgba(255,100,50,0.4)',
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(255,100,50,0.3), 0 0 80px ${ACCENT_LIGHT}`,
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
            ¡TIRO AL BLANCO COMPLETADO!
          </h3>
          <p className="text-lg font-bold mb-6" style={{ color: ACCENT }}>{team.name} vs {rival?.name}</p>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.1)',
              border: '1px solid rgba(255,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: ACCENT }}>{goals}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Goles</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.1)',
              border: '1px solid rgba(255,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#ff8844' }}>{saves}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Atajadas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.1)',
              border: '1px solid rgba(255,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#ffcc00' }}>{hatTrickBonus > 0 ? `+${hatTrickBonus}` : '—'}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Hat-trick</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(255,68,68,0.1)',
              border: '1px solid rgba(255,68,68,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>+{totalPoints + perfectBonus}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {perfectBonus > 0 && (
            <div className="mb-4 p-3 rounded-xl max-w-xs mx-auto" style={{
              background: 'rgba(255,204,0,0.1)',
              border: '1px solid rgba(255,204,0,0.4)',
            }}>
              <span className="text-sm font-black" style={{ color: '#ffcc00' }}>&#x2B50; ¡RONDA PERFECTA! +{perfectBonus} pts</span>
            </div>
          )}

          {/* Round by round results */}
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {results.map((r, i) => (
              <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black" style={{
                background: r.isGoal ? 'rgba(0,255,100,0.15)' : 'rgba(255,50,50,0.15)',
                border: `1px solid ${r.isGoal ? 'rgba(0,255,100,0.4)' : 'rgba(255,50,50,0.4)'}`,
                color: r.isGoal ? '#00ff64' : '#ff5050',
              }}>
                {r.isGoal ? '⚽' : '🧤'}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,68,68,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo equipo en: {getNextHourInfo()}
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
  const directions: Direction[] = ['IZQUIERDA', 'CENTRO', 'DERECHA']
  const directionLabels: Record<Direction, string> = {
    IZQUIERDA: '← IZQ',
    CENTRO: '↑ CENTRO',
    DERECHA: 'DER →',
  }
  const directionIcons: Record<Direction, string> = {
    IZQUIERDA: '⬅️',
    CENTRO: '⬆️',
    DERECHA: '➡️',
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
      border: `2px solid ${ACCENT_LIGHT}`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(255,68,68,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}>&#x26BD;</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: ACCENT }}>
              Penales Futboleros
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {team.name} vs {rival?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : ACCENT,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : ACCENT_GLOW}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#00ff64' }}>{goals}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Goles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#ff8844' }}>{currentRound}/{rounds}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Penal</div>
          </div>
        </div>
      </div>

      {/* Soccer field visual */}
      <div className="relative rounded-xl overflow-hidden mb-4" style={{
        background: 'linear-gradient(180deg, #0a4a0a 0%, #0a3a0a 40%, #0a2a0a 100%)',
        border: '1px solid rgba(0,200,0,0.2)',
        minHeight: '200px',
      }}>
        {/* Field markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
          width: '120px',
          height: '50px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderTop: 'none',
        }} />

        {/* Goalkeeper silhouette */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <img src={rivalImage} alt={rival?.name} className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }} />
          </div>
          <span className="text-[0.55rem] font-bold mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>PORTERO</span>
        </div>

        {/* Ball animation */}
        {lastResult && isAnimating && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2" style={{
            animation: lastResult.isGoal ? 'ball-fly-goal 1s ease-out forwards' : 'ball-fly-save 1s ease-out forwards',
            fontSize: '2rem',
            filter: `drop-shadow(0 0 10px ${lastResult.isGoal ? 'rgba(0,255,100,0.6)' : 'rgba(255,50,50,0.6)'})`,
          }}>
            ⚽
          </div>
        )}

        {/* Result overlay */}
        {lastResult && isAnimating && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-black text-2xl uppercase" style={{
            background: lastResult.isGoal ? 'rgba(0,255,100,0.2)' : 'rgba(255,50,50,0.2)',
            border: `2px solid ${lastResult.isGoal ? 'rgba(0,255,100,0.6)' : 'rgba(255,50,50,0.6)'}`,
            color: lastResult.isGoal ? '#00ff64' : '#ff5050',
            animation: 'result-pop 0.5s ease-out',
            textShadow: `0 0 15px ${lastResult.isGoal ? 'rgba(0,255,100,0.5)' : 'rgba(255,50,50,0.5)'}`,
          }}>
            {lastResult.isGoal ? '¡GOL! ⚽' : '¡ATAJADA! 🧤'}
          </div>
        )}

        {/* Goalkeeper dive direction indicator */}
        {lastResult && isAnimating && (
          <div className="absolute bottom-16 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)',
          }}>
            Portero: {lastResult.goalkeeper === 'IZQUIERDA' ? '⬅️' : lastResult.goalkeeper === 'DERECHA' ? '➡️' : '⬆️'}
          </div>
        )}

        {/* Player team badge */}
        <div className="absolute top-3 left-3">
          <img src={teamImage} alt={team.name} className="w-8 h-8 object-contain" style={{ filter: `drop-shadow(0 0 5px ${ACCENT_GLOW})` }} />
        </div>
      </div>

      {/* Direction buttons */}
      <div className="flex gap-3 justify-center mb-4">
        {directions.map(dir => (
          <button
            key={dir}
            onClick={() => handleKick(dir)}
            disabled={isAnimating || currentRound >= rounds}
            className="flex-1 max-w-[140px] py-4 rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #cc2222)`,
              color: '#fff',
              border: `2px solid rgba(255,136,68,0.4)`,
              boxShadow: `0 0 15px ${ACCENT_LIGHT}`,
            }}
          >
            <div className="text-xl mb-1">{directionIcons[dir]}</div>
            <div className="text-xs">{directionLabels[dir]}</div>
          </button>
        ))}
      </div>

      {/* Round progress */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: rounds }, (_, i) => {
          const result = results[i]
          return (
            <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{
              background: i < currentRound
                ? result?.isGoal ? 'rgba(0,255,100,0.15)' : 'rgba(255,50,50,0.15)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i < currentRound
                ? result?.isGoal ? 'rgba(0,255,100,0.4)' : 'rgba(255,50,50,0.4)'
                : 'rgba(255,255,255,0.1)'}`,
              color: i < currentRound
                ? result?.isGoal ? '#00ff64' : '#ff5050'
                : 'rgba(255,255,255,0.3)',
            }}>
              {i < currentRound ? (result?.isGoal ? '⚽' : '✗') : i + 1}
            </div>
          )
        })}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos</span>
          <span className="text-sm font-black" style={{ color: '#ffcc00' }}>{totalPoints}</span>
        </div>
        {consecutiveGoals >= 2 && (
          <div className="px-3 py-1 rounded-full text-xs font-black" style={{
            background: 'rgba(255,204,0,0.15)',
            border: '1px solid rgba(255,204,0,0.4)',
            color: '#ffcc00',
            animation: 'pulse 0.8s ease-in-out infinite',
          }}>
            🔥 RACHA x{consecutiveGoals}
          </div>
        )}
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
        @keyframes ball-fly-goal {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          60% { transform: translate(-50%, -80px) scale(1.3); opacity: 1; }
          100% { transform: translate(-50%, -60px) scale(0.8); opacity: 0.7; }
        }
        @keyframes ball-fly-save {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -20px) scale(0.6); opacity: 0.5; }
        }
        @keyframes result-pop {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          60% { transform: translate(-50%, -5px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

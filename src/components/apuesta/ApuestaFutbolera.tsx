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

// Seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

interface Match {
  homeTeam: typeof TEAMS[0]
  awayTeam: typeof TEAMS[0]
  homeScore: number | null
  awayScore: number | null
}

interface Config {
  matchesPerRound: number
  pointsExact: number
  pointsWinner: number
  pointsGoals: number
  timeLimit: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

export default function ApuestaFutbolera() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [timer, setTimer] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<{ home: string; away: string }[]>([])
  const [results, setResults] = useState<Match[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Accent color
  const accent = '#f97316'
  const accentLight = '#fb923c'

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_apuesta_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/apuesta')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching apuesta config:', err)
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
    if (phase === 'playing' && !submitted) {
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
  }, [phase, config?.timeLimit, submitted])

  // Generate matches based on hourly seed
  const generateMatches = useCallback(() => {
    if (!config) return []
    const now = new Date()
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
    const rand = seededRandom(seed)

    const shuffled = [...TEAMS].sort(() => rand() - 0.5)
    const matchList: Match[] = []
    const count = Math.min(config.matchesPerRound, Math.floor(shuffled.length / 2))

    for (let i = 0; i < count; i++) {
      matchList.push({
        homeTeam: shuffled[i * 2],
        awayTeam: shuffled[i * 2 + 1],
        homeScore: null,
        awayScore: null,
      })
    }
    return matchList
  }, [config])

  // Generate results (seeded by hour for consistency)
  const generateResults = useCallback((matchList: Match[]): Match[] => {
    const now = new Date()
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours() + 777
    const rand = seededRandom(seed)

    return matchList.map(m => ({
      ...m,
      homeScore: Math.floor(rand() * 4),
      awayScore: Math.floor(rand() * 4),
    }))
  }, [])

  const handleStart = useCallback(() => {
    if (!config) return
    const matchList = generateMatches()
    setMatches(matchList)
    setPredictions(matchList.map(() => ({ home: '', away: '' })))
    setResults([])
    setTotalPoints(0)
    setShowResults(false)
    setSubmitted(false)
    setTimer(0)
    setPhase('playing')
  }, [config, generateMatches])

  const handlePredictionChange = useCallback((index: number, field: 'home' | 'away', value: string) => {
    setPredictions(prev => {
      const newPred = [...prev]
      newPred[index] = { ...newPred[index], [field]: value }
      return newPred
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!config) return
    // Check all predictions are filled
    const allFilled = predictions.every(p => p.home !== '' && p.away !== '')
    if (!allFilled) return

    // Generate results
    const matchResults = generateResults(matches)
    setResults(matchResults)
    setSubmitted(true)

    // Calculate points
    let pts = 0
    matchResults.forEach((result, i) => {
      const pred = predictions[i]
      const homePred = parseInt(pred.home, 10)
      const awayPred = parseInt(pred.away, 10)
      const homeRes = result.homeScore!
      const awayRes = result.awayScore!

      if (homePred === homeRes && awayPred === awayRes) {
        // Exact score
        pts += config.pointsExact + config.pointsGoals
      } else {
        // Check winner/draw
        const predWinner = homePred > awayPred ? 'home' : homePred < awayPred ? 'away' : 'draw'
        const resWinner = homeRes > awayRes ? 'home' : homeRes < awayRes ? 'away' : 'draw'
        if (predWinner === resWinner) {
          pts += config.pointsWinner
        }
        // Check individual goals
        if (homePred === homeRes) pts += 5
        if (awayPred === awayRes) pts += 5
      }
    })

    setTotalPoints(pts)

    // Show results with animation
    setTimeout(() => setShowResults(true), 500)
    setTimeout(() => setPhase('won'), 4000)
  }, [config, predictions, matches, generateResults])

  // Save played state
  const savePlayed = useCallback(() => {
    localStorage.setItem(getHourKey(), JSON.stringify({ time: timer, points: totalPoints }))
  }, [getHourKey, timer, totalPoints])

  // Save points on win
  useEffect(() => {
    if (phase === 'won') {
      savePlayed()
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: totalPoints }),
        }).catch(() => {})
      }
    }
  }, [phase, totalPoints, savePlayed])

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

  const teamImage = getTeamImage(team.slug)
  const allPredictionsFilled = predictions.every(p => p.home !== '' && p.away !== '')

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(249,115,22,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(249,115,22,0.2), inset 0 0 30px rgba(249,115,22,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px rgba(249,115,22,0.6))` }}>📊</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Los partidos cambian cada hora
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(249,115,22,0.1)`,
            border: `1px solid rgba(249,115,22,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próxima jornada en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px rgba(249,115,22,0.5))` }} />
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(249,115,22,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(249,115,22,0.2), inset 0 0 30px rgba(249,115,22,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(249,115,22,0.1) 8px, rgba(249,115,22,0.1) 10px)`,
          animation: 'chase-lights 2s linear infinite',
        }} />

        <div className="text-center py-8 relative">
          {/* Neon title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2" style={{
              background: `linear-gradient(90deg, ${accent}, ${accentLight}, ${accent})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: `drop-shadow(0 0 20px rgba(249,115,22,0.5))`,
            }}>
              📊 APUESTA FUTBOLERA
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: `rgba(249,115,22,0.05)`,
                border: `2px solid rgba(249,115,22,0.3)`,
                boxShadow: `0 0 30px rgba(249,115,22,0.2)`,
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px rgba(249,115,22,0.5))` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                color: '#000',
                boxShadow: `0 0 10px rgba(249,115,22,0.5)`,
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: accent }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Predice los marcadores de la jornada
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(249,115,22,0.08)`,
              border: `1px solid rgba(249,115,22,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.matchesPerRound || 3}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Partidos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(249,115,22,0.08)`,
              border: `1px solid rgba(249,115,22,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(249,115,22,0.08)`,
              border: `1px solid rgba(249,115,22,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.pointsExact || 60}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: `rgba(249,115,22,0.08)`,
            border: `1px solid rgba(249,115,22,0.2)`,
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: accent }}>📋 Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>• Predice el marcador de cada partido</li>
              <li>• Resultado exacto = puntos completos + bonus goles</li>
              <li>• Ganador o empate correcto = puntos parciales</li>
              <li>• Ingresa los goles local y visitante</li>
              <li>• ¡Más aciertos = más puntos!</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#000',
              boxShadow: `0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(251,146,60,0.2)`,
              border: 'none',
            }}
          >
            📊 ¡HACER APUESTA!
          </button>
        </div>
      </div>
    )
  }

  // Timeout screen
  if (phase === 'timeout') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: '2px solid rgba(255,50,50,0.4)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(255,50,50,0.2)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            ¡Tiempo agotado!
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No completaste tus predicciones a tiempo
          </p>
          <p className="text-lg font-bold mb-4" style={{ color: accent }}>
            +{totalPoints} puntos
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Los partidos cambian cada hora. ¡Intenta de nuevo!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próxima jornada en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Win/results screen
  if (phase === 'won') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #2e1a0a 50%, #0a0a0a 100%)',
        border: `2px solid rgba(249,115,22,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(249,115,22,0.3), 0 0 80px rgba(251,146,60,0.15)`,
      }}>
        <div className="text-center py-8">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px rgba(249,115,22,0.6))`,
          }}>🏆</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight}, ${accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡APUESTA CERRADA!
          </h3>
          <p className="text-lg font-bold mb-4" style={{ color: accent }}>{team.name}</p>

          {/* Results summary */}
          <div className="space-y-2 mb-6 max-w-md mx-auto">
            {results.map((result, i) => {
              const pred = predictions[i]
              const homePred = parseInt(pred.home, 10)
              const awayPred = parseInt(pred.away, 10)
              const homeRes = result.homeScore!
              const awayRes = result.awayScore!
              const exactMatch = homePred === homeRes && awayPred === awayRes
              const predWinner = homePred > awayPred ? 'home' : homePred < awayPred ? 'away' : 'draw'
              const resWinner = homeRes > awayRes ? 'home' : homeRes < awayRes ? 'away' : 'draw'
              const winnerMatch = predWinner === resWinner

              return (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{
                  background: exactMatch ? 'rgba(0,255,100,0.1)' : winnerMatch ? 'rgba(249,115,22,0.1)' : 'rgba(255,50,50,0.08)',
                  border: `1px solid ${exactMatch ? 'rgba(0,255,100,0.3)' : winnerMatch ? 'rgba(249,115,22,0.3)' : 'rgba(255,50,50,0.2)'}`,
                }}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={getTeamImage(result.homeTeam.slug)} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-xs font-bold truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{result.homeTeam.name}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{homePred}-{awayPred}</span>
                    <span className="text-xs font-black" style={{ color: exactMatch ? '#00ff64' : winnerMatch ? accent : '#ff5050' }}>
                      {homeRes}-{awayRes}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-bold truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{result.awayTeam.name}</span>
                    <img src={getTeamImage(result.awayTeam.slug)} alt="" className="w-5 h-5 object-contain" />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(249,115,22,0.1)`,
              border: `1px solid rgba(249,115,22,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(249,115,22,0.1)`,
              border: `1px solid rgba(249,115,22,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(249,115,22,0.1)`,
            border: `1px solid rgba(249,115,22,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próxima jornada en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // =================== PLAYING PHASE ===================
  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
      border: `2px solid rgba(249,115,22,0.3)`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px rgba(249,115,22,0.15), inset 0 0 30px rgba(249,115,22,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px rgba(249,115,22,0.6))` }}>📊</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: accent }}>
              Apuesta Futbolera
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Jornada {team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : accent,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : 'rgba(249,115,22,0.5)'}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: accentLight }}>{matches.length}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Partidos</div>
          </div>
        </div>
      </div>

      {/* Match cards */}
      <div className="space-y-3 mb-4">
        {matches.map((match, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{
              background: showResults ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(249,115,22,0.2)`,
              animation: showResults ? `reveal-result 0.5s ease-out ${i * 0.3}s both` : 'none',
            }}
          >
            <div className="flex items-center gap-2">
              {/* Home team */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <img src={getTeamImage(match.homeTeam.slug)} alt="" className="w-7 h-7 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.3))' }} />
                <span className="text-xs font-bold truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{match.homeTeam.name}</span>
              </div>

              {/* Score inputs / results */}
              <div className="flex items-center gap-2">
                {!submitted ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={predictions[i]?.home || ''}
                      onChange={(e) => handlePredictionChange(i, 'home', e.target.value)}
                      className="w-10 h-10 text-center text-lg font-black rounded-lg outline-none"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: `2px solid rgba(249,115,22,0.4)`,
                        color: accent,
                      }}
                      disabled={submitted}
                    />
                    <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={predictions[i]?.away || ''}
                      onChange={(e) => handlePredictionChange(i, 'away', e.target.value)}
                      className="w-10 h-10 text-center text-lg font-black rounded-lg outline-none"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: `2px solid rgba(249,115,22,0.4)`,
                        color: accent,
                      }}
                      disabled={submitted}
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {predictions[i]?.home}-{predictions[i]?.away}
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#ffffff' }}>→</span>
                    {results[i] && (
                      <span className="text-lg font-black" style={{
                        color: parseInt(predictions[i]?.home) === results[i].homeScore && parseInt(predictions[i]?.away) === results[i].awayScore
                          ? '#00ff64' : '#ff5050',
                        textShadow: '0 0 10px rgba(249,115,22,0.3)',
                      }}>
                        {results[i].homeScore}-{results[i].awayScore}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Away team */}
              <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
                <span className="text-xs font-bold truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{match.awayTeam.name}</span>
                <img src={getTeamImage(match.awayTeam.slug)} alt="" className="w-7 h-7 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.3))' }} />
              </div>
            </div>

            {/* Neon odds decoration */}
            <div className="flex justify-center mt-2">
              <div className="flex gap-3">
                <span className="text-[0.55rem] px-2 py-0.5 rounded-full" style={{
                  background: 'rgba(0,255,100,0.08)',
                  border: '1px solid rgba(0,255,100,0.2)',
                  color: 'rgba(0,255,100,0.5)',
                }}>
                  LOCAL {Math.floor(Math.random() * 40 + 30)}%
                </span>
                <span className="text-[0.55rem] px-2 py-0.5 rounded-full" style={{
                  background: 'rgba(255,255,100,0.08)',
                  border: '1px solid rgba(255,255,100,0.2)',
                  color: 'rgba(255,255,100,0.5)',
                }}>
                  EMPATE {Math.floor(Math.random() * 20 + 15)}%
                </span>
                <span className="text-[0.55rem] px-2 py-0.5 rounded-full" style={{
                  background: 'rgba(255,100,100,0.08)',
                  border: '1px solid rgba(255,100,100,0.2)',
                  color: 'rgba(255,100,100,0.5)',
                }}>
                  VISITA {Math.floor(Math.random() * 40 + 20)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allPredictionsFilled}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: allPredictionsFilled ? `linear-gradient(135deg, ${accent}, ${accentLight})` : 'rgba(255,255,255,0.05)',
              color: allPredictionsFilled ? '#000' : 'rgba(255,255,255,0.3)',
              border: allPredictionsFilled ? 'none' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: allPredictionsFilled ? `0 0 20px rgba(249,115,22,0.3)` : 'none',
            }}
          >
            📊 CONFIRMAR APUESTA
          </button>
        </div>
      )}

      {/* Results animation */}
      {submitted && showResults && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px rgba(249,115,22,0.6))`,
          }}>📊</div>
          <p className="text-sm font-bold" style={{ color: accent }}>
            Calculando resultados...
          </p>
        </div>
      )}

      {/* CSS animations */}
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
        @keyframes reveal-result {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

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

// Deterministic power value based on team slug + hour
function getPowerValue(slug: string): number {
  const now = new Date()
  const hourKey = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  let hash = 0
  const str = slug + hourKey.toString()
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 100) + 1
}

interface Card {
  team: { slug: string; name: string }
  power: number
  image: string
}

interface Config {
  cardsPerRound: number
  pointsCorrect: number
  pointsStreak5: number
  pointsStreak10: number
  timeLimit: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

const ACCENT = '#eab308'
const ACCENT_LIGHT = 'rgba(234,179,8,0.3)'
const ACCENT_GLOW = 'rgba(234,179,8,0.5)'

export default function CartaMayor() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [cards, setCards] = useState<Card[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_carta_mayor_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/carta-mayor')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching carta mayor config:', err)
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

  // Generate cards
  const generateCards = useCallback(() => {
    if (!config) return []
    const numCards = config.cardsPerRound
    const shuffled = [...TEAMS].sort(() => Math.random() - 0.5)
    const selectedTeams = shuffled.slice(0, numCards)
    return selectedTeams.map(t => ({
      team: t,
      power: getPowerValue(t.slug),
      image: getTeamImage(t.slug),
    }))
  }, [config])

  const handleStart = useCallback(() => {
    if (!config) return
    const gameCards = generateCards()
    setCards(gameCards)
    setCurrentCardIndex(0)
    setIsRevealed(true) // First card is face-up
    setStreak(0)
    setTotalPoints(0)
    setCorrect(0)
    setIncorrect(0)
    setTimer(0)
    setLastResult(null)
    setIsFlipping(false)
    setPhase('playing')
  }, [config, generateCards])

  const handleBet = useCallback((bet: 'MAYOR' | 'MENOR') => {
    if (!config || isFlipping || currentCardIndex >= cards.length - 1 || phase !== 'playing') return

    setIsFlipping(true)
    const currentPower = cards[currentCardIndex].power
    const nextPower = cards[currentCardIndex + 1].power
    const isCorrect = bet === 'MAYOR' ? nextPower > currentPower : nextPower < currentPower

    // Simulate flip animation delay
    setTimeout(() => {
      if (isCorrect) {
        const newStreak = streak + 1
        setStreak(newStreak)
        setCorrect(prev => prev + 1)
        let pointsEarned = config.pointsCorrect

        // Streak bonuses
        if (newStreak >= 10) {
          pointsEarned += config.pointsStreak10
        } else if (newStreak >= 5) {
          pointsEarned += config.pointsStreak5
        }

        setTotalPoints(prev => prev + pointsEarned)
        setLastResult('correct')
      } else {
        setStreak(0)
        setIncorrect(prev => prev + 1)
        setLastResult('incorrect')
      }

      setIsRevealed(true)
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipping(false)

      // Check if game is over
      if (currentCardIndex + 1 >= cards.length - 1) {
        setTimeout(() => setPhase('won'), 800)
      }
    }, 800)
  }, [config, isFlipping, currentCardIndex, cards, phase, streak])

  // Save played state & points on win
  useEffect(() => {
    if (phase === 'won') {
      localStorage.setItem(getHourKey(), JSON.stringify({ correct, incorrect, points: totalPoints, streak }))
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: totalPoints }),
        }).catch(() => {})
      }
    }
  }, [phase, getHourKey, correct, incorrect, totalPoints, streak])

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
  const totalCards = config?.cardsPerRound ?? 10

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(234,179,8,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})` }}>&#x1F0CF;</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #ffcc00)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Las cartas cambian cada hora con escudos diferentes
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(234,179,8,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo juego en: {getNextHourInfo()}
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(234,179,8,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(234,179,8,0.1) 8px, rgba(234,179,8,0.1) 10px)`,
          animation: 'chase-lights 2s linear infinite',
        }} />

        <div className="text-center py-8 relative">
          {/* Neon title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2" style={{
              background: `linear-gradient(90deg, ${ACCENT}, #ffcc00, ${ACCENT})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
            }}>
              &#x1F0CF; CARTA MAYOR
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: 'rgba(234,179,8,0.05)',
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
                background: `linear-gradient(135deg, ${ACCENT}, #ffcc00)`,
                color: '#000',
                boxShadow: `0 0 10px ${ACCENT_GLOW}`,
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: ACCENT }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Las cartas cambian cada hora
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{totalCards}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Cartas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.pointsCorrect || 10}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Pts/Acierto</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: 'rgba(255,204,0,0.08)',
            border: '1px solid rgba(255,204,0,0.2)',
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: '#ffcc00' }}>&#x1F4CB; Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>&#x2022; Cada carta muestra un escudo con un valor de poder</li>
              <li>&#x2022; Apuesta si la próxima carta es MAYOR o MENOR</li>
              <li>&#x2022; Acierto = puntos + incremento de racha</li>
              <li>&#x2022; Racha x5 = bonus extra, Racha x10 = gran bonus</li>
              <li>&#x2022; Si fallas, la racha se reinicia</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #ffcc00)`,
              color: '#000',
              boxShadow: `0 0 30px ${ACCENT_GLOW}, 0 0 60px rgba(255,204,0,0.2)`,
              border: 'none',
            }}
          >
            &#x1F0CF; ¡JUGAR CARTA MAYOR!
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
            Acertaste {correct} de {currentCardIndex} cartas
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Las cartas cambian cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo juego en: {getNextHourInfo()}
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #2e2a0a 50%, #0a0a0a 100%)',
        border: '2px solid rgba(234,179,8,0.4)',
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(234,179,8,0.3), 0 0 80px ${ACCENT_LIGHT}`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
          }}>&#x1F3C6;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #ffcc00, ${ACCENT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡CARTA MAYOR COMPLETADO!
          </h3>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: ACCENT }}>{correct}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Aciertos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#ff8844' }}>{incorrect}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Errores</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(234,179,8,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo juego en: {getNextHourInfo()}
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
  const currentCard = cards[currentCardIndex]
  const nextCard = cards[currentCardIndex + 1]
  const isLastCard = currentCardIndex >= cards.length - 1

  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 50%, #0a0a0a 100%)',
      border: `2px solid ${ACCENT_LIGHT}`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(234,179,8,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}>&#x1F0CF;</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: ACCENT }}>
              Carta Mayor
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {team.name}
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
            <div className="text-lg font-black" style={{ color: '#00ff64' }}>{currentCardIndex + 1}/{totalCards}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Carta</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#ffcc00' }}>{totalPoints}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos</div>
          </div>
        </div>
      </div>

      {/* Cards area */}
      <div className="flex justify-center items-start gap-6 mb-6">
        {/* Current card (face-up) */}
        {currentCard && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Carta Actual</span>
            <div className="w-36 h-48 rounded-xl flex flex-col items-center justify-center relative transition-all duration-300" style={{
              background: `linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.02))`,
              border: `2px solid ${ACCENT_LIGHT}`,
              boxShadow: `0 0 20px ${ACCENT_LIGHT}`,
            }}>
              <img
                src={currentCard.image}
                alt={currentCard.team.name}
                className="w-16 h-16 object-contain mb-2"
                style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}
              />
              <p className="text-xs font-bold mb-1" style={{ color: ACCENT }}>{currentCard.team.name}</p>
              <div className="px-3 py-1 rounded-full text-sm font-black" style={{
                background: `linear-gradient(135deg, ${ACCENT}, #ffcc00)`,
                color: '#000',
                boxShadow: `0 0 10px ${ACCENT_GLOW}`,
              }}>
                {currentCard.power}
              </div>
            </div>
          </div>
        )}

        {/* VS indicator */}
        <div className="flex items-center pt-12">
          <span className="text-2xl font-black" style={{
            color: ACCENT,
            textShadow: `0 0 15px ${ACCENT_GLOW}`,
          }}>VS</span>
        </div>

        {/* Next card (face-down or revealed) */}
        {nextCard && !isLastCard && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Próxima Carta</span>
            <div className="w-36 h-48 rounded-xl flex flex-col items-center justify-center relative transition-all duration-500" style={{
              background: isRevealed && !isFlipping
                ? `linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.02))`
                : `linear-gradient(135deg, rgba(100,80,0,0.2), rgba(60,40,0,0.1))`,
              border: `2px solid ${isRevealed && !isFlipping ? ACCENT_LIGHT : 'rgba(100,80,0,0.3)'}`,
              boxShadow: `0 0 20px ${isRevealed && !isFlipping ? ACCENT_LIGHT : 'rgba(100,80,0,0.1)'}`,
              animation: isFlipping ? 'card-flip 0.8s ease-in-out' : 'none',
            }}>
              {isRevealed && !isFlipping ? (
                <>
                  <img
                    src={nextCard.image}
                    alt={nextCard.team.name}
                    className="w-16 h-16 object-contain mb-2"
                    style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}
                  />
                  <p className="text-xs font-bold mb-1" style={{ color: ACCENT }}>{nextCard.team.name}</p>
                  <div className="px-3 py-1 rounded-full text-sm font-black" style={{
                    background: `linear-gradient(135deg, ${ACCENT}, #ffcc00)`,
                    color: '#000',
                    boxShadow: `0 0 10px ${ACCENT_GLOW}`,
                  }}>
                    {nextCard.power}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}>&#x2753;</div>
                  <p className="text-xs font-bold" style={{ color: 'rgba(100,80,0,0.6)' }}>¿MAYOR o MENOR?</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result feedback */}
      {lastResult && !isFlipping && (
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 rounded-xl font-black text-sm uppercase" style={{
            background: lastResult === 'correct' ? 'rgba(0,255,100,0.15)' : 'rgba(255,50,50,0.15)',
            border: `1px solid ${lastResult === 'correct' ? 'rgba(0,255,100,0.4)' : 'rgba(255,50,50,0.4)'}`,
            color: lastResult === 'correct' ? '#00ff64' : '#ff5050',
            animation: 'result-pop 0.5s ease-out',
          }}>
            {lastResult === 'correct' ? '✓ ¡CORRECTO!' : '✗ ¡INCORRECTO!'}
          </div>
        </div>
      )}

      {/* Bet buttons */}
      {!isLastCard && nextCard && (
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={() => handleBet('MAYOR')}
            disabled={isFlipping}
            className="flex-1 max-w-[180px] py-4 rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #00cc44, #008833)',
              color: '#fff',
              border: '2px solid rgba(0,255,100,0.4)',
              boxShadow: '0 0 15px rgba(0,255,100,0.3)',
            }}
          >
            <div className="text-2xl mb-1">&#x2B06;</div>
            <div className="text-sm">MAYOR</div>
          </button>
          <button
            onClick={() => handleBet('MENOR')}
            disabled={isFlipping}
            className="flex-1 max-w-[180px] py-4 rounded-xl font-black uppercase tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #cc4400, #883300)',
              color: '#fff',
              border: '2px solid rgba(255,100,0,0.4)',
              boxShadow: '0 0 15px rgba(255,100,0,0.3)',
            }}
          >
            <div className="text-2xl mb-1">&#x2B07;</div>
            <div className="text-sm">MENOR</div>
          </button>
        </div>
      )}

      {/* Streak indicator */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Racha</span>
          <span className="text-sm font-black" style={{ color: streak >= 5 ? '#ffcc00' : '#ff8844' }}>
            {streak > 0 ? `🔥 x${streak}` : '—'}
          </span>
        </div>
        {streak >= 5 && (
          <div className="px-3 py-1 rounded-full text-xs font-black" style={{
            background: 'rgba(255,204,0,0.15)',
            border: '1px solid rgba(255,204,0,0.4)',
            color: '#ffcc00',
            animation: 'pulse 0.8s ease-in-out infinite',
          }}>
            {streak >= 10 ? '⭐ ¡RACHA x10!' : '🔥 ¡RACHA x5!'}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
          <span className="text-[0.65rem] font-black" style={{ color: ACCENT }}>
            {Math.round(((currentCardIndex + 1) / totalCards) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
              background: `linear-gradient(90deg, ${ACCENT}, #ffcc00)`,
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
        @keyframes card-flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }
        @keyframes result-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

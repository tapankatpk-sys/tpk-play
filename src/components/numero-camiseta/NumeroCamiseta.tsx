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

// Question bank — at least 30 questions across all 20 teams
const QUESTION_BANK = [
  { team: 'atletico-nacional', player: 'René Higuita', number: 1, hint: 'El Loco - Portero legendario', era: '90s' },
  { team: 'atletico-nacional', player: 'Faustino Asprilla', number: 11, hint: 'El Tin - Delantero explosivo', era: '90s' },
  { team: 'millonarios', player: 'Carlos Valderrama', number: 10, hint: 'El Pibe - Crack creativo', era: '80s' },
  { team: 'millonarios', player: 'Arnoldo Iguarán', number: 9, hint: 'El Guajiro - Goleador histórico', era: '80s-90s' },
  { team: 'america-de-cali', player: 'Anthony de Ávila', number: 7, hint: 'El Pipa - Goleador icono', era: '80s-90s' },
  { team: 'america-de-cali', player: 'Álex Escobar', number: 10, hint: 'El Maestro - Enganche genial', era: '90s' },
  { team: 'deportivo-cali', player: 'Carlos "El Pibe" Valderrama', number: 10, hint: 'Mediocampista genial', era: '80s' },
  { team: 'deportivo-cali', player: 'Henry "Buscagol" Hurtado', number: 9, hint: 'Buscagol - Delantero letal', era: '90s' },
  { team: 'atletico-junior', player: 'Carlos "El Pibe" Valderrama', number: 10, hint: 'Ídolo Tiburón - El 10 eterno', era: '90s' },
  { team: 'atletico-junior', player: 'Iván René Valenciano', number: 9, hint: 'El Chachachá - Goleador costeño', era: '90s' },
  { team: 'independiente-santa-fe', player: 'Alfonso Cañón', number: 10, hint: 'El Maestro - Leyenda cardenal', era: '70s-80s' },
  { team: 'independiente-santa-fe', player: 'Luis Carlos Ary', number: 7, hint: 'Velocidad y gol - Ala derecha', era: '80s' },
  { team: 'independiente-medellin', player: 'Germán Ezequiel Cano', number: 9, hint: 'Goleador incansable - Referente', era: '2010s' },
  { team: 'independiente-medellin', player: 'Mauricio "Mao" Molina', number: 10, hint: 'El Mao - Volante creativo', era: '2000s' },
  { team: 'deportes-tolima', player: 'Roberto "Palo" Higuaín', number: 10, hint: 'Conductor vinotinto y oro', era: '2010s' },
  { team: 'deportes-tolima', player: 'Yairo "Yairocito" Arrechea', number: 7, hint: 'Velocidad por la banda', era: '2010s' },
  { team: 'deportivo-pereira', player: 'Jhon "Choronta" Ortiz', number: 10, hint: 'El Choronta - Motor del medio', era: '2020s' },
  { team: 'deportivo-pasto', player: 'Carlos "Chumbi" Quintero', number: 10, hint: 'Crack volcánico - Talento puro', era: '2000s' },
  { team: 'once-caldas', player: 'Jhon Viáfara', number: 8, hint: 'Campeón Libertadores 2004', era: '2000s' },
  { team: 'once-caldas', player: 'Miguel "Checho" Ángel Converti', number: 9, hint: 'Goleador blanco - Libertadores', era: '2000s' },
  { team: 'atletico-bucaramanga', player: 'Oswaldo "Oswaldinho" Mackenzie', number: 7, hint: 'Velocidad y gambeta auriverde', era: '90s' },
  { team: 'cucuta-deportivo', player: 'Matías Urbano', number: 9, hint: 'Goleador motilón - Ascenso', era: '2000s' },
  { team: 'boyaca-chico', player: 'Mayer Candelo', number: 10, hint: 'El Maestro - Enganche lirismo', era: '2010s' },
  { team: 'fortaleza-ceif', player: 'Brayan "Bryan" Gil', number: 10, hint: 'Referente creativo verdolaga', era: '2020s' },
  { team: 'jaguares-de-cordoba', player: 'César "Choronta" Arias', number: 5, hint: 'Líder defensivo felino', era: '2010s' },
  { team: 'llaneros', player: 'Jorge "Cocó" Luis Soto', number: 7, hint: 'Velocidad llanera', era: '2020s' },
  { team: 'alianza-valledupar', player: 'John "Jhon" Pajoy', number: 9, hint: 'Goleador vallenato', era: '2020s' },
  { team: 'aguilas-doradas', player: 'Luis "Lucho" Fernando Muriel', number: 7, hint: 'El Diputado - Talento catire', era: '2010s' },
  { team: 'internacional-de-bogota', player: 'Jairo "El Flaco" Patiño', number: 10, hint: 'Conductor capitalino', era: '2020s' },
  { team: 'atletico-nacional', player: 'David González', number: 1, hint: 'Portero fiebre verde - Ídolo', era: '2010s' },
  { team: 'millonarios', player: 'David González', number: 1, hint: 'El Rockero - Portero azul', era: '2010s' },
  { team: 'america-de-cali', player: 'Duván "Duvancho" Zapata', number: 9, hint: 'Goleador escarlata al mundo', era: '2010s' },
  { team: 'deportivo-cali', player: 'Teófilo Gutiérrez', number: 10, hint: 'Teo - Talento y controversia', era: '2010s' },
  { team: 'atletico-junior', player: 'Teófilo Gutiérrez', number: 10, hint: 'Teo - Ídolo tiburón', era: '2010s' },
  { team: 'independiente-santa-fe', player: 'Wilder Medina', number: 7, hint: 'Velocidad cardenal', era: '2010s' },
  { team: 'deportivo-pereira', player: 'Johan "Caballo" Arango', number: 11, hint: 'Puntero matecaña', era: '2020s' },
  { team: 'once-caldas', player: 'Dayro "El Búfalo" Moreno', number: 9, hint: 'Goleador incansable manizalita', era: '2010s' },
  { team: 'deportes-tolima', player: 'Dayro "El Búfalo" Moreno', number: 9, hint: 'Goleador vinotinto y oro', era: '2010s' },
]

interface Config {
  questionsPerGame: number
  pointsExact: number
  pointsClose: number
  noHintMultiplier: number
  timeLimit: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

interface Question {
  team: string
  player: string
  number: number
  hint: string
  era: string
}

export default function NumeroCamiseta() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [timer, setTimer] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [guess, setGuess] = useState('')
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; points: number; message: string } | null>(null)
  const [answered, setAnswered] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Accent color
  const accent = '#8b5cf6'
  const accentLight = '#a78bfa'

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_numero-camiseta_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/numero-camiseta')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching numero-camiseta config:', err)
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

  // Select questions based on hourly seed
  const selectQuestions = useCallback(() => {
    const now = new Date()
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
    const rand = seededRandom(seed)
    const shuffled = [...QUESTION_BANK].sort(() => rand() - 0.5)
    const count = config?.questionsPerGame || 5
    return shuffled.slice(0, count)
  }, [config?.questionsPerGame])

  const handleStart = useCallback(() => {
    if (!config) return
    const qs = selectQuestions()
    setQuestions(qs)
    setCurrentQ(0)
    setGuess('')
    setHintUsed(false)
    setShowHint(false)
    setTotalPoints(0)
    setFeedback(null)
    setAnswered(0)
    setTimer(0)
    setPhase('playing')
  }, [config, selectQuestions])

  const handleSubmitGuess = useCallback(() => {
    if (!config || !questions[currentQ] || !guess) return
    const numGuess = parseInt(guess, 10)
    if (isNaN(numGuess)) return

    const q = questions[currentQ]
    let pts = 0
    let msg = ''

    if (numGuess === q.number) {
      pts = config.pointsExact
      msg = `¡EXACTO! El número de ${q.player} es el ${q.number}`
    } else if (Math.abs(numGuess - q.number) <= 2) {
      pts = config.pointsClose
      msg = `¡CERCA! El número era ${q.number}`
    } else {
      pts = 0
      msg = `Incorrecto. El número era ${q.number}`
    }

    // Apply no-hint multiplier
    if (pts > 0 && !hintUsed) {
      pts = Math.round(pts * config.noHintMultiplier)
    }

    setTotalPoints(prev => prev + pts)
    setFeedback({ correct: numGuess === q.number, points: pts, message: msg })
    setAnswered(prev => prev + 1)

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setPhase('won')
      } else {
        setCurrentQ(prev => prev + 1)
        setGuess('')
        setHintUsed(false)
        setShowHint(false)
        setFeedback(null)
      }
    }, 2000)
  }, [config, questions, currentQ, guess, hintUsed])

  const handleHint = useCallback(() => {
    setShowHint(true)
    setHintUsed(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitGuess()
    }
  }, [handleSubmitGuess])

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

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(139,92,246,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(139,92,246,0.2), inset 0 0 30px rgba(139,92,246,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px rgba(139,92,246,0.6))` }}>🔢</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Las preguntas cambian cada hora con jugadores diferentes
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(139,92,246,0.1)`,
            border: `1px solid rgba(139,92,246,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próximo reto en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px rgba(139,92,246,0.5))` }} />
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
        border: `2px solid rgba(139,92,246,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(139,92,246,0.2), inset 0 0 30px rgba(139,92,246,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(139,92,246,0.1) 8px, rgba(139,92,246,0.1) 10px)`,
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
              filter: `drop-shadow(0 0 20px rgba(139,92,246,0.5))`,
            }}>
              🔢 NÚMERO CAMISETA
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: `rgba(139,92,246,0.05)`,
                border: `2px solid rgba(139,92,246,0.3)`,
                boxShadow: `0 0 30px rgba(139,92,246,0.2)`,
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px rgba(139,92,246,0.5))` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                color: '#000',
                boxShadow: `0 0 10px rgba(139,92,246,0.5)`,
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: accent }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Las preguntas cambian cada hora
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.08)`,
              border: `1px solid rgba(139,92,246,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.questionsPerGame || 5}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Preguntas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.08)`,
              border: `1px solid rgba(139,92,246,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.08)`,
              border: `1px solid rgba(139,92,246,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.pointsExact || 40}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: `rgba(139,92,246,0.08)`,
            border: `1px solid rgba(139,92,246,0.2)`,
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: accent }}>📋 Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>• Adivina el número de camiseta de jugadores legendarios</li>
              <li>• Número exacto = puntos completos</li>
              <li>• Dentro de ±2 = puntos parciales</li>
              <li>• Sin usar pista = multiplicador x{config?.noHintMultiplier || 2}</li>
              <li>• ¡Responde rápido para más puntos!</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#000',
              boxShadow: `0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(167,139,250,0.2)`,
              border: 'none',
            }}
          >
            🔢 ¡A JUGAR!
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
            Respondiste {answered} de {questions.length} preguntas
          </p>
          <p className="text-lg font-bold mb-4" style={{ color: accent }}>
            +{totalPoints} puntos
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Las preguntas cambian cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo reto en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Win screen
  if (phase === 'won') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(139,92,246,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(167,139,250,0.15)`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px rgba(139,92,246,0.6))`,
          }}>🏆</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight}, ${accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡NÚMERO CAMISETA COMPLETO!
          </h3>
          <p className="text-lg font-bold mb-6" style={{ color: accent }}>{team.name}</p>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.1)`,
              border: `1px solid rgba(139,92,246,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.1)`,
              border: `1px solid rgba(139,92,246,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{answered}/{questions.length}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Respondidas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(139,92,246,0.1)`,
              border: `1px solid rgba(139,92,246,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(139,92,246,0.1)`,
            border: `1px solid rgba(139,92,246,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próximo reto en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // =================== PLAYING PHASE ===================
  const q = questions[currentQ]
  const qTeam = q ? TEAMS.find(t => t.slug === q.team) : null

  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
      border: `2px solid rgba(139,92,246,0.3)`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px rgba(139,92,246,0.15), inset 0 0 30px rgba(139,92,246,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px rgba(139,92,246,0.6))` }}>🔢</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: accent }}>
              Número Camiseta
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : accent,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : 'rgba(139,92,246,0.5)'}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: accentLight }}>{totalPoints}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#00ff64' }}>{currentQ + 1}/{questions.length}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Pregunta</div>
          </div>
        </div>
      </div>

      {/* Question area */}
      {q && qTeam && (
        <div className="flex flex-col items-center gap-4">
          {/* Team escudo */}
          <div className="w-20 h-20 rounded-xl flex items-center justify-center p-3" style={{
            background: `rgba(139,92,246,0.05)`,
            border: `2px solid rgba(139,92,246,0.3)`,
            boxShadow: `0 0 20px rgba(139,92,246,0.15)`,
          }}>
            <img
              src={getTeamImage(q.team)}
              alt={qTeam.name}
              className="w-full h-full object-contain"
              style={{ filter: `drop-shadow(0 0 8px rgba(139,92,246,0.4))` }}
            />
          </div>

          {/* Team name */}
          <p className="text-sm font-bold" style={{ color: accent }}>{qTeam.name}</p>

          {/* Player name */}
          <div className="text-center px-4">
            <p className="text-2xl font-black" style={{
              color: '#ffffff',
              textShadow: `0 0 15px rgba(139,92,246,0.5)`,
            }}>
              {q.player}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Época: {q.era}
            </p>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="px-4 py-2 rounded-lg text-center" style={{
              background: `rgba(139,92,246,0.1)`,
              border: `1px solid rgba(139,92,246,0.3)`,
            }}>
              <p className="text-sm font-bold" style={{ color: accentLight }}>💡 {q.hint}</p>
            </div>
          )}

          {/* Jersey input */}
          {!feedback ? (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              {/* Jersey shape */}
              <div className="relative w-40 h-48" style={{
                background: `linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)`,
                border: `2px solid rgba(139,92,246,0.4)`,
                borderRadius: '1.5rem 1.5rem 0.5rem 0.5rem',
                boxShadow: `0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.05)`,
                clipPath: 'polygon(15% 0%, 30% 8%, 70% 8%, 85% 0%, 100% 15%, 95% 40%, 100% 100%, 0% 100%, 5% 40%, 0% 15%)',
              }}>
                {/* Number display */}
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  <span className="text-5xl font-black" style={{
                    color: accent,
                    textShadow: `0 0 20px rgba(139,92,246,0.8), 0 0 40px rgba(139,92,246,0.4)`,
                    fontFamily: 'monospace',
                  }}>
                    {guess || '?'}
                  </span>
                </div>
              </div>

              {/* Number input */}
              <input
                type="number"
                min="1"
                max="99"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1-99"
                className="w-32 text-center text-2xl font-black rounded-xl px-4 py-3 outline-none"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `2px solid rgba(139,92,246,0.4)`,
                  color: accent,
                  boxShadow: `0 0 15px rgba(139,92,246,0.2)`,
                }}
                autoFocus
              />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleHint}
                  disabled={hintUsed}
                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: hintUsed ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.15)',
                    border: `1px solid ${hintUsed ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.4)'}`,
                    color: hintUsed ? 'rgba(255,255,255,0.3)' : accent,
                  }}
                >
                  💡 Pista
                </button>
                <button
                  onClick={handleSubmitGuess}
                  disabled={!guess}
                  className="px-6 py-2 rounded-lg text-sm font-black uppercase cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                    color: '#000',
                    border: 'none',
                    boxShadow: `0 0 15px rgba(139,92,246,0.3)`,
                  }}
                >
                  CONFIRMAR
                </button>
              </div>

              {!hintUsed && (
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Sin pista = multiplicador x{config?.noHintMultiplier || 2}
                </p>
              )}
            </div>
          ) : (
            /* Feedback */
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="text-5xl" style={{
                animation: 'pulse 0.5s ease-in-out',
                filter: `drop-shadow(0 0 20px ${feedback.correct ? 'rgba(0,255,100,0.6)' : 'rgba(255,50,50,0.6)'})`,
              }}>
                {feedback.correct ? '✅' : feedback.points > 0 ? '🟡' : '❌'}
              </div>
              <p className="text-lg font-black text-center" style={{
                color: feedback.correct ? '#00ff64' : feedback.points > 0 ? '#ffaa00' : '#ff5050',
              }}>
                {feedback.message}
              </p>
              <p className="text-xl font-black" style={{
                color: accent,
                textShadow: `0 0 10px rgba(139,92,246,0.5)`,
              }}>
                +{feedback.points} pts
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-6 px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
          <span className="text-[0.65rem] font-black" style={{ color: accent }}>
            {Math.round((currentQ / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentQ / questions.length) * 100}%`,
              background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
              boxShadow: `0 0 10px rgba(139,92,246,0.5)`,
            }}
          />
        </div>
      </div>

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
      `}</style>
    </div>
  )
}

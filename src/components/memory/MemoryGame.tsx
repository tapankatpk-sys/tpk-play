'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// EQUIPOS LIGA BETPLAY - Escudos oficiales
// ============================================
const TEAMS = [
  { id: 'atletico-nacional', name: 'Atlético Nacional', color: '#00953b', city: 'Medellín' },
  { id: 'millonarios', name: 'Millonarios', color: '#0033a0', city: 'Bogotá' },
  { id: 'america-de-cali', name: 'América de Cali', color: '#e31937', city: 'Cali' },
  { id: 'deportivo-cali', name: 'Deportivo Cali', color: '#007a33', city: 'Cali' },
  { id: 'atletico-junior', name: 'Junior FC', color: '#c8102e', city: 'Barranquilla' },
  { id: 'independiente-santa-fe', name: 'Santa Fe', color: '#c8102e', city: 'Bogotá' },
  { id: 'independiente-medellin', name: 'Independiente Medellín', color: '#e31937', city: 'Medellín' },
  { id: 'once-caldas', name: 'Once Caldas', color: '#0033a0', city: 'Manizales' },
  { id: 'deportes-tolima', name: 'Deportes Tolima', color: '#fdd835', city: 'Ibagué' },
  { id: 'atletico-bucaramanga', name: 'Atlético Bucaramanga', color: '#fdd835', city: 'Bucaramanga' },
  { id: 'fortaleza-ceif', name: 'Fortaleza CEIF', color: '#e31937', city: 'Bogotá' },
  { id: 'deportivo-pereira', name: 'Deportivo Pereira', color: '#c8102e', city: 'Pereira' },
  { id: 'deportivo-pasto', name: 'Deportivo Pasto', color: '#1a237e', city: 'Pasto' },
  { id: 'la-equidad', name: 'La Equidad', color: '#2e7d32', city: 'Bogotá' },
  { id: 'jaguares-de-cordoba', name: 'Jaguares de Córdoba', color: '#f57f17', city: 'Montería' },
  { id: 'cucuta-deportivo', name: 'Cúcuta Deportivo', color: '#b71c1c', city: 'Cúcuta' },
  { id: 'internacional-de-bogota', name: 'Internacional de Bogotá', color: '#1565c0', city: 'Bogotá' },
  { id: 'alianza-valledupar', name: 'Alianza Valledupar', color: '#00838f', city: 'Valledupar' },
  { id: 'boyaca-chico', name: 'Boyacá Chicó', color: '#e65100', city: 'Tunja' },
  { id: 'llaneros', name: 'Llaneros', color: '#4e342e', city: 'Villavicencio' },
]

interface Card {
  id: string
  teamId: string
  name: string
  color: string
  city: string
  isFlipped: boolean
  isMatched: boolean
}

type Difficulty = 'easy' | 'medium' | 'hard'

// Grid: 3 cols x 2 rows, 4 cols x 4 rows, 5 cols x 4 rows
const DIFFICULTY_CONFIG = {
  easy:   { pairs: 3,  cols: 3, rows: 2, label: 'Facil',  emoji: '\u{1F7E2}', points: 10 },
  medium: { pairs: 6,  cols: 4, rows: 3, label: 'Medio',  emoji: '\u{1F7E1}', points: 25 },
  hard:   { pairs: 10, cols: 5, rows: 4, label: 'Dificil', emoji: '\u{1F534}', points: 50 },
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Teams that only have PNG files (no SVG)
const PNG_ONLY_TEAMS = new Set(['internacional-de-bogota'])

function getTeamImagePath(teamId: string): string {
  if (PNG_ONLY_TEAMS.has(teamId)) {
    return `/images/teams/${teamId}.png`
  }
  return `/images/teams/${teamId}.svg`
}

function createCards(pairCount: number): Card[] {
  const selectedTeams = shuffleArray(TEAMS).slice(0, pairCount)
  const cards: Card[] = []
  selectedTeams.forEach((team) => {
    cards.push({
      id: `${team.id}-a`,
      teamId: team.id,
      name: team.name,
      color: team.color,
      city: team.city,
      isFlipped: false,
      isMatched: false,
    })
    cards.push({
      id: `${team.id}-b`,
      teamId: team.id,
      name: team.name,
      color: team.color,
      city: team.city,
      isFlipped: false,
      isMatched: false,
    })
  })
  return shuffleArray(cards)
}

// Check if player already played this hour for this game type
function hasPlayedThisHour(): boolean {
  try {
    const key = 'tpk_memoria_last_play'
    const lastPlay = localStorage.getItem(key)
    if (!lastPlay) return false
    const lastDate = new Date(lastPlay)
    const now = new Date()
    // Same hour check (same year, month, day, hour)
    return (
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate() &&
      lastDate.getHours() === now.getHours()
    )
  } catch {
    return false
  }
}

function markPlayedThisHour(): void {
  try {
    localStorage.setItem('tpk_memoria_last_play', new Date().toISOString())
  } catch {
    // ignore
  }
}

function getTimeUntilNextHour(): number {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  return nextHour.getTime() - now.getTime()
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]

  // Check if already played this hour
  useEffect(() => {
    const check = () => {
      if (hasPlayedThisHour()) {
        setAlreadyPlayed(true)
        setTimeRemaining(getTimeUntilNextHour())
      } else {
        setAlreadyPlayed(false)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // Countdown timer for already played
  useEffect(() => {
    if (!alreadyPlayed) return
    const tick = () => {
      setTimeRemaining(getTimeUntilNextHour())
    }
    countdownRef.current = setInterval(tick, 1000)
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [alreadyPlayed])

  // Timer logic
  useEffect(() => {
    if (isPlaying && !gameComplete) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, gameComplete])

  const startGame = useCallback((diff?: Difficulty) => {
    if (hasPlayedThisHour()) {
      setAlreadyPlayed(true)
      return
    }
    const d = diff || difficulty
    const c = DIFFICULTY_CONFIG[d]
    setDifficulty(d)
    setCards(createCards(c.pairs))
    setFlippedIds([])
    setMoves(0)
    setMatchedPairs(0)
    setIsLocked(false)
    setTimer(0)
    setIsPlaying(true)
    setGameComplete(false)
    setEarnedPoints(0)
    setShowSplash(false)
    setAlreadyPlayed(false)
    markPlayedThisHour()
  }, [difficulty])

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (isLocked) return
      if (flippedIds.includes(cardId)) return

      const card = cards.find((c) => c.id === cardId)
      if (!card || card.isMatched || card.isFlipped) return

      const newFlipped = [...flippedIds, cardId]
      setFlippedIds(newFlipped)
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      )

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1)
        setIsLocked(true)

        const [firstId, secondId] = newFlipped
        const firstCard = cards.find((c) => c.id === firstId)!
        const secondCard = cards.find((c) => c.id === secondId)!

        if (firstCard.teamId === secondCard.teamId) {
          const newMatchedCount = matchedPairs + 1
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.teamId === firstCard.teamId
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              )
            )
            setMatchedPairs(newMatchedCount)
            setFlippedIds([])
            setIsLocked(false)

            if (newMatchedCount === DIFFICULTY_CONFIG[difficulty].pairs) {
              setGameComplete(true)
              setIsPlaying(false)
              if (timerRef.current) clearInterval(timerRef.current)
              const currentMoves = moves + 1
              const pairsCount = DIFFICULTY_CONFIG[difficulty].pairs
              const starMultiplier = currentMoves <= pairsCount * 1.5 ? 3 : currentMoves <= pairsCount * 2 ? 2 : 1
              setEarnedPoints(DIFFICULTY_CONFIG[difficulty].points * starMultiplier)
            }
          }, 600)
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            )
            setFlippedIds([])
            setIsLocked(false)
          }, 1000)
        }
      }
    },
    [cards, flippedIds, isLocked, matchedPairs, difficulty, moves]
  )

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatCountdown = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000))
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ============================================
  // SPLASH SCREEN
  // ============================================
  if (showSplash) {
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(236, 72, 153, 0.4)',
            boxShadow: '0 0 40px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Background lights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: '8%', left: '5%', color: '#ec4899', delay: '0s' },
              { top: '12%', right: '8%', color: '#f97316', delay: '0.5s' },
              { bottom: '15%', left: '8%', color: '#a855f7', delay: '1s' },
              { bottom: '10%', right: '5%', color: '#22c55e', delay: '1.5s' },
            ].map((light, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  ...light,
                  background: light.color,
                  boxShadow: `0 0 8px ${light.color}, 0 0 16px ${light.color}`,
                  animation: `mem-light-blink 1.5s ease-in-out infinite ${light.delay}`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Game Icon */}
          <div className="mb-4 relative z-10">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                border: '2px solid rgba(236, 72, 153, 0.5)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 60px rgba(236, 72, 153, 0.1)',
                animation: 'mem-float 3s ease-in-out infinite',
              }}
            >
              <span className="text-4xl">{'\u{1F9E0}'}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2 relative z-10"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #f97316, #a855f7, #ec4899)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s linear infinite',
            }}
          >
            Memoria Futbolera
          </h3>
          <p className="text-sm mb-6 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Encuentra los pares de escudos de la Liga BetPlay
          </p>

          {/* Already played this hour */}
          {alreadyPlayed && (
            <div
              className="mb-4 p-4 rounded-xl relative z-10"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: '#f87171' }}>
                Ya jugaste esta hora
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Podras jugar de nuevo en: <span style={{ color: '#fbbf24' }}>{formatCountdown(timeRemaining)}</span>
              </p>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="mb-6 relative z-10">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(236,72,153,0.5)' }}>
              Selecciona dificultad
            </p>
            <div className="flex gap-3 justify-center">
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG.easy][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer"
                    style={{
                      background:
                        difficulty === key
                          ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(249, 115, 22, 0.3))'
                          : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${difficulty === key ? 'rgba(236, 72, 153, 0.6)' : 'rgba(255,255,255,0.08)'}`,
                      color: difficulty === key ? '#fff' : 'rgba(255,255,255,0.4)',
                      boxShadow:
                        difficulty === key ? '0 0 15px rgba(236, 72, 153, 0.3)' : 'none',
                    }}
                  >
                    <span className="block text-lg mb-1">{cfg.emoji}</span>
                    <span className="block">{cfg.label}</span>
                    <span className="block text-[0.6rem] opacity-60">{cfg.cols}x{cfg.rows} | {cfg.pairs} pares</span>
                    <span className="block text-[0.55rem] font-black mt-1" style={{
                      color: difficulty === key ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                      textShadow: difficulty === key ? '0 0 6px rgba(251,191,36,0.4)' : 'none',
                    }}>
                      {cfg.points} pts
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => startGame()}
            disabled={alreadyPlayed}
            className="relative z-10 px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
            style={{
              background: alreadyPlayed
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #ec4899, #f97316)',
              boxShadow: alreadyPlayed
                ? 'none'
                : '0 0 20px rgba(236, 72, 153, 0.5), 0 0 60px rgba(249, 115, 22, 0.2)',
              color: '#fff',
            }}
          >
            {'\u{1F3B0}'} JUGAR
          </button>

          {/* How to play */}
          <div className="mt-6 text-left max-w-sm mx-auto relative z-10">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(236,72,153,0.4)' }}>
              Como jugar
            </p>
            <div className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p>{'\u{1F0CF}'} Voltea 2 cartas por turno</p>
              <p>{'\u26BD'} Encuentra los escudos iguales</p>
              <p>{'\u{1F3C6}'} Menos movimientos = mas puntos (x3, x2, x1)</p>
              <p>{'\u23F0'} Una oportunidad por hora</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes mem-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes mem-light-blink {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // GAME COMPLETE SCREEN
  // ============================================
  if (gameComplete) {
    const starMultiplier = moves <= config.pairs * 1.5 ? 3 : moves <= config.pairs * 2 ? 2 : 1
    const stars = starMultiplier
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(251, 191, 36, 0.4)',
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="mb-4" style={{ animation: 'mem-celebrate 0.5s ease-out' }}>
            <span className="text-6xl">{'\u{1F3C6}'}</span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: 'linear-gradient(90deg, #fbbf24, #f97316, #fbbf24)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 2s linear infinite',
            }}
          >
            Felicidades!
          </h3>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Encontraste todos los pares de escudos
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className="text-3xl transition-all duration-500"
                style={{
                  opacity: s <= stars ? 1 : 0.2,
                  filter: s <= stars ? 'drop-shadow(0 0 8px rgba(234,179,8,0.8))' : 'none',
                  animation: s <= stars ? `mem-star-pop 0.5s ease-out ${s * 0.2}s both` : 'none',
                }}
              >
                {'\u2B50'}
              </span>
            ))}
          </div>

          {/* Points */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-4"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)',
            }}
          >
            <span className="text-sm" style={{ color: 'rgba(251,191,36,0.7)' }}>Puntos:</span>
            <span className="text-3xl font-black" style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>
              {earnedPoints}
            </span>
            <span className="text-xs" style={{ color: 'rgba(251,191,36,0.5)' }}>
              ({config.points} x{starMultiplier})
            </span>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: '#ec4899' }}>{moves}</div>
              <div className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Movimientos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: '#f97316' }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Tiempo
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: '#22c55e' }}>{config.pairs}</div>
              <div className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Pares
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowSplash(true)}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: 'rgba(236, 72, 153, 0.12)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: '#ec4899',
              }}
            >
              {'\u{1F3E0}'} Menu
            </button>
          </div>

          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Podras jugar de nuevo la proxima hora
          </p>
        </div>

        <style jsx>{`
          @keyframes mem-celebrate {
            0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1) rotate(0); opacity: 1; }
          }
          @keyframes mem-star-pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // ACTIVE GAME BOARD
  // ============================================
  return (
    <div className="relative max-w-2xl mx-auto px-4">
      <div
        className="rounded-2xl p-4 md:p-6 border overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          borderColor: 'rgba(236, 72, 153, 0.25)',
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{'\u{1F9E0}'}</span>
            <h3
              className="text-sm md:text-base font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #ec4899, #f97316, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Memoria Futbolera
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
              style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}
            >
              {'\u23F1'} {formatTime(timer)}
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}
            >
              {'\u{1F3AF}'} {moves}
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              {'\u26BD'} {matchedPairs}/{config.pairs}
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              {config.points} pts
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(matchedPairs / config.pairs) * 100}%`,
              background: 'linear-gradient(90deg, #ec4899, #f97316, #22c55e)',
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
            }}
          />
        </div>

        {/* Card Grid - FIXED: proper grid with good card sizes */}
        <div
          className="grid gap-2 md:gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            maxWidth: config.cols <= 3 ? '300px' : config.cols <= 4 ? '420px' : '500px',
          }}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setShowSplash(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {'\u2190'} Salir
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MEMORY CARD COMPONENT - Solo escudos luminosos
// FIXED: Removed overflow:hidden that was clipping 3D transforms
// ============================================
function MemoryCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (card.isFlipped || card.isMatched || isAnimating) return
    setIsAnimating(true)
    onClick()
    setTimeout(() => setIsAnimating(false), 300)
  }

  const isRevealed = card.isFlipped || card.isMatched

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front - Hidden card (neon card back) */}
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            background: '#000',
            border: '2px solid rgba(236, 72, 153, 0.4)',
            boxShadow: '0 0 12px rgba(236, 72, 153, 0.2), inset 0 0 8px rgba(236, 72, 153, 0.05)',
            aspectRatio: '1',
          }}
        >
          {/* Neon border glow effect */}
          <div className="absolute inset-0 rounded-xl" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(236, 72, 153, 0.06) 4px, rgba(236, 72, 153, 0.06) 8px)',
          }} />
          <div className="absolute rounded-lg" style={{
            inset: '6px',
            border: '1px solid rgba(236, 72, 153, 0.15)',
          }} />
          {/* Center icon */}
          <span
            className="text-2xl md:text-3xl relative z-10"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.7))',
              animation: 'mem-glow 2s ease-in-out infinite',
            }}
          >
            {'\u26BD'}
          </span>
        </div>

        {/* Back - Team shield ONLY on black background */}
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            inset: 0,
            background: '#000',
            border: `2px solid ${card.isMatched ? 'rgba(34, 197, 94, 0.8)' : 'rgba(249, 115, 22, 0.6)'}`,
            boxShadow: card.isMatched
              ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.15), inset 0 0 10px rgba(34, 197, 94, 0.05)'
              : '0 0 15px rgba(249, 115, 22, 0.25), inset 0 0 8px rgba(249, 115, 22, 0.03)',
            aspectRatio: '1',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Team shield - large, centered, no name */}
          <img
            src={getTeamImagePath(card.teamId)}
            alt=""
            className="w-[80%] h-[80%] object-contain"
            style={{
              filter: card.isMatched
                ? 'drop-shadow(0 0 8px rgba(34,197,94,0.6)) brightness(1.1)'
                : 'drop-shadow(0 0 6px rgba(255,255,255,0.25))',
              transition: 'filter 0.3s',
            }}
          />

          {/* Matched glow overlay */}
          {card.isMatched && (
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(34,197,94,0.1), transparent 70%)',
                animation: 'mem-match-glow 1s ease-in-out infinite alternate',
              }}
            />
          )}

          {/* Matched indicator */}
          {card.isMatched && (
            <div
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(34, 197, 94, 0.8)',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                animation: 'mem-check-pop 0.3s ease-out',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to give the card height (since children are absolute) */}
      <div style={{ aspectRatio: '1' }} />

      <style jsx>{`
        @keyframes mem-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes mem-match-glow {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
        @keyframes mem-check-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

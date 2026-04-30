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

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, cols: 4, label: 'Fácil', emoji: '🟢' },
  medium: { pairs: 6, cols: 4, label: 'Medio', emoji: '🟡' },
  hard: { pairs: 10, cols: 5, label: 'Difícil', emoji: '🔴' },
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function createCards(pairCount: number): Card[] {
  const selectedTeams = shuffleArray(TEAMS).slice(0, pairCount)
  const cards: Card[] = []
  selectedTeams.forEach((team) => {
    // Two cards per team (pair)
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

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [bestScores, setBestScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  })
  const [showSplash, setShowSplash] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]

  // Load best scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tpk-memory-scores')
      if (saved) setBestScores(JSON.parse(saved))
    } catch {}
  }, [])

  // Save best scores
  useEffect(() => {
    try {
      localStorage.setItem('tpk-memory-scores', JSON.stringify(bestScores))
    } catch {}
  }, [bestScores])

  // Timer logic
  useEffect(() => {
    if (isPlaying && !gameComplete) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, gameComplete])

  // Check for game completion
  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === config.pairs) {
      setGameComplete(true)
      setIsPlaying(false)
      if (timerRef.current) clearInterval(timerRef.current)

      // Check best score
      const currentBest = bestScores[difficulty]
      if (currentBest === null || moves < currentBest) {
        setBestScores((prev) => ({ ...prev, [difficulty]: moves }))
      }
    }
  }, [matchedPairs, config.pairs, moves, difficulty, bestScores])

  const startGame = useCallback((diff?: Difficulty) => {
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
    setShowSplash(false)
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
          // Match found!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.teamId === firstCard.teamId
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              )
            )
            setMatchedPairs((m) => m + 1)
            setFlippedIds([])
            setIsLocked(false)
          }, 600)
        } else {
          // No match
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
    [cards, flippedIds, isLocked]
  )

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ============================================
  // SPLASH SCREEN - Intro del juego
  // ============================================
  if (showSplash) {
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Game Icon */}
          <div className="mb-4">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                border: '2px solid rgba(168, 85, 247, 0.5)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
                animation: 'memory-float 3s ease-in-out infinite',
              }}
            >
              <span className="text-4xl">🧠</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #f97316, #fbbf24, #a855f7)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s linear infinite',
            }}
          >
            Memoria Futbolera
          </h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Encuentra los pares de escudos de la Liga BetPlay
          </p>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Selecciona dificultad
            </p>
            <div className="flex gap-3 justify-center">
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG.easy][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300"
                    style={{
                      background:
                        difficulty === key
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(249, 115, 22, 0.3))'
                          : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${difficulty === key ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                      color: difficulty === key ? '#fff' : 'rgba(255,255,255,0.4)',
                      boxShadow:
                        difficulty === key ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none',
                    }}
                  >
                    {cfg.emoji} {cfg.label}
                    <span className="block text-[0.6rem] opacity-60">{cfg.pairs} pares</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Best scores */}
          {bestScores[difficulty] !== null && (
            <div className="mb-5">
              <span className="text-xs" style={{ color: 'rgba(234,179,8,0.7)' }}>
                🏆 Mejor: {bestScores[difficulty]} movimientos
              </span>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={() => startGame()}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #f97316)',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 60px rgba(249, 115, 22, 0.2)',
              color: '#fff',
            }}
          >
            🎰 JUGAR
          </button>

          {/* How to play */}
          <div className="mt-6 text-left max-w-sm mx-auto">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Cómo jugar
            </p>
            <div className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p>🃏 Voltea 2 cartas por turno</p>
              <p>⚽ Encuentra los escudos iguales</p>
              <p>🏆 Menos movimientos = más puntos</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes memory-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // GAME COMPLETE SCREEN
  // ============================================
  if (gameComplete) {
    const stars = moves <= config.pairs * 1.5 ? 3 : moves <= config.pairs * 2 ? 2 : 1
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(234, 179, 8, 0.4)',
            boxShadow: '0 0 40px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Celebration animation */}
          <div
            className="mb-4"
            style={{ animation: 'memory-celebrate 0.5s ease-out' }}
          >
            <span className="text-6xl">🏆</span>
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
            ¡Felicidades!
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
                  transform: s <= stars ? 'scale(1)' : 'scale(0.8)',
                  animation: s <= stars ? `memory-star-pop 0.5s ease-out ${s * 0.2}s both` : 'none',
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: '#a855f7' }}>{moves}</div>
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
              onClick={() => startGame()}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #f97316)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
                color: '#fff',
              }}
            >
              🔄 Jugar de nuevo
            </button>
            <button
              onClick={() => setShowSplash(true)}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              🏠 Menú
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes memory-celebrate {
            0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1) rotate(0); opacity: 1; }
          }
          @keyframes memory-star-pop {
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
        className="rounded-2xl p-4 md:p-6 border"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          borderColor: 'rgba(168, 85, 247, 0.2)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3
              className="text-sm md:text-base font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Memoria Futbolera
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div
              className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#f97316',
                border: '1px solid rgba(249, 115, 22, 0.2)',
              }}
            >
              ⏱ {formatTime(timer)}
            </div>
            {/* Moves */}
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}
            >
              🎯 {moves} mov
            </div>
            {/* Pairs found */}
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              ⚽ {matchedPairs}/{config.pairs}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(matchedPairs / config.pairs) * 100}%`,
              background: 'linear-gradient(90deg, #a855f7, #f97316, #22c55e)',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
            }}
          />
        </div>

        {/* Card Grid */}
        <div
          className="grid gap-2 md:gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            maxWidth: config.cols * 100 + 'px',
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
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            ← Salir
          </button>
          <button
            onClick={() => startGame()}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#a855f7',
            }}
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MEMORY CARD COMPONENT
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
      style={{ perspective: '800px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0)',
          animation: isAnimating && !isRevealed ? 'memory-card-shake 0.3s ease-out' : 'none',
        }}
      >
        {/* Front - Hidden card (Las Vegas card back) */}
        <div
          className="aspect-square rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1a0030 0%, #2d0060 50%, #1a0030 100%)',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Card back pattern */}
          <div className="absolute inset-1 rounded-md overflow-hidden" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(168, 85, 247, 0.08) 3px, rgba(168, 85, 247, 0.08) 6px)',
          }} />
          <div className="absolute inset-2 rounded-md" style={{
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }} />
          <span
            className="text-lg md:text-2xl relative z-10"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))',
              animation: 'memory-glow 2s ease-in-out infinite',
            }}
          >
            ⚽
          </span>
        </div>

        {/* Back - Team shield (revealed) */}
        <div
          className="aspect-square rounded-lg flex flex-col items-center justify-center overflow-hidden p-1.5"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            border: `2px solid ${card.isMatched ? 'rgba(34, 197, 94, 0.6)' : 'rgba(249, 115, 22, 0.4)'}`,
            boxShadow: card.isMatched
              ? '0 0 15px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 0 15px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            animation: card.isMatched ? 'memory-match-pulse 0.5s ease-out' : 'none',
          }}
        >
          {/* Team shield image */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img
              src={`/images/teams/${card.teamId}.svg`}
              alt={card.name}
              className="w-full h-full object-contain p-1"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))',
                maxWidth: '80%',
                maxHeight: '80%',
              }}
              onError={(e) => {
                // Fallback to PNG if SVG fails
                const target = e.target as HTMLImageElement
                if (!target.src.endsWith('.png')) {
                  target.src = `/images/teams/${card.teamId}.png`
                }
              }}
            />
          </div>

          {/* Team name */}
          <div
            className="text-[0.5rem] md:text-[0.6rem] font-bold uppercase tracking-wide truncate w-full text-center leading-tight"
            style={{
              color: card.color,
              textShadow: `0 0 6px ${card.color}40`,
            }}
          >
            {card.name}
          </div>

          {/* Matched checkmark */}
          {card.isMatched && (
            <div
              className="absolute top-0.5 right-0.5 text-xs"
              style={{
                animation: 'memory-check-pop 0.3s ease-out',
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
              }}
            >
              ✅
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes memory-card-shake {
          0%, 100% { transform: rotateY(0) scale(1); }
          25% { transform: rotateY(0) scale(1.05); }
          50% { transform: rotateY(0) scale(0.98); }
          75% { transform: rotateY(0) scale(1.02); }
        }
        @keyframes memory-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes memory-match-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes memory-check-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

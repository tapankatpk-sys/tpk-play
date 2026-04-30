'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// EQUIPOS LIGA BETPLAY - Escudos oficiales
// ============================================
const TEAMS = [
  { id: 'atletico-nacional', name: 'Atlético Nacional', color: '#00953b', city: 'Medellín', value: 3 },
  { id: 'millonarios', name: 'Millonarios', color: '#0033a0', city: 'Bogotá', value: 3 },
  { id: 'america-de-cali', name: 'América de Cali', color: '#e31937', city: 'Cali', value: 3 },
  { id: 'deportivo-cali', name: 'Deportivo Cali', color: '#007a33', city: 'Cali', value: 2 },
  { id: 'atletico-junior', name: 'Junior FC', color: '#c8102e', city: 'Barranquilla', value: 2 },
  { id: 'independiente-santa-fe', name: 'Santa Fe', color: '#c8102e', city: 'Bogotá', value: 2 },
  { id: 'independiente-medellin', name: 'Ind. Medellín', color: '#e31937', city: 'Medellín', value: 2 },
  { id: 'once-caldas', name: 'Once Caldas', color: '#0033a0', city: 'Manizales', value: 1 },
  { id: 'deportes-tolima', name: 'Deportes Tolima', color: '#fdd835', city: 'Ibagué', value: 1 },
  { id: 'atletico-bucaramanga', name: 'Atl. Bucaramanga', color: '#fdd835', city: 'Bucaramanga', value: 1 },
  { id: 'fortaleza-ceif', name: 'Fortaleza CEIF', color: '#e31937', city: 'Bogotá', value: 1 },
  { id: 'deportivo-pereira', name: 'Deportivo Pereira', color: '#c8102e', city: 'Pereira', value: 1 },
  { id: 'deportivo-pasto', name: 'Deportivo Pasto', color: '#1a237e', city: 'Pasto', value: 1 },
  { id: 'la-equidad', name: 'La Equidad', color: '#2e7d32', city: 'Bogotá', value: 1 },
  { id: 'jaguares-de-cordoba', name: 'Jaguares', color: '#f57f17', city: 'Montería', value: 1 },
  { id: 'cucuta-deportivo', name: 'Cúcuta Deportivo', color: '#b71c1c', city: 'Cúcuta', value: 1 },
  { id: 'internacional-de-bogota', name: 'Intl. Bogotá', color: '#1565c0', city: 'Bogotá', value: 1 },
  { id: 'alianza-valledupar', name: 'Alianza', color: '#00838f', city: 'Valledupar', value: 1 },
  { id: 'boyaca-chico', name: 'Boyacá Chicó', color: '#e65100', city: 'Tunja', value: 1 },
  { id: 'llaneros', name: 'Llaneros', color: '#4e342e', city: 'Villavicencio', value: 1 },
]

const MAX_SPINS = 5
const JACKPOT_POINTS = 50
const DOUBLE_POINTS = 10
const SINGLE_BONUS_POINTS = 5

type GameState = 'splash' | 'playing' | 'spinning' | 'result'

interface ReelResult {
  teamIndex: number
  team: typeof TEAMS[0]
}

function getRandomTeam(): number {
  return Math.floor(Math.random() * TEAMS.length)
}

// ============================================
// SLOT MACHINE COMPONENT
// ============================================
export default function SlotMachineGame() {
  const [gameState, setGameState] = useState<GameState>('splash')
  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS)
  const [totalPoints, setTotalPoints] = useState(0)
  const [reels, setReels] = useState<[number, number, number]>([0, 0, 0])
  const [spinning, setSpinning] = useState([false, false, false])
  const [spinSpeeds, setSpinSpeeds] = useState([1, 1, 1])
  const [result, setResult] = useState<'jackpot' | 'double' | 'bonus' | 'none' | null>(null)
  const [resultPoints, setResultPoints] = useState(0)
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [dailyTeam, setDailyTeam] = useState(0)
  const [history, setHistory] = useState<Array<{ reels: [number, number, number]; result: string; points: number }>>([])
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reelIntervalsRef = useRef<(NodeJS.Timeout | null)[]>([null, null, null])

  // Set daily team based on date
  useEffect(() => {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    setDailyTeam(dayOfYear % TEAMS.length)
  }, [])

  // Clean up intervals
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
      reelIntervalsRef.current.forEach(interval => {
        if (interval) clearInterval(interval)
      })
    }
  }, [])

  const startGame = useCallback(() => {
    setGameState('playing')
    setSpinsLeft(MAX_SPINS)
    setTotalPoints(0)
    setResult(null)
    setHistory([])
    setReels([getRandomTeam(), getRandomTeam(), getRandomTeam()])
    setSpinning([false, false, false])
  }, [])

  const spin = useCallback(() => {
    if (spinsLeft <= 0 || spinning.some(s => s)) return

    setResult(null)
    setShowWinAnimation(false)
    setSpinsLeft(prev => prev - 1)
    setSpinning([true, true, true])
    setGameState('spinning')

    // Generate final results
    const finalReels: [number, number, number] = [getRandomTeam(), getRandomTeam(), getRandomTeam()]

    // Spin each reel with different stop times
    const spinDurations = [2000, 2800, 3600] // staggered stop times
    const speeds = [50, 60, 70] // ms per tick

    reelIntervalsRef.current = [null, null, null]

    for (let i = 0; i < 3; i++) {
      let currentTeam = getRandomTeam()
      const tickInterval = speeds[i]

      // Start spinning
      reelIntervalsRef.current[i] = setInterval(() => {
        currentTeam = getRandomTeam()
        setReels(prev => {
          const newReels = [...prev] as [number, number, number]
          newReels[i] = currentTeam
          return newReels
        })
      }, tickInterval)

      // Stop reel after duration
      setTimeout(() => {
        if (reelIntervalsRef.current[i]) {
          clearInterval(reelIntervalsRef.current[i]!)
          reelIntervalsRef.current[i] = null
        }

        // Set final value with a little bounce
        setReels(prev => {
          const newReels = [...prev] as [number, number, number]
          newReels[i] = finalReels[i]
          return newReels
        })

        setSpinning(prev => {
          const newSpinning = [...prev] as [boolean, boolean, boolean]
          newSpinning[i] = false
          return newSpinning
        })

        // When last reel stops, calculate result
        if (i === 2) {
          setTimeout(() => {
            calculateResult(finalReels)
          }, 300)
        }
      }, spinDurations[i])
    }
  }, [spinsLeft, spinning, dailyTeam])

  const calculateResult = useCallback((finalReels: [number, number, number]) => {
    const t0 = finalReels[0]
    const t1 = finalReels[1]
    const t2 = finalReels[2]

    let res: 'jackpot' | 'double' | 'bonus' | 'none' = 'none'
    let pts = 0

    if (t0 === t1 && t1 === t2) {
      // JACKPOT - 3 iguales
      res = 'jackpot'
      pts = JACKPOT_POINTS * TEAMS[t0].value
    } else if (t0 === t1 || t1 === t2 || t0 === t2) {
      // DOBLE - 2 iguales
      res = 'double'
      pts = DOUBLE_POINTS
    } else if (t0 === dailyTeam || t1 === dailyTeam || t2 === dailyTeam) {
      // BONUS - equipo del día presente
      res = 'bonus'
      pts = SINGLE_BONUS_POINTS
    }

    setResult(res)
    setResultPoints(pts)
    setTotalPoints(prev => prev + pts)
    setGameState('result')

    if (res !== 'none') {
      setShowWinAnimation(true)
    }

    setHistory(prev => [{
      reels: finalReels,
      result: res,
      points: pts
    }, ...prev].slice(0, 10))
  }, [dailyTeam])

  const formatPoints = (pts: number) => {
    return pts.toLocaleString()
  }

  // ============================================
  // SPLASH SCREEN
  // ============================================
  if (gameState === 'splash') {
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(251, 191, 36, 0.4)',
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Animated background lights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute w-4 h-4 rounded-full"
              style={{
                top: '10%', left: '5%',
                background: '#fbbf24',
                boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24',
                animation: 'slot-light-blink 1.5s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-4 h-4 rounded-full"
              style={{
                top: '15%', right: '8%',
                background: '#ef4444',
                boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444',
                animation: 'slot-light-blink 1.5s ease-in-out infinite 0.3s',
              }}
            />
            <div
              className="absolute w-3 h-3 rounded-full"
              style={{
                bottom: '20%', left: '10%',
                background: '#a855f7',
                boxShadow: '0 0 10px #a855f7, 0 0 20px #a855f7',
                animation: 'slot-light-blink 1.5s ease-in-out infinite 0.7s',
              }}
            />
            <div
              className="absolute w-3 h-3 rounded-full"
              style={{
                bottom: '12%', right: '5%',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e, 0 0 20px #22c55e',
                animation: 'slot-light-blink 1.5s ease-in-out infinite 1s',
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: '40%', left: '3%',
                background: '#3b82f6',
                boxShadow: '0 0 8px #3b82f6, 0 0 16px #3b82f6',
                animation: 'slot-light-blink 1.5s ease-in-out infinite 0.5s',
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: '60%', right: '3%',
                background: '#fbbf24',
                boxShadow: '0 0 8px #fbbf24, 0 0 16px #fbbf24',
                animation: 'slot-light-blink 1.5s ease-in-out infinite 1.2s',
              }}
            />
          </div>

          {/* Game Icon */}
          <div className="mb-4 relative z-10">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(249, 115, 22, 0.15) 50%, transparent 70%)',
                border: '3px solid rgba(251, 191, 36, 0.6)',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), 0 0 80px rgba(251, 191, 36, 0.1), inset 0 0 20px rgba(251, 191, 36, 0.1)',
                animation: 'slot-float 3s ease-in-out infinite',
              }}
            >
              <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' }}>&#x1F3B0;</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-2xl md:text-4xl font-black uppercase tracking-wider mb-2 relative z-10"
            style={{
              background: 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444, #fbbf24)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.3))',
            }}
          >
            Tragamonedas Futbolera
          </h3>
          <p className="text-sm mb-1 relative z-10" style={{ color: 'rgba(251,191,36,0.7)' }}>
            Liga BetPlay
          </p>
          <p className="text-xs mb-6 relative z-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Gira los rodillos y encuentra los escudos iguales
          </p>

          {/* Prizes info */}
          <div className="mb-6 relative z-10">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(251,191,36,0.5)' }}>
              Premios
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <div
                className="px-3 py-2 rounded-lg text-center"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
              >
                <div className="text-lg font-black" style={{ color: '#fbbf24', textShadow: '0 0 8px rgba(251,191,36,0.5)' }}>
                  &#x1F3B0;&#x1F3B0;&#x1F3B0;
                </div>
                <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>JACKPOT</div>
                <div className="text-xs font-bold" style={{ color: '#fbbf24' }}>Hasta 150 pts</div>
              </div>
              <div
                className="px-3 py-2 rounded-lg text-center"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
              >
                <div className="text-lg font-black" style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168,85,247,0.5)' }}>
                  &#x1F3B0;&#x1F3B0;-
                </div>
                <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>DOBLE</div>
                <div className="text-xs font-bold" style={{ color: '#a855f7' }}>10 pts</div>
              </div>
              <div
                className="px-3 py-2 rounded-lg text-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <div className="text-lg font-black" style={{ color: '#22c55e', textShadow: '0 0 8px rgba(34,197,94,0.5)' }}>
                  &#x2B50;
                </div>
                <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>EQUIPO DEL DIA</div>
                <div className="text-xs font-bold" style={{ color: '#22c55e' }}>5 pts</div>
              </div>
            </div>
          </div>

          {/* Daily team highlight */}
          <div className="mb-6 relative z-10">
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              <span className="text-xs font-bold uppercase" style={{ color: 'rgba(251,191,36,0.6)' }}>
                Equipo del dia:
              </span>
              <img
                src={`/images/teams/${TEAMS[dailyTeam].id}.svg`}
                alt={TEAMS[dailyTeam].name}
                className="w-8 h-8 object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.src.endsWith('.png')) {
                    target.src = `/images/teams/${TEAMS[dailyTeam].id}.png`
                  }
                }}
              />
              <span className="text-sm font-bold" style={{ color: TEAMS[dailyTeam].color, textShadow: `0 0 6px ${TEAMS[dailyTeam].color}60` }}>
                {TEAMS[dailyTeam].name}
              </span>
            </div>
          </div>

          {/* Spins info */}
          <div className="mb-6 relative z-10">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {MAX_SPINS} giros gratis por partida
            </span>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            className="relative z-10 px-10 py-4 rounded-xl font-black uppercase tracking-wider text-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f97316, #ef4444)',
              boxShadow: '0 0 25px rgba(251, 191, 36, 0.5), 0 0 80px rgba(249, 115, 22, 0.2)',
              color: '#000',
            }}
          >
            &#x1F3B0; JUGAR
          </button>

          {/* How to play */}
          <div className="mt-6 text-left max-w-sm mx-auto relative z-10">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(251,191,36,0.4)' }}>
              Como jugar
            </p>
            <div className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p>&#x1F3B0; Presiona GIRAR para lanzar los rodillos</p>
              <p>&#x26BD; 3 escudos iguales = JACKPOT</p>
              <p>&#x2728; 2 escudos iguales = Doble</p>
              <p>&#x2B50; Equipo del dia = Bonus</p>
              <p>&#x1F3C6; Acumula puntos en tus {MAX_SPINS} giros</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slot-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-8px) scale(1.03); }
          }
          @keyframes slot-light-blink {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // GAME OVER SCREEN (no spins left)
  // ============================================
  if (gameState === 'result' && spinsLeft <= 0) {
    const jackpotCount = history.filter(h => h.result === 'jackpot').length
    const doubleCount = history.filter(h => h.result === 'double').length
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: totalPoints > 0 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255,255,255,0.1)',
            boxShadow: totalPoints > 0
              ? '0 0 40px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 0 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Celebration or consolation */}
          <div className="mb-4">
            <span className="text-6xl" style={{ filter: totalPoints > 0 ? 'drop-shadow(0 0 15px rgba(251,191,36,0.8))' : 'none' }}>
              {totalPoints >= 50 ? '&#x1F3C6;' : totalPoints > 0 ? '&#x1F389;' : '&#x1F4AA;'}
            </span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: totalPoints > 0
                ? 'linear-gradient(90deg, #fbbf24, #f97316, #fbbf24)'
                : 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.3))',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: totalPoints > 0 ? 'gradient-shift 2s linear infinite' : 'none',
            }}
          >
            {totalPoints >= 50 ? 'Increible!' : totalPoints > 0 ? 'Buen juego!' : 'Sigue intentando!'}
          </h3>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {totalPoints > 0 ? 'Tus giros han terminado' : 'La suerte cambiara en la proxima'}
          </p>

          {/* Points display */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-4"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)',
            }}
          >
            <span className="text-sm" style={{ color: 'rgba(251,191,36,0.7)' }}>Puntos:</span>
            <span
              className="text-3xl font-black"
              style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}
            >
              {formatPoints(totalPoints)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-black" style={{ color: '#fbbf24' }}>{jackpotCount}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Jackpots</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black" style={{ color: '#a855f7' }}>{doubleCount}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Dobles</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black" style={{ color: '#f97316' }}>{MAX_SPINS}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Giros</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)',
                color: '#000',
              }}
            >
              &#x1F504; Jugar de nuevo
            </button>
            <button
              onClick={() => setGameState('splash')}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              &#x1F3E0; Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MAIN GAME - PLAYING / SPINNING / RESULT
  // ============================================
  return (
    <div className="relative max-w-2xl mx-auto px-4">
      <div
        className="rounded-2xl p-4 md:p-6 border overflow-hidden relative"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          borderColor: 'rgba(251, 191, 36, 0.3)',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.1)',
        }}
      >
        {/* Win animation overlay */}
        {showWinAnimation && result === 'jackpot' && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
              animation: 'slot-jackpot-flash 0.5s ease-out 3',
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">&#x1F3B0;</span>
            <h3
              className="text-sm md:text-base font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #f97316, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Tragamonedas Futbolera
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Spins left */}
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(251, 191, 36, 0.1)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              &#x1F3B0; {spinsLeft} giros
            </div>
            {/* Points */}
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              &#x1F3C6; {totalPoints} pts
            </div>
          </div>
        </div>

        {/* Daily team indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[0.6rem] uppercase" style={{ color: 'rgba(251,191,36,0.5)' }}>Equipo del dia:</span>
          <img
            src={`/images/teams/${TEAMS[dailyTeam].id}.svg`}
            alt={TEAMS[dailyTeam].name}
            className="w-5 h-5 object-contain"
            style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.src.endsWith('.png')) {
                target.src = `/images/teams/${TEAMS[dailyTeam].id}.png`
              }
            }}
          />
          <span className="text-[0.6rem] font-bold" style={{ color: TEAMS[dailyTeam].color }}>
            {TEAMS[dailyTeam].name}
          </span>
          <span className="text-[0.6rem]" style={{ color: 'rgba(34,197,94,0.6)' }}>+5 pts</span>
        </div>

        {/* ============================================ */}
        {/* SLOT MACHINE REELS */}
        {/* ============================================ */}
        <div className="relative mb-4">
          {/* Machine frame */}
          <div
            className="rounded-xl p-1 relative"
            style={{
              background: 'linear-gradient(180deg, rgba(251,191,36,0.3), rgba(249,115,22,0.2), rgba(251,191,36,0.3))',
              boxShadow: '0 0 20px rgba(251,191,36,0.15), inset 0 0 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Inner frame */}
            <div
              className="rounded-lg p-3 md:p-4"
              style={{
                background: 'linear-gradient(180deg, #0a0015, #0d0018, #0a0015)',
                border: '2px solid rgba(251,191,36,0.2)',
              }}
            >
              {/* Top lights row */}
              <div className="flex justify-around mb-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={`top-${i}`}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: spinning.some(s => s) ? (i % 2 === 0 ? '#fbbf24' : '#ef4444') : '#fbbf2440',
                      boxShadow: spinning.some(s => s)
                        ? `0 0 6px ${i % 2 === 0 ? '#fbbf24' : '#ef4444'}`
                        : 'none',
                      animation: spinning.some(s => s) ? `slot-light-chase 0.3s linear infinite ${i * 0.05}s` : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Reels container */}
              <div className="flex gap-2 md:gap-3 justify-center items-center">
                {reels.map((teamIndex, reelIndex) => (
                  <div key={reelIndex} className="flex-1 max-w-[140px]">
                    <SlotReel
                      team={TEAMS[teamIndex]}
                      isSpinning={spinning[reelIndex]}
                      isResult={result !== null && !spinning.some(s => s)}
                      resultType={result}
                      reelIndex={reelIndex}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom lights row */}
              <div className="flex justify-around mt-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={`bottom-${i}`}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: spinning.some(s => s) ? (i % 2 === 0 ? '#22c55e' : '#a855f7') : '#22c55e40',
                      boxShadow: spinning.some(s => s)
                        ? `0 0 6px ${i % 2 === 0 ? '#22c55e' : '#a855f7'}`
                        : 'none',
                      animation: spinning.some(s => s) ? `slot-light-chase 0.3s linear infinite ${i * 0.05}s` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pay line indicator */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.5), rgba(239,68,68,0.1), rgba(239,68,68,0.5))' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
          </div>
        </div>

        {/* Result display */}
        {result && !spinning.some(s => s) && (
          <div
            className="mb-4 rounded-xl p-3 text-center"
            style={{
              background: result === 'jackpot'
                ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1))'
                : result === 'double'
                ? 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))'
                : result === 'bonus'
                ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${
                result === 'jackpot' ? 'rgba(251,191,36,0.4)'
                : result === 'double' ? 'rgba(168,85,247,0.3)'
                : result === 'bonus' ? 'rgba(34,197,94,0.3)'
                : 'rgba(255,255,255,0.08)'
              }`,
              animation: result === 'jackpot' ? 'slot-result-pop 0.5s ease-out' : 'none',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">
                {result === 'jackpot' ? '&#x1F3C6;' : result === 'double' ? '&#x2728;' : result === 'bonus' ? '&#x2B50;' : '&#x1F614;'}
              </span>
              <span
                className="text-sm font-black uppercase"
                style={{
                  color: result === 'jackpot' ? '#fbbf24' : result === 'double' ? '#a855f7' : result === 'bonus' ? '#22c55e' : 'rgba(255,255,255,0.4)',
                  textShadow: result === 'jackpot' ? '0 0 10px rgba(251,191,36,0.5)' : 'none',
                }}
              >
                {result === 'jackpot' ? 'JACKPOT!' : result === 'double' ? 'DOBLE!' : result === 'bonus' ? 'BONUS!' : 'Sin suerte'}
              </span>
              {resultPoints > 0 && (
                <span className="text-sm font-bold" style={{ color: '#4ade80' }}>
                  +{resultPoints} pts
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spin button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={spin}
            disabled={spinsLeft <= 0 || spinning.some(s => s)}
            className="px-10 py-3 rounded-xl font-black uppercase tracking-wider text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
            style={{
              background: spinning.some(s => s)
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #fbbf24, #f97316, #ef4444)',
              boxShadow: spinning.some(s => s)
                ? 'none'
                : '0 0 25px rgba(251, 191, 36, 0.4), 0 0 60px rgba(249, 115, 22, 0.15)',
              color: spinning.some(s => s) ? 'rgba(255,255,255,0.3)' : '#000',
            }}
          >
            {spinning.some(s => s) ? (
              <span className="flex items-center gap-2">
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }}
                />
                Girando...
              </span>
            ) : (
              <span>&#x1F3B0; GIRAR</span>
            )}
          </button>
        </div>

        {/* History mini display */}
        {history.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {history.slice(0, 5).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.55rem]"
                  style={{
                    background: h.result === 'jackpot' ? 'rgba(251,191,36,0.1)'
                      : h.result === 'double' ? 'rgba(168,85,247,0.08)'
                      : h.result === 'bonus' ? 'rgba(34,197,94,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      h.result === 'jackpot' ? 'rgba(251,191,36,0.2)'
                      : h.result === 'double' ? 'rgba(168,85,247,0.15)'
                      : h.result === 'bonus' ? 'rgba(34,197,94,0.15)'
                      : 'rgba(255,255,255,0.05)'
                    }`,
                  }}
                >
                  {h.reels.map((teamIdx, ri) => (
                    <img
                      key={ri}
                      src={`/images/teams/${TEAMS[teamIdx].id}.svg`}
                      alt=""
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.src.endsWith('.png')) {
                          target.src = `/images/teams/${TEAMS[teamIdx].id}.png`
                        }
                      }}
                    />
                  ))}
                  {h.points > 0 && (
                    <span style={{
                      color: h.result === 'jackpot' ? '#fbbf24' : h.result === 'double' ? '#a855f7' : '#22c55e',
                    }}>
                      +{h.points}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setGameState('splash')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            &#x2190; Salir
          </button>
          <button
            onClick={startGame}
            disabled={spinning.some(s => s)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 disabled:opacity-40 cursor-pointer"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              color: '#fbbf24',
            }}
          >
            &#x1F504; Reiniciar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slot-jackpot-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes slot-result-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slot-light-chase {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        @keyframes slot-reel-blur {
          0% { filter: blur(0px); }
          20% { filter: blur(2px); }
          80% { filter: blur(2px); }
          100% { filter: blur(0px); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// SLOT REEL COMPONENT
// ============================================
function SlotReel({
  team,
  isSpinning,
  isResult,
  resultType,
  reelIndex,
}: {
  team: typeof TEAMS[0]
  isSpinning: boolean
  isResult: boolean
  resultType: 'jackpot' | 'double' | 'bonus' | 'none' | null
  reelIndex: number
}) {
  const isWinReel = isResult && (resultType === 'jackpot' || resultType === 'double')
  const isJackpot = isResult && resultType === 'jackpot'

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050008, #0a0015, #050008)',
        border: `2px solid ${
          isJackpot ? 'rgba(251,191,36,0.8)'
          : isWinReel ? 'rgba(168,85,247,0.6)'
          : 'rgba(251,191,36,0.15)'
        }`,
        boxShadow: isJackpot
          ? '0 0 25px rgba(251,191,36,0.5), inset 0 0 15px rgba(251,191,36,0.1)'
          : isWinReel
          ? '0 0 15px rgba(168,85,247,0.3), inset 0 0 10px rgba(168,85,247,0.05)'
          : 'inset 0 0 15px rgba(0,0,0,0.5)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Gradient overlays for depth */}
      <div
        className="absolute top-0 left-0 right-0 h-6 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #050008, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-6 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050008, transparent)' }}
      />

      {/* Shield display area */}
      <div
        className="flex flex-col items-center justify-center p-2 md:p-3"
        style={{
          minHeight: '140px',
          animation: isSpinning ? 'slot-reel-blur 0.2s linear infinite' : 'none',
          transition: isSpinning ? 'none' : 'filter 0.3s ease-out',
        }}
      >
        {/* Team shield */}
        <div
          className="relative mb-1"
          style={{
            width: '80px',
            height: '80px',
            animation: isJackpot ? 'slot-shield-glow 0.5s ease-in-out infinite alternate' : 'none',
          }}
        >
          <img
            src={`/images/teams/${team.id}.svg`}
            alt={team.name}
            className="w-full h-full object-contain"
            style={{
              filter: isWinReel
                ? 'drop-shadow(0 0 10px rgba(251,191,36,0.6)) brightness(1.2)'
                : 'drop-shadow(0 0 4px rgba(255,255,255,0.15))',
              transition: 'filter 0.3s ease-out',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.src.endsWith('.png')) {
                target.src = `/images/teams/${team.id}.png`
              }
            }}
          />

          {/* Win glow overlay */}
          {isJackpot && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)',
                animation: 'slot-glow-pulse 0.8s ease-in-out infinite alternate',
              }}
            />
          )}
        </div>

        {/* Team name */}
        <div
          className="text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-wide text-center truncate max-w-full leading-tight"
          style={{
            color: isWinReel ? team.color : 'rgba(255,255,255,0.5)',
            textShadow: isWinReel ? `0 0 8px ${team.color}60` : 'none',
            transition: 'color 0.3s, text-shadow 0.3s',
          }}
        >
          {team.name}
        </div>

        {/* Team value indicator */}
        {team.value >= 3 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: team.value }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#fbbf24',
                  boxShadow: '0 0 4px rgba(251,191,36,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side lights */}
      <div className="absolute top-2 bottom-2 left-0 flex flex-col justify-around">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={`left-${i}`}
            className="w-1 h-1 rounded-full ml-0.5"
            style={{
              background: isSpinning
                ? (i + reelIndex) % 2 === 0 ? '#fbbf24' : '#ef4444'
                : isWinReel ? '#fbbf24' : 'rgba(251,191,36,0.2)',
              boxShadow: isSpinning || isWinReel
                ? `0 0 4px ${isSpinning ? ((i + reelIndex) % 2 === 0 ? '#fbbf24' : '#ef4444') : '#fbbf24'}`
                : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          />
        ))}
      </div>
      <div className="absolute top-2 bottom-2 right-0 flex flex-col justify-around">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={`right-${i}`}
            className="w-1 h-1 rounded-full mr-0.5"
            style={{
              background: isSpinning
                ? (i + reelIndex) % 2 === 0 ? '#a855f7' : '#22c55e'
                : isWinReel ? '#a855f7' : 'rgba(168,85,247,0.2)',
              boxShadow: isSpinning || isWinReel
                ? `0 0 4px ${isSpinning ? ((i + reelIndex) % 2 === 0 ? '#a855f7' : '#22c55e') : '#a855f7'}`
                : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slot-shield-glow {
          0% { filter: drop-shadow(0 0 5px rgba(251,191,36,0.3)); transform: scale(1); }
          100% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.8)); transform: scale(1.05); }
        }
        @keyframes slot-glow-pulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

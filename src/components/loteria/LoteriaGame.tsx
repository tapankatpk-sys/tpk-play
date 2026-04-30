'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

// ============================================
// TEAM DATA - 20 Liga BetPlay 2026 teams
// ============================================
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
  { slug: 'jaguares-de-cordoba', name: 'Jaguares' },
  { slug: 'llaneros', name: 'Llaneros' },
  { slug: 'millonarios', name: 'Millonarios' },
  { slug: 'once-caldas', name: 'Once Caldas' },
]

const PNG_ONLY_TEAMS = ['internacional-de-bogota']

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getHourKey(): string {
  const now = new Date()
  const colombiaOffset = -5
  const colombiaTime = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset() / 60) * 3600000)
  return `${colombiaTime.getFullYear()}-${String(colombiaTime.getMonth() + 1).padStart(2, '0')}-${String(colombiaTime.getDate()).padStart(2, '0')}-${String(colombiaTime.getHours()).padStart(2, '0')}`
}

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  let state = Math.abs(hash) || 1
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// ============================================
// GAME CONFIG FROM API
// ============================================
interface LoteriaConfigData {
  boardSize: number
  pointsLine: number
  pointsDiag: number
  pointsFull: number
  drawSpeed: number
  isActive: boolean
}

const DEFAULT_CONFIG: LoteriaConfigData = {
  boardSize: 4,
  pointsLine: 30,
  pointsDiag: 50,
  pointsFull: 100,
  drawSpeed: 5,
  isActive: true,
}

type GamePhase = 'intro' | 'playing' | 'won' | 'lost' | 'completed' | 'disabled'

// ============================================
// WIN PATTERN GENERATOR (dynamic based on board size)
// ============================================
function generateWinPatterns(size: number) {
  const patterns: { row: number[][]; col: number[][]; diagonal: number[][] } = { row: [], col: [], diagonal: [] }

  // Rows
  for (let r = 0; r < size; r++) {
    patterns.row.push(Array.from({ length: size }, (_, c) => r * size + c))
  }

  // Columns
  for (let c = 0; c < size; c++) {
    patterns.col.push(Array.from({ length: size }, (_, r) => r * size + c))
  }

  // Diagonals
  patterns.diagonal.push(Array.from({ length: size }, (_, i) => i * size + i))
  patterns.diagonal.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)))

  return patterns
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LoteriaGame() {
  const [config, setConfig] = useState<LoteriaConfigData>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [board, setBoard] = useState<typeof TEAMS>([])
  const [drawnTeams, setDrawnTeams] = useState<typeof TEAMS>([])
  const [markedCells, setMarkedCells] = useState<Set<number>>(new Set())
  const [currentDraw, setCurrentDraw] = useState<typeof TEAMS[0] | null>(null)
  const [drawIndex, setDrawIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winType, setWinType] = useState<string>('')
  const [points, setPoints] = useState(0)
  const [canPlay, setCanPlay] = useState(true)
  const [showDrawnTeam, setShowDrawnTeam] = useState(false)
  const [drawAnimation, setDrawAnimation] = useState(false)
  const drawTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoDrawRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch config from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/loteria')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig({
              boardSize: data.boardSize || 4,
              pointsLine: data.pointsLine || 30,
              pointsDiag: data.pointsDiag || 50,
              pointsFull: data.pointsFull || 100,
              drawSpeed: data.drawSpeed || 5,
              isActive: data.isActive !== false,
            })
          }
        }
      } catch {
        // Use defaults
      }
      setConfigLoaded(true)
    }
    fetchConfig()
  }, [])

  // Check hourly play limit
  useEffect(() => {
    if (!configLoaded) return
    if (!config.isActive) {
      setPhase('disabled')
      return
    }
    const hourKey = getHourKey()
    const played = localStorage.getItem(`tpk_loteria_played_${hourKey}`)
    if (played) {
      setCanPlay(false)
    }
  }, [configLoaded, config.isActive])

  // Generate board from seed
  const generateBoard = useCallback((boardSize: number) => {
    const hourKey = getHourKey()
    const rng = seededRandom(`loteria-${hourKey}-${boardSize}`)
    const shuffled = [...TEAMS]
    // Seeded shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, boardSize * boardSize)
  }, [])

  // Generate draw order from seed
  const generateDrawOrder = useCallback(() => {
    const hourKey = getHourKey()
    const rng = seededRandom(`loteria-draw-${hourKey}`)
    const allTeams = [...TEAMS]
    for (let i = allTeams.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[allTeams[i], allTeams[j]] = [allTeams[j], allTeams[i]]
    }
    return allTeams
  }, [])

  // Check win condition
  const checkWin = useCallback((marked: Set<number>, boardSize: number): { won: boolean; type: string } => {
    const winPatterns = generateWinPatterns(boardSize)
    for (const [type, patterns] of Object.entries(winPatterns)) {
      for (const pattern of patterns) {
        if (pattern.every(idx => marked.has(idx))) {
          return { won: true, type: type === 'row' ? 'LÍNEA HORIZONTAL' : type === 'col' ? 'LÍNEA VERTICAL' : 'DIAGONAL' }
        }
      }
    }
    // Full board
    if (marked.size === boardSize * boardSize) {
      return { won: true, type: 'LOTERÍA COMPLETA' }
    }
    return { won: false, type: '' }
  }, [])

  // Get points for win type
  const getPointsForWin = useCallback((winType: string): number => {
    if (winType === 'LOTERÍA COMPLETA') return config.pointsFull
    if (winType === 'DIAGONAL') return config.pointsDiag
    return config.pointsLine // Lines (horizontal/vertical)
  }, [config.pointsLine, config.pointsDiag, config.pointsFull])

  // Start game
  const startGame = () => {
    const boardSize = config.boardSize
    const newBoard = generateBoard(boardSize)
    const newDrawOrder = generateDrawOrder()
    setBoard(newBoard)
    setDrawnTeams(newDrawOrder)
    setMarkedCells(new Set())
    setCurrentDraw(null)
    setDrawIndex(0)
    setPoints(0)
    setWinType('')
    setPhase('playing')
    setShowDrawnTeam(false)

    // Start first draw after a moment
    setTimeout(() => {
      drawNext(newDrawOrder, 0, new Set(), boardSize)
    }, 1000)
  }

  // Draw next team
  const drawNext = useCallback((drawOrder: typeof TEAMS, index: number, currentMarked: Set<number>, boardSize: number) => {
    if (index >= drawOrder.length) {
      setPhase('completed')
      return
    }

    setDrawIndex(index)
    setDrawAnimation(true)
    setCurrentDraw(drawOrder[index])
    setShowDrawnTeam(true)

    // Animation settle
    setTimeout(() => {
      setDrawAnimation(false)
    }, 600)

    // Auto advance after drawSpeed seconds if player doesn't mark
    if (autoDrawRef.current) clearTimeout(autoDrawRef.current)
    autoDrawRef.current = setTimeout(() => {
      const nextIndex = index + 1
      if (nextIndex >= drawOrder.length) {
        // Check if player has any win
        if (currentMarked.size > 0) {
          const result = checkWin(currentMarked, boardSize)
          if (result.won) {
            setWinType(result.type)
            const pts = getPointsForWin(result.type)
            setPoints(pts)
            setPhase('won')
            const hourKey = getHourKey()
            localStorage.setItem(`tpk_loteria_played_${hourKey}`, JSON.stringify({ points: pts, winType: result.type }))
            return
          }
        }
        setPhase('lost')
        const hourKey = getHourKey()
        localStorage.setItem(`tpk_loteria_played_${hourKey}`, JSON.stringify({ points: 0 }))
      } else {
        drawNext(drawOrder, nextIndex, currentMarked, boardSize)
      }
    }, config.drawSpeed * 1000)
  }, [checkWin, getPointsForWin, config.drawSpeed])

  // Mark a cell
  const handleMarkCell = (cellIndex: number) => {
    if (phase !== 'playing') return
    if (markedCells.has(cellIndex)) return
    if (!currentDraw) return

    const cellTeam = board[cellIndex]
    if (cellTeam.slug !== currentDraw.slug) return

    const newMarked = new Set(markedCells)
    newMarked.add(cellIndex)
    setMarkedCells(newMarked)

    // Check win
    const result = checkWin(newMarked, config.boardSize)
    if (result.won) {
      if (autoDrawRef.current) clearTimeout(autoDrawRef.current)
      setWinType(result.type)
      const pts = getPointsForWin(result.type)
      setPoints(pts)
      setPhase('won')
      const hourKey = getHourKey()
      localStorage.setItem(`tpk_loteria_played_${hourKey}`, JSON.stringify({ points: pts, winType: result.type }))
      return
    }

    // Auto draw next after marking
    if (autoDrawRef.current) clearTimeout(autoDrawRef.current)
    setTimeout(() => {
      const nextIndex = drawIndex + 1
      if (nextIndex >= drawnTeams.length) {
        setPhase('completed')
      } else {
        drawNext(drawnTeams, nextIndex, newMarked, config.boardSize)
      }
    }, 1200)
  }

  // Claim Lotería (manual claim)
  const handleClaimLoteria = () => {
    const result = checkWin(markedCells, config.boardSize)
    if (result.won) {
      if (autoDrawRef.current) clearTimeout(autoDrawRef.current)
      setWinType(result.type)
      const pts = getPointsForWin(result.type)
      setPoints(pts)
      setPhase('won')
      const hourKey = getHourKey()
      localStorage.setItem(`tpk_loteria_played_${hourKey}`, JSON.stringify({ points: pts, winType: result.type }))
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoDrawRef.current) clearTimeout(autoDrawRef.current)
      if (drawTimerRef.current) clearTimeout(drawTimerRef.current)
    }
  }, [])

  const boardSize = config.boardSize

  // ============================================
  // RENDER
  // ============================================
  if (!configLoaded) {
    return (
      <div className="relative">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ color: '#ff00ff' }}>
            LOTERÍA DE EQUIPOS
          </h3>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,0,255,0.2)' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ff00ff', borderTopColor: 'transparent' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #ff00ff)' }} />
          <h3
            className="text-lg md:text-xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #ff00ff, #ffc800, #00ffff, #ff00ff)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(255,0,255,0.4))',
            }}
          >
            LOTERÍA DE EQUIPOS
          </h3>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #ff00ff)' }} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,0,255,0.4)' }}>
          Marca los escudos que salgan en tu tabla
        </p>
      </div>

      {/* Game Container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,5,40,0.9) 50%, rgba(0,0,0,0.8) 100%)',
          border: '2px solid rgba(255,0,255,0.3)',
          boxShadow: '0 0 20px rgba(255,0,255,0.15), 0 0 40px rgba(255,200,0,0.08)',
        }}
      >
        {/* LED border lights - Top */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-2 pointer-events-none z-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`t-${i}`}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? '#ff00ff' : '#ffc800',
                boxShadow: `0 0 4px ${i % 2 === 0 ? '#ff00ff' : '#ffc800'}, 0 0 8px ${i % 2 === 0 ? '#ff00ff' : '#ffc800'}`,
                animation: `led-pulse 1.5s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
        {/* LED border lights - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around px-2 pointer-events-none z-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`b-${i}`}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? '#ffc800' : '#00ffff',
                boxShadow: `0 0 4px ${i % 2 === 0 ? '#ffc800' : '#00ffff'}, 0 0 8px ${i % 2 === 0 ? '#ffc800' : '#00ffff'}`,
                animation: `led-pulse 1.5s ease-in-out ${(16 - i) * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4 md:p-6">
          {/* ====== DISABLED PHASE ====== */}
          {phase === 'disabled' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl mb-2" style={{ filter: 'grayscale(1)' }}>🃏</div>
              <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Lotería No Disponible
              </h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                El juego está desactivado temporalmente
              </p>
            </div>
          )}

          {/* ====== INTRO PHASE ====== */}
          {phase === 'intro' && (
            <div className="text-center py-8 space-y-6">
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #ffc800)',
                  boxShadow: '0 0 20px rgba(255,0,255,0.4), 0 0 40px rgba(255,200,0,0.2)',
                }}
              >
                <span className="text-4xl">🃏</span>
              </div>
              <div>
                <h4 className="text-xl font-black uppercase" style={{ color: '#ff00ff', textShadow: '0 0 10px rgba(255,0,255,0.5)' }}>
                  Lotería de Equipos
                </h4>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Se sortean escudos y tú marcas en tu tabla ({boardSize}x{boardSize})
                </p>
              </div>

              {/* Prizes info */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#ff00ff' }}>Línea</div>
                  <div className="text-sm font-black" style={{ color: '#ffc800' }}>+{config.pointsLine} pts</div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#00ffff' }}>Diagonal</div>
                  <div className="text-sm font-black" style={{ color: '#ffc800' }}>+{config.pointsDiag} pts</div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#ffc800' }}>Completa</div>
                  <div className="text-sm font-black" style={{ color: '#ffc800' }}>+{config.pointsFull} pts</div>
                </div>
              </div>

              {!canPlay ? (
                <div>
                  <div className="px-4 py-3 rounded-xl inline-block" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                    <p className="text-xs font-bold" style={{ color: '#ffc800' }}>
                      Ya jugaste esta hora. Vuelve la próxima hora para una nueva partida.
                    </p>
                  </div>
                  <p className="text-[0.6rem] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Cambia cada hora · Una oportunidad por jugador
                  </p>
                </div>
              ) : (
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ff00ff, #ffc800)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(255,0,255,0.4), 0 0 30px rgba(255,200,0,0.2)',
                  }}
                >
                  Jugar Lotería
                </button>
              )}
            </div>
          )}

          {/* ====== PLAYING PHASE ====== */}
          {phase === 'playing' && board.length > 0 && (
            <div className="space-y-4">
              {/* Current Draw Display */}
              <div className="text-center">
                <div className="text-[0.6rem] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Escudo Sorteado ({drawIndex + 1}/{drawnTeams.length})
                </div>
                <div
                  className="relative inline-flex flex-col items-center"
                  style={{
                    transition: 'all 0.3s',
                    transform: drawAnimation ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {currentDraw && (
                    <>
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                          background: 'rgba(255,0,255,0.1)',
                          border: '3px solid #ff00ff',
                          boxShadow: '0 0 15px rgba(255,0,255,0.5), 0 0 30px rgba(255,0,255,0.2), inset 0 0 10px rgba(255,0,255,0.1)',
                        }}
                      >
                        <Image
                          src={getTeamShield(currentDraw.slug)}
                          alt={currentDraw.name}
                          width={56}
                          height={56}
                          className="w-12 h-12 md:w-16 md:h-16 object-contain"
                          style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.6))' }}
                        />
                      </div>
                      <span
                        className="mt-2 text-xs font-black uppercase tracking-wide"
                        style={{
                          color: '#ff00ff',
                          textShadow: '0 0 8px rgba(255,0,255,0.5)',
                        }}
                      >
                        {currentDraw.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((drawIndex + 1) / drawnTeams.length) * 100}%`,
                    background: 'linear-gradient(90deg, #ff00ff, #ffc800, #00ffff)',
                    boxShadow: '0 0 6px rgba(255,0,255,0.4)',
                  }}
                />
              </div>

              {/* Dynamic Board Grid */}
              <div
                className="grid gap-2 md:gap-3 max-w-md mx-auto"
                style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
              >
                {board.map((team, idx) => {
                  const isMarked = markedCells.has(idx)
                  const isCurrentDraw = currentDraw?.slug === team.slug
                  const isOnBoard = drawnTeams.slice(0, drawIndex + 1).some(t => t.slug === team.slug)

                  return (
                    <button
                      key={`${team.slug}-${idx}`}
                      onClick={() => handleMarkCell(idx)}
                      disabled={isMarked || !isCurrentDraw}
                      className={`
                        relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center
                        transition-all duration-300 cursor-pointer
                      `}
                      style={{
                        background: isMarked
                          ? 'linear-gradient(135deg, rgba(255,0,255,0.2), rgba(255,200,0,0.2))'
                          : 'rgba(255,255,255,0.03)',
                        border: isMarked
                          ? '2px solid #ff00ff'
                          : isCurrentDraw
                          ? '2px solid #ffc800'
                          : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isMarked
                          ? '0 0 10px rgba(255,0,255,0.4), 0 0 20px rgba(255,200,0,0.2), inset 0 0 8px rgba(255,0,255,0.1)'
                          : isCurrentDraw
                          ? '0 0 8px rgba(255,200,0,0.4)'
                          : 'none',
                        transform: isMarked ? 'scale(0.95)' : isCurrentDraw ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Team Shield */}
                      <Image
                        src={getTeamShield(team.slug)}
                        alt={team.name}
                        width={40}
                        height={40}
                        className={`w-8 h-8 md:w-10 md:h-10 object-contain transition-all duration-300 ${isMarked ? 'brightness-125' : !isOnBoard && drawIndex > 2 ? 'brightness-50' : ''}`}
                        style={{
                          filter: isMarked ? 'drop-shadow(0 0 6px rgba(255,0,255,0.6))' : 'drop-shadow(0 0 2px rgba(255,255,255,0.1))',
                        }}
                      />

                      {/* Team name - tiny */}
                      <span
                        className="text-[0.45rem] md:text-[0.5rem] font-bold uppercase mt-0.5 leading-tight text-center px-0.5 truncate w-full"
                        style={{
                          color: isMarked ? '#ff00ff' : 'rgba(255,255,255,0.35)',
                          textShadow: isMarked ? '0 0 4px rgba(255,0,255,0.5)' : 'none',
                        }}
                      >
                        {team.name.split(' ').pop()}
                      </span>

                      {/* Marked overlay */}
                      {isMarked && (
                        <div
                          className="absolute inset-0 pointer-events-none flex items-center justify-center"
                          style={{
                            background: 'radial-gradient(circle, rgba(255,0,255,0.15) 0%, transparent 70%)',
                          }}
                        >
                          <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 6px #ff00ff)' }}>✦</span>
                        </div>
                      )}

                      {/* Pulse ring for current draw match */}
                      {isCurrentDraw && !isMarked && (
                        <div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{
                            border: '2px solid #ffc800',
                            boxShadow: '0 0 12px rgba(255,200,0,0.4), inset 0 0 8px rgba(255,200,0,0.1)',
                            animation: 'pulse-ring 1.5s ease-in-out infinite',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Claim Lotería button */}
              {markedCells.size >= boardSize && (
                <div className="text-center">
                  <button
                    onClick={handleClaimLoteria}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ff00ff, #ffc800)',
                      color: '#000',
                      boxShadow: '0 0 12px rgba(255,0,255,0.4), 0 0 24px rgba(255,200,0,0.2)',
                      animation: 'pulse-glow 2s ease-in-out infinite',
                    }}
                  >
                    ¡LOTERÍA! 🎉
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ====== WON PHASE ====== */}
          {phase === 'won' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl mb-2" style={{ filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.6))' }}>🎉</div>
              <h4
                className="text-2xl font-black uppercase"
                style={{
                  color: '#ffc800',
                  textShadow: '0 0 10px rgba(255,200,0,0.6), 0 0 20px rgba(255,200,0,0.3)',
                }}
              >
                ¡LOTERÍA!
              </h4>
              <div
                className="inline-block px-4 py-2 rounded-lg"
                style={{
                  background: 'rgba(255,0,255,0.1)',
                  border: '1px solid rgba(255,0,255,0.4)',
                  boxShadow: '0 0 10px rgba(255,0,255,0.2)',
                }}
              >
                <span className="text-xs font-bold" style={{ color: '#ff00ff' }}>{winType}</span>
              </div>
              <div>
                <span className="text-3xl font-black" style={{ color: '#ffc800', textShadow: '0 0 12px rgba(255,200,0,0.6)' }}>
                  +{points} pts
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Vuelve la próxima hora para una nueva partida
              </p>
            </div>
          )}

          {/* ====== LOST PHASE ====== */}
          {phase === 'lost' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl mb-2">😢</div>
              <h4 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                No completaste ninguna línea
              </h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Vuelve la próxima hora para una nueva partida
              </p>
            </div>
          )}

          {/* ====== COMPLETED PHASE ====== */}
          {phase === 'completed' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl mb-2">🏁</div>
              <h4 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Se sortearon todos los escudos
              </h4>
              {markedCells.size > 0 ? (
                <div>
                  <span className="text-sm" style={{ color: 'rgba(255,0,255,0.6)' }}>
                    Marcaste {markedCells.size} de {boardSize * boardSize} escudos
                  </span>
                </div>
              ) : null}
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Vuelve la próxima hora para una nueva partida
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes led-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(255,200,0,0.4), inset 0 0 8px rgba(255,200,0,0.1); }
          50% { opacity: 0.6; box-shadow: 0 0 6px rgba(255,200,0,0.2), inset 0 0 4px rgba(255,200,0,0.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(255,0,255,0.4), 0 0 24px rgba(255,200,0,0.2); }
          50% { box-shadow: 0 0 20px rgba(255,0,255,0.6), 0 0 40px rgba(255,200,0,0.3); }
        }
      `}</style>
    </div>
  )
}

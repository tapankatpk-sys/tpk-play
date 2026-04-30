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

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface Piece {
  id: number
  correctIndex: number
  row: number
  col: number
}

interface Config {
  gridSize: number
  pointsComplete: number
  timeBonusMax: number
  timeLimit: number
  showPreview: boolean
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

export default function RompecabezasGame() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [pieces, setPieces] = useState<Piece[]>([])
  const [placedPieces, setPlacedPieces] = useState<(number | null)[]>([])
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null)
  const [timer, setTimer] = useState(0)
  const [moves, setMoves] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalPieces, setTotalPieces] = useState(36)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_rompecabezas_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/rompecabezas')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
            setTotalPieces(data.gridSize * data.gridSize)
            setShowPreview(data.showPreview)
          }
        }
      } catch (err) {
        console.error('Error fetching rompecabezas config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Update team every minute (in case hour changes while playing)
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

  // Initialize puzzle
  const initPuzzle = useCallback(() => {
    if (!config) return
    const size = config.gridSize
    const total = size * size

    const allPieces: Piece[] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = r * size + c
        allPieces.push({ id: idx, correctIndex: idx, row: r, col: c })
      }
    }

    // Shuffle pieces (for the pool)
    const shuffled = shuffleArray(allPieces)
    setPieces(shuffled)
    setPlacedPieces(new Array(total).fill(null))
    setCorrectCount(0)
    setMoves(0)
    setTimer(0)
    setImageLoaded(false)
    setImageError(false)
  }, [config])

  const handleStart = useCallback(() => {
    if (!config) return
    initPuzzle()
    setPhase('playing')
  }, [config, initPuzzle])

  // Handle piece drag start
  const handleDragStart = useCallback((pieceId: number) => {
    setDraggedPiece(pieceId)
  }, [])

  // Handle drop on grid cell
  const handleDrop = useCallback((cellIndex: number) => {
    if (draggedPiece === null || phase !== 'playing') return

    setPlacedPieces(prev => {
      const newPlaced = [...prev]
      // If cell already has a piece, return the old piece to pool
      const existingPiece = newPlaced[cellIndex]

      // Check if this piece is already placed somewhere
      const existingPlacement = newPlaced.indexOf(draggedPiece)
      if (existingPlacement !== -1) {
        newPlaced[existingPlacement] = existingPiece // swap or clear
      }

      newPlaced[cellIndex] = draggedPiece

      // Calculate correct count
      let correct = 0
      for (let i = 0; i < newPlaced.length; i++) {
        if (newPlaced[i] === i) correct++
      }
      setCorrectCount(correct)

      // Check win
      if (correct === totalPieces) {
        setTimeout(() => setPhase('won'), 300)
      }

      return newPlaced
    })

    setMoves(prev => prev + 1)
    setDraggedPiece(null)
  }, [draggedPiece, phase, totalPieces])

  // Handle returning a piece from grid to pool (double click)
  const handleCellDoubleClick = useCallback((cellIndex: number) => {
    if (phase !== 'playing') return
    setPlacedPieces(prev => {
      const newPlaced = [...prev]
      newPlaced[cellIndex] = null
      return newPlaced
    })
  }, [phase])

  // Touch support refs
  const touchPieceRef = useRef<number | null>(null)
  const touchCellRef = useRef<number | null>(null)

  const handleTouchStartPiece = useCallback((pieceId: number) => {
    touchPieceRef.current = pieceId
    setDraggedPiece(pieceId)
  }, [])

  const handleTouchEndCell = useCallback((cellIndex: number) => {
    if (touchPieceRef.current !== null) {
      handleDrop(cellIndex)
      touchPieceRef.current = null
    }
  }, [handleDrop])

  const handleTouchStartCell = useCallback((cellIndex: number) => {
    touchCellRef.current = cellIndex
  }, [])

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate points
  const calculatePoints = useCallback(() => {
    if (!config) return 0
    let points = config.pointsComplete
    if (config.timeBonusMax > 0 && timer > 0) {
      const bonus = Math.max(0, config.timeBonusMax - timer)
      points += bonus
    }
    return points
  }, [config, timer])

  // Save played state
  const savePlayed = useCallback(() => {
    localStorage.setItem(getHourKey(), JSON.stringify({ time: timer, moves }))
  }, [getHourKey, timer, moves])

  // Save points on win
  useEffect(() => {
    if (phase === 'won') {
      savePlayed()
      const points = calculatePoints()
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: points }),
        }).catch(() => {})
      }
    }
  }, [phase, calculatePoints, savePlayed])

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

  const gridSize = config?.gridSize ?? 6
  const teamImage = getTeamImage(team.slug)

  // Check if a piece is placed on the grid
  const isPiecePlaced = (pieceId: number) => {
    return placedPieces.includes(pieceId)
  }

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: '2px solid rgba(0,255,200,0.3)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(0,255,200,0.2), inset 0 0 30px rgba(0,255,200,0.05)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,200,0.6))' }}>&#x1F9E9;</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: 'linear-gradient(90deg, #00ffc8, #00aaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            El rompecabezas cambia cada hora con un escudo diferente
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(0,255,200,0.1)',
            border: '1px solid rgba(0,255,200,0.3)',
          }}>
            <span style={{ color: '#00ffc8' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#00ffc8' }}>
              Próximo escudo en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,200,0.5))' }} />
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
        border: '2px solid rgba(0,255,200,0.3)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(0,255,200,0.2), inset 0 0 30px rgba(0,255,200,0.05)',
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,255,200,0.1) 8px, rgba(0,255,200,0.1) 10px)',
          animation: 'chase-lights 2s linear infinite',
        }} />

        <div className="text-center py-8 relative">
          {/* Neon title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2" style={{
              background: 'linear-gradient(90deg, #00ffc8, #00aaff, #00ffc8)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: 'drop-shadow(0 0 20px rgba(0,255,200,0.5))',
            }}>
              &#x1F9E9; ROMPECABEZAS DE ESCUDOS
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: 'linear-gradient(90deg, transparent, #00ffc8, transparent)',
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: 'rgba(0,255,200,0.05)',
                border: '2px solid rgba(0,255,200,0.3)',
                boxShadow: '0 0 30px rgba(0,255,200,0.2)',
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,200,0.5))' }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: 'linear-gradient(135deg, #00ffc8, #00aaff)',
                color: '#000',
                boxShadow: '0 0 10px rgba(0,255,200,0.5)',
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: '#00ffc8' }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El escudo cambia cada hora
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,200,0.08)',
              border: '1px solid rgba(0,255,200,0.2)',
            }}>
              <div className="text-2xl font-black" style={{ color: '#00ffc8' }}>{gridSize}x{gridSize}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Piezas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,200,0.08)',
              border: '1px solid rgba(0,255,200,0.2)',
            }}>
              <div className="text-2xl font-black" style={{ color: '#00ffc8' }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,200,0.08)',
              border: '1px solid rgba(0,255,200,0.2)',
            }}>
              <div className="text-2xl font-black" style={{ color: '#00ffc8' }}>{config?.pointsComplete || 200}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: 'rgba(0,170,255,0.08)',
            border: '1px solid rgba(0,170,255,0.2)',
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: '#00aaff' }}>&#x1F4CB; Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>&#x2022; Arrastra las piezas al tablero para armar el escudo</li>
              <li>&#x2022; Cada pieza tiene su posición correcta</li>
              <li>&#x2022; Las piezas correctas se iluminan en verde</li>
              <li>&#x2022; Doble clic en una pieza colocada para devolverla</li>
              <li>&#x2022; Más rápido = más puntos de bonus</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00ffc8, #00aaff)',
              color: '#000',
              boxShadow: '0 0 30px rgba(0,255,200,0.4), 0 0 60px rgba(0,170,255,0.2)',
              border: 'none',
            }}
          >
            &#x1F9E9; ARMAR ROMPECABEZAS
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
          <div className="text-6xl mb-4">&#x23F0;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            ¡Tiempo agotado!
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Completaste {correctCount} de {totalPieces} piezas
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            El rompecabezas cambia cada hora. ¡Intenta de nuevo la próxima hora!
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

  // Win screen
  if (phase === 'won') {
    const points = calculatePoints()
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a2e1a 50%, #0a0a0a 100%)',
        border: '2px solid rgba(0,255,100,0.4)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 40px rgba(0,255,100,0.3), 0 0 80px rgba(0,255,200,0.15)',
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(0,255,100,0.6))',
          }}>&#x1F3C6;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: 'linear-gradient(90deg, #00ff64, #00ffc8, #00ff64)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡ROMPECABEZAS COMPLETO!
          </h3>
          <p className="text-lg font-bold mb-6" style={{ color: '#00ffc8' }}>{team.name}</p>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,100,0.1)',
              border: '1px solid rgba(0,255,100,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,100,0.1)',
              border: '1px solid rgba(0,255,100,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>{moves}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Movimientos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(0,255,100,0.1)',
              border: '1px solid rgba(0,255,100,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>+{points}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(0,255,200,0.1)',
            border: '1px solid rgba(0,255,200,0.3)',
          }}>
            <span style={{ color: '#00ffc8' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#00ffc8' }}>
              Próximo escudo en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // =================== PLAYING PHASE ===================
  return (
    <div className="w-full max-w-4xl mx-auto p-4" ref={containerRef} style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
      border: '2px solid rgba(0,255,200,0.3)',
      borderRadius: '1.5rem',
      boxShadow: '0 0 30px rgba(0,255,200,0.15), inset 0 0 30px rgba(0,255,200,0.03)',
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,200,0.6))' }}>&#x1F9E9;</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#00ffc8' }}>
              Rompecabezas de Escudos
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : '#00ffc8',
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : 'rgba(0,255,200,0.5)'}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#00aaff' }}>{moves}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Mov.</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#00ff64' }}>{correctCount}/{totalPieces}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Correctas</div>
          </div>
        </div>
      </div>

      {/* Preview toggle */}
      <div className="flex justify-center mb-3">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer transition-all"
          style={{
            background: showPreview ? 'rgba(0,255,200,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showPreview ? 'rgba(0,255,200,0.4)' : 'rgba(255,255,255,0.15)'}`,
            color: showPreview ? '#00ffc8' : 'rgba(255,255,255,0.5)',
          }}
        >
          &#x1F441; {showPreview ? 'Ocultar referencia' : 'Ver referencia'}
        </button>
      </div>

      {/* Preview image */}
      {showPreview && (
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden" style={{
            border: '2px solid rgba(0,255,200,0.3)',
            boxShadow: '0 0 15px rgba(0,255,200,0.2)',
          }}>
            <img
              src={teamImage}
              alt={team.name}
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,200,0.3))' }}
            />
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Puzzle Grid */}
        <div className="flex-1">
          <div
            className="mx-auto grid gap-[2px] p-2 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              background: 'rgba(0,255,200,0.03)',
              border: '1px solid rgba(0,255,200,0.15)',
              maxWidth: '420px',
              aspectRatio: '1',
            }}
          >
            {placedPieces.map((pieceId, cellIndex) => {
              const isCorrect = pieceId === cellIndex
              const cellRow = Math.floor(cellIndex / gridSize)
              const cellCol = cellIndex % gridSize

              return (
                <div
                  key={cellIndex}
                  className="relative aspect-square rounded-sm cursor-pointer transition-all duration-200"
                  style={{
                    background: pieceId !== null
                      ? isCorrect
                        ? 'rgba(0,255,100,0.1)'
                        : 'rgba(0,170,255,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      isCorrect ? 'rgba(0,255,100,0.5)' :
                      pieceId !== null ? 'rgba(0,170,255,0.3)' :
                      'rgba(255,255,255,0.08)'
                    }`,
                    boxShadow: isCorrect ? '0 0 8px rgba(0,255,100,0.3)' : 'none',
                    overflow: 'hidden',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(cellIndex)}
                  onDoubleClick={() => handleCellDoubleClick(cellIndex)}
                  onTouchEnd={() => handleTouchEndCell(cellIndex)}
                  onTouchStart={() => handleTouchStartCell(cellIndex)}
                >
                  {pieceId !== null && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${teamImage})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${(pieceId % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(pieceId / gridSize) * (100 / (gridSize - 1))}%`,
                        opacity: isCorrect ? 1 : 0.85,
                        filter: isCorrect ? 'none' : 'brightness(0.8)',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  )}
                  {isCorrect && (
                    <div className="absolute top-0 right-0 w-3 h-3 flex items-center justify-center" style={{
                      background: 'rgba(0,255,100,0.8)',
                      borderRadius: '0 0 0 3px',
                    }}>
                      <span className="text-[0.5rem]" style={{ color: '#000' }}>&#x2713;</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pieces Pool */}
        <div className="lg:w-64">
          <div className="p-3 rounded-xl" style={{
            background: 'rgba(0,170,255,0.05)',
            border: '1px solid rgba(0,170,255,0.2)',
          }}>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#00aaff' }}>
              &#x1F4E6; Piezas disponibles
            </h4>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.min(gridSize, 5)}, 1fr)`,
              }}
            >
              {pieces.map(piece => {
                const isPlaced = isPiecePlaced(piece.id)
                if (isPlaced) return null

                return (
                  <div
                    key={piece.id}
                    className="aspect-square rounded cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'rgba(0,255,200,0.08)',
                      border: '1px solid rgba(0,255,200,0.3)',
                      overflow: 'hidden',
                      boxShadow: draggedPiece === piece.id ? '0 0 12px rgba(0,255,200,0.5)' : '0 0 4px rgba(0,255,200,0.1)',
                    }}
                    draggable
                    onDragStart={() => handleDragStart(piece.id)}
                    onTouchStart={() => handleTouchStartPiece(piece.id)}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${teamImage})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${(piece.id % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.id / gridSize) * (100 / (gridSize - 1))}%`,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
          <span className="text-[0.65rem] font-black" style={{ color: '#00ffc8' }}>
            {Math.round((correctCount / totalPieces) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(correctCount / totalPieces) * 100}%`,
              background: 'linear-gradient(90deg, #00ffc8, #00aaff)',
              boxShadow: '0 0 10px rgba(0,255,200,0.5)',
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

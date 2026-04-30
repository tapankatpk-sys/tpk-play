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

interface CellState {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
  mineTeamSlug: string // slug of rival team if mine
}

interface Config {
  gridSize: number
  mineCount: number
  pointsPerCell: number
  pointsComplete: number
  pointsNoMines: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

export default function MineriaEscudos() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [timer, setTimer] = useState(0)
  const [grid, setGrid] = useState<CellState[][]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [flagCount, setFlagCount] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [explodedCell, setExplodedCell] = useState<{ row: number; col: number } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Accent color
  const accent = '#22c55e'
  const accentLight = '#4ade80'

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_mineria_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/mineria')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching mineria config:', err)
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
    if (phase === 'playing' && !gameOver) {
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
  }, [phase, config?.timeLimit, gameOver])

  // Initialize grid
  const initGrid = useCallback(() => {
    if (!config) return
    const size = config.gridSize
    const mineCount = Math.min(config.mineCount, size * size - 9)

    // Get rival teams (all except current)
    const rivals = TEAMS.filter(t => t.slug !== team.slug)

    // Seeded placement
    const now = new Date()
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
    const rand = seededRandom(seed)

    // Create empty grid
    const newGrid: CellState[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
        mineTeamSlug: '',
      }))
    )

    // Place mines
    let placed = 0
    while (placed < mineCount) {
      const r = Math.floor(rand() * size)
      const c = Math.floor(rand() * size)
      if (!newGrid[r][c].isMine) {
        const rival = rivals[Math.floor(rand() * rivals.length)]
        newGrid[r][c].isMine = true
        newGrid[r][c].mineTeamSlug = rival.slug
        placed++
      }
    }

    // Calculate adjacent mine counts
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c].isMine) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && newGrid[nr][nc].isMine) {
              count++
            }
          }
        }
        newGrid[r][c].adjacentMines = count
      }
    }

    setGrid(newGrid)
    setRevealedCount(0)
    setFlagCount(0)
    setTotalPoints(0)
    setGameOver(false)
    setExplodedCell(null)
    setTimer(0)
  }, [config, team.slug])

  const handleStart = useCallback(() => {
    if (!config) return
    initGrid()
    setPhase('playing')
  }, [config, initGrid])

  // Reveal cell
  const revealCell = useCallback((row: number, col: number) => {
    if (!config || gameOver || phase !== 'playing') return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))

      if (newGrid[row][col].isFlagged || newGrid[row][col].isRevealed) return prev

      // Hit a mine
      if (newGrid[row][col].isMine) {
        // Reveal all mines
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c].isMine) {
              newGrid[r][c].isRevealed = true
            }
          }
        }
        setGameOver(true)
        setExplodedCell({ row, col })
        setTimeout(() => setPhase('timeout'), 1500)
        return newGrid
      }

      // Flood fill for empty cells
      const flood = (r: number, c: number) => {
        if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) return
        if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged || newGrid[r][c].isMine) return

        newGrid[r][c].isRevealed = true
        setRevealedCount(prev => prev + 1)
        setTotalPoints(prev => prev + config.pointsPerCell)

        if (newGrid[r][c].adjacentMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              flood(r + dr, c + dc)
            }
          }
        }
      }

      flood(row, col)

      return newGrid
    })
  }, [config, gameOver, phase])

  // Check win condition
  useEffect(() => {
    if (!config || phase !== 'playing' || grid.length === 0) return
    const totalSafe = config.gridSize * config.gridSize - config.mineCount
    if (revealedCount >= totalSafe && !gameOver) {
      setTotalPoints(prev => prev + config.pointsComplete + config.pointsNoMines)
      setPhase('won')
    }
  }, [revealedCount, config, phase, grid.length, gameOver])

  // Toggle flag
  const toggleFlag = useCallback((row: number, col: number) => {
    if (gameOver || phase !== 'playing') return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      if (newGrid[row][col].isRevealed) return prev

      if (newGrid[row][col].isFlagged) {
        newGrid[row][col].isFlagged = false
        setFlagCount(f => f - 1)
      } else {
        newGrid[row][col].isFlagged = true
        setFlagCount(f => f + 1)
      }
      return newGrid
    })
  }, [gameOver, phase])

  // Handle right click
  const handleContextMenu = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    toggleFlag(row, col)
  }, [toggleFlag])

  // Handle long press (mobile)
  const handleTouchStart = useCallback((row: number, col: number) => {
    longPressTimerRef.current = setTimeout(() => {
      toggleFlag(row, col)
    }, 500)
  }, [toggleFlag])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

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
  const gridSize = config?.gridSize ?? 8
  const totalSafe = gridSize * gridSize - (config?.mineCount ?? 10)

  // Number colors for adjacent mines
  const numberColors: Record<number, string> = {
    1: '#3b82f6',
    2: '#22c55e',
    3: '#ef4444',
    4: '#8b5cf6',
    5: '#f97316',
    6: '#06b6d4',
    7: '#ec4899',
    8: '#fbbf24',
  }

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(34,197,94,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(34,197,94,0.2), inset 0 0 30px rgba(34,197,94,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px rgba(34,197,94,0.6))` }}>💣</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            El campo minado cambia cada hora
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(34,197,94,0.1)`,
            border: `1px solid rgba(34,197,94,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próximo campo en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px rgba(34,197,94,0.5))` }} />
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tu equipo: {team.name}
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
        border: `2px solid rgba(34,197,94,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(34,197,94,0.2), inset 0 0 30px rgba(34,197,94,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(34,197,94,0.1) 8px, rgba(34,197,94,0.1) 10px)`,
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
              filter: `drop-shadow(0 0 20px rgba(34,197,94,0.5))`,
            }}>
              💣 MINERÍA DE ESCUDOS
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: `rgba(34,197,94,0.05)`,
                border: `2px solid rgba(34,197,94,0.3)`,
                boxShadow: `0 0 30px rgba(34,197,94,0.2)`,
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px rgba(34,197,94,0.5))` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                color: '#000',
                boxShadow: `0 0 10px rgba(34,197,94,0.5)`,
              }}>
                TU EQUIPO
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: accent }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ¡Evita los escudos rivales!
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.08)`,
              border: `1px solid rgba(34,197,94,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{gridSize}x{gridSize}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Campo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.08)`,
              border: `1px solid rgba(34,197,94,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.mineCount || 10}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Minas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.08)`,
              border: `1px solid rgba(34,197,94,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.pointsComplete || 100}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: `rgba(34,197,94,0.08)`,
            border: `1px solid rgba(34,197,94,0.2)`,
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: accent }}>📋 Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>• Clic para revelar casillas del campo</li>
              <li>• Las minas son escudos de equipos rivales</li>
              <li>• Los números indican minas adyacentes</li>
              <li>• Clic derecho o presión larga para marcar bandera</li>
              <li>• ¡Revela todo sin detonar para ganar!</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#000',
              boxShadow: `0 0 30px rgba(34,197,94,0.4), 0 0 60px rgba(74,222,128,0.2)`,
              border: 'none',
            }}
          >
            💣 ¡DESPEJAR CAMPO!
          </button>
        </div>
      </div>
    )
  }

  // Timeout screen (also used for mine hit)
  if (phase === 'timeout') {
    const hitMine = explodedCell !== null
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(255,50,50,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(255,50,50,0.2)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{
            animation: hitMine ? 'explode 0.5s ease-out' : 'none',
          }}>{hitMine ? '💥' : '⏰'}</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            {hitMine ? '¡Escudo rival detonado!' : '¡Tiempo agotado!'}
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {hitMine
              ? 'Tocaste un escudo rival. ¡Cuidado la próxima vez!'
              : `Revelaste ${revealedCount} de ${totalSafe} casillas seguras`}
          </p>
          <p className="text-lg font-bold mb-4" style={{ color: accent }}>
            +{totalPoints} puntos
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            El campo cambia cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo campo en: {getNextHourInfo()}
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a2e1a 50%, #0a0a0a 100%)',
        border: `2px solid rgba(34,197,94,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(34,197,94,0.3), 0 0 80px rgba(74,222,128,0.15)`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px rgba(34,197,94,0.6))`,
          }}>🏆</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight}, ${accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡CAMPO DESPEJADO!
          </h3>
          <p className="text-lg font-bold mb-6" style={{ color: accent }}>{team.name}</p>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.1)`,
              border: `1px solid rgba(34,197,94,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.1)`,
              border: `1px solid rgba(34,197,94,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{config?.mineCount || 10}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Minas evadidas</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(34,197,94,0.1)`,
              border: `1px solid rgba(34,197,94,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(34,197,94,0.1)`,
            border: `1px solid rgba(34,197,94,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próximo campo en: {getNextHourInfo()}
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
      border: `2px solid rgba(34,197,94,0.3)`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px rgba(34,197,94,0.15), inset 0 0 30px rgba(34,197,94,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px rgba(34,197,94,0.6))` }}>💣</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: accent }}>
              Minería de Escudos
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : accent,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : 'rgba(34,197,94,0.5)'}`,
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
            <div className="text-lg font-black" style={{ color: '#ff5050' }}>
              {config ? config.mineCount - flagCount : 0}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Minas</div>
          </div>
        </div>
      </div>

      {/* Mine counter info */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
        }}>
          <span className="text-xs">🚩</span>
          <span className="text-xs font-bold" style={{ color: accent }}>{flagCount}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
        }}>
          <span className="text-xs">✅</span>
          <span className="text-xs font-bold" style={{ color: accent }}>{revealedCount}/{totalSafe}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex justify-center">
        <div
          className="inline-grid gap-[2px] p-2 rounded-xl"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            background: 'rgba(34,197,94,0.03)',
            border: '1px solid rgba(34,197,94,0.15)',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isExploded = explodedCell?.row === r && explodedCell?.col === c

              return (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square rounded-sm flex items-center justify-center cursor-pointer transition-all duration-200 select-none"
                  style={{
                    background: cell.isRevealed
                      ? cell.isMine
                        ? isExploded
                          ? 'rgba(255,50,50,0.4)'
                          : 'rgba(255,50,50,0.2)'
                        : 'rgba(34,197,94,0.08)'
                      : cell.isFlagged
                        ? 'rgba(255,170,0,0.15)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      cell.isRevealed
                        ? cell.isMine
                          ? 'rgba(255,50,50,0.5)'
                          : 'rgba(34,197,94,0.2)'
                        : cell.isFlagged
                          ? 'rgba(255,170,0,0.4)'
                          : 'rgba(255,255,255,0.1)'
                    }`,
                    boxShadow: cell.isRevealed && !cell.isMine
                      ? '0 0 5px rgba(34,197,94,0.15)'
                      : isExploded
                        ? '0 0 20px rgba(255,50,50,0.5)'
                        : 'none',
                    animation: isExploded ? 'explode 0.5s ease-out' : 'none',
                    minWidth: gridSize <= 8 ? '32px' : '24px',
                    minHeight: gridSize <= 8 ? '32px' : '24px',
                  }}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => handleContextMenu(e, r, c)}
                  onTouchStart={() => handleTouchStart(r, c)}
                  onTouchEnd={handleTouchEnd}
                >
                  {cell.isRevealed ? (
                    cell.isMine ? (
                      <img
                        src={getTeamImage(cell.mineTeamSlug)}
                        alt="Rival"
                        className="w-5 h-5 object-contain"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(255,50,50,0.6))' }}
                      />
                    ) : cell.adjacentMines > 0 ? (
                      <span
                        className="font-black text-xs"
                        style={{
                          color: numberColors[cell.adjacentMines] || '#ffffff',
                          textShadow: `0 0 8px ${numberColors[cell.adjacentMines] || '#ffffff'}40`,
                        }}
                      >
                        {cell.adjacentMines}
                      </span>
                    ) : null
                  ) : cell.isFlagged ? (
                    <span className="text-sm">🚩</span>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
          <span className="text-[0.65rem] font-black" style={{ color: accent }}>
            {Math.round((revealedCount / totalSafe) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(revealedCount / totalSafe) * 100}%`,
              background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
              boxShadow: `0 0 10px rgba(34,197,94,0.5)`,
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
        @keyframes explode {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

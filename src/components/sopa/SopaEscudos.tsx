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

// Word bank
const ALL_WORDS = [
  'NACIONAL', 'MILLONARIOS', 'CALI', 'AMERICA', 'JUNIOR',
  'SANTA FE', 'MEDELLIN', 'PEREIRA', 'TOLIMA', 'PASTO',
  'BUCARAMANGA', 'ONCE CALDAS', 'CHICO', 'FORTALEZA', 'LLANEROS',
  'JAGUARES', 'VALLEDUPAR', 'AGUILAS', 'CUCUTA', 'ATANASIO',
  'PALOGRANDE', 'NEMESIO', 'DIM', 'CAMILON',
]

// Directions: right, down, diagonal-down-right, diagonal-down-left, left, up, diagonal-up-right, diagonal-up-left
const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
  [0, -1], [-1, 0], [-1, 1], [-1, -1],
]

interface PlacedWord {
  word: string
  row: number
  col: number
  dirR: number
  dirC: number
  cells: { row: number; col: number }[]
}

interface Config {
  gridSize: number
  wordsPerGame: number
  pointsPerWord: number
  pointsComplete: number
  timeLimit: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

// Generate word search grid
function generateGrid(
  gridSize: number,
  wordsToPlace: string[],
  seed: number
): { grid: string[][]; placed: PlacedWord[] } {
  const rand = seededRandom(seed)
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => '')
  )
  const placed: PlacedWord[] = []

  // Sort words by length (longest first for better placement)
  const sorted = [...wordsToPlace].sort((a, b) => b.replace(/ /g, '').length - a.replace(/ /g, '').length)

  for (const word of sorted) {
    // Remove spaces for grid placement
    const cleanWord = word.replace(/ /g, '')
    let isPlaced = false
    let attempts = 0

    while (!isPlaced && attempts < 200) {
      attempts++
      const dirIdx = Math.floor(rand() * DIRECTIONS.length)
      const [dirR, dirC] = DIRECTIONS[dirIdx]
      const row = Math.floor(rand() * gridSize)
      const col = Math.floor(rand() * gridSize)

      // Check if word fits
      const endRow = row + dirR * (cleanWord.length - 1)
      const endCol = col + dirC * (cleanWord.length - 1)
      if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) continue

      // Check if cells are available
      let canPlace = true
      const cells: { row: number; col: number }[] = []
      for (let i = 0; i < cleanWord.length; i++) {
        const r = row + dirR * i
        const c = col + dirC * i
        if (grid[r][c] !== '' && grid[r][c] !== cleanWord[i]) {
          canPlace = false
          break
        }
        cells.push({ row: r, col: c })
      }

      if (canPlace) {
        for (let i = 0; i < cleanWord.length; i++) {
          grid[cells[i].row][cells[i].col] = cleanWord[i]
        }
        placed.push({ word, row, col, dirR, dirC, cells })
        isPlaced = true
      }
    }
  }

  // Fill remaining cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(rand() * letters.length)]
      }
    }
  }

  return { grid, placed }
}

export default function SopaEscudos() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [timer, setTimer] = useState(0)
  const [letterGrid, setLetterGrid] = useState<string[][]>([])
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([])
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [totalPoints, setTotalPoints] = useState(0)
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Accent color
  const accent = '#14b8a6'
  const accentLight = '#2dd4bf'

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_sopa_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/sopa')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching sopa config:', err)
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

  // Initialize puzzle
  const initPuzzle = useCallback(() => {
    if (!config) return
    const now = new Date()
    const seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
    const rand = seededRandom(seed)

    // Select words for this game
    const shuffled = [...ALL_WORDS].sort(() => rand() - 0.5)
    const wordsToPlace = shuffled.slice(0, config.wordsPerGame)

    const { grid, placed } = generateGrid(config.gridSize, wordsToPlace, seed)
    setLetterGrid(grid)
    setPlacedWords(placed)
    setFoundWords(new Set())
    setTotalPoints(0)
    setSelectedCells([])
    setHighlightedCells(new Set())
    setTimer(0)
  }, [config])

  const handleStart = useCallback(() => {
    if (!config) return
    initPuzzle()
    setPhase('playing')
  }, [config, initPuzzle])

  // Get line of cells between two points
  const getLineCells = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    const dr = endRow - startRow
    const dc = endCol - startCol
    const length = Math.max(Math.abs(dr), Math.abs(dc))

    if (length === 0) return [{ row: startRow, col: startCol }]

    const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc)

    // Only allow straight lines (horizontal, vertical, or 45° diagonal)
    if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return []

    const cells: { row: number; col: number }[] = []
    for (let i = 0; i <= length; i++) {
      const r = startRow + stepR * i
      const c = startCol + stepC * i
      if (r >= 0 && r < (config?.gridSize ?? 12) && c >= 0 && c < (config?.gridSize ?? 12)) {
        cells.push({ row: r, col: c })
      }
    }
    return cells
  }, [config?.gridSize])

  // Start selection
  const handleCellMouseDown = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return
    setIsSelecting(true)
    setSelectedCells([{ row, col }])
  }, [phase])

  // Update selection
  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting || selectedCells.length === 0) return
    const start = selectedCells[0]
    const line = getLineCells(start.row, start.col, row, col)
    if (line.length > 0) {
      setSelectedCells(line)
    }
  }, [isSelecting, selectedCells, getLineCells])

  // End selection - check if it matches a word
  const handleCellMouseUp = useCallback(() => {
    if (!isSelecting || selectedCells.length === 0) {
      setIsSelecting(false)
      return
    }

    // Build the word from selected cells
    const word = selectedCells.map(c => letterGrid[c.row]?.[c.col] || '').join('')
    const reversedWord = word.split('').reverse().join('')

    // Check against placed words
    let foundMatch: PlacedWord | null = null
    for (const pw of placedWords) {
      const cleanWord = pw.word.replace(/ /g, '')
      if (cleanWord === word || cleanWord === reversedWord) {
        if (!foundWords.has(pw.word)) {
          foundMatch = pw
          break
        }
      }
    }

    if (foundMatch) {
      setFoundWords(prev => {
        const newSet = new Set(prev)
        newSet.add(foundMatch.word)
        return newSet
      })
      setTotalPoints(prev => prev + (config?.pointsPerWord || 15))

      // Highlight found cells permanently
      const newHighlighted = new Set(highlightedCells)
      foundMatch.cells.forEach(c => newHighlighted.add(`${c.row}-${c.col}`))
      setHighlightedCells(newHighlighted)

      // Check if all words found
      if (foundWords.size + 1 >= placedWords.length) {
        setTotalPoints(prev => prev + (config?.pointsComplete || 100))
        setTimeout(() => setPhase('won'), 500)
      }
    }

    setSelectedCells([])
    setIsSelecting(false)
  }, [isSelecting, selectedCells, letterGrid, placedWords, foundWords, highlightedCells, config])

  // Touch support
  const touchStartCellRef = useRef<{ row: number; col: number } | null>(null)

  const handleTouchStart = useCallback((row: number, col: number, e: React.TouchEvent) => {
    e.preventDefault()
    if (phase !== 'playing') return
    setIsSelecting(true)
    touchStartCellRef.current = { row, col }
    setSelectedCells([{ row, col }])
  }, [phase])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !touchStartCellRef.current || !gridRef.current) return
    e.preventDefault()

    const touch = e.touches[0]
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
    const cellEl = elements.find(el => el.getAttribute('data-grid-cell') === 'true') as HTMLElement

    if (cellEl) {
      const row = parseInt(cellEl.getAttribute('data-row') || '0', 10)
      const col = parseInt(cellEl.getAttribute('data-col') || '0', 10)
      const start = touchStartCellRef.current
      const line = getLineCells(start.row, start.col, row, col)
      if (line.length > 0) {
        setSelectedCells(line)
      }
    }
  }, [isSelecting, getLineCells])

  const handleTouchEnd = useCallback(() => {
    handleCellMouseUp()
    touchStartCellRef.current = null
  }, [handleCellMouseUp])

  // Save played state
  const savePlayed = useCallback(() => {
    localStorage.setItem(getHourKey(), JSON.stringify({ time: timer, points: totalPoints, found: foundWords.size }))
  }, [getHourKey, timer, totalPoints, foundWords.size])

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
  const gridSize = config?.gridSize ?? 12

  // Check if a cell is in the current selection
  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(c => c.row === row && c.col === col)
  }

  // Check if a cell is highlighted (found word)
  const isCellHighlighted = (row: number, col: number) => {
    return highlightedCells.has(`${row}-${col}`)
  }

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(20,184,166,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(20,184,166,0.2), inset 0 0 30px rgba(20,184,166,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px rgba(20,184,166,0.6))` }}>🔤</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            La sopa de letras cambia cada hora
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(20,184,166,0.1)`,
            border: `1px solid rgba(20,184,166,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próxima sopa en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px rgba(20,184,166,0.5))` }} />
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
        border: `2px solid rgba(20,184,166,0.3)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px rgba(20,184,166,0.2), inset 0 0 30px rgba(20,184,166,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(20,184,166,0.1) 8px, rgba(20,184,166,0.1) 10px)`,
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
              filter: `drop-shadow(0 0 20px rgba(20,184,166,0.5))`,
            }}>
              🔤 SOPA DE ESCUDOS
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }} />
          </div>

          {/* Current team escudo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center p-4" style={{
                background: `rgba(20,184,166,0.05)`,
                border: `2px solid rgba(20,184,166,0.3)`,
                boxShadow: `0 0 30px rgba(20,184,166,0.2)`,
              }}>
                <img
                  src={teamImage}
                  alt={team.name}
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px rgba(20,184,166,0.5))` }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                color: '#000',
                boxShadow: `0 0 10px rgba(20,184,166,0.5)`,
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: accent }}>{team.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Encuentra los equipos y estadios
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.08)`,
              border: `1px solid rgba(20,184,166,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{gridSize}x{gridSize}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Cuadrícula</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.08)`,
              border: `1px solid rgba(20,184,166,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.wordsPerGame || 8}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Palabras</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.08)`,
              border: `1px solid rgba(20,184,166,0.2)`,
            }}>
              <div className="text-2xl font-black" style={{ color: accent }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: `rgba(20,184,166,0.08)`,
            border: `1px solid rgba(20,184,166,0.2)`,
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: accent }}>📋 Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>• Arrastra sobre las letras para seleccionar palabras</li>
              <li>• Busca nombres de equipos, ciudades y estadios</li>
              <li>• Las palabras pueden estar en cualquier dirección</li>
              <li>• Horizontal, vertical, diagonal e invertidas</li>
              <li>• ¡Encuentra todas para obtener bonus!</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#000',
              boxShadow: `0 0 30px rgba(20,184,166,0.4), 0 0 60px rgba(45,212,191,0.2)`,
              border: 'none',
            }}
          >
            🔤 ¡BUSCAR PALABRAS!
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
            Encontraste {foundWords.size} de {placedWords.length} palabras
          </p>
          <p className="text-lg font-bold mb-4" style={{ color: accent }}>
            +{totalPoints} puntos
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            La sopa cambia cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próxima sopa en: {getNextHourInfo()}
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a2e2e 50%, #0a0a0a 100%)',
        border: `2px solid rgba(20,184,166,0.4)`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px rgba(20,184,166,0.3), 0 0 80px rgba(45,212,191,0.15)`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px rgba(20,184,166,0.6))`,
          }}>🏆</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight}, ${accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡SOPA COMPLETA!
          </h3>
          <p className="text-lg font-bold mb-6" style={{ color: accent }}>{team.name}</p>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.1)`,
              border: `1px solid rgba(20,184,166,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.1)`,
              border: `1px solid rgba(20,184,166,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>{foundWords.size}/{placedWords.length}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Palabras</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: `rgba(20,184,166,0.1)`,
              border: `1px solid rgba(20,184,166,0.3)`,
            }}>
              <div className="text-xl font-black" style={{ color: accent }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: `rgba(20,184,166,0.1)`,
            border: `1px solid rgba(20,184,166,0.3)`,
          }}>
            <span style={{ color: accent }}>⏳</span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              Próxima sopa en: {getNextHourInfo()}
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
      border: `2px solid rgba(20,184,166,0.3)`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px rgba(20,184,166,0.15), inset 0 0 30px rgba(20,184,166,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px rgba(20,184,166,0.6))` }}>🔤</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: accent }}>
              Sopa de Escudos
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{team.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : accent,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : 'rgba(20,184,166,0.5)'}`,
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
            <div className="text-lg font-black" style={{ color: '#00ff64' }}>{foundWords.size}/{placedWords.length}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Encontradas</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Letter grid */}
        <div className="flex-1">
          <div
            ref={gridRef}
            className="mx-auto inline-grid gap-[3px] p-2 rounded-xl select-none"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              background: 'rgba(20,184,166,0.03)',
              border: '1px solid rgba(20,184,166,0.15)',
              maxWidth: '500px',
              width: '100%',
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {letterGrid.map((row, r) =>
              row.map((letter, c) => {
                const selected = isCellSelected(r, c)
                const highlighted = isCellHighlighted(r, c)

                return (
                  <div
                    key={`${r}-${c}`}
                    data-grid-cell="true"
                    data-row={r}
                    data-col={c}
                    className="aspect-square rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150"
                    style={{
                      background: selected
                        ? `rgba(20,184,166,0.3)`
                        : highlighted
                          ? 'rgba(0,255,100,0.15)'
                          : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${
                        selected
                          ? `rgba(20,184,166,0.6)`
                          : highlighted
                            ? 'rgba(0,255,100,0.4)'
                            : 'rgba(255,255,255,0.08)'
                      }`,
                      boxShadow: selected
                        ? `0 0 8px rgba(20,184,166,0.4)`
                        : highlighted
                          ? '0 0 5px rgba(0,255,100,0.2)'
                          : 'none',
                      minWidth: gridSize <= 12 ? '26px' : '20px',
                      minHeight: gridSize <= 12 ? '26px' : '20px',
                    }}
                    onMouseDown={() => handleCellMouseDown(r, c)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    onMouseUp={handleCellMouseUp}
                    onTouchStart={(e) => handleTouchStart(r, c, e)}
                  >
                    <span
                      className="font-black text-xs"
                      style={{
                        color: selected
                          ? '#ffffff'
                          : highlighted
                            ? '#00ff64'
                            : 'rgba(255,255,255,0.6)',
                        textShadow: selected
                          ? `0 0 10px rgba(20,184,166,0.8)`
                          : highlighted
                            ? '0 0 8px rgba(0,255,100,0.5)'
                            : 'none',
                      }}
                    >
                      {letter}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Word list sidebar */}
        <div className="lg:w-48">
          <div className="p-3 rounded-xl max-h-96 overflow-y-auto" style={{
            background: 'rgba(20,184,166,0.05)',
            border: '1px solid rgba(20,184,166,0.2)',
          }}>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accent }}>
              🔤 Palabras
            </h4>
            <div className="space-y-1">
              {placedWords.map((pw, i) => {
                const isFound = foundWords.has(pw.word)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1 rounded"
                    style={{
                      background: isFound ? 'rgba(0,255,100,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isFound ? 'rgba(0,255,100,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: isFound ? 0.7 : 1,
                    }}
                  >
                    <span className="text-xs" style={{ color: isFound ? '#00ff64' : 'rgba(255,255,255,0.5)' }}>
                      {isFound ? '✅' : '⬜'}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: isFound ? '#00ff64' : 'rgba(255,255,255,0.7)',
                        textDecoration: isFound ? 'line-through' : 'none',
                      }}
                    >
                      {pw.word}
                    </span>
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
          <span className="text-[0.65rem] font-black" style={{ color: accent }}>
            {placedWords.length > 0 ? Math.round((foundWords.size / placedWords.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${placedWords.length > 0 ? (foundWords.size / placedWords.length) * 100 : 0}%`,
              background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
              boxShadow: `0 0 10px rgba(20,184,166,0.5)`,
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

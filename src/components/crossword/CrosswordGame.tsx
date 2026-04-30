'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// TYPES
// ============================================
interface GridCell {
  letter: string
  number?: number
  isAcrossStart?: boolean
  isDownStart?: boolean
  acrossWord?: string
  downWord?: string
}

interface PlacedWord {
  word: string
  clue: string
  category: string
  row: number
  col: number
  direction: 'across' | 'down'
  number: number
}

interface CrosswordPuzzle {
  grid: (GridCell | null)[][]
  placedWords: PlacedWord[]
  rows: number
  cols: number
  teamId?: string
  teamName?: string
  difficulty: 'bajo' | 'medio' | 'dificil'
}

interface CrosswordApiResponse {
  puzzle: CrosswordPuzzle
  difficulty: 'bajo' | 'medio' | 'dificil'
  isSpecial: boolean
  teamId: string
  teamName: string
  teamColor: string
  teamCity: string
  timeLimit: number
  totalPoints: number
}

type GameState = 'splash' | 'loading' | 'playing' | 'levelComplete' | 'specialOffer' | 'specialPlaying' | 'gameComplete'

// ============================================
// CONSTANTS
// ============================================
const TEAM_SHIELDS: Record<string, string> = {
  'aguilas-doradas': '/images/teams/aguilas-doradas.svg',
  'alianza-fc': '/images/teams/alianza-fc.svg',
  'america-de-cali': '/images/teams/america-de-cali.svg',
  'atletico-nacional': '/images/teams/atletico-nacional.svg',
  'atletico-bucaramanga': '/images/teams/atletico-bucaramanga.svg',
  'boyaca-chico': '/images/teams/boyaca-chico.svg',
  'cucuta-deportivo': '/images/teams/cucuta-deportivo.png',
  'deportes-tolima': '/images/teams/deportes-tolima.svg',
  'deportivo-cali': '/images/teams/deportivo-cali.png',
  'deportivo-pasto': '/images/teams/deportivo-pasto.svg',
  'deportivo-pereira': '/images/teams/deportivo-pereira.svg',
  'fortaleza-ceif': '/images/teams/fortaleza-ceif.svg',
  'independiente-medellin': '/images/teams/independiente-medellin.svg',
  'independiente-santa-fe': '/images/teams/independiente-santa-fe.svg',
  'internacional-de-bogota': '/images/teams/internacional-de-bogota.png',
  'jaguares-de-cordoba': '/images/teams/jaguares-de-cordoba.png',
  'junior-fc': '/images/teams/junior-fc.svg',
  'millonarios': '/images/teams/millonarios.svg',
  'once-caldas': '/images/teams/once-caldas.svg',
  'llaneros-fc': '/images/teams/llaneros-fc.png',
  'envigado': '/images/teams/envigado.svg',
  'la-equidad': '/images/teams/la-equidad.svg',
  'patriotas': '/images/teams/patriotas.png',
  'internacional-palmira': '/images/teams/internacional-palmira.png',
  'liga-betplay': '/images/teams/liga-betplay.svg',
}

const LEVELS: Record<string, { label: string; emoji: string; color: string; timeLimit: number; words: number }> = {
  bajo: { label: 'BAJO', emoji: '🔵', color: '#3b82f6', timeLimit: 600, words: 10 },
  medio: { label: 'MEDIO', emoji: '🟡', color: '#eab308', timeLimit: 900, words: 20 },
  dificil: { label: 'DIFÍCIL', emoji: '🔴', color: '#ef4444', timeLimit: 1200, words: 30 },
}

const SPECIAL_LEVEL = { label: 'ESPECIAL', emoji: '🟣', color: '#a855f7', timeLimit: 1500 }

// Check if player already played this hour
function hasPlayedThisHour(): boolean {
  try {
    const key = 'tpk_crucigrama_last_play'
    const lastPlay = localStorage.getItem(key)
    if (!lastPlay) return false
    const lastDate = new Date(lastPlay)
    const now = new Date()
    return (
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate() &&
      lastDate.getHours() === now.getHours()
    )
  } catch { return false }
}

function markPlayedThisHour(): void {
  try { localStorage.setItem('tpk_crucigrama_last_play', new Date().toISOString()) } catch {}
}

function getTimeUntilNextHour(): number {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  return nextHour.getTime() - now.getTime()
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CrosswordGame() {
  const [gameState, setGameState] = useState<GameState>('splash')
  const [difficulty, setDifficulty] = useState<'bajo' | 'medio' | 'dificil'>('bajo')
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set())
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timer, setTimer] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<'across' | 'down'>('across')
  const [teamId, setTeamId] = useState('atletico-nacional')
  const [teamName, setTeamName] = useState('Atlético Nacional')
  const [teamColor, setTeamColor] = useState('#00953b')
  const [teamCity, setTeamCity] = useState('Medellín')
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isSpecial, setIsSpecial] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set())
  const [animateCard, setAnimateCard] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [tpkCode, setTpkCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

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

  // Countdown for already played
  useEffect(() => {
    if (!alreadyPlayed) return
    const tick = () => setTimeRemaining(getTimeUntilNextHour())
    countdownRef.current = setInterval(tick, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [alreadyPlayed])

  // Load saved TPK code
  useEffect(() => {
    const saved = localStorage.getItem('tpk_code')
    if (saved) setTpkCode(saved)
    // Load completed levels
    try {
      const savedLevels = localStorage.getItem('tpk-crossword-completed')
      if (savedLevels) setCompletedLevels(new Set(JSON.parse(savedLevels)))
    } catch {}
  }, [])

  // Save completed levels
  useEffect(() => {
    try {
      localStorage.setItem('tpk-crossword-completed', JSON.stringify([...completedLevels]))
    } catch {}
  }, [completedLevels])

  // ============================================
  // FETCH PUZZLE
  // ============================================
  const fetchPuzzle = useCallback(async (diff: 'bajo' | 'medio' | 'dificil', special = false) => {
    setLoading(true)
    setError('')
    try {
      const url = special
        ? '/api/crossword?special=true'
        : `/api/crossword?difficulty=${diff}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al cargar crucigrama')
      const data: CrosswordApiResponse = await res.json()
      setPuzzle(data.puzzle)
      setTeamId(data.teamId)
      setTeamName(data.teamName)
      setTeamColor(data.teamColor || '#a855f7')
      setTeamCity(data.teamCity || '')
      setIsSpecial(data.isSpecial)
      setTimer(data.timeLimit)
      setTotalPoints(data.totalPoints)
      setAnswers({})
      setRevealedCells(new Set())
      setSelectedCell(null)
      setDirection('across')
    } catch (err) {
      console.error('Error fetching crossword:', err)
      setError('No se pudo cargar el crucigrama')
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // TIMER
  // ============================================
  useEffect(() => {
    if ((gameState === 'playing' || gameState === 'specialPlaying') && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState])

  const handleTimeUp = () => {
    // Time ran out - check what was completed
    if (gameState === 'specialPlaying') {
      // Special crossword failed - lose all points
      setTotalPoints(0)
      setGameState('gameComplete')
    } else {
      // Regular level - just end with what they have
      checkLevelCompletion(true)
    }
  }

  // ============================================
  // GAME FLOW HANDLERS
  // ============================================
  const handleStartLevel = async (diff: 'bajo' | 'medio' | 'dificil') => {
    if (hasPlayedThisHour()) {
      setAlreadyPlayed(true)
      return
    }
    markPlayedThisHour()
    setDifficulty(diff)
    setGameState('loading')
    await fetchPuzzle(diff)
    setGameState('playing')
    setTimeout(() => setAnimateCard(true), 100)
  }

  const handleStartSpecial = async () => {
    setGameState('loading')
    await fetchPuzzle(difficulty, true)
    setGameState('specialPlaying')
    setTimeout(() => setAnimateCard(true), 100)
  }

  const checkLevelCompletion = useCallback((timeUp = false) => {
    if (!puzzle) return

    let correctCells = 0
    let totalCells = 0

    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = puzzle.grid[r][c]
        if (cell !== null) {
          totalCells++
          const key = `${r}-${c}`
          if (answers[key]?.toUpperCase() === cell.letter) {
            correctCells++
          }
        }
      }
    }

    const isComplete = correctCells === totalCells && totalCells > 0

    if (timeUp && !isComplete) {
      // Time up but not complete
      if (gameState === 'specialPlaying') {
        setTotalPoints(0)
        setGameState('gameComplete')
      } else {
        setGameState('gameComplete')
      }
      return
    }

    if (isComplete) {
      if (timerRef.current) clearInterval(timerRef.current)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      if (gameState === 'specialPlaying') {
        // Special crossword completed - 50 points!
        setTotalPoints(50)
        setGameState('gameComplete')
      } else {
        // Regular level completed
        const newCompleted = new Set(completedLevels)
        newCompleted.add(difficulty)
        setCompletedLevels(newCompleted)

        // Check if all 3 levels completed
        if (newCompleted.has('bajo') && newCompleted.has('medio') && newCompleted.has('dificil')) {
          setTotalPoints(30)
          setGameState('specialOffer')
        } else {
          setGameState('levelComplete')
        }
      }
    }
  }, [puzzle, answers, difficulty, completedLevels, gameState])

  // ============================================
  // SUBMIT ANSWERS
  // ============================================
  const handleSubmit = useCallback(async () => {
    if (!puzzle || !tpkCode.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/crossword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCode: tpkCode,
          puzzle,
          answers,
          difficulty,
          isSpecial: gameState === 'specialPlaying',
        }),
      })
      const data = await res.json()
      if (data.success) {
        checkLevelCompletion()
      } else {
        // Not complete - show errors
        setError(data.message || 'Crucigrama incompleto')
      }
    } catch {
      // Offline mode - just check locally
      checkLevelCompletion()
    } finally {
      setSubmitting(false)
    }
  }, [puzzle, answers, tpkCode, difficulty, gameState, checkLevelCompletion])

  // ============================================
  // GRID INTERACTION
  // ============================================
  const handleCellClick = useCallback((row: number, col: number) => {
    if (!puzzle) return
    const cell = puzzle.grid[row][col]
    if (!cell) return

    setSelectedCell({ row, col })

    // Toggle direction if cell belongs to both across and down word
    if (cell.acrossWord && cell.downWord) {
      if (selectedCell?.row === row && selectedCell?.col === col) {
        setDirection(prev => prev === 'across' ? 'down' : 'across')
      } else {
        // Default to across, or keep if already in a direction that applies
        if (!cell.acrossWord && direction === 'across') setDirection('down')
        else if (!cell.downWord && direction === 'down') setDirection('across')
      }
    } else if (cell.acrossWord && !cell.downWord) {
      setDirection('across')
    } else if (cell.downWord && !cell.acrossWord) {
      setDirection('down')
    }

    // Focus hidden input for keyboard
    inputRef.current?.focus()
  }, [puzzle, selectedCell, direction])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!puzzle || !selectedCell) return
    const { row, col } = selectedCell

    if (e.key === 'Backspace') {
      e.preventDefault()
      const key = `${row}-${col}`
      if (answers[key]) {
        setAnswers(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      } else {
        // Move back
        moveToPrevCell()
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      setDirection(prev => prev === 'across' ? 'down' : 'across')
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveInDirection(-1, 0)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveInDirection(1, 0)
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveInDirection(0, -1)
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveInDirection(0, 1)
      return
    }

    // Letter input
    const letter = e.key.toUpperCase()
    if (/^[A-Z]$/.test(letter)) {
      e.preventDefault()
      const key = `${row}-${col}`
      setAnswers(prev => ({ ...prev, [key]: letter }))
      moveToNextCell()
    }
  }, [puzzle, selectedCell, direction, answers])

  const moveToNextCell = useCallback(() => {
    if (!puzzle || !selectedCell) return
    const dr = direction === 'down' ? 1 : 0
    const dc = direction === 'across' ? 1 : 0
    let nextRow = selectedCell.row + dr
    let nextCol = selectedCell.col + dc

    // Find next non-null cell in direction
    while (nextRow < puzzle.rows && nextCol < puzzle.cols) {
      if (puzzle.grid[nextRow]?.[nextCol] !== null) {
        setSelectedCell({ row: nextRow, col: nextCol })
        return
      }
      nextRow += dr
      nextCol += dc
    }
  }, [puzzle, selectedCell, direction])

  const moveToPrevCell = useCallback(() => {
    if (!puzzle || !selectedCell) return
    const dr = direction === 'down' ? -1 : 0
    const dc = direction === 'across' ? -1 : 0
    let prevRow = selectedCell.row + dr
    let prevCol = selectedCell.col + dc

    while (prevRow >= 0 && prevCol >= 0) {
      if (puzzle.grid[prevRow]?.[prevCol] !== null) {
        setSelectedCell({ row: prevRow, col: prevCol })
        // Also delete the letter in the previous cell
        const key = `${prevRow}-${prevCol}`
        setAnswers(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }
      prevRow += dr
      prevCol += dc
    }
  }, [puzzle, selectedCell, direction])

  const moveInDirection = useCallback((dr: number, dc: number) => {
    if (!puzzle || !selectedCell) return
    let nextRow = selectedCell.row + dr
    let nextCol = selectedCell.col + dc
    while (nextRow >= 0 && nextRow < puzzle.rows && nextCol >= 0 && nextCol < puzzle.cols) {
      if (puzzle.grid[nextRow]?.[nextCol] !== null) {
        setSelectedCell({ row: nextRow, col: nextCol })
        if (dc !== 0) setDirection('across')
        if (dr !== 0) setDirection('down')
        return
      }
      nextRow += dr
      nextCol += dc
    }
  }, [puzzle, selectedCell])

  // ============================================
  // HELPER: Get active word info
  // ============================================
  const getActiveWord = useCallback((): PlacedWord | null => {
    if (!puzzle || !selectedCell) return null
    const cell = puzzle.grid[selectedCell.row]?.[selectedCell.col]
    if (!cell) return null

    const wordName = direction === 'across' ? cell.acrossWord : cell.downWord
    if (!wordName) {
      // Try opposite direction
      const altWord = direction === 'across' ? cell.downWord : cell.acrossWord
      return puzzle.placedWords.find(pw => pw.word === altWord) || null
    }
    return puzzle.placedWords.find(pw => pw.word === wordName) || null
  }, [puzzle, selectedCell, direction])

  // ============================================
  // HELPER: Check if cell is part of active word
  // ============================================
  const isCellInActiveWord = useCallback((row: number, col: number): boolean => {
    const activeWord = getActiveWord()
    if (!activeWord) return false
    const dr = activeWord.direction === 'down' ? 1 : 0
    const dc = activeWord.direction === 'across' ? 1 : 0
    for (let i = 0; i < activeWord.word.length; i++) {
      if (activeWord.row + dr * i === row && activeWord.col + dc * i === col) return true
    }
    return false
  }, [getActiveWord])

  // ============================================
  // PROGRESS CALCULATION
  // ============================================
  const getProgress = useCallback((): { filled: number; total: number; correct: number } => {
    if (!puzzle) return { filled: 0, total: 0, correct: 0 }
    let filled = 0
    let total = 0
    let correct = 0
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = puzzle.grid[r][c]
        if (cell !== null) {
          total++
          const key = `${r}-${c}`
          if (answers[key]) {
            filled++
            if (answers[key].toUpperCase() === cell.letter) correct++
          }
        }
      }
    }
    return { filled, total, correct }
  }, [puzzle, answers])

  // ============================================
  // FORMAT TIME
  // ============================================
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  // ============================================
  // NEON COLOR FOR CURRENT LEVEL
  // ============================================
  const currentLevelConfig = isSpecial ? SPECIAL_LEVEL : LEVELS[difficulty]
  const neonColor = currentLevelConfig?.color || '#a855f7'

  // Shield path
  const shieldPath = TEAM_SHIELDS[teamId] || `/images/teams/${teamId}.svg`

  // ============================================
  // SPLASH SCREEN
  // ============================================
  if (gameState === 'splash') {
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* LED Border top */}
          <LedBorder color1="#a855f7" color2="#f97316" color3="#fbbf24" color4="#22c55e" color5="#ec4899" />

          {/* Game Icon */}
          <div className="mb-4 mt-2">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full relative"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                border: '2px solid rgba(168, 85, 247, 0.5)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
                animation: 'cw-float 3s ease-in-out infinite',
              }}
            >
              <span className="text-4xl">🎯</span>
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
            CRUCIGRAMA FUTBOLERO
          </h3>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Completa el crucigrama de tu equipo favorito
          </p>
          <p className="text-xs mb-6 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Liga BetPlay Colombia 2026
          </p>

          {/* Current team info */}
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-xl mb-6"
            style={{
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            <img
              src={shieldPath}
              alt={teamName}
              className="w-8 h-8 object-contain"
              style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.4))' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.src.endsWith('.png')) {
                  target.src = `/images/teams/${teamId}.png`
                }
              }}
            />
            <div className="text-left">
              <p className="text-xs font-bold" style={{ color: teamColor, textShadow: `0 0 8px ${teamColor}60` }}>{teamName}</p>
              <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>{teamCity}</p>
            </div>
          </div>

          {/* Level Selection */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Niveles de dificultad
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(['bajo', 'medio', 'dificil'] as const).map((key) => {
                const level = LEVELS[key]
                const isUnlocked = key === 'bajo' || completedLevels.has(key === 'medio' ? 'bajo' : 'medio')
                const isCompleted = completedLevels.has(key)
                const isNext = !isCompleted && isUnlocked

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (isNext || isCompleted) {
                        setDifficulty(key)
                      }
                    }}
                    className="px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: isCompleted
                        ? `linear-gradient(135deg, ${level.color}30, ${level.color}15)`
                        : isNext
                          ? `linear-gradient(135deg, ${level.color}25, ${level.color}10)`
                          : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isCompleted ? `${level.color}60` : isNext ? `${level.color}40` : 'rgba(255,255,255,0.08)'}`,
                      color: isCompleted || isNext ? level.color : 'rgba(255,255,255,0.25)',
                      boxShadow: isNext ? `0 0 15px ${level.color}20` : 'none',
                      cursor: isNext || isCompleted ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span className="text-lg">{level.emoji}</span>
                    <div className="text-xs mt-1">{level.label}</div>
                    <div className="text-[0.6rem] opacity-60">{level.words} palabras · {level.timeLimit / 60}min</div>
                    {isCompleted && (
                      <span className="absolute top-1 right-1.5 text-xs" style={{ color: '#22c55e' }}>✓</span>
                    )}
                    {!isUnlocked && !isCompleted && (
                      <span className="absolute top-1 right-1.5 text-xs">🔒</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Already played this hour */}
          {alreadyPlayed && (
            <div
              className="mb-4 p-4 rounded-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: '#f87171' }}>
                Ya jugaste esta hora
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Podras jugar de nuevo en: <span style={{ color: '#fbbf24' }}>{Math.floor(Math.max(0, timeRemaining) / 60000)}:{(Math.floor(Math.max(0, timeRemaining) / 1000) % 60).toString().padStart(2, '0')}</span>
              </p>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={() => handleStartLevel(difficulty)}
            disabled={alreadyPlayed || (!completedLevels.has(difficulty === 'medio' ? 'bajo' : difficulty === 'dificil' ? 'medio' : '') && difficulty !== 'bajo' && !completedLevels.has(difficulty))}
            className="px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-base transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #f97316)',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 60px rgba(249, 115, 22, 0.2)',
              color: '#fff',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'option-shimmer 3s ease-in-out infinite',
            }} />
            <span className="relative">🎯 JUGAR CRUCIGRAMA</span>
          </button>

          {/* How to play */}
          <div className="mt-6 text-left max-w-sm mx-auto">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Cómo jugar
            </p>
            <div className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p>🔤 Haz clic en una celda y escribe la letra</p>
              <p>↔️ Clic en número para cambiar dirección</p>
              <p>⏱ Completa antes de que se agote el tiempo</p>
              <p>🏆 Completa los 3 niveles = 30 puntos</p>
              <p>🟣 Crucigrama especial = 50 puntos o 0</p>
            </div>
          </div>

          {/* Completed levels info */}
          {completedLevels.size > 0 && (
            <div className="mt-4">
              <span className="text-xs" style={{ color: 'rgba(234,179,8,0.7)' }}>
                🏆 Niveles completados: {completedLevels.size}/3
              </span>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes cw-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (gameState === 'loading' || !puzzle) {
    return (
      <div className="relative max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#a855f7', borderRightColor: '#f97316' }} />
          <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }} />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Generando crucigrama...</p>
      </div>
    )
  }

  // ============================================
  // LEVEL COMPLETE SCREEN
  // ============================================
  if (gameState === 'levelComplete') {
    const levelInfo = LEVELS[difficulty]
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: `${levelInfo.color}40`,
            boxShadow: `0 0 40px ${levelInfo.color}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Celebration */}
          <div className="mb-4" style={{ animation: 'cw-float 2s ease-in-out infinite' }}>
            <span className="text-6xl">🎉</span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: `linear-gradient(90deg, ${levelInfo.color}, #fbbf24, ${levelInfo.color})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
            }}
          >
            ¡NIVEL COMPLETADO!
          </h3>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl my-3"
            style={{
              background: `${levelInfo.color}15`,
              border: `1px solid ${levelInfo.color}30`,
            }}
          >
            <span>{levelInfo.emoji}</span>
            <span className="font-bold" style={{ color: levelInfo.color }}>{levelInfo.label}</span>
          </div>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            ¡Excelente conocimiento futbolero!
          </p>

          {/* Next level button */}
          {difficulty === 'bajo' && (
            <button
              onClick={() => handleStartLevel('medio')}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${LEVELS.medio.color}, #fbbf24)`,
                boxShadow: `0 0 20px ${LEVELS.medio.color}40`,
                color: '#fff',
              }}
            >
              {LEVELS.medio.emoji} SIGUIENTE: MEDIO
            </button>
          )}
          {difficulty === 'medio' && (
            <button
              onClick={() => handleStartLevel('dificil')}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${LEVELS.dificil.color}, #fbbf24)`,
                boxShadow: `0 0 20px ${LEVELS.dificil.color}40`,
                color: '#fff',
              }}
            >
              {LEVELS.dificil.emoji} SIGUIENTE: DIFÍCIL
            </button>
          )}

          <div className="mt-4">
            <button
              onClick={() => setGameState('splash')}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              ← Menú principal
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes cw-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // SPECIAL OFFER SCREEN
  // ============================================
  if (gameState === 'specialOffer') {
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        <div
          className="rounded-2xl p-6 md:p-8 text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(168, 85, 247, 0.4)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.25), 0 0 80px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Animated border */}
          <LedBorder color1="#a855f7" color2="#fbbf24" color3="#ec4899" color4="#22c55e" color5="#f97316" />

          <div className="mt-2 mb-4" style={{ animation: 'cw-float 2.5s ease-in-out infinite' }}>
            <span className="text-6xl">🟣</span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #fbbf24, #a855f7)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
            }}
          >
            ¡CRUCIGRAMA ESPECIAL!
          </h3>

          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Has completado los 3 niveles. ¡Ahora puedes intentar el crucigrama especial de la Liga BetPlay!
          </p>

          {/* Risk/Reward card */}
          <div
            className="p-4 rounded-xl my-4 space-y-3"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(251,191,36,0.05))',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#22c55e', textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>50 pts</p>
                <p className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Si completas</p>
              </div>
              <div className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>0 pts</p>
                <p className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Si fallas</p>
              </div>
            </div>

            <div
              className="p-2 rounded-lg text-center"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <p className="text-xs font-bold" style={{ color: '#f87171' }}>
                ⚠️ Si aceptas y fallas, perderás TODOS los puntos de este juego
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartSpecial}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #fbbf24)',
                boxShadow: '0 0 25px rgba(168,85,247,0.5), 0 0 50px rgba(251,191,36,0.2)',
                color: '#fff',
              }}
            >
              🟣 ACEPTAR DESAFÍO
            </button>
            <button
              onClick={() => { setTotalPoints(30); setGameState('gameComplete') }}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Conservar 30 pts
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes cw-float {
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
  if (gameState === 'gameComplete') {
    const isFailed = totalPoints === 0 && isSpecial
    return (
      <div className="relative max-w-2xl mx-auto px-4">
        {showConfetti && <ConfettiEffect />}
        <div
          className="rounded-2xl p-6 md:p-8 text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: isFailed ? 'rgba(239,68,68,0.4)' : 'rgba(234,179,8,0.4)',
            boxShadow: isFailed
              ? '0 0 40px rgba(239,68,68,0.2)'
              : '0 0 40px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <LedBorder
            color1={isFailed ? '#ef4444' : '#fbbf24'}
            color2={isFailed ? '#f87171' : '#a855f7'}
            color3={isFailed ? '#dc2626' : '#22c55e'}
            color4={isFailed ? '#ef4444' : '#f97316'}
            color5={isFailed ? '#f87171' : '#ec4899'}
          />

          <div className="mt-2 mb-4" style={{ animation: 'cw-float 2s ease-in-out infinite' }}>
            <span className="text-6xl">{isFailed ? '💔' : totalPoints >= 50 ? '🏆' : '🎉'}</span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              background: isFailed
                ? 'linear-gradient(90deg, #f87171, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #fbbf24, #f97316, #fbbf24)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
            }}
          >
            {isFailed ? '¡INTENTO FALLIDO!' : totalPoints >= 50 ? '¡CRUCIGRAMA COMPLETO!' : '¡BIEN HECHO!'}
          </h3>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {isFailed
              ? 'No completaste el crucigrama especial. Has perdido los puntos de este juego.'
              : totalPoints >= 50
                ? '¡Completaste el crucigrama especial! Eres un verdadero experto futbolero.'
                : `Completaste ${completedLevels.size} de 3 niveles.`}
          </p>

          {/* Points display */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl my-3"
            style={{
              background: isFailed ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
              border: `1px solid ${isFailed ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
            }}
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos obtenidos:</span>
            <span
              className="text-3xl font-black"
              style={{
                color: isFailed ? '#ef4444' : '#fbbf24',
                textShadow: isFailed ? '0 0 15px rgba(239,68,68,0.5)' : '0 0 15px rgba(251,191,36,0.5)',
              }}
            >
              {totalPoints}
            </span>
          </div>

          {/* Play again */}
          <div className="mt-6">
            <button
              onClick={() => {
                setCompletedLevels(new Set())
                setGameState('splash')
                setAnimateCard(false)
              }}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #f97316)',
                boxShadow: '0 0 20px rgba(168,85,247,0.5)',
                color: '#fff',
              }}
            >
              🔄 JUGAR DE NUEVO
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes cw-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // PLAYING / SPECIAL PLAYING STATE
  // ============================================
  const activeWord = getActiveWord()
  const progress = getProgress()
  const acrossClues = puzzle.placedWords.filter(pw => pw.direction === 'across').sort((a, b) => a.number - b.number)
  const downClues = puzzle.placedWords.filter(pw => pw.direction === 'down').sort((a, b) => a.number - b.number)

  // Determine cell size based on grid dimensions
  const maxCellSize = puzzle.cols > 18 ? 24 : puzzle.cols > 14 ? 28 : 34
  const gridWidth = puzzle.cols * maxCellSize

  return (
    <div className="relative max-w-4xl mx-auto px-2 md:px-4">
      {showConfetti && <ConfettiEffect />}

      <div
        className="rounded-2xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          borderColor: `${neonColor}30`,
          boxShadow: `0 0 40px ${neonColor}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* LED Border */}
        <LedBorder
          color1={neonColor}
          color2="#fbbf24"
          color3={neonColor}
          color4="#22c55e"
          color5="#ec4899"
        />

        {/* Header */}
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Title */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3
                className="text-sm md:text-base font-black uppercase tracking-wider"
                style={{
                  background: `linear-gradient(90deg, ${neonColor}, #fbbf24)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {isSpecial ? 'CRUCIGRAMA ESPECIAL' : `CRUCIGRAMA ${LEVELS[difficulty]?.label || ''}`}
              </h3>
            </div>

            {/* Timer & Progress */}
            <div className="flex items-center gap-2">
              {/* Level badge */}
              <div
                className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase"
                style={{
                  background: `${neonColor}15`,
                  border: `1px solid ${neonColor}30`,
                  color: neonColor,
                }}
              >
                {isSpecial ? '🟣 ESPECIAL' : `${LEVELS[difficulty]?.emoji} ${LEVELS[difficulty]?.label}`}
              </div>

              {/* Timer */}
              <div
                className="px-3 py-1.5 rounded-full text-sm font-black flex items-center gap-1.5"
                style={{
                  background: timer < 60 ? 'rgba(239,68,68,0.2)' : timer < 120 ? 'rgba(249,115,22,0.15)' : `${neonColor}10`,
                  border: `1px solid ${timer < 60 ? 'rgba(239,68,68,0.5)' : timer < 120 ? 'rgba(249,115,22,0.4)' : `${neonColor}30`}`,
                  color: timer < 60 ? '#ef4444' : timer < 120 ? '#f97316' : neonColor,
                  textShadow: timer < 60 ? '0 0 10px rgba(239,68,68,0.8)' : timer < 120 ? '0 0 8px rgba(249,115,22,0.5)' : `0 0 8px ${neonColor}50`,
                  animation: timer < 30 ? 'cw-danger 0.5s ease-in-out infinite' : 'none',
                }}
              >
                ⏱ {formatTime(timer)}
              </div>

              {/* Progress */}
              <div
                className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                }}
              >
                {progress.correct}/{progress.total}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress.total > 0 ? (progress.correct / progress.total) * 100 : 0}%`,
                background: `linear-gradient(90deg, ${neonColor}, #22c55e)`,
                boxShadow: `0 0 8px ${neonColor}50`,
              }}
            />
          </div>

          {/* Team info bar */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <img
              src={shieldPath}
              alt={teamName}
              className="w-5 h-5 object-contain"
              style={{ filter: 'drop-shadow(0 0 3px rgba(168,85,247,0.3))' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.src.endsWith('.png')) {
                  target.src = `/images/teams/${teamId}.png`
                }
              }}
            />
            <span className="text-xs font-bold" style={{ color: teamColor, textShadow: `0 0 6px ${teamColor}40` }}>{teamName}</span>
            <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>· {teamCity}</span>
          </div>
        </div>

        {/* Main game area - Grid + Clues */}
        <div className="px-3 md:px-4 pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Crossword Grid */}
            <div className="flex-shrink-0">
              <div
                className="relative mx-auto"
                style={{ maxWidth: '100%', overflow: 'auto' }}
              >
                {/* Team shield watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <img
                    src={shieldPath}
                    alt=""
                    className="w-48 h-48 object-contain"
                    style={{ opacity: 0.06, filter: 'grayscale(50%)' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.endsWith('.png')) {
                        target.src = `/images/teams/${teamId}.png`
                      }
                    }}
                  />
                </div>

                {/* Grid with animated LED border */}
                <div
                  className="relative p-1 rounded-lg z-10"
                  style={{
                    border: `2px solid ${neonColor}30`,
                    boxShadow: `0 0 15px ${neonColor}15, inset 0 0 10px rgba(0,0,0,0.3)`,
                    animation: 'cw-led-pulse 3s ease-in-out infinite',
                  }}
                >
                  <div
                    ref={gridRef}
                    className="grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${puzzle.cols}, ${maxCellSize}px)`,
                      width: `${puzzle.cols * maxCellSize}px`,
                    }}
                  >
                    {Array.from({ length: puzzle.rows }).map((_, row) =>
                      Array.from({ length: puzzle.cols }).map((_, col) => {
                        const cell = puzzle.grid[row][col]
                        if (!cell) {
                          return (
                            <div
                              key={`${row}-${col}`}
                              className="aspect-square"
                              style={{
                                width: maxCellSize,
                                height: maxCellSize,
                                background: 'rgba(0,0,0,0.6)',
                              }}
                            />
                          )
                        }

                        const key = `${row}-${col}`
                        const isSelected = selectedCell?.row === row && selectedCell?.col === col
                        const isInActiveWord = isCellInActiveWord(row, col)
                        const answer = answers[key]?.toUpperCase()
                        const isCorrect = answer === cell.letter
                        const isRevealed = revealedCells.has(key)
                        const isFilled = !!answer

                        // Determine cell styling
                        let cellBg = 'rgba(10, 0, 20, 0.8)'
                        let cellBorder = `1px solid rgba(${neonColor === '#3b82f6' ? '59,130,246' : neonColor === '#eab308' ? '234,179,8' : neonColor === '#ef4444' ? '239,68,68' : '168,85,247'},0.15)`
                        let cellShadow = 'none'
                        let textColor = 'rgba(255,255,255,0.85)'

                        if (isSelected) {
                          cellBg = `rgba(${neonColor === '#3b82f6' ? '59,130,246' : neonColor === '#eab308' ? '234,179,8' : neonColor === '#ef4444' ? '239,68,68' : '168,85,247'},0.2)`
                          cellBorder = `2px solid ${neonColor}`
                          cellShadow = `0 0 12px ${neonColor}60, inset 0 0 8px ${neonColor}20`
                        } else if (isInActiveWord) {
                          cellBg = `rgba(${neonColor === '#3b82f6' ? '59,130,246' : neonColor === '#eab308' ? '234,179,8' : neonColor === '#ef4444' ? '239,68,68' : '168,85,247'},0.08)`
                          cellBorder = `1px solid ${neonColor}40`
                        } else if (isFilled) {
                          cellBg = 'rgba(20, 10, 40, 0.9)'
                          cellBorder = '1px solid rgba(255,255,255,0.1)'
                        }

                        if (isRevealed && isCorrect) {
                          cellBg = 'rgba(34, 197, 94, 0.15)'
                          cellBorder = '1px solid rgba(34,197,94,0.4)'
                          cellShadow = '0 0 8px rgba(34,197,94,0.3)'
                          textColor = '#4ade80'
                        }

                        return (
                          <button
                            key={`${row}-${col}`}
                            onClick={() => handleCellClick(row, col)}
                            className="relative flex items-center justify-center cursor-pointer transition-all duration-150 select-none"
                            style={{
                              width: maxCellSize,
                              height: maxCellSize,
                              background: cellBg,
                              border: cellBorder,
                              boxShadow: cellShadow,
                              animation: isSelected ? 'cw-cell-glow 1.5s ease-in-out infinite' : 'none',
                              color: textColor,
                              fontSize: maxCellSize > 28 ? '0.9rem' : '0.75rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                            }}
                          >
                            {/* Cell number */}
                            {cell.number && (
                              <span
                                className="absolute top-0 left-0.5 leading-none font-sans"
                                style={{
                                  fontSize: maxCellSize > 28 ? '0.5rem' : '0.4rem',
                                  color: neonColor,
                                  opacity: 0.7,
                                  fontWeight: 600,
                                }}
                              >
                                {cell.number}
                              </span>
                            )}

                            {/* Player's answer */}
                            {answer && (
                              <span style={{
                                textShadow: isSelected
                                  ? `0 0 8px ${neonColor}80`
                                  : '0 0 4px rgba(255,255,255,0.2)',
                              }}>
                                {answer}
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden input for keyboard capture */}
              <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 w-0 h-0"
                style={{ position: 'absolute', left: '-9999px' }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCapitalize="characters"
              />

              {/* Grid controls */}
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => setDirection(prev => prev === 'across' ? 'down' : 'across')}
                  className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: `${neonColor}15`,
                    border: `1px solid ${neonColor}30`,
                    color: neonColor,
                  }}
                >
                  {direction === 'across' ? '↔️ HORIZONTAL' : '↕️ VERTICAL'}
                </button>
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  ⌨️ Teclado
                </button>
                <button
                  onClick={() => {
                    setGameState('splash')
                    if (timerRef.current) clearInterval(timerRef.current)
                  }}
                  className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  ← Salir
                </button>
              </div>
            </div>

            {/* Clues Panel */}
            <div className="flex-1 min-w-0">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(10, 0, 20, 0.6)',
                  border: `1px solid ${neonColor}20`,
                  maxHeight: '500px',
                }}
              >
                {/* Clues header */}
                <div
                  className="px-3 py-2 text-center"
                  style={{
                    background: `${neonColor}10`,
                    borderBottom: `1px solid ${neonColor}20`,
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: neonColor }}>
                    Pistas
                  </span>
                </div>

                <div className="overflow-y-auto max-h-[450px] p-2" style={{ scrollbarColor: `${neonColor}30 transparent` }}>
                  {/* Across clues */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: neonColor }}>↔️ Horizontales</span>
                      <div className="flex-1 h-px" style={{ background: `${neonColor}20` }} />
                    </div>
                    {acrossClues.map(pw => {
                      const isActive = activeWord?.word === pw.word && activeWord?.direction === 'across'
                      return (
                        <button
                          key={`across-${pw.number}`}
                          onClick={() => {
                            setSelectedCell({ row: pw.row, col: pw.col })
                            setDirection('across')
                            inputRef.current?.focus()
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg mb-1 transition-all cursor-pointer hover:scale-[1.01]"
                          style={{
                            background: isActive ? `${neonColor}15` : 'transparent',
                            border: isActive ? `1px solid ${neonColor}30` : '1px solid transparent',
                          }}
                        >
                          <span
                            className="text-[0.65rem] font-bold mr-1.5"
                            style={{
                              color: isActive ? neonColor : 'rgba(255,255,255,0.5)',
                              textShadow: isActive ? `0 0 6px ${neonColor}60` : 'none',
                            }}
                          >
                            {pw.number}.
                          </span>
                          <span
                            className="text-[0.65rem]"
                            style={{
                              color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                            }}
                          >
                            {pw.clue}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Down clues */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: neonColor }}>↕️ Verticales</span>
                      <div className="flex-1 h-px" style={{ background: `${neonColor}20` }} />
                    </div>
                    {downClues.map(pw => {
                      const isActive = activeWord?.word === pw.word && activeWord?.direction === 'down'
                      return (
                        <button
                          key={`down-${pw.number}`}
                          onClick={() => {
                            setSelectedCell({ row: pw.row, col: pw.col })
                            setDirection('down')
                            inputRef.current?.focus()
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg mb-1 transition-all cursor-pointer hover:scale-[1.01]"
                          style={{
                            background: isActive ? `${neonColor}15` : 'transparent',
                            border: isActive ? `1px solid ${neonColor}30` : '1px solid transparent',
                          }}
                        >
                          <span
                            className="text-[0.65rem] font-bold mr-1.5"
                            style={{
                              color: isActive ? neonColor : 'rgba(255,255,255,0.5)',
                              textShadow: isActive ? `0 0 6px ${neonColor}60` : 'none',
                            }}
                          >
                            {pw.number}.
                          </span>
                          <span
                            className="text-[0.65rem]"
                            style={{
                              color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                            }}
                          >
                            {pw.clue}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Active clue display */}
              {activeWord && (
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{
                    background: `${neonColor}10`,
                    border: `1px solid ${neonColor}25`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: neonColor }}>
                      {activeWord.number}{activeWord.direction === 'across' ? 'H' : 'V'}
                    </span>
                    <span className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {activeWord.direction === 'across' ? 'Horizontal' : 'Vertical'} · {activeWord.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {activeWord.clue}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || progress.filled < progress.total}
                className="w-full mt-3 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${neonColor}, #fbbf24)`,
                  boxShadow: `0 0 15px ${neonColor}40`,
                  color: '#fff',
                }}
              >
                {submitting ? '⏳ VALIDANDO...' : progress.filled >= progress.total ? '✅ ENVIAR CRUCIGRAMA' : `📋 ${progress.filled}/${progress.total} celdas llenas`}
              </button>

              {error && (
                <p className="text-center text-xs mt-2 font-bold" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom LED border */}
        <LedBorder color1={neonColor} color2="#fbbf24" color3="#22c55e" color4={neonColor} color5="#ec4899" reverse />
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cw-led-pulse {
          0%, 100% {
            box-shadow: 0 0 15px ${neonColor}15, inset 0 0 10px rgba(0,0,0,0.3);
            border-color: ${neonColor}30;
          }
          50% {
            box-shadow: 0 0 25px ${neonColor}25, inset 0 0 10px rgba(0,0,0,0.3);
            border-color: ${neonColor}50;
          }
        }
        @keyframes cw-cell-glow {
          0%, 100% {
            box-shadow: 0 0 8px ${neonColor}40, inset 0 0 4px ${neonColor}15;
          }
          50% {
            box-shadow: 0 0 16px ${neonColor}70, inset 0 0 8px ${neonColor}25;
          }
        }
        @keyframes cw-correct {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes cw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cw-danger {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes option-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes vegas-lights {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// LED BORDER COMPONENT
// ============================================
function LedBorder({
  color1,
  color2,
  color3,
  color4,
  color5,
  reverse = false,
}: {
  color1: string
  color2: string
  color3: string
  color4: string
  color5: string
  reverse?: boolean
}) {
  const colors = [color1, color2, color3, color4, color5]
  return (
    <div className="relative h-2 w-full overflow-hidden flex-shrink-0">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`,
          backgroundSize: '200% 100%',
          animation: `gradient-shift ${reverse ? '4s' : '3s'} linear infinite${reverse ? ' reverse' : ''}`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-around px-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: colors[i % 5],
              boxShadow: `0 0 4px ${colors[i % 5]}`,
              animation: `vegas-lights ${0.4 + Math.random() * 0.8}s ease-in-out ${i * 0.08}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// CONFETTI EFFECT
// ============================================
function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#3b82f6', '#fbbf24', '#06b6d4'][i % 8],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `trivia-confetti ${1.5 + Math.random() * 2.5}s ease-out ${Math.random() * 0.8}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

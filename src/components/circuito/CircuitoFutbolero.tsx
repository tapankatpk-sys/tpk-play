'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

// ============================================
// TEAM DATA - 20 Liga BetPlay 2026
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

// ============================================
// RIVAL MAP - Classic rivalries
// ============================================
const RIVAL_MAP: Record<string, string[]> = {
  'millonarios': ['independiente-santa-fe', 'atletico-nacional', 'america-de-cali', 'deportivo-cali'],
  'atletico-nacional': ['independiente-medellin', 'atletico-junior', 'america-de-cali', 'deportivo-cali'],
  'america-de-cali': ['deportivo-cali', 'atletico-nacional', 'millonarios', 'atletico-junior'],
  'deportivo-cali': ['america-de-cali', 'atletico-junior', 'atletico-nacional', 'millonarios'],
  'atletico-junior': ['atletico-nacional', 'america-de-cali', 'millonarios', 'deportivo-cali'],
  'independiente-santa-fe': ['millonarios', 'atletico-nacional', 'atletico-junior', 'america-de-cali'],
  'independiente-medellin': ['atletico-nacional', 'atletico-junior', 'deportivo-cali', 'millonarios'],
  'once-caldas': ['atletico-nacional', 'deportes-tolima', 'millonarios', 'america-de-cali'],
  'deportes-tolima': ['once-caldas', 'atletico-nacional', 'deportivo-cali', 'millonarios'],
  'deportivo-pereira': ['atletico-nacional', 'once-caldas', 'deportivo-cali', 'america-de-cali'],
  'deportivo-pasto': ['america-de-cali', 'atletico-nacional', 'deportivo-cali', 'millonarios'],
  'fortaleza-ceif': ['millonarios', 'independiente-santa-fe', 'atletico-nacional', 'america-de-cali'],
  'atletico-bucaramanga': ['atletico-nacional', 'millonarios', 'atletico-junior', 'america-de-cali'],
  'aguilas-doradas': ['atletico-nacional', 'independiente-medellin', 'deportes-tolima', 'millonarios'],
  'alianza-valledupar': ['atletico-junior', 'atletico-nacional', 'millonarios', 'america-de-cali'],
  'cucuta-deportivo': ['atletico-bucaramanga', 'atletico-nacional', 'millonarios', 'america-de-cali'],
  'jaguares-de-cordoba': ['atletico-junior', 'atletico-nacional', 'millonarios', 'america-de-cali'],
  'llaneros': ['atletico-nacional', 'millonarios', 'deportes-tolima', 'america-de-cali'],
  'internacional-de-bogota': ['millonarios', 'independiente-santa-fe', 'fortaleza-ceif', 'atletico-nacional'],
  'boyaca-chico': ['atletico-nacional', 'millonarios', 'once-caldas', 'america-de-cali'],
}
const DEFAULT_RIVALS = ['atletico-nacional', 'millonarios', 'america-de-cali', 'atletico-junior']

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

function getRivals(slug: string): string[] {
  return RIVAL_MAP[slug] || DEFAULT_RIVALS
}

// ============================================
// MAZES - 0=dot, 1=wall, 2=power, 3=empty
// ============================================
const MAZE_L1 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,0,0,1,0,1,1,0,1],
  [1,2,0,0,0,0,0,1,0,0,0,0,0,2,1],
  [1,0,1,0,1,1,0,0,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,0,1,1,1],
  [1,0,0,0,1,0,3,3,3,0,1,0,0,0,1],
  [1,0,1,0,0,0,1,3,1,0,0,0,1,0,1],
  [1,0,1,0,1,0,3,3,3,0,1,0,1,0,1],
  [1,0,0,0,1,0,1,1,1,0,1,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,2,0,0,1,1,0,1,0,1,1,0,0,2,1],
  [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

const MAZE_L2 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,2,1,1,0,0,0,1,0,0,0,1,1,2,1],
  [1,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
  [1,1,0,0,0,1,0,1,0,1,0,0,0,1,1],
  [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,3,3,3,0,0,0,0,0,1],
  [1,1,0,1,0,1,1,3,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,3,3,3,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,0,0,1,0,1,0,1,0,0,0,1,1],
  [1,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
  [1,2,1,1,0,0,0,1,0,0,0,1,1,2,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

// ============================================
// GAME TYPES
// ============================================
type Dir = 'up' | 'down' | 'left' | 'right'
type Phase = 'intro' | 'selecting' | 'playing' | 'paused' | 'levelcomplete' | 'gameover' | 'disabled'

interface Ghost {
  x: number
  y: number
  dir: Dir
  slug: string
  vulnerable: boolean
  eaten: boolean
}

interface CircuitoConfig {
  pointsDot: number
  pointsGhost: number
  gameSpeed: number
  lives: number
  isActive: boolean
}

const DEFAULT_CONFIG: CircuitoConfig = {
  pointsDot: 10,
  pointsGhost: 200,
  gameSpeed: 3,
  lives: 3,
  isActive: true,
}

const SPEED_MAP: Record<number, { player: number; ghost: number }> = {
  1: { player: 280, ghost: 420 },
  2: { player: 240, ghost: 360 },
  3: { player: 200, ghost: 300 },
  4: { player: 170, ghost: 250 },
  5: { player: 140, ghost: 200 },
}

const PLAYER_START = { x: 7, y: 15 }
const GHOST_STARTS = [
  { x: 6, y: 7 },
  { x: 7, y: 7 },
  { x: 8, y: 7 },
  { x: 7, y: 8 },
]

const DIR_OFFSETS: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CircuitoFutbolero() {
  const [config, setConfig] = useState<CircuitoConfig>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState<1 | 2>(1)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [livesLeft, setLivesLeft] = useState(3)
  const [playerPos, setPlayerPos] = useState(PLAYER_START)
  const [playerDir, setPlayerDir] = useState<Dir | null>(null)
  const [nextDir, setNextDir] = useState<Dir | null>(null)
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const [maze, setMaze] = useState<number[][]>([])
  const [powered, setPowered] = useState(false)
  const [powerTimer, setPowerTimer] = useState(0)
  const [canPlay, setCanPlay] = useState(true)
  const [ghostsEatenCombo, setGhostsEatenCombo] = useState(0)
  const [totalDots, setTotalDots] = useState(0)
  const [dotsEaten, setDotsEaten] = useState(0)

  const playerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const ghostIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const powerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mazeRef = useRef<number[][]>([])
  const playerPosRef = useRef(PLAYER_START)
  const playerDirRef = useRef<Dir | null>(null)
  const nextDirRef = useRef<Dir | null>(null)
  const ghostsRef = useRef<Ghost[]>([])
  const poweredRef = useRef(false)
  const scoreRef = useRef(0)

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/circuito')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig({
              pointsDot: data.pointsDot || 10,
              pointsGhost: data.pointsGhost || 200,
              gameSpeed: data.gameSpeed || 3,
              lives: data.lives || 3,
              isActive: data.isActive !== false,
            })
          }
        }
      } catch { /* use defaults */ }
      setConfigLoaded(true)
    }
    fetchConfig()
  }, [])

  // Check play limit
  useEffect(() => {
    if (!configLoaded) return
    if (!config.isActive) { setPhase('disabled'); return }
    const hourKey = new Date().toISOString().slice(0, 13)
    if (localStorage.getItem(`tpk_circuito_played_${hourKey}`)) setCanPlay(false)
  }, [configLoaded, config.isActive])

  // Init maze for a level
  const initMaze = useCallback((lvl: 1 | 2) => {
    const base = lvl === 1 ? MAZE_L1 : MAZE_L2
    const newMaze = base.map(row => [...row])
    setMaze(newMaze)
    mazeRef.current = newMaze
    let dots = 0
    for (const row of newMaze) for (const cell of row) if (cell === 0 || cell === 2) dots++
    setTotalDots(dots)
    setDotsEaten(0)
  }, [])

  // Init game
  const initGame = useCallback((lvl: 1 | 2, teamSlug: string) => {
    initMaze(lvl)
    setPlayerPos(PLAYER_START)
    playerPosRef.current = PLAYER_START
    setPlayerDir(null)
    playerDirRef.current = null
    setNextDir(null)
    nextDirRef.current = null
    setPowered(false)
    poweredRef.current = false
    setPowerTimer(0)
    setGhostsEatenCombo(0)
    const rivals = getRivals(teamSlug)
    const gs: Ghost[] = GHOST_STARTS.map((pos, i) => ({
      x: pos.x, y: pos.y,
      dir: ['up', 'left', 'right', 'down'][i] as Dir,
      slug: rivals[i] || DEFAULT_RIVALS[i],
      vulnerable: false,
      eaten: false,
    }))
    setGhosts(gs)
    ghostsRef.current = gs
    setLevel(lvl)
  }, [initMaze])

  // Can move to position?
  const canMove = useCallback((x: number, y: number, mz: number[][]): boolean => {
    if (y < 0 || y >= mz.length || x < 0 || x >= mz[0].length) return false
    return mz[y][x] !== 1
  }, [])

  // Move player
  const movePlayer = useCallback(() => {
    const mz = mazeRef.current
    let px = playerPosRef.current.x
    let py = playerPosRef.current.y
    let dir = nextDirRef.current || playerDirRef.current
    if (!dir) return

    // Try next direction first
    if (nextDirRef.current) {
      const nd = nextDirRef.current
      const off = DIR_OFFSETS[nd]
      if (canMove(px + off.dx, py + off.dy, mz)) {
        dir = nd
        playerDirRef.current = nd
        setPlayerDir(nd)
        nextDirRef.current = null
        setNextDir(null)
      }
    }

    const off = DIR_OFFSETS[dir]
    const nx = px + off.dx
    const ny = py + off.dy

    if (canMove(nx, ny, mz)) {
      playerPosRef.current = { x: nx, y: ny }
      setPlayerPos({ x: nx, y: ny })

      // Eat dot
      const cell = mz[ny][nx]
      if (cell === 0) {
        mz[ny][nx] = 3
        setMaze(mz.map(r => [...r]))
        mazeRef.current = mz
        scoreRef.current += config.pointsDot
        setScore(prev => prev + config.pointsDot)
        setDotsEaten(prev => prev + 1)
      } else if (cell === 2) {
        mz[ny][nx] = 3
        setMaze(mz.map(r => [...r]))
        mazeRef.current = mz
        scoreRef.current += 50
        setScore(prev => prev + 50)
        setDotsEaten(prev => prev + 1)
        // Power up!
        poweredRef.current = true
        setPowered(true)
        setPowerTimer(8)
        setGhostsEatenCombo(0)
        ghostsRef.current = ghostsRef.current.map(g => ({ ...g, vulnerable: true }))
        setGhosts(ghostsRef.current.map(g => ({ ...g, vulnerable: true })))
      }
    }
  }, [canMove, config.pointsDot])

  // Move ghost
  const moveGhosts = useCallback(() => {
    const mz = mazeRef.current
    const px = playerPosRef.current.x
    const py = playerPosRef.current.y
    const pw = poweredRef.current

    const newGhosts = ghostsRef.current.map(ghost => {
      if (ghost.eaten) {
        // Return to spawn
        const spawn = GHOST_STARTS[0]
        if (ghost.x === spawn.x && ghost.y === spawn.y) {
          return { ...ghost, eaten: false, vulnerable: pw }
        }
        const dx = spawn.x - ghost.x
        const dy = spawn.y - ghost.y
        let bestDir: Dir = ghost.dir
        if (Math.abs(dx) > Math.abs(dy)) bestDir = dx > 0 ? 'right' : 'left'
        else bestDir = dy > 0 ? 'down' : 'up'
        const off = DIR_OFFSETS[bestDir]
        if (canMove(ghost.x + off.dx, ghost.y + off.dy, mz)) {
          return { ...ghost, x: ghost.x + off.dx, y: ghost.y + off.dy, dir: bestDir }
        }
        return ghost
      }

      const dirs: Dir[] = ['up', 'down', 'left', 'right']
      const opposite: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

      // Get valid directions (not wall, not reverse)
      const validDirs = dirs.filter(d => {
        if (d === opposite[ghost.dir]) return false
        const off = DIR_OFFSETS[d]
        return canMove(ghost.x + off.dx, ghost.y + off.dy, mz)
      })

      if (validDirs.length === 0) {
        // Dead end, reverse
        const revDir = opposite[ghost.dir]
        const off = DIR_OFFSETS[revDir]
        if (canMove(ghost.x + off.dx, ghost.y + off.dy, mz)) {
          return { ...ghost, x: ghost.x + off.dx, y: ghost.y + off.dy, dir: revDir }
        }
        return ghost
      }

      let chosenDir: Dir
      if (pw && ghost.vulnerable) {
        // Run away from player
        validDirs.sort((a, b) => {
          const offA = DIR_OFFSETS[a]
          const offB = DIR_OFFSETS[b]
          const distA = Math.abs(ghost.x + offA.dx - px) + Math.abs(ghost.y + offA.dy - py)
          const distB = Math.abs(ghost.x + offB.dx - px) + Math.abs(ghost.y + offB.dy - py)
          return distB - distA
        })
        chosenDir = validDirs[0]
      } else {
        // Chase player with some randomness
        if (Math.random() < 0.3) {
          chosenDir = validDirs[Math.floor(Math.random() * validDirs.length)]
        } else {
          validDirs.sort((a, b) => {
            const offA = DIR_OFFSETS[a]
            const offB = DIR_OFFSETS[b]
            const distA = Math.abs(ghost.x + offA.dx - px) + Math.abs(ghost.y + offA.dy - py)
            const distB = Math.abs(ghost.x + offB.dx - px) + Math.abs(ghost.y + offB.dy - py)
            return distA - distB
          })
          chosenDir = validDirs[0]
        }
      }

      const off = DIR_OFFSETS[chosenDir]
      return { ...ghost, x: ghost.x + off.dx, y: ghost.y + off.dy, dir: chosenDir }
    })

    ghostsRef.current = newGhosts
    setGhosts(newGhosts)
  }, [canMove])

  // Check collisions
  const checkCollisions = useCallback(() => {
    const px = playerPosRef.current.x
    const py = playerPosRef.current.y
    const pw = poweredRef.current

    for (let i = 0; i < ghostsRef.current.length; i++) {
      const g = ghostsRef.current[i]
      if (g.x === px && g.y === py) {
        if (pw && g.vulnerable && !g.eaten) {
          // Eat ghost
          const combo = ghostsEatenCombo + 1
          const pts = config.pointsGhost * combo
          scoreRef.current += pts
          setScore(prev => prev + pts)
          setGhostsEatenCombo(combo)
          ghostsRef.current[i] = { ...g, eaten: true }
          setGhosts([...ghostsRef.current])
        } else if (!g.eaten) {
          // Player dies
          return true
        }
      }
    }
    return false
  }, [config.pointsGhost, ghostsEatenCombo])

  // Check level complete
  const checkLevelComplete = useCallback(() => {
    const mz = mazeRef.current
    for (const row of mz) for (const cell of row) if (cell === 0 || cell === 2) return false
    return true
  }, [])

  // Game loop
  const startGameLoop = useCallback(() => {
    const speeds = SPEED_MAP[config.gameSpeed] || SPEED_MAP[3]

    playerIntervalRef.current = setInterval(() => {
      movePlayer()
      const died = checkCollisions()
      if (died) {
        const newLives = livesLeft - 1
        setLivesLeft(newLives)
        if (newLives <= 0) {
          stopGameLoop()
          setPhase('gameover')
          const hourKey = new Date().toISOString().slice(0, 13)
          localStorage.setItem(`tpk_circuito_played_${hourKey}`, JSON.stringify({ score: scoreRef.current }))
        } else {
          // Reset positions
          playerPosRef.current = PLAYER_START
          setPlayerPos(PLAYER_START)
          playerDirRef.current = null
          setPlayerDir(null)
          nextDirRef.current = null
          setNextDir(null)
          const gs = ghostsRef.current.map((g, i) => ({
            ...g, x: GHOST_STARTS[i].x, y: GHOST_STARTS[i].y, vulnerable: false, eaten: false,
          }))
          ghostsRef.current = gs
          setGhosts(gs)
          poweredRef.current = false
          setPowered(false)
          setPowerTimer(0)
        }
      }
      if (checkLevelComplete()) {
        stopGameLoop()
        if (level === 1) {
          setPhase('levelcomplete')
        } else {
          setPhase('gameover')
          const hourKey = new Date().toISOString().slice(0, 13)
          localStorage.setItem(`tpk_circuito_played_${hourKey}`, JSON.stringify({ score: scoreRef.current }))
        }
      }
    }, speeds.player)

    ghostIntervalRef.current = setInterval(() => {
      moveGhosts()
      const died = checkCollisions()
      if (died) {
        const newLives = livesLeft - 1
        setLivesLeft(newLives)
        if (newLives <= 0) {
          stopGameLoop()
          setPhase('gameover')
        } else {
          playerPosRef.current = PLAYER_START
          setPlayerPos(PLAYER_START)
          playerDirRef.current = null
          setPlayerDir(null)
          const gs = ghostsRef.current.map((g, i) => ({
            ...g, x: GHOST_STARTS[i].x, y: GHOST_STARTS[i].y, vulnerable: false, eaten: false,
          }))
          ghostsRef.current = gs
          setGhosts(gs)
          poweredRef.current = false
          setPowered(false)
        }
      }
    }, speeds.ghost)
  }, [config.gameSpeed, livesLeft, level, movePlayer, moveGhosts, checkCollisions, checkLevelComplete])

  const stopGameLoop = useCallback(() => {
    if (playerIntervalRef.current) clearInterval(playerIntervalRef.current)
    if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current)
    if (powerIntervalRef.current) clearInterval(powerIntervalRef.current)
    playerIntervalRef.current = null
    ghostIntervalRef.current = null
    powerIntervalRef.current = null
  }, [])

  // Power timer
  useEffect(() => {
    if (powered && phase === 'playing') {
      powerIntervalRef.current = setInterval(() => {
        setPowerTimer(prev => {
          if (prev <= 1) {
            poweredRef.current = false
            setPowered(false)
            ghostsRef.current = ghostsRef.current.map(g => ({ ...g, vulnerable: false }))
            setGhosts(ghostsRef.current.map(g => ({ ...g, vulnerable: false })))
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => { if (powerIntervalRef.current) clearInterval(powerIntervalRef.current) }
    }
  }, [powered, phase])

  // Keyboard controls
  useEffect(() => {
    if (phase !== 'playing') return
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
        W: 'up', S: 'down', A: 'left', D: 'right',
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        nextDirRef.current = dir
        setNextDir(dir)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase])

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) > Math.abs(dy)) {
      const dir: Dir = dx > 0 ? 'right' : 'left'
      nextDirRef.current = dir
      setNextDir(dir)
    } else {
      const dir: Dir = dy > 0 ? 'down' : 'up'
      nextDirRef.current = dir
      setNextDir(dir)
    }
    touchStartRef.current = null
  }

  // D-pad button
  const handleDpad = (dir: Dir) => {
    nextDirRef.current = dir
    setNextDir(dir)
  }

  // Start game
  const startGame = (lvl: 1 | 2, teamSlug: string) => {
    setScore(0)
    scoreRef.current = 0
    setLivesLeft(config.lives)
    initGame(lvl, teamSlug)
    setPhase('playing')
    setTimeout(() => startGameLoop(), 500)
  }

  // Next level
  const goNextLevel = () => {
    if (!selectedTeam) return
    initGame(2, selectedTeam)
    setPhase('playing')
    setTimeout(() => startGameLoop(), 500)
  }

  // Cleanup
  useEffect(() => { return () => stopGameLoop() }, [stopGameLoop])

  const COLS = 15
  const ROWS = 17

  // ============================================
  // RENDER
  // ============================================
  if (!configLoaded) {
    return (
      <div className="relative">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ color: '#00ff80' }}>
            CIRCUITO FUTBOLERO
          </h3>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(0,255,128,0.2)' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00ff80', borderTopColor: 'transparent' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #00ff80)' }} />
          <h3
            className="text-lg md:text-xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #00ff80, #ffc800, #00ff80)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(0,255,128,0.4))',
            }}
          >
            CIRCUITO FUTBOLERO
          </h3>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #00ff80)' }} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(0,255,128,0.4)' }}>
          Escapa de tus rivales en el circuito
        </p>
      </div>

      {/* Game Container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,15,10,0.9) 50%, rgba(0,0,0,0.85) 100%)',
          border: '2px solid rgba(0,255,128,0.3)',
          boxShadow: '0 0 25px rgba(0,255,128,0.15), 0 0 50px rgba(255,200,0,0.08)',
        }}
      >
        <div className="relative z-10 p-4 md:p-6">

          {/* DISABLED */}
          {phase === 'disabled' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl" style={{ filter: 'grayscale(1)' }}>&#x1F3AE;</div>
              <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Circuito No Disponible</h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>El juego está desactivado temporalmente</p>
            </div>
          )}

          {/* INTRO */}
          {phase === 'intro' && (
            <div className="text-center py-8 space-y-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00ff80, #ffc800)',
                  boxShadow: '0 0 25px rgba(0,255,128,0.4), 0 0 50px rgba(255,200,0,0.2)',
                }}
              >
                <span className="text-4xl">&#x1F3AE;</span>
              </div>
              <div>
                <h4 className="text-xl font-black uppercase" style={{ color: '#00ff80', textShadow: '0 0 10px rgba(0,255,128,0.5)' }}>
                  Circuito Futbolero
                </h4>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Navega el laberinto, recoge balones y escapa de tus rivales
                </p>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#00ff80' }}>Nivel 1</div>
                  <div className="text-[0.6rem]" style={{ color: 'rgba(0,255,128,0.6)' }}>Clásico de la Liga</div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#ffc800' }}>Nivel 2</div>
                  <div className="text-[0.6rem]" style={{ color: 'rgba(255,200,0,0.6)' }}>Rivales Históricos</div>
                </div>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.5)' }}>&#x26BD; +{config.pointsDot}pts</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(255,200,0,0.6)' }}>&#x1F97E; +{config.pointsGhost}pts</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(239,68,68,0.6)' }}>&#x2764;&#xFE0F; x{config.lives} vidas</span>
                </div>
              </div>
              {!canPlay ? (
                <div className="px-4 py-3 rounded-xl inline-block" style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                  <p className="text-xs font-bold" style={{ color: '#00ff80' }}>Ya jugaste esta hora. Vuelve la próxima hora.</p>
                </div>
              ) : (
                <button
                  onClick={() => { setPhase('selecting'); setSelectedTeam(null) }}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00ff80, #ffc800)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(0,255,128,0.4), 0 0 30px rgba(255,200,0,0.2)',
                  }}
                >
                  Jugar Circuito
                </button>
              )}
            </div>
          )}

          {/* SELECTING TEAM */}
          {phase === 'selecting' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-black uppercase" style={{ color: '#00ff80', textShadow: '0 0 8px rgba(0,255,128,0.5)' }}>
                  Elige tu Equipo
                </h4>
                <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Tus rivales clásicos te perseguirán en el circuito
                </p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 max-w-xl mx-auto">
                {TEAMS.map((team) => {
                  const isSelected = selectedTeam === team.slug
                  return (
                    <button
                      key={team.slug}
                      onClick={() => setSelectedTeam(team.slug)}
                      className="relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                      style={{
                        background: isSelected ? 'rgba(0,255,128,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '2px solid #00ff80' : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected ? '0 0 12px rgba(0,255,128,0.4)' : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <Image src={getTeamShield(team.slug)} alt={team.name} width={28} height={28}
                        className="w-6 h-6 object-contain"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,255,128,0.6)) brightness(1.2)' : 'brightness(0.7)' }}
                      />
                      <span className="text-[0.35rem] font-bold uppercase mt-0.5 text-center truncate w-full px-0.5"
                        style={{ color: isSelected ? '#00ff80' : 'rgba(255,255,255,0.3)' }}>
                        {team.name.split(' ').pop()}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* Show rivals */}
              {selectedTeam && (
                <div className="text-center space-y-2">
                  <p className="text-[0.55rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Tus rivales en el circuito:
                  </p>
                  <div className="flex justify-center gap-2">
                    {getRivals(selectedTeam).map((slug) => (
                      <div key={slug} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Image src={getTeamShield(slug)} alt={slug} width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span className="text-[0.5rem] font-bold" style={{ color: '#ef4444' }}>
                          {TEAMS.find(t => t.slug === slug)?.name.split(' ').pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-center pt-2 flex justify-center gap-3">
                <button onClick={() => setPhase('intro')}
                  className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Volver
                </button>
                <button onClick={() => selectedTeam && startGame(1, selectedTeam)}
                  disabled={!selectedTeam}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedTeam ? 'linear-gradient(135deg, #00ff80, #ffc800)' : 'rgba(255,255,255,0.1)',
                    color: '#000',
                    boxShadow: selectedTeam ? '0 0 20px rgba(0,255,128,0.4)' : 'none',
                  }}>
                  &#x1F3AE; Nivel 1: Clásico
                </button>
              </div>
            </div>
          )}

          {/* PLAYING */}
          {phase === 'playing' && selectedTeam && (
            <div className="space-y-3">
              {/* HUD */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src={getTeamShield(selectedTeam)} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
                  <span className="text-xs font-black" style={{ color: '#00ff80' }}>{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[0.55rem] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Nivel {level}
                  </span>
                  <span className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                  <span className="text-[0.55rem] font-bold" style={{ color: 'rgba(0,255,128,0.6)' }}>
                    {level === 1 ? 'Clásico' : 'Rivales'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: config.lives }).map((_, i) => (
                    <span key={i} className="text-xs" style={{ opacity: i < livesLeft ? 1 : 0.2, filter: i < livesLeft ? 'none' : 'grayscale(1)' }}>
                      &#x2764;&#xFE0F;
                    </span>
                  ))}
                </div>
              </div>

              {/* Power indicator */}
              {powered && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-black animate-pulse"
                    style={{ background: 'rgba(255,200,0,0.15)', color: '#ffc800', border: '1px solid rgba(255,200,0,0.4)', textShadow: '0 0 8px rgba(255,200,0,0.5)' }}>
                    &#x1F97E; PODER {powerTimer}s
                  </span>
                </div>
              )}

              {/* Maze */}
              <div
                className="mx-auto relative"
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  aspectRatio: `${COLS}/${ROWS}`,
                  touchAction: 'none',
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                  {maze.map((row, y) => row.map((cell, x) => {
                    const isWall = cell === 1
                    const isDot = cell === 0
                    const isPower = cell === 2
                    return (
                      <div key={`${x}-${y}`} className="relative flex items-center justify-center"
                        style={{ background: isWall ? 'rgba(0,255,128,0.08)' : 'transparent' }}>
                        {isWall && (
                          <div className="absolute inset-[1px] rounded-sm" style={{
                            background: 'linear-gradient(135deg, rgba(0,255,128,0.15), rgba(255,200,0,0.08))',
                            border: '1px solid rgba(0,255,128,0.25)',
                            boxShadow: '0 0 4px rgba(0,255,128,0.15), inset 0 0 3px rgba(0,255,128,0.08)',
                          }} />
                        )}
                        {isDot && (
                          <div className="w-[3px] h-[3px] rounded-full" style={{
                            backgroundColor: 'rgba(255,200,0,0.6)',
                            boxShadow: '0 0 3px rgba(255,200,0,0.3)',
                          }} />
                        )}
                        {isPower && (
                          <div className="w-[8px] h-[8px] rounded-full animate-pulse" style={{
                            backgroundColor: '#ffc800',
                            boxShadow: '0 0 6px rgba(255,200,0,0.6), 0 0 12px rgba(255,200,0,0.3)',
                          }} />
                        )}
                      </div>
                    )
                  }))}
                </div>

                {/* Player */}
                <div className="absolute pointer-events-none transition-all duration-150"
                  style={{
                    width: `${100 / COLS}%`,
                    height: `${100 / ROWS}%`,
                    left: `${(playerPos.x / COLS) * 100}%`,
                    top: `${(playerPos.y / ROWS) * 100}%`,
                    zIndex: 20,
                  }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Image src={getTeamShield(selectedTeam)} alt="" width={20} height={20}
                      className="w-[70%] h-[70%] object-contain"
                      style={{
                        filter: powered ? 'drop-shadow(0 0 8px rgba(255,200,0,0.8)) brightness(1.3)' : 'drop-shadow(0 0 4px rgba(0,255,128,0.5))',
                      }}
                    />
                  </div>
                </div>

                {/* Ghosts */}
                {ghosts.map((ghost, i) => (
                  <div key={`ghost-${i}`}
                    className="absolute pointer-events-none transition-all duration-200"
                    style={{
                      width: `${100 / COLS}%`,
                      height: `${100 / ROWS}%`,
                      left: `${(ghost.x / COLS) * 100}%`,
                      top: `${(ghost.y / ROWS) * 100}%`,
                      zIndex: 15,
                      opacity: ghost.eaten ? 0.3 : 1,
                    }}>
                    <div className="w-full h-full flex items-center justify-center relative">
                      <Image src={getTeamShield(ghost.slug)} alt="" width={18} height={18}
                        className="w-[60%] h-[60%] object-contain"
                        style={{
                          filter: ghost.vulnerable
                            ? 'hue-rotate(200deg) brightness(0.5) drop-shadow(0 0 6px rgba(0,100,255,0.5))'
                            : ghost.eaten
                            ? 'grayscale(1) opacity(0.3)'
                            : 'drop-shadow(0 0 4px rgba(239,68,68,0.5))',
                        }}
                      />
                      {ghost.vulnerable && !ghost.eaten && (
                        <div className="absolute inset-0 rounded-full animate-pulse" style={{
                          background: 'radial-gradient(circle, rgba(0,100,255,0.2) 0%, transparent 70%)',
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* D-pad for mobile */}
              <div className="flex justify-center md:hidden">
                <div className="grid grid-cols-3 gap-1" style={{ width: '120px' }}>
                  <div />
                  <button onClick={() => handleDpad('up')} className="p-2 rounded-lg text-center cursor-pointer active:scale-90"
                    style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                    <span style={{ color: '#00ff80', fontSize: '0.8rem' }}>&#x25B2;</span>
                  </button>
                  <div />
                  <button onClick={() => handleDpad('left')} className="p-2 rounded-lg text-center cursor-pointer active:scale-90"
                    style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                    <span style={{ color: '#00ff80', fontSize: '0.8rem' }}>&#x25C0;</span>
                  </button>
                  <div className="p-2 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>&#x1F3AE;</span>
                  </div>
                  <button onClick={() => handleDpad('right')} className="p-2 rounded-lg text-center cursor-pointer active:scale-90"
                    style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                    <span style={{ color: '#00ff80', fontSize: '0.8rem' }}>&#x25B6;</span>
                  </button>
                  <div />
                  <button onClick={() => handleDpad('down')} className="p-2 rounded-lg text-center cursor-pointer active:scale-90"
                    style={{ background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)' }}>
                    <span style={{ color: '#00ff80', fontSize: '0.8rem' }}>&#x25BC;</span>
                  </button>
                  <div />
                </div>
              </div>

              {/* Desktop controls hint */}
              <div className="hidden md:block text-center">
                <span className="text-[0.5rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Usa las flechas del teclado o WASD para moverte
                </span>
              </div>
            </div>
          )}

          {/* LEVEL COMPLETE */}
          {phase === 'levelcomplete' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl" style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,128,0.6))' }}>&#x1F3C6;&#x1F3C6;</div>
              <h4 className="text-xl font-black uppercase" style={{ color: '#00ff80', textShadow: '0 0 10px rgba(0,255,128,0.5)' }}>
                Nivel 1 Completado!
              </h4>
              <div className="inline-block px-5 py-2 rounded-xl"
                style={{ background: 'rgba(0,255,128,0.1)', border: '2px solid rgba(0,255,128,0.4)' }}>
                <span className="text-2xl font-black" style={{ color: '#00ff80' }}>+{score} pts</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Ahora enfrenta a tus Rivales Históricos en un laberinto más difícil
              </p>
              <button onClick={goNextLevel}
                className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                  color: '#000',
                  boxShadow: '0 0 20px rgba(255,200,0,0.4), 0 0 40px rgba(255,0,255,0.2)',
                }}>
                &#x1F525; Nivel 2: Rivales Históricos
              </button>
            </div>
          )}

          {/* GAME OVER */}
          {phase === 'gameover' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">{livesLeft <= 0 ? '&#x1F614;' : '&#x1F3C6;'}</div>
              <h4 className="text-xl font-black uppercase"
                style={{ color: livesLeft <= 0 ? '#ef4444' : '#00ff80', textShadow: `0 0 10px ${livesLeft <= 0 ? 'rgba(239,68,68,0.5)' : 'rgba(0,255,128,0.5)'}` }}>
                {livesLeft <= 0 ? 'Fin del Juego' : 'Circuito Completado!'}
              </h4>
              <div className="inline-block px-5 py-2 rounded-xl"
                style={{ background: 'rgba(255,200,0,0.1)', border: '2px solid rgba(255,200,0,0.4)' }}>
                <span className="text-2xl font-black" style={{ color: '#ffc800' }}>{score} pts</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Vuelve la próxima hora para una nueva partida
              </p>
              <button onClick={() => { setPhase('intro'); stopGameLoop() }}
                className="px-6 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Volver al Inicio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
      `}</style>
    </div>
  )
}

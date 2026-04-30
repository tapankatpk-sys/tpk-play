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

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

// ============================================
// CLASSIC RIVALRIES - For game modes
// ============================================
const CLASICOS_PRESETS: Record<string, { name: string; teams: string[]; label: string }> = {
  'clasico-capitalino': {
    name: 'Clásico Capitalino',
    label: 'Bogotá',
    teams: ['millonarios', 'independiente-santa-fe', 'atletico-nacional', 'america-de-cali'],
  },
  'clasico-paisa': {
    name: 'Clásico Paisa',
    label: 'Medellín',
    teams: ['atletico-nacional', 'independiente-medellin', 'millonarios', 'america-de-cali'],
  },
  'clasico-vallecaucano': {
    name: 'Clásico Vallecaucano',
    label: 'Cali',
    teams: ['america-de-cali', 'deportivo-cali', 'atletico-nacional', 'millonarios'],
  },
  'clasico-costeno': {
    name: 'Clásico Costeño',
    label: 'Costa',
    teams: ['atletico-junior', 'atletico-nacional', 'millonarios', 'america-de-cali'],
  },
  'rivales-historicos': {
    name: 'Rivales Históricos',
    label: 'Nacional',
    teams: ['atletico-nacional', 'millonarios', 'america-de-cali', 'deportivo-cali'],
  },
}

const PLAYER_COLORS = ['#facc15', '#3b82f6', '#ef4444', '#22c55e']
const PLAYER_COLORS_DIM = ['rgba(250,204,21,0.15)', 'rgba(59,130,246,0.15)', 'rgba(239,68,68,0.15)', 'rgba(34,197,94,0.15)']
const PLAYER_COLORS_GLOW = ['rgba(250,204,21,0.4)', 'rgba(59,130,246,0.4)', 'rgba(239,68,68,0.4)', 'rgba(34,197,94,0.4)']
const PLAYER_NAMES = ['Amarillo', 'Azul', 'Rojo', 'Verde']

// ============================================
// BOARD LAYOUT - 15x15 grid Parqués
// ============================================

// Track positions: 52 squares going clockwise
const TRACK: [number, number][] = [
  // Left arm going right (Player 0 side)
  [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],
  // Top arm going up
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  // Top going right
  [0,7],[0,8],
  // Top arm going down (Player 1 side)
  [1,8],[2,8],[3,8],[4,8],[5,8],
  // Right arm going right
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  // Right going down
  [7,14],
  // Right arm going left (Player 2 side)
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  // Bottom arm going down
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  // Bottom going left
  [14,7],[14,6],
  // Bottom arm going up (Player 3 side)
  [13,6],[12,6],[11,6],[10,6],[9,6],
  // Left arm going left
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  // Left going up
  [7,0],
]

// Player entry positions on the track
const ENTRY_POS = [0, 13, 26, 39]

// Safe corridors: 6 squares leading to center per player
const CORRIDORS: [number, number][][] = [
  // Player 0: row 7, going right
  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  // Player 1: col 7, going down
  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  // Player 2: row 7, going left
  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  // Player 3: col 7, going up
  [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
]

// Last track position before entering corridor
const CORRIDOR_ENTRY = [51, 12, 25, 38]

// Home base positions (where tokens start)
const HOME_BASES: [number, number][][] = [
  // Player 0: top-left corner
  [[1,1],[1,3],[3,1],[3,3]],
  // Player 1: top-right corner
  [[1,11],[1,13],[3,11],[3,13]],
  // Player 2: bottom-right corner
  [[11,11],[11,13],[13,11],[13,13]],
  // Player 3: bottom-left corner
  [[11,1],[11,3],[13,1],[13,3]],
]

// Center position (goal)
const CENTER: [number, number] = [7, 7]

// Board grid for rendering (0=empty, 1=track, 2=P0home, 3=P1home, 4=P2home, 5=P3home, 6=corridor, 7=center)
const BOARD_GRID = [
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,2,0,2,0,0,1,6,1,0,0,3,0,3,0],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [0,2,0,2,0,0,1,6,1,0,0,3,0,3,0],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [1,1,1,1,1,1,7,6,7,1,1,1,1,1,1],
  [1,6,6,6,6,6,6,7,6,6,6,6,6,6,1],
  [1,1,1,1,1,1,7,6,7,1,1,1,1,1,1],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [0,5,0,5,0,0,1,6,1,0,0,4,0,4,0],
  [0,0,0,0,0,0,1,6,1,0,0,0,0,0,0],
  [0,5,0,5,0,0,1,6,1,0,0,4,0,4,0],
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
]

// ============================================
// GAME TYPES
// ============================================
type Phase = 'intro' | 'selecting' | 'playing' | 'rolling' | 'moving' | 'gameover' | 'disabled'

interface Token {
  id: number
  player: number
  state: 'home' | 'track' | 'corridor' | 'finished'
  trackPos: number   // position on track (0-51) if state='track'
  corridorPos: number // position in corridor (0-5) if state='corridor'
}

interface PlayerState {
  teamSlug: string
  isAI: boolean
  tokens: Token[]
}

interface ParquesConfigType {
  tokensPerPlayer: number
  pointsCapture: number
  pointsFinish: number
  pointsWin: number
  diceSpeed: number
  isActive: boolean
}

const DEFAULT_CONFIG: ParquesConfigType = {
  tokensPerPlayer: 2,
  pointsCapture: 50,
  pointsFinish: 100,
  pointsWin: 500,
  diceSpeed: 3,
  isActive: true,
}

const DICE_FACES = ['\u2680','\u2681','\u2682','\u2683','\u2684','\u2685']

// ============================================
// MAIN COMPONENT
// ============================================
export default function ParquesGame() {
  const [config, setConfig] = useState<ParquesConfigType>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')
  const [selectedMode, setSelectedMode] = useState<string>('rivales-historicos')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [canPlay, setCanPlay] = useState(true)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [movableTokens, setMovableTokens] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [consecutiveSixes, setConsecutiveSixes] = useState(0)
  const [showInvite, setShowInvite] = useState(false)

  const diceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/parques')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig({
              tokensPerPlayer: data.tokensPerPlayer || 2,
              pointsCapture: data.pointsCapture || 50,
              pointsFinish: data.pointsFinish || 100,
              pointsWin: data.pointsWin || 500,
              diceSpeed: data.diceSpeed || 3,
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
    if (localStorage.getItem(`tpk_parques_played_${hourKey}`)) setCanPlay(false)
  }, [configLoaded, config.isActive])

  // Initialize players with teams
  const initPlayers = useCallback((mode: string, userTeamSlug: string) => {
    const preset = CLASICOS_PRESETS[mode]
    const presetTeams = preset ? preset.teams : CLASICOS_PRESETS['rivales-historicos'].teams

    // Ensure user team is player 0
    const teamList = [userTeamSlug]
    for (const t of presetTeams) {
      if (t !== userTeamSlug && teamList.length < 4) teamList.push(t)
    }
    // Fill remaining with other teams if needed
    for (const t of TEAMS) {
      if (!teamList.includes(t.slug) && teamList.length < 4) teamList.push(t.slug)
    }

    const numTokens = config.tokensPerPlayer
    const newPlayers: PlayerState[] = teamList.map((slug, i) => ({
      teamSlug: slug,
      isAI: i !== 0,
      tokens: Array.from({ length: numTokens }, (_, j) => ({
        id: j,
        player: i,
        state: 'home' as const,
        trackPos: -1,
        corridorPos: -1,
      })),
    }))
    setPlayers(newPlayers)
    setCurrentPlayer(0)
    setScore(0)
    setConsecutiveSixes(0)
    setWinner(null)
    setMessage('¡Tira el dado para empezar!')
  }, [config.tokensPerPlayer])

  // Get token position on board grid
  const getTokenBoardPos = useCallback((token: Token): [number, number] => {
    if (token.state === 'home') return HOME_BASES[token.player][token.id % 4]
    if (token.state === 'track') return TRACK[token.trackPos]
    if (token.state === 'corridor') return CORRIDORS[token.player][token.corridorPos]
    if (token.state === 'finished') return CENTER
    return [0, 0]
  }, [])

  // Get all tokens at a specific board position
  const getTokensAtPos = useCallback((row: number, col: number, currentPlayers: PlayerState[]): Token[] => {
    const tokens: Token[] = []
    for (const p of currentPlayers) {
      for (const t of p.tokens) {
        let pos: [number, number]
        if (t.state === 'home') pos = HOME_BASES[t.player][t.id % 4]
        else if (t.state === 'track') pos = TRACK[t.trackPos]
        else if (t.state === 'corridor') pos = CORRIDORS[t.player][t.corridorPos]
        else if (t.state === 'finished') pos = CENTER
        else continue
        if (pos[0] === row && pos[1] === col) tokens.push(t)
      }
    }
    return tokens
  }, [])

  // Check if a move is valid and where it would land
  const getValidMoves = useCallback((playerIdx: number, dice: number, currentPlayers: PlayerState[]): { tokenId: number; newState: Token }[] => {
    const player = currentPlayers[playerIdx]
    const moves: { tokenId: number; newState: Token }[] = []

    for (const token of player.tokens) {
      if (token.state === 'finished') continue

      if (token.state === 'home') {
        // Can only leave home with a 6
        if (dice === 6) {
          const newToken: Token = { ...token, state: 'track', trackPos: ENTRY_POS[playerIdx], corridorPos: -1 }
          moves.push({ tokenId: token.id, newState: newToken })
        }
      } else if (token.state === 'track') {
        const stepsFromCorridorEntry = ((CORRIDOR_ENTRY[playerIdx] - token.trackPos) % 52 + 52) % 52
        if (dice <= stepsFromCorridorEntry) {
          // Stay on track
          const newTrackPos = (token.trackPos + dice) % 52
          const newToken: Token = { ...token, trackPos: newTrackPos }
          moves.push({ tokenId: token.id, newState: newToken })
        } else if (dice === stepsFromCorridorEntry + 1) {
          // Enter corridor at position 0
          if (stepsFromCorridorEntry >= 0) {
            const newToken: Token = { ...token, state: 'corridor', trackPos: -1, corridorPos: 0 }
            moves.push({ tokenId: token.id, newState: newToken })
          }
        } else {
          // Move within corridor
          const corridorSteps = dice - stepsFromCorridorEntry - 1
          if (corridorSteps <= 5) {
            const newToken: Token = { ...token, state: 'corridor', trackPos: -1, corridorPos: corridorSteps }
            moves.push({ tokenId: token.id, newState: newToken })
          }
          // If corridorSteps === 5, token reaches center (finished)
          if (corridorSteps === 5) {
            const newToken: Token = { ...token, state: 'finished', trackPos: -1, corridorPos: -1 }
            // Replace the previous move
            moves[moves.length - 1] = { tokenId: token.id, newState: newToken }
          }
        }
      } else if (token.state === 'corridor') {
        const newPos = token.corridorPos + dice
        if (newPos === 5) {
          const newToken: Token = { ...token, state: 'finished', trackPos: -1, corridorPos: -1 }
          moves.push({ tokenId: token.id, newState: newToken })
        } else if (newPos < 5) {
          const newToken: Token = { ...token, corridorPos: newPos }
          moves.push({ tokenId: token.id, newState: newToken })
        }
        // If newPos > 5, invalid move (overshoot)
      }
    }
    return moves
  }, [])

  // Roll dice
  const rollDice = useCallback(() => {
    if (isRolling || phase !== 'playing') return
    setIsRolling(true)
    setMovableTokens([])
    setMessage('')

    const speedMap: Record<number, number> = { 1: 300, 2: 220, 3: 150, 4: 100, 5: 60 }
    const speed = speedMap[config.diceSpeed] || 150
    let count = 0
    const maxCount = 12

    diceIntervalRef.current = setInterval(() => {
      const val = Math.floor(Math.random() * 6) + 1
      setDiceValue(val)
      count++
      if (count >= maxCount) {
        if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
        diceIntervalRef.current = null
        const finalVal = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalVal)
        setIsRolling(false)
        handleDiceResult(finalVal)
      }
    }, speed)
  }, [isRolling, phase, config.diceSpeed])

  // Handle dice result
  const handleDiceResult = useCallback((dice: number) => {
    const moves = getValidMoves(currentPlayer, dice, players)
    if (moves.length === 0) {
      setMessage(`${TEAMS.find(t => t.slug === players[currentPlayer].teamSlug)?.name || PLAYER_NAMES[currentPlayer]} no puede mover`)
      // Next turn after delay
      setTimeout(() => nextTurn(dice), 1200)
      return
    }
    if (players[currentPlayer].isAI) {
      // AI picks a move
      setTimeout(() => aiMove(moves, dice), 800)
    } else {
      // Human selects which token to move
      setMovableTokens(moves.map(m => m.tokenId))
      setMessage(`Tiraste ${dice}. Selecciona una ficha para mover.`)
    }
  }, [currentPlayer, players, getValidMoves])

  // AI move selection
  const aiMove = useCallback((moves: { tokenId: number; newState: Token }[], dice: number) => {
    // Priority: finish > capture > enter corridor > advance > leave home
    let bestMove = moves[0]

    // Prefer finishing
    const finishMove = moves.find(m => m.newState.state === 'finished')
    if (finishMove) { bestMove = finishMove }
    else {
      // Prefer capturing
      const captureMove = moves.find(m => {
        if (m.newState.state !== 'track') return false
        return players.some((p, pi) => pi !== currentPlayer && p.tokens.some(t =>
          t.state === 'track' && t.trackPos === m.newState.trackPos
        ))
      })
      if (captureMove) { bestMove = captureMove }
      else {
        // Prefer entering corridor
        const corridorMove = moves.find(m => m.newState.state === 'corridor')
        if (corridorMove) { bestMove = corridorMove }
        else {
          // Prefer advancing furthest on track
          const trackMoves = moves.filter(m => m.newState.state === 'track')
          if (trackMoves.length > 0) {
            bestMove = trackMoves.reduce((best, m) => {
              const bestDist = ((CORRIDOR_ENTRY[currentPlayer] - best.newState.trackPos) % 52 + 52) % 52
              const mDist = ((CORRIDOR_ENTRY[currentPlayer] - m.newState.trackPos) % 52 + 52) % 52
              return mDist < bestDist ? m : best
            })
          }
        }
      }
    }

    executeMove(currentPlayer, bestMove.tokenId, bestMove.newState, dice)
  }, [currentPlayer, players])

  // Execute a move
  const executeMove = useCallback((playerIdx: number, tokenId: number, newState: Token, dice: number) => {
    setPlayers(prev => {
      const newPlayers = prev.map((p, pi) => {
        if (pi !== playerIdx) return p
        return {
          ...p,
          tokens: p.tokens.map(t => t.id === tokenId ? { ...newState, player: playerIdx, id: tokenId } : t),
        }
      })

      // Check captures (only on track)
      if (newState.state === 'track') {
        const pos = newState.trackPos
        // Safe positions (entry points)
        const safePositions = ENTRY_POS
        if (!safePositions.includes(pos)) {
          for (let pi = 0; pi < newPlayers.length; pi++) {
            if (pi === playerIdx) continue
            newPlayers[pi] = {
              ...newPlayers[pi],
              tokens: newPlayers[pi].tokens.map(t => {
                if (t.state === 'track' && t.trackPos === pos) {
                  // Captured! Send back home
                  if (playerIdx === 0) {
                    setScore(s => s + config.pointsCapture)
                  }
                  return { ...t, state: 'home' as const, trackPos: -1, corridorPos: -1 }
                }
                return t
              }),
            }
          }
        }
      }

      // Check finish
      if (newState.state === 'finished' && playerIdx === 0) {
        setScore(s => s + config.pointsFinish)
      }

      // Check win
      const player = newPlayers[playerIdx]
      if (player.tokens.every(t => t.state === 'finished')) {
        setWinner(playerIdx)
        if (playerIdx === 0) {
          setScore(s => s + config.pointsWin)
        }
        setPhase('gameover')
        const hourKey = new Date().toISOString().slice(0, 13)
        localStorage.setItem(`tpk_parques_played_${hourKey}`, JSON.stringify({ score: score }))
      }

      return newPlayers
    })

    setMovableTokens([])

    // Next turn
    setTimeout(() => nextTurn(dice), 600)
  }, [config, score])

  // Next turn logic
  const nextTurn = useCallback((lastDice: number) => {
    if (winner !== null) return

    if (lastDice === 6) {
      const newConsecutive = consecutiveSixes + 1
      setConsecutiveSixes(newConsecutive)
      if (newConsecutive >= 3) {
        // Three consecutive sixes: lose turn
        setMessage('¡3 seises seguidos! Pierde el turno.')
        setConsecutiveSixes(0)
        const nextPlayer = (currentPlayer + 1) % 4
        setCurrentPlayer(nextPlayer)
        if (!players[nextPlayer].isAI) {
          setMessage('Tu turno. Tira el dado.')
        } else {
          setMessage(`${TEAMS.find(t => t.slug === players[nextPlayer].teamSlug)?.name} está jugando...`)
          setTimeout(() => rollDice(), 800)
        }
        return
      }
      // Roll again with 6
      setMessage('¡Sacaste 6! Tira de nuevo.')
      if (players[currentPlayer].isAI) {
        setTimeout(() => rollDice(), 800)
      }
      return
    }

    setConsecutiveSixes(0)
    const nextPlayer = (currentPlayer + 1) % 4
    setCurrentPlayer(nextPlayer)

    if (!players[nextPlayer]?.isAI) {
      setMessage('Tu turno. Tira el dado.')
    } else {
      setMessage(`${TEAMS.find(t => t.slug === players[nextPlayer]?.teamSlug)?.name || 'Rival'} está jugando...`)
      setTimeout(() => rollDice(), 1000)
    }
  }, [currentPlayer, players, winner, consecutiveSixes, rollDice])

  // Handle token click (human move selection)
  const handleTokenClick = useCallback((playerIdx: number, tokenId: number) => {
    if (playerIdx !== 0 || !movableTokens.includes(tokenId) || phase !== 'playing') return
    const moves = getValidMoves(currentPlayer, diceValue, players)
    const move = moves.find(m => m.tokenId === tokenId)
    if (move) {
      executeMove(playerIdx, tokenId, move.newState, diceValue)
    }
  }, [movableTokens, phase, currentPlayer, diceValue, players, getValidMoves, executeMove])

  // Start game
  const startGame = (mode: string, teamSlug: string) => {
    initPlayers(mode, teamSlug)
    setPhase('playing')
    setMessage('Tu turno. Tira el dado.')
  }

  // Share/invite
  const handleInvite = () => {
    const text = encodeURIComponent(
      `🎲 ¡Juguemos Parqués Futbolero en TPK PLAY!\n\n` +
      `Elige tu equipo de la Liga BetPlay y compite con los clásicos rivales del fútbol colombiano.\n` +
      `🔗 tpkplay.vercel.app\n\n` +
      `#TPKPLAY #ParquesFutbolero #LigaBetPlay`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
    }
  }, [])

  // Get cell color based on grid value
  const getCellColor = (value: number, row: number, col: number): string => {
    switch(value) {
      case 0: return 'transparent'
      case 1: return 'rgba(255,255,255,0.06)'
      case 2: return PLAYER_COLORS_DIM[0]
      case 3: return PLAYER_COLORS_DIM[1]
      case 4: return PLAYER_COLORS_DIM[2]
      case 5: return PLAYER_COLORS_DIM[3]
      case 6: {
        // Determine which player's corridor
        if (row === 7 && col >= 1 && col <= 6) return PLAYER_COLORS_DIM[0]
        if (col === 7 && row >= 1 && row <= 6) return PLAYER_COLORS_DIM[1]
        if (row === 7 && col >= 8 && col <= 13) return PLAYER_COLORS_DIM[2]
        if (col === 7 && row >= 8 && row <= 13) return PLAYER_COLORS_DIM[3]
        return 'rgba(255,255,255,0.04)'
      }
      case 7: return 'rgba(255,255,255,0.08)'
      default: return 'transparent'
    }
  }

  const getCellBorder = (value: number, row: number, col: number): string => {
    switch(value) {
      case 1: return '1px solid rgba(255,255,255,0.08)'
      case 2: return `1px solid ${PLAYER_COLORS[0]}30`
      case 3: return `1px solid ${PLAYER_COLORS[1]}30`
      case 4: return `1px solid ${PLAYER_COLORS[2]}30`
      case 5: return `1px solid ${PLAYER_COLORS[3]}30`
      case 6: {
        if (row === 7 && col >= 1 && col <= 6) return `1px solid ${PLAYER_COLORS[0]}30`
        if (col === 7 && row >= 1 && row <= 6) return `1px solid ${PLAYER_COLORS[1]}30`
        if (row === 7 && col >= 8 && col <= 13) return `1px solid ${PLAYER_COLORS[2]}30`
        if (col === 7 && row >= 8 && row <= 13) return `1px solid ${PLAYER_COLORS[3]}30`
        return '1px solid rgba(255,255,255,0.06)'
      }
      case 7: return '1px solid rgba(255,200,0,0.3)'
      default: return 'none'
    }
  }

  // Check if a board position is an entry point (safe spot)
  const isEntryPoint = (row: number, col: number): boolean => {
    for (const ep of ENTRY_POS) {
      if (TRACK[ep][0] === row && TRACK[ep][1] === col) return true
    }
    return false
  }

  // ============================================
  // RENDER
  // ============================================
  if (!configLoaded) {
    return (
      <div className="relative">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ color: '#facc15' }}>
            PARQUÉS FUTBOLERO
          </h3>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(250,204,21,0.2)' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }} />
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
          <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #facc15)' }} />
          <h3
            className="text-lg md:text-xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #facc15, #ef4444, #3b82f6, #22c55e, #facc15)',
              backgroundSize: '400% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(250,204,21,0.4))',
            }}
          >
            PARQUÉS FUTBOLERO
          </h3>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #facc15)' }} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(250,204,21,0.4)' }}>
          Clásicos del fútbol colombiano
        </p>
      </div>

      {/* Game Container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(15,10,0,0.95) 50%, rgba(0,0,0,0.9) 100%)',
          border: '2px solid rgba(250,204,21,0.3)',
          boxShadow: '0 0 30px rgba(250,204,21,0.12), 0 0 60px rgba(239,68,68,0.06)',
        }}
      >
        <div className="relative z-10 p-4 md:p-6">

          {/* DISABLED */}
          {phase === 'disabled' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl" style={{ filter: 'grayscale(1)' }}>&#x1F3B2;</div>
              <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Parqués No Disponible</h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>El juego está desactivado temporalmente</p>
            </div>
          )}

          {/* INTRO */}
          {phase === 'intro' && (
            <div className="text-center py-6 space-y-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #facc15, #ef4444)',
                  boxShadow: '0 0 25px rgba(250,204,21,0.4), 0 0 50px rgba(239,68,68,0.2)',
                }}
              >
                <span className="text-4xl">&#x1F3B2;</span>
              </div>
              <div>
                <h4 className="text-xl font-black uppercase" style={{ color: '#facc15', textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>
                  Parqués Futbolero
                </h4>
                <p className="text-xs mt-2 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  El clásico juego de parqués colombiano con los escudos y clásicos rivales de la Liga BetPlay.
                  4 jugadores, tira el dado, mueve tus fichas y captura a tus rivales.
                </p>
              </div>

              {/* Game modes */}
              <div className="space-y-2 max-w-sm mx-auto">
                <p className="text-[0.6rem] uppercase tracking-wider font-bold" style={{ color: 'rgba(250,204,21,0.5)' }}>
                  Selecciona el Clásico
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(CLASICOS_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMode(key)}
                      className="px-4 py-2.5 rounded-xl text-left cursor-pointer transition-all duration-200"
                      style={{
                        background: selectedMode === key ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.03)',
                        border: selectedMode === key ? '2px solid #facc15' : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: selectedMode === key ? '0 0 12px rgba(250,204,21,0.3)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {preset.teams.slice(0, 4).map(slug => (
                            <Image key={slug} src={getTeamShield(slug)} alt="" width={16} height={16}
                              className="w-4 h-4 object-contain"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                            />
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: selectedMode === key ? '#facc15' : 'rgba(255,255,255,0.6)' }}>
                            {preset.name}
                          </div>
                          <div className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {preset.label} &middot; {preset.teams.map(s => TEAMS.find(t => t.slug === s)?.name.split(' ').pop()).join(' vs ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info badges */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(250,204,21,0.7)' }}>&#x1F3B2; 4 Jugadores</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(239,68,68,0.7)' }}>&#x2694;&#xFE0F; +{config.pointsCapture}pts captura</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(34,197,94,0.7)' }}>&#x1F3C6; +{config.pointsWin}pts victoria</span>
                </div>
              </div>

              {!canPlay ? (
                <div className="px-4 py-3 rounded-xl inline-block" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
                  <p className="text-xs font-bold" style={{ color: '#facc15' }}>Ya jugaste esta hora. Vuelve la próxima hora.</p>
                </div>
              ) : (
                <button
                  onClick={() => { setPhase('selecting'); setSelectedTeam(null) }}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #ef4444)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(250,204,21,0.4), 0 0 30px rgba(239,68,68,0.2)',
                  }}
                >
                  Jugar Parqués
                </button>
              )}
            </div>
          )}

          {/* SELECTING TEAM */}
          {phase === 'selecting' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-black uppercase" style={{ color: '#facc15', textShadow: '0 0 8px rgba(250,204,21,0.5)' }}>
                  Elige tu Equipo
                </h4>
                <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Tus rivales clásicos te esperan en el tablero
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
                        background: isSelected ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '2px solid #facc15' : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected ? '0 0 12px rgba(250,204,21,0.4)' : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <Image src={getTeamShield(team.slug)} alt={team.name} width={28} height={28}
                        className="w-6 h-6 object-contain"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(250,204,21,0.6)) brightness(1.2)' : 'brightness(0.7)' }}
                      />
                      <span className="text-[0.35rem] font-bold uppercase mt-0.5 text-center truncate w-full px-0.5"
                        style={{ color: isSelected ? '#facc15' : 'rgba(255,255,255,0.3)' }}>
                        {team.name.split(' ').pop()}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* Show rival teams */}
              {selectedTeam && (
                <div className="text-center space-y-2">
                  <p className="text-[0.55rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Rivales en el tablero:
                  </p>
                  <div className="flex justify-center gap-2">
                    {CLASICOS_PRESETS[selectedMode]?.teams.filter(s => s !== selectedTeam).slice(0, 3).map((slug) => (
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
                <button onClick={() => selectedTeam && startGame(selectedMode, selectedTeam)}
                  disabled={!selectedTeam}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedTeam ? 'linear-gradient(135deg, #facc15, #ef4444)' : 'rgba(255,255,255,0.1)',
                    color: '#000',
                    boxShadow: selectedTeam ? '0 0 20px rgba(250,204,21,0.4)' : 'none',
                  }}>
                  &#x1F3B2; Jugar
                </button>
              </div>
            </div>
          )}

          {/* PLAYING / GAME OVER */}
          {(phase === 'playing' || phase === 'gameover') && players.length === 4 && (
            <div className="space-y-3">
              {/* Top bar: player info + score */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Image src={getTeamShield(players[0].teamSlug)} alt="" width={20} height={20}
                    className="w-5 h-5 object-contain"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }}
                  />
                  <span className="text-xs font-black" style={{ color: '#facc15' }}>{score} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  {players.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{
                        background: currentPlayer === i ? PLAYER_COLORS_DIM[i] : 'transparent',
                        border: `1px solid ${currentPlayer === i ? PLAYER_COLORS[i] + '60' : 'transparent'}`,
                      }}
                    >
                      <Image src={getTeamShield(p.teamSlug)} alt="" width={12} height={12} className="w-3 h-3 object-contain" />
                      <span className="text-[0.5rem] font-bold" style={{ color: PLAYER_COLORS[i] }}>
                        {p.tokens.filter(t => t.state === 'finished').length}/{p.tokens.length}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="px-2 py-1 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  Invitar
                </button>
              </div>

              {/* Invite popup */}
              {showInvite && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <p className="text-[0.6rem] mb-2" style={{ color: 'rgba(34,197,94,0.7)' }}>
                    Invita a tus amigos a jugar Parqués Futbolero:
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleInvite}
                      className="flex-1 px-3 py-2 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
                      style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
                      WhatsApp
                    </button>
                    <button onClick={() => {
                      navigator.clipboard.writeText('https://tpkplay.vercel.app')
                      setMessage('Enlace copiado!')
                    }}
                      className="flex-1 px-3 py-2 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
                      style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                      Copiar Enlace
                    </button>
                  </div>
                </div>
              )}

              {/* Message bar */}
              {message && (
                <div className="text-center px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-[0.6rem] font-bold" style={{ color: PLAYER_COLORS[currentPlayer] || 'rgba(255,255,255,0.6)' }}>
                    {message}
                  </span>
                </div>
              )}

              {/* Board */}
              <div className="flex justify-center">
                <div className="relative" style={{ width: '100%', maxWidth: '390px', aspectRatio: '1/1' }}>
                  {/* Grid */}
                  <div className="w-full h-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(15, 1fr)' }}>
                    {BOARD_GRID.map((row, y) => row.map((cell, x) => {
                      const isTrackCell = cell === 1
                      const isHomeCell = cell >= 2 && cell <= 5
                      const isCorridorCell = cell === 6
                      const isCenterCell = cell === 7
                      const isEntry = isTrackCell && isEntryPoint(y, x)
                      const tokensHere = getTokensAtPos(y, x, players)

                      return (
                        <div key={`${x}-${y}`}
                          className="relative flex items-center justify-center"
                          style={{
                            background: getCellColor(cell, y, x),
                            border: getCellBorder(cell, y, x),
                            borderRadius: isTrackCell || isCorridorCell || isCenterCell ? '2px' : isHomeCell ? '4px' : '0',
                          }}
                        >
                          {/* Entry point marker */}
                          {isEntry && (
                            <div className="w-[5px] h-[5px] rounded-full" style={{
                              backgroundColor: 'rgba(255,200,0,0.5)',
                              boxShadow: '0 0 4px rgba(255,200,0,0.3)',
                            }} />
                          )}
                          {/* Center star */}
                          {isCenterCell && x === 7 && y === 7 && (
                            <div className="w-[8px] h-[8px] rounded-full" style={{
                              background: 'radial-gradient(circle, #ffc800 0%, rgba(255,200,0,0.3) 70%, transparent 100%)',
                              boxShadow: '0 0 8px rgba(255,200,0,0.4)',
                            }} />
                          )}

                          {/* Tokens on this cell */}
                          {tokensHere.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                              <div className="flex flex-wrap gap-[1px] items-center justify-center" style={{ maxWidth: '90%', maxHeight: '90%' }}>
                                {tokensHere.map((token, ti) => {
                                  const pIdx = token.player
                                  const isClickable = pIdx === 0 && movableTokens.includes(token.id) && phase === 'playing'
                                  const teamSlug = players[pIdx]?.teamSlug || 'millonarios'
                                  return (
                                    <div key={ti}
                                      onClick={() => handleTokenClick(pIdx, token.id)}
                                      className="relative cursor-pointer transition-all duration-200"
                                      style={{
                                        width: tokensHere.length > 2 ? '10px' : tokensHere.length > 1 ? '12px' : '14px',
                                        height: tokensHere.length > 2 ? '10px' : tokensHere.length > 1 ? '12px' : '14px',
                                        borderRadius: '50%',
                                        background: PLAYER_COLORS[pIdx],
                                        border: isClickable ? '2px solid #fff' : `1.5px solid ${PLAYER_COLORS[pIdx]}`,
                                        boxShadow: isClickable
                                          ? `0 0 8px ${PLAYER_COLORS[pIdx]}, 0 0 16px ${PLAYER_COLORS_GLOW[pIdx]}`
                                          : `0 0 4px ${PLAYER_COLORS_GLOW[pIdx]}`,
                                        animation: isClickable ? 'pulse 1s ease-in-out infinite' : 'none',
                                        zIndex: isClickable ? 20 : 10,
                                        transform: isClickable ? 'scale(1.15)' : 'scale(1)',
                                      }}
                                    >
                                      <Image src={getTeamShield(teamSlug)} alt="" width={10} height={10}
                                        className="w-full h-full object-contain rounded-full p-[1px]"
                                        style={{ filter: 'brightness(1.2)' }}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  </div>
                </div>
              </div>

              {/* Dice + Controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Player indicator */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ background: PLAYER_COLORS_DIM[currentPlayer], border: `1px solid ${PLAYER_COLORS[currentPlayer]}40` }}>
                  <Image src={getTeamShield(players[currentPlayer].teamSlug)} alt="" width={16} height={16} className="w-4 h-4 object-contain" />
                  <span className="text-[0.55rem] font-bold" style={{ color: PLAYER_COLORS[currentPlayer] }}>
                    {players[currentPlayer].isAI ? 'IA' : 'Tú'}
                  </span>
                </div>

                {/* Dice */}
                <button
                  onClick={rollDice}
                  disabled={isRolling || players[currentPlayer]?.isAI || phase === 'gameover'}
                  className="w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isRolling
                      ? 'linear-gradient(135deg, #facc15, #ef4444)'
                      : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isRolling ? '#facc15' : 'rgba(250,204,21,0.2)'}`,
                    boxShadow: isRolling ? '0 0 20px rgba(250,204,21,0.5)' : '0 0 8px rgba(250,204,21,0.1)',
                  }}
                >
                  <span className="text-2xl" style={{
                    color: isRolling ? '#000' : '#facc15',
                    textShadow: isRolling ? 'none' : '0 0 8px rgba(250,204,21,0.4)',
                    animation: isRolling ? 'spin 0.3s linear infinite' : 'none',
                  }}>
                    {DICE_FACES[diceValue - 1]}
                  </span>
                </button>

                {/* Token status for player 0 */}
                <div className="flex gap-1">
                  {players[0]?.tokens.map((t, i) => (
                    <div key={i} className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{
                        background: t.state === 'finished' ? 'rgba(34,197,94,0.2)' : t.state === 'home' ? 'rgba(250,204,21,0.1)' : 'rgba(250,204,21,0.2)',
                        border: `1px solid ${t.state === 'finished' ? 'rgba(34,197,94,0.4)' : 'rgba(250,204,21,0.3)'}`,
                      }}
                    >
                      <span className="text-[0.4rem]" style={{
                        color: t.state === 'finished' ? '#22c55e' : t.state === 'home' ? 'rgba(250,204,21,0.4)' : '#facc15'
                      }}>
                        {t.state === 'finished' ? 'OK' : t.state === 'home' ? 'H' : t.state === 'corridor' ? 'C' : 'P'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Over */}
              {phase === 'gameover' && winner !== null && (
                <div className="text-center py-4 space-y-4">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${PLAYER_COLORS[winner]}, #ffc800)`,
                      boxShadow: `0 0 20px ${PLAYER_COLORS_GLOW[winner]}, 0 0 40px rgba(255,200,0,0.2)`,
                    }}
                  >
                    <Image src={getTeamShield(players[winner].teamSlug)} alt="" width={32} height={32}
                      className="w-8 h-8 object-contain"
                      style={{ filter: 'brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase" style={{
                      color: PLAYER_COLORS[winner],
                      textShadow: `0 0 10px ${PLAYER_COLORS_GLOW[winner]}`,
                    }}>
                      {winner === 0 ? '¡GANASTE!' : `${TEAMS.find(t => t.slug === players[winner].teamSlug)?.name} Gana`}
                    </h4>
                    {winner === 0 && (
                      <p className="text-xs mt-1" style={{ color: '#ffc800' }}>+{score} puntos</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setPhase('intro'); setPlayers([]); setWinner(null); setScore(0); }}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #facc15, #ef4444)',
                      color: '#000',
                      boxShadow: '0 0 12px rgba(250,204,21,0.3)',
                    }}
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              )}

              {/* Legend */}
              <div className="flex justify-center gap-3 flex-wrap pt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#facc15' }} />
                  <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Home</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Pista</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(250,204,21,0.3)' }} />
                  <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Corredor</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,200,0,0.5)' }} />
                  <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Meta</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

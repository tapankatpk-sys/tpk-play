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
// CLASSIC RIVALRIES
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

// ============================================
// BOARD LAYOUT - 15x15 grid Parqués
// ============================================
const TRACK: [number, number][] = [
  [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],
]

const ENTRY_POS = [0, 13, 26, 39]

const CORRIDORS: [number, number][][] = [
  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
]

const CORRIDOR_ENTRY = [51, 12, 25, 38]

const HOME_BASES: [number, number][][] = [
  [[1,1],[1,3],[3,1],[3,3]],
  [[1,11],[1,13],[3,11],[3,13]],
  [[11,11],[11,13],[13,11],[13,13]],
  [[11,1],[11,3],[13,1],[13,3]],
]

const CENTER: [number, number] = [7, 7]

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
type Phase = 'intro' | 'login' | 'create' | 'join' | 'lobby' | 'playing' | 'gameover' | 'disabled'

interface Token {
  id: number
  player: number
  state: 'home' | 'track' | 'corridor' | 'finished'
  trackPos: number
  corridorPos: number
}

interface RoomPlayer {
  id: string
  participantCode: string
  participantName: string
  teamSlug: string
  playerIndex: number
  isCreator: boolean
  score: number
}

interface RoomData {
  id: string
  roomCode: string
  clasicoMode: string
  status: string
  currentPlayer: number
  gameState: string
  winnerPlayerIdx: number
  players: RoomPlayer[]
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
// MAIN COMPONENT — INVITE-ONLY MULTIPLAYER
// ============================================
export default function ParquesGame() {
  const [config, setConfig] = useState<ParquesConfigType>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')

  // User auth
  const [tpkCode, setTpkCode] = useState('')
  const [userName, setUserName] = useState('')
  const [loginError, setLoginError] = useState('')

  // Room
  const [room, setRoom] = useState<RoomData | null>(null)
  const [selectedMode, setSelectedMode] = useState<string>('rivales-historicos')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [roomError, setRoomError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Game
  const [tokens, setTokens] = useState<Token[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [movableTokens, setMovableTokens] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [consecutiveSixes, setConsecutiveSixes] = useState(0)

  const diceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved TPK code
  useEffect(() => {
    const saved = localStorage.getItem('tpk_parques_code')
    const savedName = localStorage.getItem('tpk_parques_name')
    if (saved) setTpkCode(saved)
    if (savedName) setUserName(savedName)
  }, [])

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

  // Check if game is active
  useEffect(() => {
    if (!configLoaded) return
    if (!config.isActive) { setPhase('disabled'); return }
  }, [configLoaded, config.isActive])

  // Check if user has an active room on mount
  useEffect(() => {
    if (!configLoaded || !config.isActive) return
    const savedCode = localStorage.getItem('tpk_parques_code')
    if (savedCode) {
      checkActiveRoom(savedCode)
    }
  }, [configLoaded, config.isActive])

  const checkActiveRoom = async (code: string) => {
    try {
      const res = await fetch(`/api/parques-room?participantCode=${encodeURIComponent(code)}`)
      if (res.ok) {
        const rooms = await res.json()
        if (Array.isArray(rooms) && rooms.length > 0) {
          const activeRoom = rooms[0]
          setRoom(activeRoom)
          setUserName(localStorage.getItem('tpk_parques_name') || '')
          if (activeRoom.status === 'waiting') {
            setPhase('lobby')
          } else if (activeRoom.status === 'playing') {
            loadGameState(activeRoom)
            setPhase('playing')
          }
        }
      }
    } catch { /* ignore */ }
  }

  // Poll for room updates when in lobby
  useEffect(() => {
    if (phase !== 'lobby' || !room) return
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/parques-room?roomCode=${encodeURIComponent(room.roomCode)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'playing') {
            setRoom(data)
            loadGameState(data)
            setPhase('playing')
          } else if (data.status === 'finished') {
            setRoom(data)
            setPhase('gameover')
          } else {
            setRoom(data)
          }
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current) }
  }, [phase, room?.roomCode])

  // Poll when playing (for opponent moves)
  useEffect(() => {
    if (phase !== 'playing' || !room) return
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/parques-room?roomCode=${encodeURIComponent(room.roomCode)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'finished') {
            setRoom(data)
            const gs = JSON.parse(data.gameState || '{}')
            if (gs.tokens) setTokens(gs.tokens)
            setCurrentPlayer(data.currentPlayer)
            setWinner(data.winnerPlayerIdx >= 0 ? data.winnerPlayerIdx : null)
            setPhase('gameover')
            return
          }
          setRoom(data)
          const gs = JSON.parse(data.gameState || '{}')
          if (gs.tokens) setTokens(gs.tokens)
          if (data.currentPlayer !== currentPlayer) {
            setCurrentPlayer(data.currentPlayer)
          }
          // Update score for current user
          const myPlayer = data.players?.find((p: RoomPlayer) => p.participantCode === tpkCode)
          if (myPlayer) setScore(myPlayer.score)
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current) }
  }, [phase, room?.roomCode, tpkCode, currentPlayer])

  // Load game state from room data
  const loadGameState = (roomData: RoomData) => {
    const gs = JSON.parse(roomData.gameState || '{}')
    if (gs.tokens) setTokens(gs.tokens)
    setCurrentPlayer(roomData.currentPlayer)
    setConsecutiveSixes(gs.consecutiveSixes || 0)
    const myPlayer = roomData.players?.find((p: RoomPlayer) => p.participantCode === tpkCode)
    if (myPlayer) setScore(myPlayer.score)
    const isMyTurn = myPlayer?.playerIndex === roomData.currentPlayer
    setMessage(isMyTurn ? 'Tu turno. Tira el dado.' : `Esperando a ${roomData.players.find((p: RoomPlayer) => p.playerIndex === roomData.currentPlayer)?.participantName || 'rival'}...`)
  }

  // Verify TPK code and login
  const handleLogin = async () => {
    setLoginError('')
    if (!tpkCode.trim()) { setLoginError('Ingresa tu código TPK'); return }
    try {
      const res = await fetch('/api/participants')
      if (res.ok) {
        const participants = await res.json()
        const me = participants.find((p: { code: string }) => p.code === tpkCode.trim().toUpperCase())
        if (!me) {
          setLoginError('Código TPK no registrado. Regístrate primero en TPK PLAY.')
          return
        }
        setUserName(me.name)
        localStorage.setItem('tpk_parques_code', tpkCode.trim().toUpperCase())
        localStorage.setItem('tpk_parques_name', me.name)
        setTpkCode(tpkCode.trim().toUpperCase())
        setPhase('create')
      }
    } catch {
      setLoginError('Error de conexión')
    }
  }

  // Create a new room
  const handleCreateRoom = async () => {
    if (!selectedTeam) { setRoomError('Elige un equipo'); return }
    setIsCreating(true)
    setRoomError('')
    try {
      const res = await fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          participantCode: tpkCode,
          teamSlug: selectedTeam,
          clasicoMode: selectedMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.room) {
          setRoom(data.room)
          if (data.room.status === 'waiting') setPhase('lobby')
          else if (data.room.status === 'playing') { loadGameState(data.room); setPhase('playing') }
        } else {
          setRoomError(data.error || 'Error al crear sala')
        }
      } else {
        setRoom(data)
        setPhase('lobby')
        setMessage('Sala creada. Invita a otros jugadores con el código.')
      }
    } catch {
      setRoomError('Error de conexión')
    }
    setIsCreating(false)
  }

  // Join an existing room
  const handleJoinRoom = async () => {
    if (!joinRoomCode.trim()) { setRoomError('Ingresa el código de la sala'); return }
    if (!selectedTeam) { setRoomError('Elige un equipo'); return }
    setIsJoining(true)
    setRoomError('')
    try {
      const res = await fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          participantCode: tpkCode,
          teamSlug: selectedTeam,
          roomCode: joinRoomCode.trim().toUpperCase(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.room) {
          setRoom(data.room)
          if (data.room.status === 'waiting') setPhase('lobby')
          else if (data.room.status === 'playing') { loadGameState(data.room); setPhase('playing') }
        } else {
          setRoomError(data.error || 'Error al unirse')
        }
      } else {
        setRoom(data)
        setPhase('lobby')
        setMessage('Te uniste a la sala. Esperando a que inicien el juego.')
      }
    } catch {
      setRoomError('Error de conexión')
    }
    setIsJoining(false)
  }

  // Start the game (only creator)
  const handleStartGame = async () => {
    if (!room) return
    setRoomError('')
    try {
      const res = await fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          participantCode: tpkCode,
          roomCode: room.roomCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRoomError(data.error || 'Error al iniciar')
        return
      }
      setRoom(data)
      loadGameState(data)
      setPhase('playing')
    } catch {
      setRoomError('Error de conexión')
    }
  }

  // Leave room
  const handleLeaveRoom = async () => {
    if (!room) return
    try {
      await fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          participantCode: tpkCode,
          roomCode: room.roomCode,
        }),
      })
    } catch { /* ignore */ }
    setRoom(null)
    setTokens([])
    setPhase('create')
    setMessage('')
  }

  // Invite via WhatsApp
  const handleWhatsAppInvite = () => {
    if (!room) return
    const text = encodeURIComponent(
      `🎲 ¡Juguemos Parqués Futbolero en TPK PLAY!\n\n` +
      `Código de sala: ${room.roomCode}\n` +
      `Ingresa con tu código TPK y elige tu equipo de la Liga BetPlay.\n` +
      `🔗 tpkplay.vercel.app\n\n` +
      `#TPKPLAY #ParquesFutbolero #LigaBetPlay`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Get my player index
  const getMyPlayerIndex = useCallback((): number => {
    if (!room) return -1
    const myPlayer = room.players?.find((p: RoomPlayer) => p.participantCode === tpkCode)
    return myPlayer?.playerIndex ?? -1
  }, [room, tpkCode])

  // Build player state from tokens + room data
  const getPlayersFromRoom = useCallback((): { teamSlug: string; playerName: string; score: number }[] => {
    if (!room) return []
    return room.players.map((p: RoomPlayer) => ({
      teamSlug: p.teamSlug,
      playerName: p.participantName,
      score: p.score,
    }))
  }, [room])

  // Valid moves computation
  const getValidMoves = useCallback((playerIdx: number, dice: number, currentTokens: Token[][]): { tokenId: number; newState: Token }[] => {
    const playerTokens = currentTokens[playerIdx] || []
    const moves: { tokenId: number; newState: Token }[] = []

    for (const token of playerTokens) {
      if (token.state === 'finished') continue
      if (token.state === 'home') {
        if (dice === 6) {
          moves.push({ tokenId: token.id, newState: { ...token, state: 'track', trackPos: ENTRY_POS[playerIdx], corridorPos: -1 } })
        }
      } else if (token.state === 'track') {
        const stepsFromCorridorEntry = ((CORRIDOR_ENTRY[playerIdx] - token.trackPos) % 52 + 52) % 52
        if (dice <= stepsFromCorridorEntry) {
          moves.push({ tokenId: token.id, newState: { ...token, trackPos: (token.trackPos + dice) % 52 } })
        } else if (dice === stepsFromCorridorEntry + 1) {
          moves.push({ tokenId: token.id, newState: { ...token, state: 'corridor', trackPos: -1, corridorPos: 0 } })
        } else {
          const corridorSteps = dice - stepsFromCorridorEntry - 1
          if (corridorSteps <= 5) {
            moves.push({ tokenId: token.id, newState: { ...token, state: 'corridor', trackPos: -1, corridorPos: corridorSteps } })
          }
          if (corridorSteps === 5) {
            moves[moves.length - 1] = { tokenId: token.id, newState: { ...token, state: 'finished', trackPos: -1, corridorPos: -1 } }
          }
        }
      } else if (token.state === 'corridor') {
        const newPos = token.corridorPos + dice
        if (newPos === 5) {
          moves.push({ tokenId: token.id, newState: { ...token, state: 'finished', trackPos: -1, corridorPos: -1 } })
        } else if (newPos < 5) {
          moves.push({ tokenId: token.id, newState: { ...token, corridorPos: newPos } })
        }
      }
    }
    return moves
  }, [])

  // Roll dice (server-side)
  const rollDice = useCallback(async () => {
    if (isRolling || phase !== 'playing' || !room) return
    const myIdx = getMyPlayerIndex()
    if (myIdx !== currentPlayer) return

    setIsRolling(true)
    setMovableTokens([])
    setMessage('')

    // Animate locally
    const speedMap: Record<number, number> = { 1: 300, 2: 220, 3: 150, 4: 100, 5: 60 }
    const speed = speedMap[config.diceSpeed] || 150
    let count = 0
    const maxCount = 10

    await new Promise<void>((resolve) => {
      diceIntervalRef.current = setInterval(() => {
        const val = Math.floor(Math.random() * 6) + 1
        setDiceValue(val)
        count++
        if (count >= maxCount) {
          if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
          diceIntervalRef.current = null
          resolve()
        }
      }, speed)
    })

    // Get actual dice from server
    try {
      const res = await fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'roll',
          participantCode: tpkCode,
          roomCode: room.roomCode,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const finalDice = data.diceValue
        setDiceValue(finalDice)
        handleDiceResult(finalDice)
      } else {
        setMessage(data.error || 'Error al tirar')
      }
    } catch {
      setMessage('Error de conexión')
    }
    setIsRolling(false)
  }, [isRolling, phase, room, getMyPlayerIndex, currentPlayer, config.diceSpeed, tpkCode])

  // Handle dice result
  const handleDiceResult = useCallback((dice: number) => {
    const moves = getValidMoves(currentPlayer, dice, tokens)
    if (moves.length === 0) {
      const playersList = getPlayersFromRoom()
      setMessage(`${playersList[currentPlayer]?.playerName || 'Jugador'} no puede mover`)
      setTimeout(() => nextTurn(dice), 1200)
      return
    }
    const myIdx = getMyPlayerIndex()
    if (currentPlayer === myIdx) {
      setMovableTokens(moves.map(m => m.tokenId))
      setMessage(`Tiraste ${dice}. Selecciona una ficha para mover.`)
    } else {
      setMessage(`Esperando movimiento de ${room?.players[currentPlayer]?.participantName || 'rival'}...`)
    }
  }, [currentPlayer, tokens, getValidMoves, getMyPlayerIndex, getPlayersFromRoom, room])

  // Execute move and sync with server
  const executeMove = useCallback(async (playerIdx: number, tokenId: number, newState: Token, dice: number) => {
    // Apply locally
    const newTokens = tokens.map((playerTokens, pi) => {
      if (pi !== playerIdx) return playerTokens
      return playerTokens.map(t => t.id === tokenId ? { ...newState, player: playerIdx, id: tokenId } : t)
    })

    // Check captures
    let captured = false
    if (newState.state === 'track') {
      const pos = newState.trackPos
      if (!ENTRY_POS.includes(pos)) {
        for (let pi = 0; pi < newTokens.length; pi++) {
          if (pi === playerIdx) continue
          newTokens[pi] = newTokens[pi].map(t => {
            if (t.state === 'track' && t.trackPos === pos) {
              captured = true
              return { ...t, state: 'home' as const, trackPos: -1, corridorPos: -1 }
            }
            return t
          })
        }
      }
    }

    // Check finish
    let finished = false
    if (newState.state === 'finished') finished = true

    // Check win
    let winIdx = -1
    const playerTokens = newTokens[playerIdx]
    if (playerTokens.every(t => t.state === 'finished')) {
      winIdx = playerIdx
    }

    // Calculate next player
    let nextPlayerIdx = currentPlayer
    let newConsecutive = consecutiveSixes
    if (dice === 6) {
      newConsecutive = consecutiveSixes + 1
      if (newConsecutive >= 3) {
        newConsecutive = 0
        nextPlayerIdx = (currentPlayer + 1) % (room?.players.length || 4)
      } else {
        nextPlayerIdx = currentPlayer // roll again
      }
    } else {
      newConsecutive = 0
      nextPlayerIdx = (currentPlayer + 1) % (room?.players.length || 4)
    }

    // Update score
    let newScore = score
    if (captured && playerIdx === getMyPlayerIndex()) newScore += config.pointsCapture
    if (finished && playerIdx === getMyPlayerIndex()) newScore += config.pointsFinish
    if (winIdx === getMyPlayerIndex()) newScore += config.pointsWin
    setScore(newScore)

    const newGameState = {
      tokens: newTokens,
      consecutiveSixes: newConsecutive,
      lastDice: dice,
    }

    // Sync with server
    if (room) {
      try {
        await fetch('/api/parques-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateState',
            participantCode: tpkCode,
            roomCode: room.roomCode,
            newGameState,
            nextPlayer: nextPlayerIdx,
            winnerIdx: winIdx >= 0 ? winIdx : undefined,
            playerScore: newScore,
          }),
        })
      } catch { /* offline fallback */ }
    }

    setTokens(newTokens)
    setMovableTokens([])
    setConsecutiveSixes(newConsecutive)

    if (winIdx >= 0) {
      setWinner(winIdx)
      setPhase('gameover')
      return
    }

    setCurrentPlayer(nextPlayerIdx)
    const myIdx = getMyPlayerIndex()
    if (nextPlayerIdx === myIdx) {
      if (dice === 6 && newConsecutive > 0) {
        setMessage('¡Sacaste 6! Tira de nuevo.')
      } else {
        setMessage('Tu turno. Tira el dado.')
      }
    } else {
      const playersList = getPlayersFromRoom()
      if (dice === 6 && newConsecutive > 0) {
        setMessage(`${playersList[nextPlayerIdx]?.playerName || 'Rival'} sacó 6, tira de nuevo.`)
      } else {
        setMessage(`Esperando a ${playersList[nextPlayerIdx]?.playerName || 'rival'}...`)
      }
    }
  }, [tokens, currentPlayer, consecutiveSixes, score, room, config, getMyPlayerIndex, getPlayersFromRoom, tpkCode])

  // Next turn (for when no moves available)
  const nextTurn = useCallback((lastDice: number) => {
    if (winner !== null) return
    let nextPlayerIdx: number
    let newConsecutive = consecutiveSixes
    if (lastDice === 6) {
      newConsecutive = consecutiveSixes + 1
      if (newConsecutive >= 3) {
        newConsecutive = 0
        nextPlayerIdx = (currentPlayer + 1) % (room?.players.length || 4)
      } else {
        nextPlayerIdx = currentPlayer
      }
    } else {
      newConsecutive = 0
      nextPlayerIdx = (currentPlayer + 1) % (room?.players.length || 4)
    }

    // Sync with server
    if (room) {
      fetch('/api/parques-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateState',
          participantCode: tpkCode,
          roomCode: room.roomCode,
          newGameState: { tokens, consecutiveSixes: newConsecutive, lastDice },
          nextPlayer: nextPlayerIdx,
        }),
      }).catch(() => {})
    }

    setConsecutiveSixes(newConsecutive)
    setCurrentPlayer(nextPlayerIdx)
    const myIdx = getMyPlayerIndex()
    if (nextPlayerIdx === myIdx) {
      setMessage('Tu turno. Tira el dado.')
    } else {
      setMessage(`Esperando a ${room?.players[nextPlayerIdx]?.participantName || 'rival'}...`)
    }
  }, [winner, consecutiveSixes, currentPlayer, room, tokens, tpkCode, getMyPlayerIndex])

  // Handle token click
  const handleTokenClick = useCallback((playerIdx: number, tokenId: number) => {
    const myIdx = getMyPlayerIndex()
    if (playerIdx !== myIdx || !movableTokens.includes(tokenId) || phase !== 'playing') return
    const moves = getValidMoves(currentPlayer, diceValue, tokens)
    const move = moves.find(m => m.tokenId === tokenId)
    if (move) {
      executeMove(playerIdx, tokenId, move.newState, diceValue)
    }
  }, [getMyPlayerIndex, movableTokens, phase, currentPlayer, diceValue, tokens, getValidMoves, executeMove])

  // Cleanup
  useEffect(() => {
    return () => {
      if (diceIntervalRef.current) clearInterval(diceIntervalRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Board rendering helpers
  const getCellColor = (value: number, row: number, col: number): string => {
    switch(value) {
      case 0: return 'transparent'
      case 1: return 'rgba(255,255,255,0.06)'
      case 2: return PLAYER_COLORS_DIM[0]
      case 3: return PLAYER_COLORS_DIM[1]
      case 4: return PLAYER_COLORS_DIM[2]
      case 5: return PLAYER_COLORS_DIM[3]
      case 6: {
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

  const getTokenBoardPos = (token: Token): [number, number] => {
    if (token.state === 'home') return HOME_BASES[token.player][token.id % 4]
    if (token.state === 'track') return TRACK[token.trackPos]
    if (token.state === 'corridor') return CORRIDORS[token.player][token.corridorPos]
    if (token.state === 'finished') return CENTER
    return [0, 0]
  }

  const getTokensAtPos = (row: number, col: number): Token[] => {
    const result: Token[] = []
    for (const playerTokens of tokens) {
      for (const t of playerTokens) {
        const pos = getTokenBoardPos(t)
        if (pos[0] === row && pos[1] === col) result.push(t)
      }
    }
    return result
  }

  const isEntryPoint = (row: number, col: number): boolean => {
    for (const ep of ENTRY_POS) {
      if (TRACK[ep][0] === row && TRACK[ep][1] === col) return true
    }
    return false
  }

  const playersList = getPlayersFromRoom()
  const myIdx = getMyPlayerIndex()
  const takenTeams = room?.players?.map((p: RoomPlayer) => p.teamSlug) || []

  // ============================================
  // RENDER
  // ============================================
  if (!configLoaded) {
    return (
      <div className="relative">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ color: '#facc15' }}>
            PARQUES FUTBOLERO
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
            PARQUES FUTBOLERO
          </h3>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #facc15)' }} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(250,204,21,0.4)' }}>
          Invita y compite con rivales reales
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

          {/* INTRO — Must login to play */}
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
                  Juega con rivales reales. Solo puedes jugar invitando a usuarios inscritos en TPK PLAY.
                  4 posiciones, escudos de la Liga BetPlay, clásicos del fútbol colombiano.
                </p>
              </div>

              {/* Info badges */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(250,204,21,0.7)' }}>&#x1F465; Solo con invitación</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(239,68,68,0.7)' }}>&#x2694;&#xFE0F; +{config.pointsCapture}pts captura</span>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(34,197,94,0.7)' }}>&#x1F3C6; +{config.pointsWin}pts victoria</span>
                </div>
              </div>

              <button
                onClick={() => setPhase('login')}
                className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #facc15, #ef4444)',
                  color: '#000',
                  boxShadow: '0 0 15px rgba(250,204,21,0.4), 0 0 30px rgba(239,68,68,0.2)',
                }}
              >
                Ingresar con Código TPK
              </button>
            </div>
          )}

          {/* LOGIN — Enter TPK code */}
          {phase === 'login' && (
            <div className="text-center py-6 space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'rgba(250,204,21,0.1)', border: '2px solid rgba(250,204,21,0.3)' }}>
                <span className="text-2xl">&#x1F511;</span>
              </div>
              <h4 className="text-sm font-black uppercase" style={{ color: '#facc15' }}>
                Ingresa tu Código TPK
              </h4>
              <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Debes estar registrado como participante para jugar Parqués.
              </p>
              <input
                type="text"
                value={tpkCode}
                onChange={(e) => setTpkCode(e.target.value.toUpperCase())}
                placeholder="TPKXXXXXX"
                maxLength={9}
                className="w-full px-4 py-3 rounded-xl text-center text-sm font-mono font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(250,204,21,0.2)',
                  color: '#facc15',
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {loginError && (
                <p className="text-[0.6rem] font-bold" style={{ color: '#ef4444' }}>{loginError}</p>
              )}
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setPhase('intro'); setLoginError('') }}
                  className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Volver
                </button>
                <button onClick={handleLogin}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #ef4444)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(250,204,21,0.3)',
                  }}>
                  Ingresar
                </button>
              </div>
            </div>
          )}

          {/* CREATE / JOIN ROOM */}
          {phase === 'create' && (
            <div className="py-6 space-y-5">
              {/* Welcome */}
              <div className="text-center">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Hola, <span style={{ color: '#facc15' }}>{userName}</span>
                </p>
                <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Código TPK: <span className="font-mono font-bold" style={{ color: 'rgba(250,204,21,0.6)' }}>{tpkCode}</span>
                </p>
              </div>

              {/* Create Room Section */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}>
                <h4 className="text-xs font-black uppercase mb-3" style={{ color: '#facc15', textShadow: '0 0 6px rgba(250,204,21,0.3)' }}>
                  &#x1F3E0; Crear Sala
                </h4>
                {/* Clasico mode selector */}
                <div className="space-y-1.5 mb-3">
                  <p className="text-[0.55rem] uppercase tracking-wider font-bold" style={{ color: 'rgba(250,204,21,0.5)' }}>
                    Selecciona el Clásico
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(CLASICOS_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedMode(key)}
                        className="px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-200"
                        style={{
                          background: selectedMode === key ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.02)',
                          border: selectedMode === key ? '1.5px solid #facc15' : '1.5px solid rgba(255,255,255,0.06)',
                          boxShadow: selectedMode === key ? '0 0 8px rgba(250,204,21,0.2)' : 'none',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {preset.teams.slice(0, 4).map(slug => (
                              <Image key={slug} src={getTeamShield(slug)} alt="" width={12} height={12}
                                className="w-3 h-3 object-contain" />
                            ))}
                          </div>
                          <div>
                            <div className="text-[0.6rem] font-bold" style={{ color: selectedMode === key ? '#facc15' : 'rgba(255,255,255,0.5)' }}>
                              {preset.name}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team selector */}
                <p className="text-[0.55rem] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'rgba(250,204,21,0.5)' }}>
                  Elige tu Equipo
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-3">
                  {TEAMS.map((team) => {
                    const isSelected = selectedTeam === team.slug
                    return (
                      <button
                        key={team.slug}
                        onClick={() => setSelectedTeam(team.slug)}
                        className="relative aspect-square rounded-lg overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1.5px solid #facc15' : '1.5px solid rgba(255,255,255,0.06)',
                          boxShadow: isSelected ? '0 0 8px rgba(250,204,21,0.3)' : 'none',
                        }}
                      >
                        <Image src={getTeamShield(team.slug)} alt={team.name} width={20} height={20}
                          className="w-4 h-4 object-contain"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 4px rgba(250,204,21,0.5)) brightness(1.2)' : 'brightness(0.6)' }}
                        />
                        <span className="text-[0.3rem] font-bold uppercase mt-0.5 truncate w-full px-0.5 text-center"
                          style={{ color: isSelected ? '#facc15' : 'rgba(255,255,255,0.25)' }}>
                          {team.name.split(' ').pop()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button onClick={handleCreateRoom}
                  disabled={!selectedTeam || isCreating}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedTeam ? 'linear-gradient(135deg, #facc15, #ef4444)' : 'rgba(255,255,255,0.08)',
                    color: '#000',
                    boxShadow: selectedTeam ? '0 0 12px rgba(250,204,21,0.3)' : 'none',
                  }}>
                  {isCreating ? 'Creando...' : 'Crear Sala'}
                </button>
              </div>

              {/* Join Room Section */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <h4 className="text-xs font-black uppercase mb-3" style={{ color: '#3b82f6', textShadow: '0 0 6px rgba(59,130,246,0.3)' }}>
                  &#x1F517; Unirse a Sala
                </h4>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO DE SALA"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-lg text-center text-sm font-mono font-bold uppercase tracking-[0.3em] mb-3"
                  style={{
                    background: 'rgba(59,130,246,0.06)',
                    border: '1.5px solid rgba(59,130,246,0.2)',
                    color: '#3b82f6',
                    outline: 'none',
                  }}
                />

                {/* Team selector for joining */}
                <p className="text-[0.55rem] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'rgba(59,130,246,0.5)' }}>
                  Elige tu Equipo
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-3">
                  {TEAMS.map((team) => {
                    const isSelected = selectedTeam === team.slug
                    return (
                      <button
                        key={team.slug}
                        onClick={() => setSelectedTeam(team.slug)}
                        className="relative aspect-square rounded-lg overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <Image src={getTeamShield(team.slug)} alt={team.name} width={20} height={20}
                          className="w-4 h-4 object-contain"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 4px rgba(59,130,246,0.5)) brightness(1.2)' : 'brightness(0.6)' }}
                        />
                        <span className="text-[0.3rem] font-bold uppercase mt-0.5 truncate w-full px-0.5 text-center"
                          style={{ color: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.25)' }}>
                          {team.name.split(' ').pop()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button onClick={handleJoinRoom}
                  disabled={!joinRoomCode || !selectedTeam || isJoining}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: (joinRoomCode && selectedTeam) ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    boxShadow: (joinRoomCode && selectedTeam) ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                  }}>
                  {isJoining ? 'Uniéndose...' : 'Unirse'}
                </button>
              </div>

              {roomError && (
                <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-[0.6rem] font-bold" style={{ color: '#ef4444' }}>{roomError}</p>
                </div>
              )}
            </div>
          )}

          {/* JOIN — simpler version for join only */}
          {phase === 'join' && (
            <div className="py-6 space-y-4 max-w-sm mx-auto">
              <h4 className="text-sm font-black uppercase text-center" style={{ color: '#3b82f6' }}>
                Unirse a Sala
              </h4>
              <p className="text-[0.6rem] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Ingresa el código que te compartió el creador de la sala
              </p>
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE SALA"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl text-center text-sm font-mono font-bold uppercase tracking-[0.3em]"
                style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '2px solid rgba(59,130,246,0.2)',
                  color: '#3b82f6',
                  outline: 'none',
                }}
              />
              <button onClick={() => setPhase('create')}
                className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Volver
              </button>
            </div>
          )}

          {/* LOBBY — Waiting for players */}
          {phase === 'lobby' && room && (
            <div className="py-6 space-y-5">
              {/* Room code display */}
              <div className="text-center space-y-2">
                <h4 className="text-sm font-black uppercase" style={{ color: '#facc15', textShadow: '0 0 8px rgba(250,204,21,0.5)' }}>
                  Sala de Espera
                </h4>
                <div className="inline-block px-6 py-3 rounded-xl" style={{ background: 'rgba(250,204,21,0.08)', border: '2px solid rgba(250,204,21,0.3)', boxShadow: '0 0 20px rgba(250,204,21,0.15)' }}>
                  <p className="text-[0.5rem] uppercase tracking-wider mb-1" style={{ color: 'rgba(250,204,21,0.5)' }}>
                    Código de Sala
                  </p>
                  <p className="text-2xl font-black font-mono tracking-[0.3em]" style={{ color: '#facc15', textShadow: '0 0 10px rgba(250,204,21,0.6)' }}>
                    {room.roomCode}
                  </p>
                </div>
                <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Comparte este código con tus rivales
                </p>
              </div>

              {/* Players in lobby */}
              <div className="space-y-2">
                <p className="text-[0.55rem] uppercase tracking-wider font-bold text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Jugadores ({room.players.length}/4)
                </p>
                {room.players.map((p: RoomPlayer, i: number) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: PLAYER_COLORS_DIM[i], border: `1px solid ${PLAYER_COLORS[i]}30` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: PLAYER_COLORS[i] + '20', border: `2px solid ${PLAYER_COLORS[i]}60` }}>
                      <Image src={getTeamShield(p.teamSlug)} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold" style={{ color: PLAYER_COLORS[i] }}>
                        {p.participantName} {p.isCreator ? '(Creador)' : ''}
                      </div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {TEAMS.find(t => t.slug === p.teamSlug)?.name} &middot; Posición {i + 1}
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLAYER_COLORS[i], boxShadow: `0 0 6px ${PLAYER_COLORS_GLOW[i]}` }} />
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: 4 - room.players.length }, (_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 px-4 py-2.5 rounded-xl opacity-30"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="flex-1">
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Esperando jugador...</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite buttons */}
              <div className="space-y-2">
                <button onClick={handleWhatsAppInvite}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(37,211,102,0.12)',
                    color: '#25D366',
                    border: '1px solid rgba(37,211,102,0.3)',
                    boxShadow: '0 0 10px rgba(37,211,102,0.1)',
                  }}>
                  &#x1F4AC; Invitar por WhatsApp
                </button>
                <button onClick={() => {
                  navigator.clipboard.writeText(`Código sala Parqués TPK: ${room.roomCode}`)
                  setMessage('Código copiado!')
                }}
                  className="w-full px-4 py-2 rounded-xl font-bold text-[0.6rem] uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    color: '#a855f7',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}>
                  Copiar Código
                </button>
              </div>

              {/* Start game button */}
              {room.players.find((p: RoomPlayer) => p.participantCode === tpkCode)?.isCreator && (
                <div className="text-center space-y-2">
                  <button onClick={handleStartGame}
                    disabled={room.players.length < 2}
                    className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: room.players.length >= 2 ? 'linear-gradient(135deg, #facc15, #ef4444)' : 'rgba(255,255,255,0.08)',
                      color: '#000',
                      boxShadow: room.players.length >= 2 ? '0 0 15px rgba(250,204,21,0.4)' : 'none',
                    }}>
                    {room.players.length < 2 ? `Mínimo 2 jugadores (${room.players.length}/4)` : 'Iniciar Juego'}
                  </button>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Se puede jugar con 2, 3 o 4 jugadores
                  </p>
                </div>
              )}

              {!room.players.find((p: RoomPlayer) => p.participantCode === tpkCode)?.isCreator && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                    <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }} />
                    <span className="text-[0.6rem] font-bold" style={{ color: 'rgba(250,204,21,0.6)' }}>Esperando que el creador inicie...</span>
                  </div>
                </div>
              )}

              {/* Leave room */}
              <div className="text-center">
                <button onClick={handleLeaveRoom}
                  className="px-4 py-2 rounded-xl text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Salir de la Sala
                </button>
              </div>

              {roomError && (
                <p className="text-[0.6rem] font-bold text-center" style={{ color: '#ef4444' }}>{roomError}</p>
              )}
            </div>
          )}

          {/* PLAYING */}
          {phase === 'playing' && room && tokens.length > 0 && (
            <div className="space-y-3">
              {/* Top bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Image src={getTeamShield(playersList[myIdx]?.teamSlug || '')} alt="" width={20} height={20}
                    className="w-5 h-5 object-contain"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }}
                  />
                  <span className="text-xs font-black" style={{ color: PLAYER_COLORS[myIdx] }}>{score} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  {playersList.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{
                        background: currentPlayer === i ? PLAYER_COLORS_DIM[i] : 'transparent',
                        border: `1px solid ${currentPlayer === i ? PLAYER_COLORS[i] + '60' : 'transparent'}`,
                      }}
                    >
                      <Image src={getTeamShield(p.teamSlug)} alt="" width={12} height={12} className="w-3 h-3 object-contain" />
                      <span className="text-[0.5rem] font-bold" style={{ color: PLAYER_COLORS[i] }}>
                        {tokens[i]?.filter(t => t.state === 'finished').length || 0}/{tokens[i]?.length || 0}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                  <span className="text-[0.5rem] font-mono font-bold" style={{ color: 'rgba(250,204,21,0.6)' }}>{room.roomCode}</span>
                </div>
              </div>

              {/* Message bar */}
              {message && (
                <div className="text-center px-3 py-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                  <p className="text-[0.6rem] font-bold" style={{ color: currentPlayer === myIdx ? '#facc15' : 'rgba(255,255,255,0.5)' }}>
                    {message}
                  </p>
                </div>
              )}

              {/* Board */}
              <div className="overflow-x-auto">
                <div className="inline-grid gap-0 mx-auto" style={{
                  gridTemplateColumns: `repeat(15, minmax(18px, 1fr))`,
                  minWidth: '270px',
                  maxWidth: '390px',
                  width: '100%',
                }}>
                  {BOARD_GRID.map((row, ri) =>
                    row.map((cell, ci) => {
                      const cellTokens = getTokensAtPos(ri, ci)
                      const isEntry = isEntryPoint(ri, ci)
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className="aspect-square relative flex items-center justify-center"
                          style={{
                            background: getCellColor(cell, ri, ci),
                            border: getCellBorder(cell, ri, ci),
                          }}
                        >
                          {isEntry && cell === 1 && (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(250,204,21,0.3)' }} />
                          )}
                          {cell === 7 && (
                            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(250,204,21,0.2)', border: '1px solid rgba(250,204,21,0.4)' }} />
                          )}
                          {cellTokens.map((token) => {
                            const isMovable = movableTokens.includes(token.id) && token.player === myIdx
                            return (
                              <div
                                key={`${token.player}-${token.id}`}
                                className={`absolute rounded-full flex items-center justify-center ${isMovable ? 'cursor-pointer animate-pulse' : ''}`}
                                style={{
                                  width: '80%',
                                  height: '80%',
                                  background: PLAYER_COLORS[token.player],
                                  boxShadow: `0 0 ${isMovable ? '8' : '4'}px ${PLAYER_COLORS_GLOW[token.player]}`,
                                  border: `1.5px solid rgba(255,255,255,0.3)`,
                                  transform: `translate(${token.id * 2}px, ${token.id * -2}px)`,
                                  zIndex: isMovable ? 20 : 10,
                                  animation: isMovable ? 'pulse 1s infinite' : undefined,
                                }}
                                onClick={() => handleTokenClick(token.player, token.id)}
                              >
                                <Image
                                  src={getTeamShield(playersList[token.player]?.teamSlug || '')}
                                  alt=""
                                  width={10}
                                  height={10}
                                  className="w-[60%] h-[60%] object-contain"
                                  style={{ filter: 'brightness(2) drop-shadow(0 0 1px rgba(0,0,0,0.5))' }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Dice + controls */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1">
                  {/* Player indicators */}
                  <div className="flex justify-center gap-1.5 mb-2">
                    {playersList.map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-0.5"
                        style={{ opacity: currentPlayer === i ? 1 : 0.4 }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: PLAYER_COLORS_DIM[i], border: `1.5px solid ${currentPlayer === i ? PLAYER_COLORS[i] : 'transparent'}` }}>
                          <Image src={getTeamShield(p.teamSlug)} alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        </div>
                        <span className="text-[0.4rem] font-bold truncate max-w-[50px]" style={{ color: PLAYER_COLORS[i] }}>
                          {p.playerName.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={rollDice}
                  disabled={isRolling || currentPlayer !== myIdx || phase === 'gameover'}
                  className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(239,68,68,0.1))',
                    border: '2px solid rgba(250,204,21,0.4)',
                    boxShadow: '0 0 15px rgba(250,204,21,0.2)',
                  }}
                >
                  <span className="text-2xl" style={{ filter: isRolling ? 'blur(1px)' : 'none' }}>
                    {DICE_FACES[diceValue - 1]}
                  </span>
                </button>

                <div className="flex-1 text-center">
                  {currentPlayer !== myIdx && (
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PLAYER_COLORS[currentPlayer], borderTopColor: 'transparent' }} />
                      <span className="text-[0.55rem] font-bold" style={{ color: PLAYER_COLORS[currentPlayer] }}>
                        Turno de {playersList[currentPlayer]?.playerName.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Leave */}
              <div className="text-center mt-2">
                <button onClick={handleLeaveRoom}
                  className="px-3 py-1 rounded-lg text-[0.5rem] font-bold cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.5)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  Abandonar
                </button>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {phase === 'gameover' && room && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PLAYER_COLORS[winner ?? 0]}, rgba(250,204,21,0.8))`,
                  boxShadow: `0 0 30px ${PLAYER_COLORS_GLOW[winner ?? 0]}, 0 0 60px rgba(250,204,21,0.2)`,
                }}
              >
                <span className="text-4xl">&#x1F3C6;</span>
              </div>
              <div>
                <h4 className="text-lg font-black uppercase" style={{ color: PLAYER_COLORS[winner ?? 0], textShadow: `0 0 10px ${PLAYER_COLORS_GLOW[winner ?? 0]}` }}>
                  {winner !== null && playersList[winner] ? playersList[winner].playerName : 'Jugador'} Gana!
                </h4>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {winner !== null && playersList[winner] ? TEAMS.find(t => t.slug === playersList[winner]?.teamSlug)?.name : 'Equipo'} - Campeón del Parqués
                </p>
              </div>

              {/* Scoreboard */}
              <div className="space-y-1.5 max-w-xs mx-auto">
                {playersList.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      background: i === winner ? PLAYER_COLORS_DIM[i] : 'rgba(255,255,255,0.02)',
                      border: i === winner ? `1px solid ${PLAYER_COLORS[i]}40` : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: PLAYER_COLORS[i] + '20' }}>
                      <Image src={getTeamShield(p.teamSlug)} alt="" width={12} height={12} className="w-3 h-3 object-contain" />
                    </div>
                    <span className="text-[0.6rem] font-bold flex-1 text-left" style={{ color: PLAYER_COLORS[i] }}>
                      {p.playerName}
                    </span>
                    <span className="text-[0.6rem] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {tokens[i]?.filter(t => t.state === 'finished').length || 0}/{tokens[i]?.length || 0} fichas
                    </span>
                    <span className="text-[0.6rem] font-black" style={{ color: PLAYER_COLORS[i] }}>
                      {p.score} pts
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={handleLeaveRoom}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #ef4444)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(250,204,21,0.3)',
                  }}>
                  Nueva Partida
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Inline keyframe animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center }
          100% { background-position: 400% center }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

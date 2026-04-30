'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import GamePreviewModal from './GamePreviewModal'

interface Game {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  type: string
  config: string | null
  isActive: boolean
  order: number
  createdAt: string
  _count?: { participants: number }
}

interface Participant {
  id: string
  name: string
  email: string
  phone: string
  code: string
  teamSlug: string
  gameId: string | null
  game: Game | null
  followedFb: boolean
  followedIg: boolean
  followedWa: boolean
  totalPoints: number
  createdAt: string
}

interface PopupConfig {
  id: string
  text: string
  linkUrl: string
  imageUrl: string | null
  isActive: boolean
  color: string
  size: number
  position: string
  createdAt: string
  updatedAt: string
}

interface TpkBannerData {
  id: string
  type: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  linkUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MatchPredictionData {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  matchDate: string
  venue: string | null
  status: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type Tab = 'dashboard' | 'games' | 'participants' | 'stats' | 'popup' | 'banners' | 'predictions' | 'loteria' | 'ruleta' | 'circuito' | 'parques' | 'rompecabezas' | 'penales' | 'carta-mayor' | 'diana' | 'clasificacion' | 'numero-camiseta' | 'mineria' | 'apuesta' | 'sopa' | 'audio'

interface SidebarSection {
  id: string
  label: string
  icon: string
  color: string
  items: SidebarItem[]
}

interface SidebarItem {
  id: Tab
  label: string
  icon: string
  color: string
  count?: number
}

const SESSION_KEY = 'tpk_admin_token'

const GAME_TYPES: Record<string, { label: string; icon: string; color: string; description: string }> = {
  'trivia-futbolera': { label: 'Trivia Futbolera', icon: '⚽', color: '#a855f7', description: 'Pregunta por hora sobre la Liga BetPlay' },
  'trivia-relampago': { label: 'Trivia Relámpago', icon: '⚡', color: '#eab308', description: '5 preguntas en 60 segundos' },
  'memoria-futbolera': { label: 'Memoria Futbolera', icon: '🧠', color: '#ec4899', description: 'Encuentra los pares de escudos de la Liga BetPlay' },
  'crucigrama-futbolero': { label: 'Crucigrama Futbolero', icon: '🎯', color: '#a855f7', description: '3 niveles de crucigrama por equipo de la Liga BetPlay' },
  'tragamonedas-futbolera': { label: 'Tragamonedas Futbolera', icon: '🎰', color: '#fbbf24', description: 'Slot machine con escudos de la Liga BetPlay' },
  'loteria-futbolera': { label: 'Lotería de Equipos', icon: '🃏', color: '#ff00ff', description: 'Lotería con escudos de la Liga BetPlay' },
  'ruleta-futbolera': { label: 'Ruleta de Equipos', icon: '🎰', color: '#ffc800', description: 'Ruleta casino con escudos de la Liga BetPlay' },
  'circuito-futbolero': { label: 'Circuito Futbolero', icon: '🎮', color: '#00ff80', description: 'Pac-Man con escudos de rivales de la Liga BetPlay' },
  'parques-futbolero': { label: 'Parqués Futbolero', icon: '🎲', color: '#facc15', description: 'Parqués clásico con clásicos rivales de la Liga BetPlay' },
  'rompecabezas-futbolero': { label: 'Rompecabezas de Escudos', icon: '🧩', color: '#00ffc8', description: 'Rompecabezas con escudos de la Liga BetPlay que cambia cada hora' },
  'penales-futbolero': { label: 'Penales Futboleros', icon: '⚽', color: '#ff4444', description: 'Simulador de tiros penales con escudos de la Liga BetPlay' },
  'carta-mayor-futbolero': { label: 'Carta Mayor', icon: '🃏', color: '#eab308', description: 'Alto y baja con escudos de la Liga BetPlay' },
  'diana-futbolera': { label: 'Diana de Escudos', icon: '🎯', color: '#ef4444', description: 'Tiro al blanco con escudos de la Liga BetPlay' },
  'clasificacion-futbolera': { label: 'Clasificación Histórica', icon: '🏆', color: '#06b6d4', description: 'Ordena los equipos por criterios históricos' },
  'numero-camiseta': { label: 'Número Camiseta', icon: '🔢', color: '#8b5cf6', description: 'Adivina el dorsal de jugadores históricos' },
  'mineria-futbolera': { label: 'Minería de Escudos', icon: '💣', color: '#22c55e', description: 'Buscaminas con escudos rivales de la Liga BetPlay' },
  'apuesta-futbolera': { label: 'Apuesta Futbolera', icon: '📊', color: '#f97316', description: 'Predice resultados de partidos de la Liga BetPlay' },
  'sopa-futbolera': { label: 'Sopa de Escudos', icon: '🔤', color: '#14b8a6', description: 'Sopa de letras con nombres de la Liga BetPlay' },
  'prediccion': { label: 'Predicción', icon: '🎯', color: '#f97316', description: 'Predice resultados de partidos' },
  'encuesta': { label: 'Encuesta', icon: '📊', color: '#3b82f6', description: 'Vota en encuestas futboleras' },
  'personalizado': { label: 'Personalizado', icon: '🎮', color: '#22c55e', description: 'Juego personalizado' },
}

const GAME_TYPE_OPTIONS = Object.entries(GAME_TYPES).map(([value, { label }]) => ({ value, label }))

const TEAM_NAMES_MAP: Record<string, string> = {
  'aguilas-doradas': 'Águilas Doradas',
  'alianza-valledupar': 'Alianza Valledupar',
  'america-de-cali': 'América de Cali',
  'atletico-bucaramanga': 'Atl. Bucaramanga',
  'atletico-junior': 'Atl. Junior',
  'atletico-nacional': 'Atl. Nacional',
  'boyaca-chico': 'Boyacá Chicó',
  'cucuta-deportivo': 'Cúcuta Deportivo',
  'deportes-tolima': 'Deportes Tolima',
  'deportivo-cali': 'Deportivo Cali',
  'deportivo-pasto': 'Deportivo Pasto',
  'deportivo-pereira': 'Deportivo Pereira',
  'fortaleza-ceif': 'Fortaleza CEIF',
  'independiente-medellin': 'Ind. Medellín',
  'independiente-santa-fe': 'Ind. Santa Fe',
  'internacional-de-bogota': 'Internacional',
  'jaguares-de-cordoba': 'Jaguares de Córdoba',
  'llaneros': 'Llaneros',
  'millonarios': 'Millonarios',
  'once-caldas': 'Once Caldas',
}

const PNG_ONLY = ['internacional-de-bogota']

const TEAM_OPTIONS = Object.entries(TEAM_NAMES_MAP).map(([value, label]) => ({ value, label }))

const RULETA_TEAMS = Object.entries(TEAM_NAMES_MAP).map(([slug, name]) => ({ slug, name }))

// Maze for Circuito preview
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

interface GameFormData {
  name: string
  description: string
  imageUrl: string
  type: string
  config: string
  order: number
  isActive: boolean
}

const emptyGameForm: GameFormData = {
  name: '',
  description: '',
  imageUrl: '',
  type: 'personalizado',
  config: '',
  order: 0,
  isActive: true,
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [games, setGames] = useState<Game[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)

  // Sidebar state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contenido: true,
    banners: true,
    usuarios: true,
    datos: true,
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Game form state
  const [showGameForm, setShowGameForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [gameForm, setGameForm] = useState<GameFormData>(emptyGameForm)
  const [savingGame, setSavingGame] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Preview state
  const [previewGame, setPreviewGame] = useState<Game | null>(null)

  // Popup state
  const [popups, setPopups] = useState<PopupConfig[]>([])
  const [popupForm, setPopupForm] = useState({ text: 'TPK NUEVO', linkUrl: '#', imageUrl: '', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
  const [editingPopup, setEditingPopup] = useState<PopupConfig | null>(null)
  const [savingPopup, setSavingPopup] = useState(false)

  // Banners state
  const [banners, setBanners] = useState<TpkBannerData[]>([])
  const [bannerForm, setBannerForm] = useState({ type: 'ganador', title: 'GANADOR TPK', subtitle: '', imageUrl: '', linkUrl: '', isActive: true })
  const [editingBanner, setEditingBanner] = useState<TpkBannerData | null>(null)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)

  // Predictions state
  const [predictions, setPredictions] = useState<MatchPredictionData[]>([])
  const [predictionForm, setPredictionForm] = useState({ homeTeam: 'millonarios', awayTeam: 'atletico-nacional', homeScore: '' as string, awayScore: '' as string, matchDate: '', venue: '', status: 'upcoming', isActive: true, order: 0 })
  const [editingPrediction, setEditingPrediction] = useState<MatchPredictionData | null>(null)
  const [showPredictionForm, setShowPredictionForm] = useState(false)
  const [savingPrediction, setSavingPrediction] = useState(false)

  // Loteria state
  const [loteriaConfig, setLoteriaConfig] = useState<{ id: string; boardSize: number; pointsLine: number; pointsDiag: number; pointsFull: number; drawSpeed: number; isActive: boolean } | null>(null)
  const [loteriaForm, setLoteriaForm] = useState({ boardSize: 4, pointsLine: 30, pointsDiag: 50, pointsFull: 100, drawSpeed: 5, isActive: true })
  const [savingLoteria, setSavingLoteria] = useState(false)

  // Ruleta state
  const [ruletaConfig, setRuletaConfig] = useState<{ id: string; pointsExact: number; pointsRegion: number; spinDuration: number; isActive: boolean } | null>(null)
  const [ruletaForm, setRuletaForm] = useState({ pointsExact: 50, pointsRegion: 10, spinDuration: 4, isActive: true })
  const [savingRuleta, setSavingRuleta] = useState(false)

  // Circuito state
  const [circuitoConfig, setCircuitoConfig] = useState<{ id: string; pointsDot: number; pointsGhost: number; gameSpeed: number; lives: number; isActive: boolean } | null>(null)
  const [circuitoForm, setCircuitoForm] = useState({ pointsDot: 10, pointsGhost: 200, gameSpeed: 3, lives: 3, isActive: true })
  const [savingCircuito, setSavingCircuito] = useState(false)

  // Parques state
  const [parquesConfig, setParquesConfig] = useState<{ id: string; tokensPerPlayer: number; pointsCapture: number; pointsFinish: number; pointsWin: number; diceSpeed: number; isActive: boolean } | null>(null)
  const [parquesForm, setParquesForm] = useState({ tokensPerPlayer: 2, pointsCapture: 50, pointsFinish: 100, pointsWin: 500, diceSpeed: 3, isActive: true })
  const [savingParques, setSavingParques] = useState(false)

  // Rompecabezas state
  const [rompecabezasConfig, setRompecabezasConfig] = useState<{ id: string; gridSize: number; pointsComplete: number; timeBonusMax: number; timeLimit: number; showPreview: boolean; isActive: boolean } | null>(null)
  const [rompecabezasForm, setRompecabezasForm] = useState({ gridSize: 6, pointsComplete: 200, timeBonusMax: 100, timeLimit: 300, showPreview: true, isActive: true })
  const [savingRompecabezas, setSavingRompecabezas] = useState(false)

  // Penales state
  const [penalesConfig, setPenalesConfig] = useState<{ id: string; roundsPerGame: number; pointsGoal: number; pointsHatTrick: number; pointsPerfect: number; timeLimit: number; isActive: boolean } | null>(null)
  const [penalesForm, setPenalesForm] = useState({ roundsPerGame: 5, pointsGoal: 20, pointsHatTrick: 50, pointsPerfect: 100, timeLimit: 60, isActive: true })
  const [savingPenales, setSavingPenales] = useState(false)

  // Carta Mayor state
  const [cartaMayorConfig, setCartaMayorConfig] = useState<{ id: string; cardsPerRound: number; pointsCorrect: number; pointsStreak5: number; pointsStreak10: number; timeLimit: number; isActive: boolean } | null>(null)
  const [cartaMayorForm, setCartaMayorForm] = useState({ cardsPerRound: 10, pointsCorrect: 10, pointsStreak5: 50, pointsStreak10: 200, timeLimit: 120, isActive: true })
  const [savingCartaMayor, setSavingCartaMayor] = useState(false)

  // Diana state
  const [dianaConfig, setDianaConfig] = useState<{ id: string; roundsPerGame: number; pointsCenter: number; pointsMiddle: number; pointsEdge: number; speed: number; isActive: boolean } | null>(null)
  const [dianaForm, setDianaForm] = useState({ roundsPerGame: 10, pointsCenter: 50, pointsMiddle: 30, pointsEdge: 10, speed: 3, isActive: true })
  const [savingDiana, setSavingDiana] = useState(false)

  // Clasificacion state
  const [clasificacionConfig, setClasificacionConfig] = useState<{ id: string; teamsPerRound: number; pointsPerfect: number; pointsPartial: number; timeLimit: number; timeBonusMax: number; isActive: boolean } | null>(null)
  const [clasificacionForm, setClasificacionForm] = useState({ teamsPerRound: 6, pointsPerfect: 150, pointsPartial: 80, timeLimit: 120, timeBonusMax: 50, isActive: true })
  const [savingClasificacion, setSavingClasificacion] = useState(false)

  // Numero Camiseta state
  const [numeroCamisetaConfig, setNumeroCamisetaConfig] = useState<{ id: string; questionsPerGame: number; pointsExact: number; pointsClose: number; noHintMultiplier: number; timeLimit: number; isActive: boolean } | null>(null)
  const [numeroCamisetaForm, setNumeroCamisetaForm] = useState({ questionsPerGame: 5, pointsExact: 40, pointsClose: 20, noHintMultiplier: 2, timeLimit: 90, isActive: true })
  const [savingNumeroCamiseta, setSavingNumeroCamiseta] = useState(false)

  // Mineria state
  const [mineriaConfig, setMineriaConfig] = useState<{ id: string; gridSize: number; mineCount: number; pointsPerCell: number; pointsComplete: number; pointsNoMines: number; isActive: boolean } | null>(null)
  const [mineriaForm, setMineriaForm] = useState({ gridSize: 8, mineCount: 10, pointsPerCell: 5, pointsComplete: 100, pointsNoMines: 50, isActive: true })
  const [savingMineria, setSavingMineria] = useState(false)

  // Apuesta state
  const [apuestaConfig, setApuestaConfig] = useState<{ id: string; matchesPerRound: number; pointsExact: number; pointsWinner: number; pointsGoals: number; timeLimit: number; isActive: boolean } | null>(null)
  const [apuestaForm, setApuestaForm] = useState({ matchesPerRound: 3, pointsExact: 60, pointsWinner: 20, pointsGoals: 30, timeLimit: 180, isActive: true })
  const [savingApuesta, setSavingApuesta] = useState(false)

  // Sopa state
  const [sopaConfig, setSopaConfig] = useState<{ id: string; gridSize: number; wordsPerGame: number; pointsPerWord: number; pointsComplete: number; timeLimit: number; isActive: boolean } | null>(null)
  const [sopaForm, setSopaForm] = useState({ gridSize: 12, wordsPerGame: 8, pointsPerWord: 15, pointsComplete: 100, timeLimit: 180, isActive: true })
  const [savingSopa, setSavingSopa] = useState(false)

  // Audio config state
  const [audioConfig, setAudioConfig] = useState<{ id: string; audioUrl: string; volume: number; autoPlay: boolean; isActive: boolean; label: string } | null>(null)
  const [audioForm, setAudioForm] = useState({ audioUrl: '/tpk-anthem.mp3', volume: 60, autoPlay: false, isActive: true, label: 'Te Pe Ka Fans Club' })
  const [savingAudio, setSavingAudio] = useState(false)

  // Parques rooms state
  const [parquesRooms, setParquesRooms] = useState<any[]>([])
  const [parquesRoomsLoading, setParquesRoomsLoading] = useState(false)

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  // Check existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem(SESSION_KEY)
      if (token) {
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', token }),
          })
          const data = await res.json()
          if (data.valid) {
            setIsAuthenticated(true)
            setAdminEmail(data.email)
          } else {
            localStorage.removeItem(SESSION_KEY)
          }
        } catch {
          localStorage.removeItem(SESSION_KEY)
        }
      }
    }
    verifySession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: authEmail,
          password: authPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Error al iniciar sesión')
        return
      }

      localStorage.setItem(SESSION_KEY, data.token)
      setIsAuthenticated(true)
      setAdminEmail(data.email)
      setAuthEmail('')
      setAuthPassword('')
    } catch {
      setAuthError('Error de conexión. Intenta de nuevo.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem(SESSION_KEY)
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token }),
      })
    } catch {
      // ignore
    }
    localStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
    setAdminEmail('')
    setShowPanel(false)
  }

  const [fetchError, setFetchError] = useState('')

  const fetchGames = useCallback(async () => {
    try {
      setFetchError('')
      const res = await fetch('/api/games')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setGames(data)
      } else {
        setGames([])
        setFetchError('Error al cargar juegos. Verifica la conexión a la base de datos.')
      }
    } catch (err) {
      console.error('Error fetching games:', err)
      setGames([])
      setFetchError('Error de conexión al cargar juegos.')
    }
  }, [])

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/participants')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setParticipants(data)
      } else {
        setParticipants([])
      }
    } catch (err) {
      console.error('Error fetching participants:', err)
      setParticipants([])
    }
  }, [])

  const fetchPopups = useCallback(async () => {
    try {
      const res = await fetch('/api/popup')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPopups(data)
      } else {
        setPopups([])
      }
    } catch (err) {
      console.error('Error fetching popups:', err)
      setPopups([])
    }
  }, [])

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setBanners(data)
      } else {
        setBanners([])
      }
    } catch (err) {
      console.error('Error fetching banners:', err)
      setBanners([])
    }
  }, [])

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch('/api/predictions')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPredictions(data)
      } else {
        setPredictions([])
      }
    } catch (err) {
      console.error('Error fetching predictions:', err)
      setPredictions([])
    }
  }, [])

  const fetchLoteriaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/loteria')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setLoteriaConfig(data)
        setLoteriaForm({
          boardSize: data.boardSize,
          pointsLine: data.pointsLine,
          pointsDiag: data.pointsDiag,
          pointsFull: data.pointsFull,
          drawSpeed: data.drawSpeed,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching loteria config:', err)
    }
  }, [])

  const fetchRuletaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/ruleta')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setRuletaConfig(data)
        setRuletaForm({
          pointsExact: data.pointsExact,
          pointsRegion: data.pointsRegion,
          spinDuration: data.spinDuration,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching ruleta config:', err)
    }
  }, [])

  const fetchCircuitoConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/circuito')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setCircuitoConfig(data)
        setCircuitoForm({
          pointsDot: data.pointsDot,
          pointsGhost: data.pointsGhost,
          gameSpeed: data.gameSpeed,
          lives: data.lives,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching circuito config:', err)
    }
  }, [])

  const fetchParquesConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/parques')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setParquesConfig(data)
        setParquesForm({
          tokensPerPlayer: data.tokensPerPlayer,
          pointsCapture: data.pointsCapture,
          pointsFinish: data.pointsFinish,
          pointsWin: data.pointsWin,
          diceSpeed: data.diceSpeed,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching parqués config:', err)
    }
  }, [])

  const fetchRompecabezasConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/rompecabezas')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setRompecabezasConfig(data)
        setRompecabezasForm({
          gridSize: data.gridSize,
          pointsComplete: data.pointsComplete,
          timeBonusMax: data.timeBonusMax,
          timeLimit: data.timeLimit,
          showPreview: data.showPreview,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching rompecabezas config:', err)
    }
  }, [])

  const fetchPenalesConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/penales')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setPenalesConfig(data)
        setPenalesForm({
          roundsPerGame: data.roundsPerGame,
          pointsGoal: data.pointsGoal,
          pointsHatTrick: data.pointsHatTrick,
          pointsPerfect: data.pointsPerfect,
          timeLimit: data.timeLimit,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching penales config:', err)
    }
  }, [])

  const fetchCartaMayorConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/carta-mayor')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setCartaMayorConfig(data)
        setCartaMayorForm({
          cardsPerRound: data.cardsPerRound,
          pointsCorrect: data.pointsCorrect,
          pointsStreak5: data.pointsStreak5,
          pointsStreak10: data.pointsStreak10,
          timeLimit: data.timeLimit,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching carta mayor config:', err)
    }
  }, [])

  const fetchDianaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/diana')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setDianaConfig(data)
        setDianaForm({
          roundsPerGame: data.roundsPerGame,
          pointsCenter: data.pointsCenter,
          pointsMiddle: data.pointsMiddle,
          pointsEdge: data.pointsEdge,
          speed: data.speed,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching diana config:', err)
    }
  }, [])

  const fetchClasificacionConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/clasificacion')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setClasificacionConfig(data)
        setClasificacionForm({
          teamsPerRound: data.teamsPerRound,
          pointsPerfect: data.pointsPerfect,
          pointsPartial: data.pointsPartial,
          timeLimit: data.timeLimit,
          timeBonusMax: data.timeBonusMax,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching clasificacion config:', err)
    }
  }, [])

  const fetchNumeroCamisetaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/numero-camiseta')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setNumeroCamisetaConfig(data)
        setNumeroCamisetaForm({
          questionsPerGame: data.questionsPerGame,
          pointsExact: data.pointsExact,
          pointsClose: data.pointsClose,
          noHintMultiplier: data.noHintMultiplier,
          timeLimit: data.timeLimit,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching numero camiseta config:', err)
    }
  }, [])

  const fetchMineriaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/mineria')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setMineriaConfig(data)
        setMineriaForm({
          gridSize: data.gridSize,
          mineCount: data.mineCount,
          pointsPerCell: data.pointsPerCell,
          pointsComplete: data.pointsComplete,
          pointsNoMines: data.pointsNoMines,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching mineria config:', err)
    }
  }, [])

  const fetchApuestaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/apuesta')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setApuestaConfig(data)
        setApuestaForm({
          matchesPerRound: data.matchesPerRound,
          pointsExact: data.pointsExact,
          pointsWinner: data.pointsWinner,
          pointsGoals: data.pointsGoals,
          timeLimit: data.timeLimit,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching apuesta config:', err)
    }
  }, [])

  const fetchSopaConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/sopa')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setSopaConfig(data)
        setSopaForm({
          gridSize: data.gridSize,
          wordsPerGame: data.wordsPerGame,
          pointsPerWord: data.pointsPerWord,
          pointsComplete: data.pointsComplete,
          timeLimit: data.timeLimit,
          isActive: data.isActive,
        })
      }
    } catch (err) {
      console.error('Error fetching sopa config:', err)
    }
  }, [])

  const fetchAudioConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/audio')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data && !data.error) {
        setAudioConfig(data)
        setAudioForm({
          audioUrl: data.audioUrl || '/tpk-anthem.mp3',
          volume: data.volume ?? 60,
          autoPlay: data.autoPlay ?? false,
          isActive: data.isActive !== false,
          label: data.label || 'Te Pe Ka Fans Club',
        })
      }
    } catch (err) {
      console.error('Error fetching audio config:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && showPanel) {
      const load = async () => {
        setLoading(true)
        await Promise.all([fetchGames(), fetchParticipants(), fetchPopups(), fetchBanners(), fetchPredictions(), fetchLoteriaConfig(), fetchRuletaConfig(), fetchCircuitoConfig(), fetchParquesConfig(), fetchRompecabezasConfig(), fetchPenalesConfig(), fetchCartaMayorConfig(), fetchDianaConfig(), fetchClasificacionConfig(), fetchNumeroCamisetaConfig(), fetchMineriaConfig(), fetchApuestaConfig(), fetchSopaConfig(), fetchAudioConfig()])
        setLoading(false)
      }
      load()
    }
  }, [isAuthenticated, showPanel, fetchGames, fetchParticipants, fetchPopups, fetchBanners, fetchPredictions, fetchLoteriaConfig, fetchRuletaConfig, fetchCircuitoConfig, fetchParquesConfig, fetchRompecabezasConfig, fetchPenalesConfig, fetchCartaMayorConfig, fetchDianaConfig, fetchClasificacionConfig, fetchNumeroCamisetaConfig, fetchMineriaConfig, fetchApuestaConfig, fetchSopaConfig, fetchAudioConfig])

  // Fetch Parques Rooms
  const fetchParquesRooms = useCallback(async () => {
    setParquesRoomsLoading(true)
    try {
      const res = await fetch('/api/parques-room?listAll=true')
      if (res.ok) {
        const data = await res.json()
        setParquesRooms(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
    setParquesRoomsLoading(false)
  }, [])

  // Game CRUD
  const handleOpenAddGame = () => {
    setEditingGame(null)
    setGameForm({ ...emptyGameForm, order: games.length })
    setShowGameForm(true)
  }

  const handleOpenEditGame = (game: Game) => {
    setEditingGame(game)
    setGameForm({
      name: game.name,
      description: game.description || '',
      imageUrl: game.imageUrl || '',
      type: game.type || 'personalizado',
      config: game.config || '',
      order: game.order,
      isActive: game.isActive,
    })
    setShowGameForm(true)
  }

  const handleSaveGame = async () => {
    if (!gameForm.name.trim()) return
    setSavingGame(true)
    try {
      if (editingGame) {
        await fetch('/api/games', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingGame.id,
            name: gameForm.name,
            description: gameForm.description || null,
            imageUrl: gameForm.imageUrl || null,
            type: gameForm.type,
            config: gameForm.config || null,
            order: gameForm.order,
            isActive: gameForm.isActive,
          }),
        })
      } else {
        await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: gameForm.name,
            description: gameForm.description || null,
            imageUrl: gameForm.imageUrl || null,
            type: gameForm.type,
            config: gameForm.config || null,
            order: gameForm.order,
            isActive: gameForm.isActive,
          }),
        })
      }
      setShowGameForm(false)
      setEditingGame(null)
      fetchGames()
    } catch (err) {
      console.error('Error saving game:', err)
    } finally {
      setSavingGame(false)
    }
  }

  const handleToggleGame = async (game: Game) => {
    try {
      await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: game.id, isActive: !game.isActive }),
      })
      fetchGames()
    } catch (err) {
      console.error('Error toggling game:', err)
    }
  }

  const handleDeleteGame = async (id: string) => {
    try {
      await fetch(`/api/games?id=${id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchGames()
      fetchParticipants()
    } catch (err) {
      console.error('Error deleting game:', err)
    }
  }

  const handleMoveGame = async (game: Game, direction: 'up' | 'down') => {
    const sortedGames = [...games].sort((a, b) => a.order - b.order)
    const currentIndex = sortedGames.findIndex(g => g.id === game.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sortedGames.length - 1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapGame = sortedGames[swapIndex]

    try {
      await Promise.all([
        fetch('/api/games', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: game.id, order: swapGame.order }),
        }),
        fetch('/api/games', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swapGame.id, order: game.order }),
        }),
      ])
      fetchGames()
    } catch (err) {
      console.error('Error reordering game:', err)
    }
  }

  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('¿Eliminar este participante?')) return
    try {
      await fetch(`/api/participants?id=${id}`, { method: 'DELETE' })
      fetchParticipants()
    } catch (err) {
      console.error('Error deleting participant:', err)
    }
  }

  const sendToWhatsApp = (participant: Participant) => {
    const message = encodeURIComponent(
      `🎮 *TPK PLAY - Nuevo Participante*\n\n` +
      `📋 Código: *${participant.code}*\n` +
      `👤 Nombre: ${participant.name}\n` +
      `📧 Email: ${participant.email}\n` +
      `📱 Teléfono: ${participant.phone}\n` +
      `🎯 Juego: ${participant.game?.name || 'Sin asignar'}\n` +
      `✅ Facebook: ${participant.followedFb ? 'Sí' : 'No'}\n` +
      `✅ Instagram: ${participant.followedIg ? 'Sí' : 'No'}\n` +
      `✅ WhatsApp: ${participant.followedWa ? 'Sí' : 'No'}`
    )
    window.open(`https://wa.me/573112632365?text=${message}`, '_blank')
  }

  const sendAllToWhatsApp = () => {
    const teamMap: Record<string, string> = {
      'aguilas-doradas': 'Águilas Doradas', 'alianza-valledupar': 'Alianza Valledupar',
      'america-de-cali': 'América de Cali', 'atletico-bucaramanga': 'Atl. Bucaramanga',
      'atletico-junior': 'Atl. Junior', 'atletico-nacional': 'Atl. Nacional',
      'boyaca-chico': 'Boyacá Chicó', 'cucuta-deportivo': 'Cúcuta Deportivo',
      'deportes-tolima': 'Deportes Tolima', 'deportivo-cali': 'Deportivo Cali',
      'deportivo-pasto': 'Deportivo Pasto', 'deportivo-pereira': 'Deportivo Pereira',
      'fortaleza-ceif': 'Fortaleza CEIF', 'independiente-medellin': 'Ind. Medellín',
      'independiente-santa-fe': 'Ind. Santa Fe', 'internacional-de-bogota': 'Internacional',
      'jaguares-de-cordoba': 'Jaguares', 'llaneros': 'Llaneros',
      'millonarios': 'Millonarios', 'once-caldas': 'Once Caldas',
    }
    const lines = participants.map(p =>
      `${p.code} | ${p.name} | ${p.email} | ${p.phone} | Hincha: ${teamMap[p.teamSlug] || p.teamSlug || 'N/A'} | ${p.game?.name || 'N/A'}`
    )
    const message = encodeURIComponent(
      `🎮 *TPK PLAY - Participantes Registrados (${participants.length})*\n\n` +
      lines.join('\n')
    )
    window.open(`https://wa.me/573112632365?text=${message}`, '_blank')
  }

  const handleSavePopup = async () => {
    if (!popupForm.text.trim()) return
    setSavingPopup(true)
    try {
      const payload = {
        ...popupForm,
        imageUrl: popupForm.imageUrl || null,
      }
      if (editingPopup) {
        await fetch('/api/popup', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPopup.id, ...payload }),
        })
      } else {
        await fetch('/api/popup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setEditingPopup(null)
      setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', imageUrl: '', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
      fetchPopups()
    } catch (err) {
      console.error('Error saving popup:', err)
    } finally {
      setSavingPopup(false)
    }
  }

  const handleDeletePopup = async (id: string) => {
    try {
      await fetch(`/api/popup?id=${id}`, { method: 'DELETE' })
      fetchPopups()
    } catch (err) {
      console.error('Error deleting popup:', err)
    }
  }

  const handleTogglePopup = async (popup: PopupConfig) => {
    try {
      await fetch('/api/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: popup.id, isActive: !popup.isActive }),
      })
      fetchPopups()
    } catch (err) {
      console.error('Error toggling popup:', err)
    }
  }

  // Banner CRUD
  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) return
    setSavingBanner(true)
    try {
      const payload = {
        ...bannerForm,
        subtitle: bannerForm.subtitle || null,
        imageUrl: bannerForm.imageUrl || null,
        linkUrl: bannerForm.linkUrl || null,
      }
      if (editingBanner) {
        await fetch('/api/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBanner.id, ...payload }),
        })
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setEditingBanner(null)
      setShowBannerForm(false)
      setBannerForm({ type: 'ganador', title: 'GANADOR TPK', subtitle: '', imageUrl: '', linkUrl: '', isActive: true })
      fetchBanners()
    } catch (err) {
      console.error('Error saving banner:', err)
    } finally {
      setSavingBanner(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    try {
      await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      fetchBanners()
    } catch (err) {
      console.error('Error deleting banner:', err)
    }
  }

  const handleToggleBanner = async (banner: TpkBannerData) => {
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
      })
      fetchBanners()
    } catch (err) {
      console.error('Error toggling banner:', err)
    }
  }

  // Prediction CRUD
  const handleSavePrediction = async () => {
    if (!predictionForm.homeTeam || !predictionForm.awayTeam || !predictionForm.matchDate) return
    setSavingPrediction(true)
    try {
      const payload = {
        homeTeam: predictionForm.homeTeam,
        awayTeam: predictionForm.awayTeam,
        homeScore: predictionForm.homeScore !== '' ? parseInt(predictionForm.homeScore) : null,
        awayScore: predictionForm.awayScore !== '' ? parseInt(predictionForm.awayScore) : null,
        matchDate: predictionForm.matchDate,
        venue: predictionForm.venue || null,
        status: predictionForm.status,
        isActive: predictionForm.isActive,
        order: predictionForm.order,
      }
      if (editingPrediction) {
        await fetch('/api/predictions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPrediction.id, ...payload }),
        })
      } else {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setEditingPrediction(null)
      setShowPredictionForm(false)
      setPredictionForm({ homeTeam: 'millonarios', awayTeam: 'atletico-nacional', homeScore: '', awayScore: '', matchDate: '', venue: '', status: 'upcoming', isActive: true, order: 0 })
      fetchPredictions()
    } catch (err) {
      console.error('Error saving prediction:', err)
    } finally {
      setSavingPrediction(false)
    }
  }

  const handleDeletePrediction = async (id: string) => {
    try {
      await fetch(`/api/predictions?id=${id}`, { method: 'DELETE' })
      fetchPredictions()
    } catch (err) {
      console.error('Error deleting prediction:', err)
    }
  }

  const handleTogglePrediction = async (prediction: MatchPredictionData) => {
    try {
      await fetch('/api/predictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prediction.id, isActive: !prediction.isActive }),
      })
      fetchPredictions()
    } catch (err) {
      console.error('Error toggling prediction:', err)
    }
  }

  // Loteria save handler
  const handleSaveLoteria = async () => {
    setSavingLoteria(true)
    try {
      if (loteriaConfig) {
        await fetch('/api/loteria', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: loteriaConfig.id, ...loteriaForm }),
        })
      } else {
        await fetch('/api/loteria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loteriaForm),
        })
      }
      fetchLoteriaConfig()
    } catch (err) {
      console.error('Error saving loteria config:', err)
    } finally {
      setSavingLoteria(false)
    }
  }

  // Ruleta save handler
  const handleSaveRuleta = async () => {
    setSavingRuleta(true)
    try {
      if (ruletaConfig) {
        await fetch('/api/ruleta', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ruletaConfig.id, ...ruletaForm }),
        })
      } else {
        await fetch('/api/ruleta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruletaForm),
        })
      }
      fetchRuletaConfig()
    } catch (err) {
      console.error('Error saving ruleta config:', err)
    } finally {
      setSavingRuleta(false)
    }
  }

  // Circuito save handler
  const handleSaveCircuito = async () => {
    setSavingCircuito(true)
    try {
      if (circuitoConfig) {
        await fetch('/api/circuito', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: circuitoConfig.id, ...circuitoForm }),
        })
      } else {
        await fetch('/api/circuito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(circuitoForm),
        })
      }
      fetchCircuitoConfig()
    } catch (err) {
      console.error('Error saving circuito config:', err)
    } finally {
      setSavingCircuito(false)
    }
  }

  // Parques save handler
  const handleSaveParques = async () => {
    setSavingParques(true)
    try {
      if (parquesConfig) {
        await fetch('/api/parques', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parquesConfig.id, ...parquesForm }),
        })
      } else {
        await fetch('/api/parques', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parquesForm),
        })
      }
      fetchParquesConfig()
    } catch (err) {
      console.error('Error saving parqués config:', err)
    } finally {
      setSavingParques(false)
    }
  }

  const handleSaveRompecabezas = async () => {
    setSavingRompecabezas(true)
    try {
      if (rompecabezasConfig) {
        await fetch('/api/rompecabezas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: rompecabezasConfig.id, ...rompecabezasForm }),
        })
      } else {
        await fetch('/api/rompecabezas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rompecabezasForm),
        })
      }
      fetchRompecabezasConfig()
    } catch (err) {
      console.error('Error saving rompecabezas config:', err)
    } finally {
      setSavingRompecabezas(false)
    }
  }

  const handleSavePenales = async () => {
    setSavingPenales(true)
    try {
      if (penalesConfig) {
        await fetch('/api/penales', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: penalesConfig.id, ...penalesForm }),
        })
      } else {
        await fetch('/api/penales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(penalesForm),
        })
      }
      fetchPenalesConfig()
    } catch (err) {
      console.error('Error saving penales config:', err)
    } finally {
      setSavingPenales(false)
    }
  }

  const handleSaveCartaMayor = async () => {
    setSavingCartaMayor(true)
    try {
      if (cartaMayorConfig) {
        await fetch('/api/carta-mayor', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cartaMayorConfig.id, ...cartaMayorForm }),
        })
      } else {
        await fetch('/api/carta-mayor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartaMayorForm),
        })
      }
      fetchCartaMayorConfig()
    } catch (err) {
      console.error('Error saving carta mayor config:', err)
    } finally {
      setSavingCartaMayor(false)
    }
  }

  const handleSaveDiana = async () => {
    setSavingDiana(true)
    try {
      if (dianaConfig) {
        await fetch('/api/diana', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dianaConfig.id, ...dianaForm }),
        })
      } else {
        await fetch('/api/diana', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dianaForm),
        })
      }
      fetchDianaConfig()
    } catch (err) {
      console.error('Error saving diana config:', err)
    } finally {
      setSavingDiana(false)
    }
  }

  const handleSaveClasificacion = async () => {
    setSavingClasificacion(true)
    try {
      if (clasificacionConfig) {
        await fetch('/api/clasificacion', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: clasificacionConfig.id, ...clasificacionForm }),
        })
      } else {
        await fetch('/api/clasificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clasificacionForm),
        })
      }
      fetchClasificacionConfig()
    } catch (err) {
      console.error('Error saving clasificacion config:', err)
    } finally {
      setSavingClasificacion(false)
    }
  }

  const handleSaveNumeroCamiseta = async () => {
    setSavingNumeroCamiseta(true)
    try {
      if (numeroCamisetaConfig) {
        await fetch('/api/numero-camiseta', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: numeroCamisetaConfig.id, ...numeroCamisetaForm }),
        })
      } else {
        await fetch('/api/numero-camiseta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(numeroCamisetaForm),
        })
      }
      fetchNumeroCamisetaConfig()
    } catch (err) {
      console.error('Error saving numero camiseta config:', err)
    } finally {
      setSavingNumeroCamiseta(false)
    }
  }

  const handleSaveMineria = async () => {
    setSavingMineria(true)
    try {
      if (mineriaConfig) {
        await fetch('/api/mineria', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: mineriaConfig.id, ...mineriaForm }),
        })
      } else {
        await fetch('/api/mineria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mineriaForm),
        })
      }
      fetchMineriaConfig()
    } catch (err) {
      console.error('Error saving mineria config:', err)
    } finally {
      setSavingMineria(false)
    }
  }

  const handleSaveApuesta = async () => {
    setSavingApuesta(true)
    try {
      if (apuestaConfig) {
        await fetch('/api/apuesta', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: apuestaConfig.id, ...apuestaForm }),
        })
      } else {
        await fetch('/api/apuesta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apuestaForm),
        })
      }
      fetchApuestaConfig()
    } catch (err) {
      console.error('Error saving apuesta config:', err)
    } finally {
      setSavingApuesta(false)
    }
  }

  const handleSaveSopa = async () => {
    setSavingSopa(true)
    try {
      if (sopaConfig) {
        await fetch('/api/sopa', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sopaConfig.id, ...sopaForm }),
        })
      } else {
        await fetch('/api/sopa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sopaForm),
        })
      }
      fetchSopaConfig()
    } catch (err) {
      console.error('Error saving sopa config:', err)
    } finally {
      setSavingSopa(false)
    }
  }

  const handleSaveAudio = async () => {
    setSavingAudio(true)
    try {
      if (audioConfig) {
        await fetch('/api/audio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: audioConfig.id, ...audioForm }),
        })
      } else {
        await fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(audioForm),
        })
      }
      fetchAudioConfig()
    } catch (err) {
      console.error('Error saving audio config:', err)
    } finally {
      setSavingAudio(false)
    }
  }

  // Delete parques room
  const handleDeleteParquesRoom = async (roomId: string) => {
    try {
      await fetch(`/api/parques-room?roomId=${roomId}`, { method: 'DELETE' })
      fetchParquesRooms()
    } catch { /* ignore */ }
  }

  // Stats calculations
  const totalParticipants = participants.length
  const totalPoints = participants.reduce((sum, p) => sum + p.totalPoints, 0)
  const activeGames = games.filter(g => g.isActive).length
  const totalGames = games.length

  // Active banners count for badge
  const activeBanners = banners.filter(b => b.isActive).length

  // Sidebar sections configuration
  const sidebarSections: SidebarSection[] = [
    {
      id: 'contenido',
      label: 'Contenido',
      icon: '🎮',
      color: '#a855f7',
      items: [
        { id: 'games', label: 'Juegos', icon: '⚽', color: '#a855f7', count: games.length },
        { id: 'loteria', label: 'Lotería', icon: '🃏', color: '#ff00ff' },
        { id: 'ruleta', label: 'Ruleta', icon: '🎰', color: '#ffc800' },
        { id: 'circuito', label: 'Circuito', icon: '🎮', color: '#00ff80' },
        { id: 'parques', label: 'Parqués', icon: '🎲', color: '#facc15' },
        { id: 'rompecabezas', label: 'Rompecabezas', icon: '🧩', color: '#00ffc8' },
        { id: 'penales', label: 'Penales', icon: '⚽', color: '#ff4444' },
        { id: 'carta-mayor', label: 'Carta Mayor', icon: '🃏', color: '#eab308' },
        { id: 'diana', label: 'Diana', icon: '🎯', color: '#ef4444' },
        { id: 'clasificacion', label: 'Clasificación', icon: '🏆', color: '#06b6d4' },
        { id: 'numero-camiseta', label: 'N° Camiseta', icon: '🔢', color: '#8b5cf6' },
        { id: 'mineria', label: 'Minería', icon: '💣', color: '#22c55e' },
        { id: 'apuesta', label: 'Apuesta', icon: '📊', color: '#f97316' },
        { id: 'sopa', label: 'Sopa', icon: '🔤', color: '#14b8a6' },
        { id: 'audio', label: 'Audio', icon: '🎵', color: '#a855f7' },
        { id: 'predictions', label: 'Predicciones', icon: '⚽', color: '#00ff80', count: predictions.length },
        { id: 'popup', label: 'Popup', icon: '💬', color: '#eab308', count: popups.length },
      ],
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: '🖼️',
      color: '#00ffff',
      items: [
        { id: 'banners', label: 'Gestionar Banners', icon: '🖼️', color: '#00ffff', count: banners.length },
      ],
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: '👥',
      color: '#f97316',
      items: [
        { id: 'participants', label: 'Participantes', icon: '👤', color: '#f97316', count: participants.length },
      ],
    },
    {
      id: 'datos',
      label: 'Datos',
      icon: '📊',
      color: '#22c55e',
      items: [
        { id: 'stats', label: 'Estadísticas', icon: '📈', color: '#22c55e' },
      ],
    },
  ]

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false) // Close mobile sidebar on selection
  }

  // Floating admin button
  if (!showPanel) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(249, 115, 22, 0.3)',
          }}
          title="Panel de Administración"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    )
  }

  // Login screen (not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), 0 0 80px rgba(249, 115, 22, 0.1)',
          }}
        >
          {/* Header */}
          <div className="p-6 text-center border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.15)' }}>
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #f97316)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2
              className="text-xl font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #d8b4fe, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TPK PLAY Admin
            </h2>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#d8b4fe' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@tpkplay.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#fdba74' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }}
              />
            </div>

            {authError && (
              <div
                className="p-3 rounded-xl text-center text-xs font-bold"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
                color: 'white',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(249, 115, 22, 0.2)',
              }}
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPanel(false)
                setAuthError('')
              }}
              className="w-full py-2 text-xs uppercase tracking-wider cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin panel (authenticated)
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <div
          className="w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.2), 0 0 60px rgba(249, 115, 22, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #f97316)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold" style={{ color: '#d8b4fe', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}>
                  TPK PLAY Admin
                </h2>
                <p className="text-[0.65rem] md:text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-[0.65rem] md:text-xs font-bold cursor-pointer transition-all"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                Cerrar Sesión
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Body: Sidebar + Content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="absolute inset-0 z-20 md:hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Navigation */}
            <div
              className={`
                absolute md:relative z-30 md:z-auto
                h-full w-56 flex-shrink-0 flex flex-col overflow-y-auto
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              `}
              style={{
                background: 'linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(26,10,46,0.98) 50%, rgba(10,10,10,0.98) 100%)',
                borderRight: '1px solid rgba(168, 85, 247, 0.15)',
                scrollbarColor: 'rgba(168,85,247,0.3) transparent',
                scrollbarWidth: 'thin',
              }}
            >
              <div className="p-3 space-y-1">
                {/* Dashboard home button - always visible at top */}
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all mb-1"
                  style={{
                    color: activeTab === 'dashboard' ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                    background: activeTab === 'dashboard' ? 'rgba(251,191,36,0.12)' : 'transparent',
                    borderLeft: activeTab === 'dashboard' ? '3px solid #fbbf24' : '3px solid transparent',
                    boxShadow: activeTab === 'dashboard' ? '0 0 12px rgba(251,191,36,0.08)' : 'none',
                  }}
                >
                  <span className="text-sm">🏠</span>
                  <span className="flex-1 text-left">Dashboard</span>
                </button>

                {/* Visual separator */}
                <div className="my-2 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.3), transparent)' }} />

                {sidebarSections.map((section, sectionIndex) => {
                  const isExpanded = expandedSections[section.id]
                  return (
                    <div key={section.id}>
                      {/* Section header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all hover:bg-white/5"
                        style={{ color: section.color }}
                      >
                        <span className="text-sm">{section.icon}</span>
                        <span className="flex-1 text-left">{section.label}</span>
                        {/* Banners badge - always show count */}
                        {section.id === 'banners' && banners.length > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[0.55rem] font-black min-w-[18px] text-center"
                            style={{
                              background: 'rgba(0,255,255,0.2)',
                              color: '#00ffff',
                              border: '1px solid rgba(0,255,255,0.4)',
                              boxShadow: '0 0 6px rgba(0,255,255,0.15)',
                            }}
                          >
                            {banners.length}
                          </span>
                        )}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={section.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      {/* Collapsible items */}
                      <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          maxHeight: isExpanded ? `${section.items.length * 44}px` : '0px',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        {section.items.map((item) => {
                          const isActive = activeTab === item.id
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleTabChange(item.id)}
                              className="w-full flex items-center gap-2.5 pl-5 pr-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                              style={{
                                color: isActive ? item.color : 'rgba(255,255,255,0.45)',
                                background: isActive ? `${item.color}12` : 'transparent',
                                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                                boxShadow: isActive ? `inset 0 0 12px ${item.color}08` : 'none',
                              }}
                            >
                              <span className="text-sm">{item.icon}</span>
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.count !== undefined && item.count > 0 && (
                                <span
                                  className="px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold min-w-[20px] text-center"
                                  style={{
                                    background: isActive ? `${item.color}25` : 'rgba(255,255,255,0.08)',
                                    color: isActive ? item.color : 'rgba(255,255,255,0.4)',
                                    border: `1px solid ${isActive ? `${item.color}40` : 'rgba(255,255,255,0.1)'}`,
                                  }}
                                >
                                  {item.count}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Visual separator between sections */}
                      {sectionIndex < sidebarSections.length - 1 && (
                        <div className="my-2 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Sidebar footer info */}
              <div className="mt-auto p-3 border-t" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="text-sm font-black" style={{ color: '#d8b4fe' }}>{activeGames}/{totalGames}</div>
                    <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Juegos</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,255,255,0.06)' }}>
                    <div className="text-sm font-black" style={{ color: '#00ffff' }}>{activeBanners}</div>
                    <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Banners</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(249,115,22,0.06)' }}>
                    <div className="text-sm font-black" style={{ color: '#fdba74' }}>{totalParticipants}</div>
                    <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Participantes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4" style={{ scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
              {/* Breadcrumb / Section Title */}
              {!loading && (
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🏠</span>
                  <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</span>
                  <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: activeTab === 'dashboard' ? '#fbbf24'
                        : activeTab === 'games' ? '#a855f7'
                        : activeTab === 'loteria' ? '#ff00ff'
                        : activeTab === 'ruleta' ? '#ffc800'
                        : activeTab === 'circuito' ? '#00ff80'
                        : activeTab === 'parques' ? '#facc15'
                        : activeTab === 'rompecabezas' ? '#00ffc8'
                        : activeTab === 'penales' ? '#ff4444'
                        : activeTab === 'carta-mayor' ? '#eab308'
                        : activeTab === 'diana' ? '#ef4444'
                        : activeTab === 'clasificacion' ? '#06b6d4'
                        : activeTab === 'numero-camiseta' ? '#8b5cf6'
                        : activeTab === 'mineria' ? '#22c55e'
                        : activeTab === 'apuesta' ? '#f97316'
                        : activeTab === 'sopa' ? '#14b8a6'
                        : activeTab === 'audio' ? '#a855f7'
                        : activeTab === 'predictions' ? '#00ff80'
                        : activeTab === 'banners' ? '#00ffff'
                        : activeTab === 'popup' ? '#eab308'
                        : activeTab === 'participants' ? '#f97316'
                        : '#22c55e',
                    }}
                  >
                    {activeTab === 'dashboard' ? 'Dashboard'
                      : activeTab === 'games' ? 'Juegos'
                      : activeTab === 'loteria' ? 'Lotería de Equipos'
                      : activeTab === 'ruleta' ? 'Ruleta de Equipos'
                      : activeTab === 'circuito' ? 'Circuito Futbolero'
                      : activeTab === 'parques' ? 'Parqués Futbolero'
                      : activeTab === 'rompecabezas' ? 'Rompecabezas de Escudos'
                      : activeTab === 'penales' ? 'Penales Futboleros'
                      : activeTab === 'carta-mayor' ? 'Carta Mayor'
                      : activeTab === 'diana' ? 'Diana de Escudos'
                      : activeTab === 'clasificacion' ? 'Clasificación Histórica'
                      : activeTab === 'numero-camiseta' ? 'Número Camiseta'
                      : activeTab === 'mineria' ? 'Minería de Escudos'
                      : activeTab === 'apuesta' ? 'Apuesta Futbolera'
                      : activeTab === 'sopa' ? 'Sopa de Escudos'
                      : activeTab === 'audio' ? 'Reproductor de Audio'
                      : activeTab === 'predictions' ? 'Predicciones'
                      : activeTab === 'banners' ? 'Banners'
                      : activeTab === 'popup' ? 'Popup'
                      : activeTab === 'participants' ? 'Participantes'
                      : 'Estadísticas'}
                  </span>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
                </div>
              ) : activeTab === 'dashboard' ? (
                /* ========== DASHBOARD TAB ========== */
                <div className="space-y-4">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                      className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
                      onClick={() => handleTabChange('games')}
                    >
                      <div className="text-2xl font-black" style={{ color: '#d8b4fe' }}>{activeGames}/{totalGames}</div>
                      <div className="text-[0.6rem] uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Juegos Activos</div>
                      <div className="text-lg mt-1">⚽</div>
                    </div>
                    <div
                      className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
                      onClick={() => handleTabChange('participants')}
                    >
                      <div className="text-2xl font-black" style={{ color: '#fdba74' }}>{totalParticipants}</div>
                      <div className="text-[0.6rem] uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Participantes</div>
                      <div className="text-lg mt-1">👤</div>
                    </div>
                    <div
                      className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)' }}
                      onClick={() => handleTabChange('banners')}
                    >
                      <div className="text-2xl font-black" style={{ color: '#00ffff' }}>{activeBanners}/{banners.length}</div>
                      <div className="text-[0.6rem] uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Banners</div>
                      <div className="text-lg mt-1">🖼️</div>
                    </div>
                    <div
                      className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                      onClick={() => handleTabChange('stats')}
                    >
                      <div className="text-2xl font-black" style={{ color: '#4ade80' }}>{totalPoints.toLocaleString()}</div>
                      <div className="text-[0.6rem] uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos Total</div>
                      <div className="text-lg mt-1">🏆</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleTabChange('games')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', color: '#d8b4fe' }}
                      >
                        <span className="block text-lg mb-1">⚽</span>
                        Gestionar Juegos
                      </button>
                      <button
                        onClick={() => handleTabChange('banners')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.15)', color: '#00ffff' }}
                      >
                        <span className="block text-lg mb-1">🖼️</span>
                        Editar Banners
                      </button>
                      <button
                        onClick={() => handleTabChange('popup')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#eab308' }}
                      >
                        <span className="block text-lg mb-1">💬</span>
                        Configurar Popup
                      </button>
                      <button
                        onClick={() => handleTabChange('loteria')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(255,0,255,0.06)', border: '1px solid rgba(255,0,255,0.15)', color: '#ff00ff' }}
                      >
                        <span className="block text-lg mb-1">🃏</span>
                        Lotería de Equipos
                      </button>
                      <button
                        onClick={() => handleTabChange('ruleta')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.15)', color: '#ffc800' }}
                      >
                        <span className="block text-lg mb-1">🎰</span>
                        Ruleta de Equipos
                      </button>
                      <button
                        onClick={() => handleTabChange('participants')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', color: '#f97316' }}
                      >
                        <span className="block text-lg mb-1">👤</span>
                        Ver Participantes
                      </button>
                      <button
                        onClick={() => handleTabChange('stats')}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#22c55e' }}
                      >
                        <span className="block text-lg mb-1">📈</span>
                        Estadísticas
                      </button>
                      <button
                        onClick={sendAllToWhatsApp}
                        className="p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80' }}
                      >
                        <span className="block text-lg mb-1">📱</span>
                        Enviar por WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Recent Games */}
                  {games.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Juegos Recientes</h3>
                      <div className="space-y-2">
                        {games.sort((a, b) => a.order - b.order).slice(0, 3).map((game) => {
                          const gameType = GAME_TYPES[game.type] || GAME_TYPES['personalizado']
                          return (
                            <div
                              key={game.id}
                              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5"
                              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${game.isActive ? `${gameType.color}20` : 'rgba(255,255,255,0.05)'}` }}
                              onClick={() => handleTabChange('games')}
                            >
                              <span className="text-lg">{gameType.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate" style={{ color: game.isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{game.name}</div>
                                <div className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{gameType.label}</div>
                              </div>
                              <div
                                className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold"
                                style={{
                                  background: game.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                  color: game.isActive ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                }}
                              >
                                {game.isActive ? 'Activo' : 'Inactivo'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'games' ? (
                /* ========== GAMES TAB ========== */
                <div className="space-y-3">
                  {/* Error message */}
                  {fetchError && (
                    <div
                      className="p-3 rounded-xl flex items-center justify-between"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: '#ef4444' }}>{fetchError}</span>
                      <button
                        onClick={() => { fetchGames(); fetchParticipants(); }}
                        className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                  {/* Add game button */}
                  <button
                    onClick={handleOpenAddGame}
                    className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                    style={{
                      border: '1px dashed rgba(168, 85, 247, 0.4)',
                      color: '#d8b4fe',
                      background: 'rgba(168, 85, 247, 0.05)',
                    }}
                  >
                    + Agregar Juego
                  </button>

                  {games.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No hay juegos registrados. Agrega el primero.
                    </div>
                  ) : (
                    games
                      .sort((a, b) => a.order - b.order)
                      .map((game) => {
                        const gameType = GAME_TYPES[game.type] || GAME_TYPES['personalizado']
                        return (
                          <div
                            key={game.id}
                            className="rounded-xl transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid ${game.isActive ? `${gameType.color}30` : 'rgba(255,255,255,0.08)'}`,
                              boxShadow: game.isActive ? `0 0 10px ${gameType.color}08` : 'none',
                            }}
                          >
                            {/* Game card top row */}
                            <div className="p-4 flex items-start gap-3">
                              {/* Drag handle + order */}
                              <div className="flex flex-col items-center gap-0.5 pt-1">
                                <button
                                  onClick={() => handleMoveGame(game, 'up')}
                                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                                  style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
                                  title="Mover arriba"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                                </button>
                                <span className="text-[0.6rem] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>#{game.order}</span>
                                <button
                                  onClick={() => handleMoveGame(game, 'down')}
                                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                                  style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
                                  title="Mover abajo"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                </button>
                              </div>

                              {/* Game info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span
                                    className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"
                                    style={{ background: `${gameType.color}20`, color: gameType.color, border: `1px solid ${gameType.color}40` }}
                                  >
                                    <span>{gameType.icon}</span>
                                    {gameType.label}
                                  </span>
                                  <span
                                    className="px-2 py-0.5 rounded text-xs font-bold"
                                    style={{
                                      background: game.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                      color: game.isActive ? '#4ade80' : '#ef4444',
                                      border: `1px solid ${game.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    }}
                                  >
                                    {game.isActive ? '● Activo' : '○ Inactivo'}
                                  </span>
                                </div>
                                <div className="font-bold text-sm" style={{ color: game.isActive ? '#e9d5ff' : 'rgba(255,255,255,0.4)' }}>
                                  {game.name}
                                </div>
                                {game.description && (
                                  <div className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{game.description}</div>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs" style={{ color: `${gameType.color}80` }}>
                                    👥 {game._count?.participants || 0} participantes
                                  </span>
                                  {game.type && (
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                      {gameType.description}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setPreviewGame(game)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                  style={{
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    color: '#d8b4fe',
                                    border: '1px solid rgba(168, 85, 247, 0.2)',
                                  }}
                                  title="Vista Previa"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                                <button
                                  onClick={() => handleOpenEditGame(game)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                  style={{
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    color: '#fdba74',
                                    border: '1px solid rgba(249, 115, 22, 0.2)',
                                  }}
                                  title="Editar"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button
                                  onClick={() => handleToggleGame(game)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                  style={{
                                    background: game.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: game.isActive ? '#4ade80' : '#ef4444',
                                    border: `1px solid ${game.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                  }}
                                  title={game.isActive ? 'Desactivar' : 'Activar'}
                                >
                                  {game.isActive ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                  )}
                                </button>
                                {deleteConfirm === game.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteGame(game.id)}
                                      className="px-2 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                      style={{ background: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }}
                                    >
                                      Sí
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2 py-1 rounded-lg text-xs cursor-pointer"
                                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(game.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      color: '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                    }}
                                    title="Eliminar"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              ) : activeTab === 'participants' ? (
                /* ========== PARTICIPANTS TAB ========== */
                <div className="space-y-3">
                  {participants.length > 0 && (
                    <button
                      onClick={sendAllToWhatsApp}
                      className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.358A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.136 0-4.144-.62-5.845-1.688l-.414-.258-2.965.858.87-2.89-.276-.438A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      Enviar Todo a WhatsApp TPK
                    </button>
                  )}

                  {participants.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No hay participantes registrados aún.
                    </div>
                  ) : (
                    participants.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(249, 115, 22, 0.2)',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-sm" style={{ color: '#fed7aa' }}>{p.name}</div>
                            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.email}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.phone}</div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                              >
                                {p.code}
                              </span>
                              {p.teamSlug && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"
                                  style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15', border: '1px solid rgba(250,204,21,0.3)' }}
                                >
                                  <img
                                    src={`/images/teams/${p.teamSlug}${p.teamSlug === 'internacional-de-bogota' ? '.png' : '.svg'}`}
                                    alt={p.teamSlug}
                                    className="w-3 h-3 object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                  />
                                  {(() => {
                                    const tm: Record<string, string> = {
                                      'aguilas-doradas': 'Águilas Doradas', 'alianza-valledupar': 'Alianza Valledupar',
                                      'america-de-cali': 'América de Cali', 'atletico-bucaramanga': 'Atl. Bucaramanga',
                                      'atletico-junior': 'Atl. Junior', 'atletico-nacional': 'Atl. Nacional',
                                      'boyaca-chico': 'Boyacá Chicó', 'cucuta-deportivo': 'Cúcuta Deportivo',
                                      'deportes-tolima': 'Deportes Tolima', 'deportivo-cali': 'Deportivo Cali',
                                      'deportivo-pasto': 'Deportivo Pasto', 'deportivo-pereira': 'Deportivo Pereira',
                                      'fortaleza-ceif': 'Fortaleza CEIF', 'independiente-medellin': 'Ind. Medellín',
                                      'independiente-santa-fe': 'Ind. Santa Fe', 'internacional-de-bogota': 'Internacional',
                                      'jaguares-de-cordoba': 'Jaguares', 'llaneros': 'Llaneros',
                                      'millonarios': 'Millonarios', 'once-caldas': 'Once Caldas',
                                    }
                                    return tm[p.teamSlug] || p.teamSlug
                                  })()}
                                </span>
                              )}
                              {p.game && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' }}
                                >
                                  {p.game.name}
                                </span>
                              )}
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
                              >
                                ⭐ {p.totalPoints} pts
                              </span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <span className="text-xs" style={{ color: p.followedFb ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>FB</span>
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                              <span className="text-xs" style={{ color: p.followedIg ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>IG</span>
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                              <span className="text-xs" style={{ color: p.followedWa ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>WA</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => sendToWhatsApp(p)}
                              className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="px-3 py-1 rounded-lg text-xs cursor-pointer"
                              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'popup' ? (
                /* ========== POPUP TAB ========== */
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setEditingPopup(null)
                      setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', imageUrl: '', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                    style={{
                      border: '1px dashed rgba(234, 179, 8, 0.4)',
                      color: '#fde047',
                      background: 'rgba(234, 179, 8, 0.05)',
                    }}
                  >
                    + Agregar Popup Circular
                  </button>

                  {(editingPopup || popupForm.text) && (
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{
                        background: 'rgba(234, 179, 8, 0.05)',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: '#fde047' }}>
                          {editingPopup ? 'Editar Popup' : 'Nuevo Popup'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingPopup(null)
                            setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', imageUrl: '', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
                          }}
                          className="text-xs cursor-pointer"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>Texto</label>
                          <input
                            type="text"
                            value={popupForm.text}
                            onChange={(e) => setPopupForm({ ...popupForm, text: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234,179,8,0.3)' }}
                            placeholder="TPK NUEVO"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>URL de destino</label>
                          <input
                            type="url"
                            value={popupForm.linkUrl}
                            onChange={(e) => setPopupForm({ ...popupForm, linkUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234,179,8,0.3)' }}
                            placeholder="https://ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>URL de Imagen</label>
                          <input
                            type="url"
                            value={popupForm.imageUrl}
                            onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234,179,8,0.3)' }}
                            placeholder="https://ejemplo.com/producto.jpg"
                          />
                          {popupForm.imageUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={popupForm.imageUrl}
                                alt="Preview"
                                className="w-8 h-8 rounded-full object-cover"
                                style={{ border: `1px solid ${popupForm.color}` }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Vista previa</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>Color</label>
                          <div className="flex gap-2 flex-wrap">
                            {['#f97316', '#a855f7', '#eab308', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4'].map((c) => (
                              <button
                                key={c}
                                onClick={() => setPopupForm({ ...popupForm, color: c })}
                                className="w-7 h-7 rounded-full cursor-pointer transition-all"
                                style={{
                                  background: c,
                                  border: popupForm.color === c ? '2px solid white' : '2px solid transparent',
                                  boxShadow: popupForm.color === c ? `0 0 10px ${c}80` : 'none',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>Posicion</label>
                          <select
                            value={popupForm.position}
                            onChange={(e) => setPopupForm({ ...popupForm, position: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234,179,8,0.3)' }}
                          >
                            <option value="bottom-left">Abajo Izquierda</option>
                            <option value="bottom-right">Abajo Derecha</option>
                            <option value="top-left">Arriba Izquierda</option>
                            <option value="top-right">Arriba Derecha</option>
                            <option value="center-left">Centro Izquierda</option>
                            <option value="center-right">Centro Derecha</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fde047' }}>
                            Tamano: {popupForm.size}px
                          </label>
                          <input
                            type="range"
                            min="80"
                            max="200"
                            step="10"
                            value={popupForm.size}
                            onChange={(e) => setPopupForm({ ...popupForm, size: parseInt(e.target.value) })}
                            className="w-full"
                            style={{ accentColor: popupForm.color }}
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-3">
                          <button
                            onClick={() => setPopupForm({ ...popupForm, isActive: !popupForm.isActive })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                            style={{
                              background: popupForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: popupForm.isActive ? '#4ade80' : '#ef4444',
                              border: `1px solid ${popupForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                          >
                            {popupForm.isActive ? '● Activo' : '○ Inactivo'}
                          </button>
                        </div>
                      </div>

                      {/* Mini Preview */}
                      <div className="flex justify-center py-4">
                        <div className="relative" style={{ width: Math.min(popupForm.size + 40, 140), height: Math.min(popupForm.size + 40, 140) }}>
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                          >
                            <span className="text-[0.5rem] font-black uppercase tracking-wider absolute" style={{ color: popupForm.color, textShadow: `0 0 6px ${popupForm.color}80`, top: 2, left: '50%', transform: 'translateX(-50%)' }}>
                              {popupForm.text}
                            </span>
                            <span className="text-[0.5rem] font-black uppercase tracking-wider absolute" style={{ color: popupForm.color, textShadow: `0 0 6px ${popupForm.color}80`, bottom: 2, left: '50%', transform: 'translateX(-50%)' }}>
                              {popupForm.text}
                            </span>
                          </div>
                          <div
                            className="absolute rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              width: Math.min(popupForm.size, 100),
                              height: Math.min(popupForm.size, 100),
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              background: `radial-gradient(circle at 35% 35%, ${popupForm.color}40, ${popupForm.color}15 50%, rgba(0,0,0,0.9) 80%)`,
                              border: `2px solid ${popupForm.color}`,
                              boxShadow: `0 0 15px ${popupForm.color}60, 0 0 30px ${popupForm.color}30`,
                            }}
                          >
                            {popupForm.imageUrl ? (
                              <img
                                src={popupForm.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            ) : (
                              <span className="text-xs font-black uppercase" style={{ color: popupForm.color, textShadow: `0 0 6px ${popupForm.color}80` }}>
                                TPK
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSavePopup}
                        disabled={savingPopup}
                        className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                        style={{
                          background: `linear-gradient(135deg, ${popupForm.color}, ${popupForm.color}cc)`,
                          color: 'white',
                          boxShadow: `0 0 15px ${popupForm.color}40`,
                        }}
                      >
                        {savingPopup ? 'Guardando...' : editingPopup ? 'Actualizar Popup' : 'Crear Popup'}
                      </button>
                    </div>
                  )}

                  {popups.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No hay popups creados. Agrega el primero.
                    </div>
                  ) : (
                    popups.map((popup) => (
                      <div
                        key={popup.id}
                        className="p-4 rounded-xl flex items-center gap-3"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${popup.isActive ? `${popup.color}30` : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{
                            background: `radial-gradient(circle, ${popup.color}40, ${popup.color}10)`,
                            border: `1px solid ${popup.color}`,
                            boxShadow: `0 0 8px ${popup.color}40`,
                          }}
                        >
                          {popup.imageUrl ? (
                            <img
                              src={popup.imageUrl}
                              alt={popup.text}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <span className="text-[0.5rem] font-black uppercase" style={{ color: popup.color }}>
                              {popup.text.substring(0, 3)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm" style={{ color: popup.isActive ? '#fef3c7' : 'rgba(255,255,255,0.4)' }}>
                            {popup.text}
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {popup.linkUrl} | {popup.size}px | {popup.position}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {popup.imageUrl && (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
                              >
                                Con Imagen
                              </span>
                            )}
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background: `${popup.color}20`, color: popup.color, border: `1px solid ${popup.color}40` }}
                            >
                              {popup.color}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{
                                background: popup.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                color: popup.isActive ? '#4ade80' : '#ef4444',
                                border: `1px solid ${popup.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                              }}
                            >
                              {popup.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePopup(popup)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{
                              background: popup.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: popup.isActive ? '#4ade80' : '#ef4444',
                              border: `1px solid ${popup.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            }}
                            title={popup.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {popup.isActive ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingPopup(popup)
                              setPopupForm({
                                text: popup.text,
                                linkUrl: popup.linkUrl,
                                imageUrl: popup.imageUrl || '',
                                isActive: popup.isActive,
                                color: popup.color,
                                size: popup.size,
                                position: popup.position,
                              })
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{ background: 'rgba(249,115,22,0.1)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.2)' }}
                            title="Editar"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => handleDeletePopup(popup.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                            title="Eliminar"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'banners' ? (
                /* ========== BANNERS TAB ========== */
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(0, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 255, 255, 0.2)',
                    }}
                  >
                    <span style={{ color: '#00ffff', fontSize: '1.2rem' }}>💡</span>
                    <span className="text-xs" style={{ color: 'rgba(0,255,255,0.7)' }}>
                      Crea los banners <b style={{ color: '#00ffff' }}>GANADOR TPK</b> y <b style={{ color: '#ff00ff' }}>PREMIO TPK</b> para mostrar en la página principal. Sube la foto del ganador o el premio.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingBanner(null)
                      setBannerForm({ type: 'ganador', title: 'GANADOR TPK', subtitle: '', imageUrl: '', linkUrl: '', isActive: true })
                      setShowBannerForm(true)
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                    style={{
                      border: '1px dashed rgba(0, 255, 255, 0.4)',
                      color: '#00ffff',
                      background: 'rgba(0, 255, 255, 0.05)',
                    }}
                  >
                    + Agregar Banner
                  </button>

                  {showBannerForm && (
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{
                        background: `rgba(${bannerForm.type === 'ganador' ? '0,255,255' : '255,0,255'}, 0.05)`,
                        border: `1px solid rgba(${bannerForm.type === 'ganador' ? '0,255,255' : '255,0,255'}, 0.2)`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: bannerForm.type === 'ganador' ? '#00ffff' : '#ff00ff' }}>
                          {bannerForm.type === 'ganador' ? '🏆 GANADOR TPK' : '🎁 PREMIO TPK'}
                        </span>
                        <button
                          onClick={() => { setEditingBanner(null); setShowBannerForm(false) }}
                          className="text-xs cursor-pointer"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ffff' }}>Tipo de Banner</label>
                          <select
                            value={bannerForm.type}
                            onChange={(e) => {
                              const t = e.target.value
                              setBannerForm({
                                ...bannerForm,
                                type: t,
                                title: t === 'ganador' ? 'GANADOR TPK' : 'PREMIO TPK',
                              })
                            }}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                          >
                            <option value="ganador">🏆 GANADOR TPK</option>
                            <option value="premio">🎁 PREMIO TPK</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ffff' }}>Título</label>
                          <input
                            type="text"
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                            placeholder="GANADOR TPK"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ffff' }}>Subtítulo</label>
                          <input
                            type="text"
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                            placeholder="Campeón Semanal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ffff' }}>URL de Imagen</label>
                          <input
                            type="url"
                            value={bannerForm.imageUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                            placeholder="https://ejemplo.com/foto.jpg"
                          />
                          {bannerForm.imageUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={bannerForm.imageUrl}
                                alt="Preview"
                                className="w-10 h-10 rounded-lg object-cover"
                                style={{ border: `2px solid ${bannerForm.type === 'ganador' ? '#00ffff' : '#ff00ff'}`, boxShadow: `0 0 8px ${bannerForm.type === 'ganador' ? 'rgba(0,255,255,0.4)' : 'rgba(255,0,255,0.4)'}` }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Vista previa</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ffff' }}>Enlace (opcional)</label>
                          <input
                            type="url"
                            value={bannerForm.linkUrl}
                            onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                            placeholder="https://instagram.com/ganador"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setBannerForm({ ...bannerForm, isActive: !bannerForm.isActive })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                            style={{
                              background: bannerForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: bannerForm.isActive ? '#4ade80' : '#ef4444',
                              border: `1px solid ${bannerForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                          >
                            {bannerForm.isActive ? '● Activo' : '○ Inactivo'}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveBanner}
                          disabled={savingBanner || !bannerForm.title.trim()}
                          className="flex-1 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
                          style={{
                            background: `linear-gradient(135deg, ${bannerForm.type === 'ganador' ? '#00ffff, #0088ff' : '#ff00ff, #ff4488'})`,
                            color: '#000',
                            boxShadow: `0 0 10px ${bannerForm.type === 'ganador' ? 'rgba(0,255,255,0.3)' : 'rgba(255,0,255,0.3)'}`,
                          }}
                        >
                          {savingBanner ? 'Guardando...' : 'Guardar Banner'}
                        </button>
                        <button
                          onClick={() => { setEditingBanner(null); setShowBannerForm(false) }}
                          className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {banners.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No hay banners creados. Agrega el GANADOR TPK y el PREMIO TPK.
                    </div>
                  ) : (
                    banners.map((banner) => {
                      const isGanador = banner.type === 'ganador'
                      const color = isGanador ? '#00ffff' : '#ff00ff'
                      const glowBg = isGanador ? 'rgba(0,255,255,' : 'rgba(255,0,255,'
                      return (
                        <div
                          key={banner.id}
                          className="rounded-xl transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${banner.isActive ? `${glowBg}0.3)` : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: banner.isActive ? `0 0 10px ${glowBg}0.08)` : 'none',
                          }}
                        >
                          <div className="p-4 flex items-center gap-3">
                            <div
                              className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: `2px solid ${color}50`,
                                background: banner.imageUrl ? 'transparent' : `${glowBg}0.1)`,
                              }}
                            >
                              {banner.imageUrl ? (
                                <img
                                  src={banner.imageUrl}
                                  alt={banner.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                              ) : (
                                <span className="text-xl">{isGanador ? '🏆' : '🎁'}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-bold"
                                  style={{ background: `${glowBg}0.15)`, color, border: `1px solid ${glowBg}0.3)` }}
                                >
                                  {isGanador ? '🏆 GANADOR' : '🎁 PREMIO'}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-bold"
                                  style={{
                                    background: banner.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: banner.isActive ? '#4ade80' : '#ef4444',
                                    border: `1px solid ${banner.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                  }}
                                >
                                  {banner.isActive ? '● Activo' : '○ Inactivo'}
                                </span>
                              </div>
                              <div className="font-bold text-sm" style={{ color: banner.isActive ? color : 'rgba(255,255,255,0.4)' }}>
                                {banner.title}
                              </div>
                              {banner.subtitle && (
                                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{banner.subtitle}</div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleBanner(banner)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{
                                  background: banner.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: banner.isActive ? '#4ade80' : '#ef4444',
                                  border: `1px solid ${banner.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                }}
                                title={banner.isActive ? 'Desactivar' : 'Activar'}
                              >
                                {banner.isActive ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBanner(banner)
                                  setBannerForm({
                                    type: banner.type,
                                    title: banner.title,
                                    subtitle: banner.subtitle || '',
                                    imageUrl: banner.imageUrl || '',
                                    linkUrl: banner.linkUrl || '',
                                    isActive: banner.isActive,
                                  })
                                  setShowBannerForm(true)
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ background: `${glowBg}0.1)`, color, border: `1px solid ${glowBg}0.2)` }}
                                title="Editar"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                                title="Eliminar"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ) : activeTab === 'predictions' ? (
                /* ========== PREDICTIONS TAB ========== */
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(0, 255, 128, 0.05)',
                      border: '1px solid rgba(0, 255, 128, 0.2)',
                    }}
                  >
                    <span style={{ color: '#00ff80', fontSize: '1.2rem' }}>⚽</span>
                    <span className="text-xs" style={{ color: 'rgba(0,255,128,0.7)' }}>
                      Agrega los partidos de la <b style={{ color: '#00ff80' }}>Liga BetPlay</b> con fecha, equipos y marcador. Los partidos se muestran en la página principal.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingPrediction(null)
                      setPredictionForm({ homeTeam: 'millonarios', awayTeam: 'atletico-nacional', homeScore: '', awayScore: '', matchDate: '', venue: '', status: 'upcoming', isActive: true, order: predictions.length })
                      setShowPredictionForm(true)
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                    style={{
                      border: '1px dashed rgba(0, 255, 128, 0.4)',
                      color: '#00ff80',
                      background: 'rgba(0, 255, 128, 0.05)',
                    }}
                  >
                    + Agregar Partido
                  </button>

                  {showPredictionForm && (
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{
                        background: 'rgba(0, 255, 128, 0.05)',
                        border: '1px solid rgba(0, 255, 128, 0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: '#00ff80' }}>
                          {editingPrediction ? 'Editar Partido' : 'Nuevo Partido'}
                        </span>
                        <button
                          onClick={() => { setEditingPrediction(null); setShowPredictionForm(false) }}
                          className="text-xs cursor-pointer"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ff80' }}>Equipo Local</label>
                          <select
                            value={predictionForm.homeTeam}
                            onChange={(e) => setPredictionForm({ ...predictionForm, homeTeam: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,128,0.3)' }}
                          >
                            {TEAM_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ff80' }}>Equipo Visitante</label>
                          <select
                            value={predictionForm.awayTeam}
                            onChange={(e) => setPredictionForm({ ...predictionForm, awayTeam: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,128,0.3)' }}
                          >
                            {TEAM_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ff80' }}>Fecha y Hora</label>
                          <input
                            type="datetime-local"
                            value={predictionForm.matchDate}
                            onChange={(e) => setPredictionForm({ ...predictionForm, matchDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,128,0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ff80' }}>Estadio / Sede</label>
                          <input
                            type="text"
                            value={predictionForm.venue}
                            onChange={(e) => setPredictionForm({ ...predictionForm, venue: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,128,0.3)' }}
                            placeholder="Estadio El Campín"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#ffc800' }}>Marcador Local</label>
                          <input
                            type="number"
                            min="0"
                            value={predictionForm.homeScore}
                            onChange={(e) => setPredictionForm({ ...predictionForm, homeScore: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
                            placeholder="-"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#ffc800' }}>Marcador Visitante</label>
                          <input
                            type="number"
                            min="0"
                            value={predictionForm.awayScore}
                            onChange={(e) => setPredictionForm({ ...predictionForm, awayScore: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
                            placeholder="-"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#00ff80' }}>Estado</label>
                          <select
                            value={predictionForm.status}
                            onChange={(e) => setPredictionForm({ ...predictionForm, status: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,128,0.3)' }}
                          >
                            <option value="upcoming">Próximo</option>
                            <option value="live">En Vivo</option>
                            <option value="finished">Finalizado</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <button
                            onClick={() => setPredictionForm({ ...predictionForm, isActive: !predictionForm.isActive })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                            style={{
                              background: predictionForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: predictionForm.isActive ? '#4ade80' : '#ef4444',
                              border: `1px solid ${predictionForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                          >
                            {predictionForm.isActive ? '● Activo' : '○ Inactivo'}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSavePrediction}
                          disabled={savingPrediction || !predictionForm.matchDate}
                          className="flex-1 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #00ff80, #00c8ff)',
                            color: '#000',
                            boxShadow: '0 0 10px rgba(0,255,128,0.3)',
                          }}
                        >
                          {savingPrediction ? 'Guardando...' : 'Guardar Partido'}
                        </button>
                        <button
                          onClick={() => { setEditingPrediction(null); setShowPredictionForm(false) }}
                          className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {predictions.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No hay partidos agregados. Agrega partidos de la Liga BetPlay.
                    </div>
                  ) : (
                    predictions.map((prediction) => {
                      const isLive = prediction.status === 'live'
                      const isFinished = prediction.status === 'finished'
                      const statusColor = isLive ? '#ff3333' : isFinished ? '#00ff80' : '#ffc800'
                      const statusLabel = isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : 'PRÓXIMO'
                      const teamName = (slug: string) => TEAM_NAMES_MAP[slug] || slug.replace(/-/g, ' ')
                      return (
                        <div
                          key={prediction.id}
                          className="rounded-xl transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${prediction.isActive ? 'rgba(0,255,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: prediction.isActive ? '0 0 8px rgba(0,255,128,0.05)' : 'none',
                          }}
                        >
                          <div className="p-3 flex items-center gap-3">
                            {/* Home team shield */}
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{ border: '1px solid rgba(0,255,128,0.2)', background: 'rgba(0,0,0,0.3)' }}
                            >
                              <img
                                src={`/images/teams/${prediction.homeTeam}.${PNG_ONLY.includes(prediction.homeTeam) ? 'png' : 'svg'}`}
                                alt={teamName(prediction.homeTeam)}
                                className="w-7 h-7 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded text-[0.6rem] font-bold"
                                  style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}
                                >
                                  {statusLabel}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-[0.6rem] font-bold"
                                  style={{
                                    background: prediction.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: prediction.isActive ? '#4ade80' : '#ef4444',
                                    border: `1px solid ${prediction.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                  }}
                                >
                                  {prediction.isActive ? '● Activo' : '○ Inactivo'}
                                </span>
                              </div>
                              <div className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                {teamName(prediction.homeTeam)} {prediction.homeScore !== null ? prediction.homeScore : '-'} : {prediction.awayScore !== null ? prediction.awayScore : '-'} {teamName(prediction.awayTeam)}
                              </div>
                              <div className="text-[0.6rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {new Date(prediction.matchDate).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                {prediction.venue && ` · ${prediction.venue}`}
                              </div>
                            </div>

                            {/* Away team shield */}
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{ border: '1px solid rgba(0,255,128,0.2)', background: 'rgba(0,0,0,0.3)' }}
                            >
                              <img
                                src={`/images/teams/${prediction.awayTeam}.${PNG_ONLY.includes(prediction.awayTeam) ? 'png' : 'svg'}`}
                                alt={teamName(prediction.awayTeam)}
                                className="w-7 h-7 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTogglePrediction(prediction)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{
                                  background: prediction.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: prediction.isActive ? '#4ade80' : '#ef4444',
                                  border: `1px solid ${prediction.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                }}
                                title={prediction.isActive ? 'Desactivar' : 'Activar'}
                              >
                                {prediction.isActive ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPrediction(prediction)
                                  setPredictionForm({
                                    homeTeam: prediction.homeTeam,
                                    awayTeam: prediction.awayTeam,
                                    homeScore: prediction.homeScore !== null ? String(prediction.homeScore) : '',
                                    awayScore: prediction.awayScore !== null ? String(prediction.awayScore) : '',
                                    matchDate: new Date(prediction.matchDate).toISOString().slice(0, 16),
                                    venue: prediction.venue || '',
                                    status: prediction.status,
                                    isActive: prediction.isActive,
                                    order: prediction.order,
                                  })
                                  setShowPredictionForm(true)
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ background: 'rgba(0,255,128,0.1)', color: '#00ff80', border: '1px solid rgba(0,255,128,0.2)' }}
                                title="Editar"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => handleDeletePrediction(prediction.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                                title="Eliminar"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ) : activeTab === 'loteria' ? (
                /* ========== LOTERIA TAB ========== */
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(255, 0, 255, 0.05)',
                      border: '1px solid rgba(255, 0, 255, 0.2)',
                    }}
                  >
                    <span style={{ color: '#ff00ff', fontSize: '1.2rem' }}>🃏</span>
                    <span className="text-xs" style={{ color: 'rgba(255,0,255,0.7)' }}>
                      Configura la <b style={{ color: '#ff00ff' }}>Lotería de Equipos</b>: tamaño del tablero, puntos por tipo de victoria y velocidad del sorteo. Los cambios se reflejan en tiempo real.
                    </span>
                  </div>

                  {/* Current Config Display */}
                  {loteriaConfig && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(255, 0, 255, 0.04)',
                        border: '1px solid rgba(255, 0, 255, 0.15)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold" style={{ color: '#ff00ff' }}>
                          Estado Actual
                        </span>
                        <button
                          onClick={() => setLoteriaForm({
                            boardSize: loteriaConfig.boardSize,
                            pointsLine: loteriaConfig.pointsLine,
                            pointsDiag: loteriaConfig.pointsDiag,
                            pointsFull: loteriaConfig.pointsFull,
                            drawSpeed: loteriaConfig.drawSpeed,
                            isActive: loteriaConfig.isActive,
                          })}
                          className="text-[0.65rem] font-bold cursor-pointer px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(255,0,255,0.1)', color: '#ff00ff', border: '1px solid rgba(255,0,255,0.3)' }}
                        >
                          Restablecer
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,0,255,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#ff00ff' }}>{loteriaConfig.boardSize}x{loteriaConfig.boardSize}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tablero</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,200,0,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#ffc800' }}>+{loteriaConfig.pointsLine}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Línea</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,255,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#00ffff' }}>+{loteriaConfig.pointsDiag}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Diagonal</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,200,0,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#ffc800' }}>+{loteriaConfig.pointsFull}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Completa</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#d8b4fe' }}>{loteriaConfig.drawSpeed}s</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Velocidad</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: loteriaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: loteriaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                            {loteriaConfig.isActive ? '●' : '○'}
                          </div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {loteriaConfig.isActive ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configuration Form */}
                  <div
                    className="p-4 rounded-xl space-y-4"
                    style={{
                      background: 'rgba(255, 0, 255, 0.03)',
                      border: '1px solid rgba(255, 0, 255, 0.15)',
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: '#ff00ff' }}>
                      Configuración del Juego
                    </span>

                    {/* Board Size */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ff00ff' }}>
                        Tamaño del Tablero
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { size: 3, label: '3x3', desc: '9 equipos' },
                          { size: 4, label: '4x4', desc: '16 equipos' },
                          { size: 5, label: '5x5', desc: '25 equipos' },
                        ].map((option) => (
                          <button
                            key={option.size}
                            onClick={() => setLoteriaForm({ ...loteriaForm, boardSize: option.size })}
                            className="p-3 rounded-xl text-center cursor-pointer transition-all"
                            style={{
                              background: loteriaForm.boardSize === option.size ? 'rgba(255,0,255,0.15)' : 'rgba(0,0,0,0.3)',
                              border: loteriaForm.boardSize === option.size ? '2px solid #ff00ff' : '2px solid rgba(255,255,255,0.08)',
                              boxShadow: loteriaForm.boardSize === option.size ? '0 0 12px rgba(255,0,255,0.2)' : 'none',
                            }}
                          >
                            <div className="text-lg font-black" style={{ color: loteriaForm.boardSize === option.size ? '#ff00ff' : 'rgba(255,255,255,0.5)' }}>
                              {option.label}
                            </div>
                            <div className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Points Configuration */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ffc800' }}>
                        Puntos por Tipo de Victoria
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[0.6rem] uppercase mb-1" style={{ color: '#ff00ff' }}>Línea</label>
                          <input
                            type="number"
                            min="1"
                            value={loteriaForm.pointsLine}
                            onChange={(e) => setLoteriaForm({ ...loteriaForm, pointsLine: parseInt(e.target.value) || 30 })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white text-center font-bold outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,0,255,0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] uppercase mb-1" style={{ color: '#00ffff' }}>Diagonal</label>
                          <input
                            type="number"
                            min="1"
                            value={loteriaForm.pointsDiag}
                            onChange={(e) => setLoteriaForm({ ...loteriaForm, pointsDiag: parseInt(e.target.value) || 50 })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white text-center font-bold outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] uppercase mb-1" style={{ color: '#ffc800' }}>Completa</label>
                          <input
                            type="number"
                            min="1"
                            value={loteriaForm.pointsFull}
                            onChange={(e) => setLoteriaForm({ ...loteriaForm, pointsFull: parseInt(e.target.value) || 100 })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white text-center font-bold outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Draw Speed */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#d8b4fe' }}>
                        Velocidad del Sorteo
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="10"
                          step="1"
                          value={loteriaForm.drawSpeed}
                          onChange={(e) => setLoteriaForm({ ...loteriaForm, drawSpeed: parseInt(e.target.value) })}
                          className="flex-1"
                          style={{ accentColor: '#ff00ff' }}
                        />
                        <span className="text-sm font-bold min-w-[40px] text-center" style={{ color: '#d8b4fe' }}>
                          {loteriaForm.drawSpeed}s
                        </span>
                      </div>
                      <div className="flex justify-between text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        <span>Rápido</span>
                        <span>Lento</span>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Juego Activo
                        </label>
                        <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Desactiva para ocultar la lotería del sitio
                        </p>
                      </div>
                      <button
                        onClick={() => setLoteriaForm({ ...loteriaForm, isActive: !loteriaForm.isActive })}
                        className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        style={{
                          background: loteriaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: loteriaForm.isActive ? '#4ade80' : '#ef4444',
                          border: `1px solid ${loteriaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          boxShadow: loteriaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                        }}
                      >
                        {loteriaForm.isActive ? '● Activo' : '○ Inactivo'}
                      </button>
                    </div>

                    {/* Save button */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveLoteria}
                        disabled={savingLoteria}
                        className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #ff00ff, #ffc800)',
                          color: '#000',
                          boxShadow: '0 0 12px rgba(255,0,255,0.3), 0 0 24px rgba(255,200,0,0.15)',
                        }}
                      >
                        {savingLoteria ? 'Guardando...' : 'Guardar Configuración'}
                      </button>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(255, 0, 255, 0.03)',
                      border: '1px solid rgba(255, 0, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,0,255,0.6)' }}>
                        Vista Previa del Tablero
                      </span>
                      <span className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {loteriaForm.boardSize * loteriaForm.boardSize} escudos
                      </span>
                    </div>
                    <div
                      className="grid gap-1.5 mx-auto"
                      style={{
                        gridTemplateColumns: `repeat(${loteriaForm.boardSize}, 1fr)`,
                        maxWidth: loteriaForm.boardSize <= 3 ? '180px' : loteriaForm.boardSize <= 4 ? '240px' : '300px',
                      }}
                    >
                      {Array.from({ length: loteriaForm.boardSize * loteriaForm.boardSize }).map((_, i) => {
                        const teamIndex = i % 20
                        const teamSlug = [
                          'millonarios', 'atletico-nacional', 'america-de-cali', 'deportivo-cali',
                          'atletico-junior', 'independiente-santa-fe', 'independiente-medellin', 'once-caldas',
                          'deportes-tolima', 'deportivo-pereira', 'aguilas-doradas',
                          'atletico-bucaramanga', 'deportivo-pasto', 'fortaleza-ceif',
                          'boyaca-chico', 'jaguares-de-cordoba', 'cucuta-deportivo', 'alianza-valledupar',
                          'llaneros', 'internacional-de-bogota'
                        ][teamIndex]
                        const ext = teamSlug === 'internacional-de-bogota' ? 'png' : 'svg'
                        const isEven = i % 2 === 0
                        return (
                          <div
                            key={i}
                            className="aspect-square rounded-lg flex items-center justify-center overflow-hidden"
                            style={{
                              background: isEven ? 'rgba(255,0,255,0.08)' : 'rgba(0,255,255,0.06)',
                              border: `1px solid ${isEven ? 'rgba(255,0,255,0.2)' : 'rgba(0,255,255,0.15)'}`,
                            }}
                          >
                            <img
                              src={`/images/teams/${teamSlug}.${ext}`}
                              alt=""
                              className="w-6 h-6 md:w-8 md:h-8 object-contain"
                              style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,255,0.4))', opacity: 0.7 }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <div className="px-2 py-1 rounded text-[0.55rem] font-bold" style={{ background: 'rgba(255,0,255,0.1)', color: '#ff00ff', border: '1px solid rgba(255,0,255,0.2)' }}>
                        Línea +{loteriaForm.pointsLine}
                      </div>
                      <div className="px-2 py-1 rounded text-[0.55rem] font-bold" style={{ background: 'rgba(0,255,255,0.1)', color: '#00ffff', border: '1px solid rgba(0,255,255,0.2)' }}>
                        Diagonal +{loteriaForm.pointsDiag}
                      </div>
                      <div className="px-2 py-1 rounded text-[0.55rem] font-bold" style={{ background: 'rgba(255,200,0,0.1)', color: '#ffc800', border: '1px solid rgba(255,200,0,0.2)' }}>
                        Completa +{loteriaForm.pointsFull}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'ruleta' ? (
                /* ========== RULETA TAB ========== */
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(255, 200, 0, 0.05)',
                      border: '1px solid rgba(255, 200, 0, 0.2)',
                    }}
                  >
                    <span style={{ color: '#ffc800', fontSize: '1.2rem' }}>🎰</span>
                    <span className="text-xs" style={{ color: 'rgba(255,200,0,0.7)' }}>
                      Configura la <b style={{ color: '#ffc800' }}>Ruleta de Equipos</b>: puntos por acierto exacto, puntos por misma región y velocidad del giro. Los cambios se reflejan en tiempo real.
                    </span>
                  </div>

                  {/* Current Config Display */}
                  {ruletaConfig && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(255, 200, 0, 0.04)',
                        border: '1px solid rgba(255, 200, 0, 0.15)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold" style={{ color: '#ffc800' }}>
                          Estado Actual
                        </span>
                        <button
                          onClick={() => setRuletaForm({
                            pointsExact: ruletaConfig.pointsExact,
                            pointsRegion: ruletaConfig.pointsRegion,
                            spinDuration: ruletaConfig.spinDuration,
                            isActive: ruletaConfig.isActive,
                          })}
                          className="text-[0.65rem] font-bold cursor-pointer px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(255,200,0,0.1)', color: '#ffc800', border: '1px solid rgba(255,200,0,0.3)' }}
                        >
                          Restablecer
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,200,0,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#ffc800' }}>+{ruletaConfig.pointsExact}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Exacto</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,255,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#00ffff' }}>+{ruletaConfig.pointsRegion}</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Región</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: '#d8b4fe' }}>{ruletaConfig.spinDuration}s</div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Giro</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: ruletaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                          <div className="text-lg font-black" style={{ color: ruletaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                            {ruletaConfig.isActive ? '●' : '○'}
                          </div>
                          <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {ruletaConfig.isActive ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configuration Form */}
                  <div
                    className="p-4 rounded-xl space-y-4"
                    style={{
                      background: 'rgba(255, 200, 0, 0.03)',
                      border: '1px solid rgba(255, 200, 0, 0.15)',
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: '#ffc800' }}>
                      Configuración del Juego
                    </span>

                    {/* Points Configuration */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ffc800' }}>
                        Puntos por Tipo de Acierto
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[0.6rem] uppercase mb-1" style={{ color: '#ffc800' }}>Escudo Exacto</label>
                          <input
                            type="number"
                            min="1"
                            value={ruletaForm.pointsExact}
                            onChange={(e) => setRuletaForm({ ...ruletaForm, pointsExact: parseInt(e.target.value) || 50 })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white text-center font-bold outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] uppercase mb-1" style={{ color: '#00ffff' }}>Misma Región</label>
                          <input
                            type="number"
                            min="0"
                            value={ruletaForm.pointsRegion}
                            onChange={(e) => setRuletaForm({ ...ruletaForm, pointsRegion: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white text-center font-bold outline-none"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Spin Duration */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#d8b4fe' }}>
                        Duración del Giro
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="8"
                          step="1"
                          value={ruletaForm.spinDuration}
                          onChange={(e) => setRuletaForm({ ...ruletaForm, spinDuration: parseInt(e.target.value) })}
                          className="flex-1"
                          style={{ accentColor: '#ffc800' }}
                        />
                        <span className="text-sm font-bold min-w-[40px] text-center" style={{ color: '#d8b4fe' }}>
                          {ruletaForm.spinDuration}s
                        </span>
                      </div>
                      <div className="flex justify-between text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        <span>Rápido</span>
                        <span>Lento</span>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Juego Activo
                        </label>
                        <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Desactiva para ocultar la ruleta del sitio
                        </p>
                      </div>
                      <button
                        onClick={() => setRuletaForm({ ...ruletaForm, isActive: !ruletaForm.isActive })}
                        className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        style={{
                          background: ruletaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: ruletaForm.isActive ? '#4ade80' : '#ef4444',
                          border: `1px solid ${ruletaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          boxShadow: ruletaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                        }}
                      >
                        {ruletaForm.isActive ? '● Activo' : '○ Inactivo'}
                      </button>
                    </div>

                    {/* Save button */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveRuleta}
                        disabled={savingRuleta}
                        className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                          color: '#000',
                          boxShadow: '0 0 12px rgba(255,200,0,0.3), 0 0 24px rgba(255,0,255,0.15)',
                        }}
                      >
                        {savingRuleta ? 'Guardando...' : 'Guardar Configuración'}
                      </button>
                    </div>
                  </div>

                  {/* Roulette Preview */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(255, 200, 0, 0.03)',
                      border: '1px solid rgba(255, 200, 0, 0.1)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,200,0,0.6)' }}>
                        Vista Previa de la Ruleta
                      </span>
                      <span className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        22 escudos de la Liga BetPlay
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative" style={{ width: '200px', height: '200px' }}>
                        <div
                          className="w-full h-full rounded-full overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(30,10,0,0.9))',
                            border: '2px solid rgba(255,200,0,0.3)',
                            boxShadow: '0 0 15px rgba(255,200,0,0.15)',
                          }}
                        >
                          {RULETA_TEAMS.slice(0, 20).map((team, i) => {
                            const segAngle = 360 / 20
                            const startAngle = i * segAngle
                            const isEven = i % 2 === 0
                            return (
                              <div
                                key={team.slug}
                                className="absolute"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + segAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + segAngle - 90) * Math.PI / 180)}%)`,
                                  background: isEven
                                    ? 'rgba(255,200,0,0.08)'
                                    : 'rgba(255,0,255,0.06)',
                                }}
                              >
                                <div
                                  className="absolute"
                                  style={{
                                    left: `${50 + 32 * Math.cos((startAngle + segAngle / 2 - 90) * Math.PI / 180)}%`,
                                    top: `${50 + 32 * Math.sin((startAngle + segAngle / 2 - 90) * Math.PI / 180)}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                >
                                  <img
                                    src={`/images/teams/${team.slug}.${team.slug === 'internacional-de-bogota' ? 'png' : 'svg'}`}
                                    alt=""
                                    className="w-3.5 h-3.5 object-contain"
                                    style={{ filter: 'drop-shadow(0 0 2px rgba(255,200,0,0.4))', opacity: 0.6 }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                          {/* Center */}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                                boxShadow: '0 0 8px rgba(255,200,0,0.3)',
                                border: '1px solid rgba(255,200,0,0.5)',
                              }}
                            >
                              <span className="text-[0.5rem] font-black" style={{ color: '#000' }}>TPK</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <div className="px-2 py-1 rounded text-[0.55rem] font-bold" style={{ background: 'rgba(255,200,0,0.1)', color: '#ffc800', border: '1px solid rgba(255,200,0,0.2)' }}>
                        Exacto +{ruletaForm.pointsExact}
                      </div>
                      <div className="px-2 py-1 rounded text-[0.55rem] font-bold" style={{ background: 'rgba(0,255,255,0.1)', color: '#00ffff', border: '1px solid rgba(0,255,255,0.2)' }}>
                        Región +{ruletaForm.pointsRegion}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'circuito' ? (
                /* ========== CIRCUITO TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(0,255,128,0.04)', border: '1px solid rgba(0,255,128,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura el <b style={{ color: '#00ff80' }}>Circuito Futbolero</b>: puntos por balón, puntos por rival eliminado, velocidad del juego y vidas. Los cambios se reflejan en tiempo real.
                    </p>
                  </div>

                  {circuitoConfig && (
                    <div className="grid grid-cols-5 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,128,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,128,0.5)' }}>Balón</div>
                        <div className="text-lg font-black" style={{ color: '#00ff80' }}>+{circuitoConfig.pointsDot}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,200,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,200,0,0.5)' }}>Rival</div>
                        <div className="text-lg font-black" style={{ color: '#ffc800' }}>+{circuitoConfig.pointsGhost}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(168,85,247,0.5)' }}>Velocidad</div>
                        <div className="text-lg font-black" style={{ color: '#d8b4fe' }}>{circuitoConfig.gameSpeed}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Vidas</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>x{circuitoConfig.lives}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: circuitoConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: circuitoConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {circuitoConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,128,0.6)' }}>
                          Puntos por Balón
                        </label>
                        <input type="number" min={1} max={100}
                          value={circuitoForm.pointsDot}
                          onChange={(e) => setCircuitoForm({ ...circuitoForm, pointsDot: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,128,0.2)', color: '#00ff80' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,200,0,0.6)' }}>
                          Puntos por Rival
                        </label>
                        <input type="number" min={50} max={1000} step={50}
                          value={circuitoForm.pointsGhost}
                          onChange={(e) => setCircuitoForm({ ...circuitoForm, pointsGhost: parseInt(e.target.value) || 200 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,200,0,0.2)', color: '#ffc800' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(168,85,247,0.6)' }}>
                          Velocidad (1-5)
                        </label>
                        <input type="range" min={1} max={5}
                          value={circuitoForm.gameSpeed}
                          onChange={(e) => setCircuitoForm({ ...circuitoForm, gameSpeed: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-xs font-bold mt-1" style={{ color: '#d8b4fe' }}>
                          {circuitoForm.gameSpeed}
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Vidas
                        </label>
                        <input type="number" min={1} max={5}
                          value={circuitoForm.lives}
                          onChange={(e) => setCircuitoForm({ ...circuitoForm, lives: parseInt(e.target.value) || 3 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Estado del Juego
                      </label>
                      <p className="text-[0.55rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Desactiva para ocultar el circuito del sitio
                      </p>
                      <button
                        onClick={() => setCircuitoForm({ ...circuitoForm, isActive: !circuitoForm.isActive })}
                        className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        style={{
                          background: circuitoForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: circuitoForm.isActive ? '#4ade80' : '#ef4444',
                          border: `1px solid ${circuitoForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          boxShadow: circuitoForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                        }}
                      >
                        {circuitoForm.isActive ? '● Activo' : '○ Inactivo'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveCircuito}
                      disabled={savingCircuito}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #00ff80, #ffc800)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(0,255,128,0.2)',
                      }}
                    >
                      {savingCircuito ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(0,255,128,0.4)' }}>
                      Vista Previa del Circuito
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,128,0.1)' }}>
                      <div className="relative" style={{ width: '160px', height: '180px' }}>
                        <div className="w-full h-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(17, 1fr)' }}>
                          {MAZE_L1.map((row, y) => row.map((cell, x) => (
                            <div key={`prev-${x}-${y}`} className="flex items-center justify-center"
                              style={{ background: cell === 1 ? 'rgba(0,255,128,0.1)' : 'transparent' }}>
                              {cell === 1 && <div className="w-[90%] h-[90%] rounded-[1px]" style={{ background: 'rgba(0,255,128,0.12)', border: '0.5px solid rgba(0,255,128,0.2)' }} />}
                              {cell === 0 && <div className="w-[2px] h-[2px] rounded-full" style={{ backgroundColor: 'rgba(255,200,0,0.4)' }} />}
                              {cell === 2 && <div className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: '#ffc800', boxShadow: '0 0 3px rgba(255,200,0,0.4)' }} />}
                            </div>
                          )))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#00ff80', textShadow: '0 0 6px rgba(0,255,128,0.3)' }}>
                          Circuito Futbolero
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(0,255,128,0.6)' }}>&#x26BD; Balón +{circuitoForm.pointsDot}pts</div>
                          <div style={{ color: 'rgba(255,200,0,0.6)' }}>&#x1F97E; Rival +{circuitoForm.pointsGhost}pts</div>
                          <div style={{ color: 'rgba(168,85,247,0.6)' }}>&#x1F3AE; Velocidad {circuitoForm.gameSpeed}</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x2764;&#xFE0F; Vidas x{circuitoForm.lives}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'parques' ? (
                /* ========== PARQUÉS TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura el <b style={{ color: '#facc15' }}>Parqués Futbolero</b>: fichas por jugador, puntos por captura, meta y victoria, velocidad del dado. Los cambios se reflejan en tiempo real.
                    </p>
                  </div>

                  {parquesConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(250,204,21,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(250,204,21,0.5)' }}>Fichas</div>
                        <div className="text-lg font-black" style={{ color: '#facc15' }}>x{parquesConfig.tokensPerPlayer}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Captura</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>+{parquesConfig.pointsCapture}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(34,197,94,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(34,197,94,0.5)' }}>Meta</div>
                        <div className="text-lg font-black" style={{ color: '#22c55e' }}>+{parquesConfig.pointsFinish}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,200,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,200,0,0.5)' }}>Victoria</div>
                        <div className="text-lg font-black" style={{ color: '#ffc800' }}>+{parquesConfig.pointsWin}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(168,85,247,0.5)' }}>Dado</div>
                        <div className="text-lg font-black" style={{ color: '#d8b4fe' }}>{parquesConfig.diceSpeed}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: parquesConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: parquesConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {parquesConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(250,204,21,0.6)' }}>
                          Fichas por Jugador
                        </label>
                        <select
                          value={parquesForm.tokensPerPlayer}
                          onChange={(e) => setParquesForm({ ...parquesForm, tokensPerPlayer: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(250,204,21,0.2)', color: '#facc15' }}
                        >
                          <option value={2} style={{ background: '#1a0a2e' }}>2 fichas</option>
                          <option value={4} style={{ background: '#1a0a2e' }}>4 fichas</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Puntos por Captura
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={parquesForm.pointsCapture}
                          onChange={(e) => setParquesForm({ ...parquesForm, pointsCapture: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
                          Puntos por Meta
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={parquesForm.pointsFinish}
                          onChange={(e) => setParquesForm({ ...parquesForm, pointsFinish: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,200,0,0.6)' }}>
                          Puntos por Victoria
                        </label>
                        <input type="number" min={100} max={2000} step={50}
                          value={parquesForm.pointsWin}
                          onChange={(e) => setParquesForm({ ...parquesForm, pointsWin: parseInt(e.target.value) || 500 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,200,0,0.2)', color: '#ffc800' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(168,85,247,0.6)' }}>
                        Velocidad del Dado (1-5)
                      </label>
                      <input type="range" min={1} max={5}
                        value={parquesForm.diceSpeed}
                        onChange={(e) => setParquesForm({ ...parquesForm, diceSpeed: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-xs font-bold mt-1" style={{ color: '#d8b4fe' }}>
                        {parquesForm.diceSpeed}
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Estado del Juego
                      </label>
                      <p className="text-[0.55rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Desactiva para ocultar el parqués del sitio
                      </p>
                      <button
                        onClick={() => setParquesForm({ ...parquesForm, isActive: !parquesForm.isActive })}
                        className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        style={{
                          background: parquesForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: parquesForm.isActive ? '#4ade80' : '#ef4444',
                          border: `1px solid ${parquesForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          boxShadow: parquesForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                        }}
                      >
                        {parquesForm.isActive ? '● Activo' : '○ Inactivo'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveParques}
                      disabled={savingParques}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #facc15, #ef4444)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(250,204,21,0.2)',
                      }}
                    >
                      {savingParques ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Salas Activas */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[0.6rem] font-bold uppercase tracking-wider" style={{ color: 'rgba(250,204,21,0.4)' }}>
                        Salas de Parqués
                      </div>
                      <button
                        onClick={fetchParquesRooms}
                        className="px-2 py-1 rounded-lg text-[0.5rem] font-bold cursor-pointer"
                        style={{ background: 'rgba(250,204,21,0.08)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}
                      >
                        Actualizar
                      </button>
                    </div>
                    {parquesRoomsLoading ? (
                      <div className="text-center py-4">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }} />
                      </div>
                    ) : parquesRooms.length === 0 ? (
                      <div className="text-center py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>No hay salas activas</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {parquesRooms.map((r: any) => (
                          <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[0.6rem] font-mono font-black" style={{ color: '#facc15' }}>{r.roomCode}</span>
                                <span className="text-[0.5rem] px-1.5 py-0.5 rounded-full font-bold"
                                  style={{
                                    background: r.status === 'waiting' ? 'rgba(250,204,21,0.1)' : r.status === 'playing' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: r.status === 'waiting' ? '#facc15' : r.status === 'playing' ? '#22c55e' : '#ef4444',
                                  }}>
                                  {r.status === 'waiting' ? 'Espera' : r.status === 'playing' ? 'Jugando' : 'Finalizada'}
                                </span>
                              </div>
                              <div className="text-[0.45rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {r.players?.length || 0}/4 jugadores &middot; {r.clasicoMode}
                              </div>
                            </div>
                            {r.players && r.players.length > 0 && (
                              <div className="flex -space-x-1">
                                {r.players.slice(0, 4).map((p: any) => (
                                  <Image key={p.id} src={`/images/teams/${p.teamSlug}.${p.teamSlug === 'internacional-de-bogota' ? 'png' : 'svg'}`} alt="" width={14} height={14}
                                    className="w-3.5 h-3.5 object-contain rounded-full"
                                    style={{ border: '1px solid rgba(0,0,0,0.5)' }}
                                  />
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => { if (confirm('Eliminar esta sala?')) handleDeleteParquesRoom(r.id) }}
                              className="px-1.5 py-0.5 rounded text-[0.5rem] cursor-pointer"
                              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(250,204,21,0.4)' }}>
                      Vista Previa del Parqués
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(250,204,21,0.1)' }}>
                      <div className="relative" style={{ width: '160px', height: '160px' }}>
                        <div className="w-full h-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(15, 1fr)' }}>
                          {[
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
                          ].flat().map((cell, i) => (
                            <div key={`pq-${i}`} className="flex items-center justify-center"
                              style={{
                                background: cell === 1 ? 'rgba(255,255,255,0.08)' : cell >= 2 && cell <= 5 ? ['','rgba(250,204,21,0.12)','rgba(59,130,246,0.12)','rgba(239,68,68,0.12)','rgba(34,197,94,0.12)'][cell] || 'transparent' : cell === 6 ? 'rgba(250,204,21,0.06)' : cell === 7 ? 'rgba(255,200,0,0.1)' : 'transparent',
                                border: cell > 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                              }}
                            >
                              {cell === 7 && i === 112 && <div className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: '#ffc800', boxShadow: '0 0 3px rgba(255,200,0,0.4)' }} />}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#facc15', textShadow: '0 0 6px rgba(250,204,21,0.3)' }}>
                          Parqués Futbolero
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(250,204,21,0.6)' }}>&#x1F3B2; Fichas x{parquesForm.tokensPerPlayer}</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x2694;&#xFE0F; Captura +{parquesForm.pointsCapture}pts</div>
                          <div style={{ color: 'rgba(34,197,94,0.6)' }}>&#x1F3C6; Meta +{parquesForm.pointsFinish}pts</div>
                          <div style={{ color: 'rgba(255,200,0,0.6)' }}>&#x1F451; Victoria +{parquesForm.pointsWin}pts</div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {['#facc15','#3b82f6','#ef4444','#22c55e'].map((c, ci) => (
                            <div key={ci} className="w-3 h-3 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}60` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'rompecabezas' ? (
                /* ========== ROMPECABEZAS TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(0,255,200,0.04)', border: '1px solid rgba(0,255,200,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura el <b style={{ color: '#00ffc8' }}>Rompecabezas de Escudos</b>: tamaño de grilla, puntos por completar, bonus por tiempo, límite y vista previa. El escudo cambia cada hora automáticamente entre los 20 equipos de la Liga BetPlay.
                    </p>
                  </div>

                  {rompecabezasConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Grilla</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>{rompecabezasConfig.gridSize}x{rompecabezasConfig.gridSize}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,100,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,100,0.5)' }}>Puntos</div>
                        <div className="text-lg font-black" style={{ color: '#00ff64' }}>+{rompecabezasConfig.pointsComplete}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,170,255,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,170,255,0.5)' }}>Bonus</div>
                        <div className="text-lg font-black" style={{ color: '#00aaff' }}>+{rompecabezasConfig.timeBonusMax}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{rompecabezasConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Preview</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>{rompecabezasConfig.showPreview ? 'Sí' : 'No'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: rompecabezasConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: rompecabezasConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {rompecabezasConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Tamaño de Grilla (Complejidad)
                        </label>
                        <select
                          value={rompecabezasForm.gridSize}
                          onChange={(e) => setRompecabezasForm({ ...rompecabezasForm, gridSize: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        >
                          <option value={4} style={{ background: '#1a0a2e' }}>4x4 - Fácil (16 piezas)</option>
                          <option value={5} style={{ background: '#1a0a2e' }}>5x5 - Medio (25 piezas)</option>
                          <option value={6} style={{ background: '#1a0a2e' }}>6x6 - Complejo (36 piezas)</option>
                          <option value={7} style={{ background: '#1a0a2e' }}>7x7 - Experto (49 piezas)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,100,0.6)' }}>
                          Puntos por Completar
                        </label>
                        <input type="number" min={50} max={1000} step={25}
                          value={rompecabezasForm.pointsComplete}
                          onChange={(e) => setRompecabezasForm({ ...rompecabezasForm, pointsComplete: parseInt(e.target.value) || 200 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,100,0.2)', color: '#00ff64' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,170,255,0.6)' }}>
                          Bonus Máx. por Tiempo
                        </label>
                        <input type="number" min={0} max={500} step={10}
                          value={rompecabezasForm.timeBonusMax}
                          onChange={(e) => setRompecabezasForm({ ...rompecabezasForm, timeBonusMax: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,170,255,0.2)', color: '#00aaff' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={600} step={30}
                          value={rompecabezasForm.timeLimit}
                          onChange={(e) => setRompecabezasForm({ ...rompecabezasForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Mostrar Vista Previa
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Muestra la imagen completa como referencia al armar el rompecabezas
                        </p>
                        <button
                          onClick={() => setRompecabezasForm({ ...rompecabezasForm, showPreview: !rompecabezasForm.showPreview })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: rompecabezasForm.showPreview ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                            color: rompecabezasForm.showPreview ? '#eab308' : '#ef4444',
                            border: `1px solid ${rompecabezasForm.showPreview ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }}
                        >
                          {rompecabezasForm.showPreview ? '● Visible' : '○ Oculta'}
                        </button>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el rompecabezas del sitio
                        </p>
                        <button
                          onClick={() => setRompecabezasForm({ ...rompecabezasForm, isActive: !rompecabezasForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: rompecabezasForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: rompecabezasForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${rompecabezasForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: rompecabezasForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {rompecabezasForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveRompecabezas}
                      disabled={savingRompecabezas}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #00ffc8, #00aaff)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(0,255,200,0.2)',
                      }}
                    >
                      {savingRompecabezas ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Rompecabezas Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(0,255,200,0.4)' }}>
                      Vista Previa del Rompecabezas
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,200,0.1)' }}>
                      <div className="relative" style={{ width: '160px', height: '160px' }}>
                        <div className="w-full h-full rounded-lg overflow-hidden" style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${rompecabezasForm.gridSize}, 1fr)`,
                          gridTemplateRows: `repeat(${rompecabezasForm.gridSize}, 1fr)`,
                          gap: '1px',
                          background: 'rgba(0,255,200,0.15)',
                        }}>
                          {Array.from({ length: rompecabezasForm.gridSize * rompecabezasForm.gridSize }).map((_, i) => (
                            <div key={`rm-${i}`} className="flex items-center justify-center" style={{
                              background: `rgba(0,255,200,${0.02 + (i % 3) * 0.02})`,
                              border: '0.5px solid rgba(0,255,200,0.1)',
                            }}>
                              <div className="w-[2px] h-[2px] rounded-full" style={{ backgroundColor: 'rgba(0,255,200,0.2)' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#00ffc8', textShadow: '0 0 6px rgba(0,255,200,0.3)' }}>
                          Rompecabezas de Escudos
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x1F9E9; Grilla {rompecabezasForm.gridSize}x{rompecabezasForm.gridSize} = {rompecabezasForm.gridSize * rompecabezasForm.gridSize} piezas</div>
                          <div style={{ color: 'rgba(0,255,100,0.6)' }}>&#x1F3C6; Completar +{rompecabezasForm.pointsComplete}pts</div>
                          <div style={{ color: 'rgba(0,170,255,0.6)' }}>&#x26A1; Bonus máx +{rompecabezasForm.timeBonusMax}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {rompecabezasForm.timeLimit || '∞'}s</div>
                          <div style={{ color: 'rgba(234,179,8,0.6)' }}>&#x1F441; Preview {rompecabezasForm.showPreview ? 'activada' : 'oculta'}</div>
                        </div>
                        <div className="text-[0.5rem] mt-2 px-2 py-1 rounded" style={{ background: 'rgba(0,255,200,0.06)', color: 'rgba(0,255,200,0.4)' }}>
                          Cambia cada hora entre 20 escudos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'penales' ? (
                /* ========== PENALES TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,68,68,0.04)', border: '1px solid rgba(255,68,68,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura los <b style={{ color: '#ff4444' }}>Penales Futboleros</b>: rondas por juego, puntos por gol, hat-trick, perfecto, tiempo límite y activación. Simulador de tiros penales con escudos de la Liga BetPlay.
                    </p>
                  </div>

                  {penalesConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,68,68,0.5)' }}>Rondas</div>
                        <div className="text-lg font-black" style={{ color: '#ff4444' }}>{penalesConfig.roundsPerGame}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,100,100,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,100,100,0.5)' }}>Gol</div>
                        <div className="text-lg font-black" style={{ color: '#ff6464' }}>+{penalesConfig.pointsGoal}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,165,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,165,0,0.5)' }}>Hat-Trick</div>
                        <div className="text-lg font-black" style={{ color: '#ffa500' }}>+{penalesConfig.pointsHatTrick}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,215,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,215,0,0.5)' }}>Perfecto</div>
                        <div className="text-lg font-black" style={{ color: '#ffd700' }}>+{penalesConfig.pointsPerfect}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{penalesConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: penalesConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: penalesConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {penalesConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,68,68,0.6)' }}>
                          Rondas por Juego
                        </label>
                        <select
                          value={penalesForm.roundsPerGame}
                          onChange={(e) => setPenalesForm({ ...penalesForm, roundsPerGame: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}
                        >
                          <option value={3} style={{ background: '#1a0a2e' }}>3 - Rápido</option>
                          <option value={5} style={{ background: '#1a0a2e' }}>5 - Normal</option>
                          <option value={7} style={{ background: '#1a0a2e' }}>7 - Largo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,100,100,0.6)' }}>
                          Puntos por Gol
                        </label>
                        <input type="number" min={5} max={100} step={5}
                          value={penalesForm.pointsGoal}
                          onChange={(e) => setPenalesForm({ ...penalesForm, pointsGoal: parseInt(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff6464' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,165,0,0.6)' }}>
                          Puntos Hat-Trick
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={penalesForm.pointsHatTrick}
                          onChange={(e) => setPenalesForm({ ...penalesForm, pointsHatTrick: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,165,0,0.2)', color: '#ffa500' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,215,0,0.6)' }}>
                          Puntos Perfecto
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={penalesForm.pointsPerfect}
                          onChange={(e) => setPenalesForm({ ...penalesForm, pointsPerfect: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.2)', color: '#ffd700' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={300} step={10}
                          value={penalesForm.timeLimit}
                          onChange={(e) => setPenalesForm({ ...penalesForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setPenalesForm({ ...penalesForm, isActive: !penalesForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: penalesForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: penalesForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${penalesForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: penalesForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {penalesForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePenales}
                      disabled={savingPenales}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #ff4444, #ff6464)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(255,68,68,0.2)',
                      }}
                    >
                      {savingPenales ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Penales Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,68,68,0.4)' }}>
                      Vista Previa de Penales
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,68,68,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(255,68,68,0.1)', borderRadius: '12px', border: '2px solid rgba(255,68,68,0.3)' }}>
                        <span className="text-4xl">⚽</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#ff4444', textShadow: '0 0 6px rgba(255,68,68,0.3)' }}>
                          Penales Futboleros
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(255,68,68,0.6)' }}>&#x26BD; {penalesForm.roundsPerGame} rondas por juego</div>
                          <div style={{ color: 'rgba(255,100,100,0.6)' }}>&#x1F3C6; Gol +{penalesForm.pointsGoal}pts | Hat-Trick +{penalesForm.pointsHatTrick}pts</div>
                          <div style={{ color: 'rgba(255,215,0,0.6)' }}>&#x2B50; Perfecto +{penalesForm.pointsPerfect}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {penalesForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'carta-mayor' ? (
                /* ========== CARTA MAYOR TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura <b style={{ color: '#eab308' }}>Carta Mayor</b>: cartas por ronda, puntos por acierto, rachas de 5 y 10, tiempo límite y activación. Alto y baja con escudos de la Liga BetPlay.
                    </p>
                  </div>

                  {cartaMayorConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Cartas</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>{cartaMayorConfig.cardsPerRound}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Acierto</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{cartaMayorConfig.pointsCorrect}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,165,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,165,0,0.5)' }}>Racha 5</div>
                        <div className="text-lg font-black" style={{ color: '#ffa500' }}>+{cartaMayorConfig.pointsStreak5}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,215,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,215,0,0.5)' }}>Racha 10</div>
                        <div className="text-lg font-black" style={{ color: '#ffd700' }}>+{cartaMayorConfig.pointsStreak10}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{cartaMayorConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: cartaMayorConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: cartaMayorConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {cartaMayorConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Cartas por Ronda
                        </label>
                        <select
                          value={cartaMayorForm.cardsPerRound}
                          onChange={(e) => setCartaMayorForm({ ...cartaMayorForm, cardsPerRound: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        >
                          <option value={5} style={{ background: '#1a0a2e' }}>5 - Rápido</option>
                          <option value={10} style={{ background: '#1a0a2e' }}>10 - Normal</option>
                          <option value={15} style={{ background: '#1a0a2e' }}>15 - Largo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos por Acierto
                        </label>
                        <input type="number" min={5} max={50} step={5}
                          value={cartaMayorForm.pointsCorrect}
                          onChange={(e) => setCartaMayorForm({ ...cartaMayorForm, pointsCorrect: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,165,0,0.6)' }}>
                          Puntos Racha 5
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={cartaMayorForm.pointsStreak5}
                          onChange={(e) => setCartaMayorForm({ ...cartaMayorForm, pointsStreak5: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,165,0,0.2)', color: '#ffa500' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,215,0,0.6)' }}>
                          Puntos Racha 10
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={cartaMayorForm.pointsStreak10}
                          onChange={(e) => setCartaMayorForm({ ...cartaMayorForm, pointsStreak10: parseInt(e.target.value) || 200 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.2)', color: '#ffd700' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={300} step={10}
                          value={cartaMayorForm.timeLimit}
                          onChange={(e) => setCartaMayorForm({ ...cartaMayorForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setCartaMayorForm({ ...cartaMayorForm, isActive: !cartaMayorForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: cartaMayorForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: cartaMayorForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${cartaMayorForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: cartaMayorForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {cartaMayorForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveCartaMayor}
                      disabled={savingCartaMayor}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #eab308, #ffd700)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(234,179,8,0.2)',
                      }}
                    >
                      {savingCartaMayor ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Carta Mayor Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(234,179,8,0.4)' }}>
                      Vista Previa de Carta Mayor
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(234,179,8,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(234,179,8,0.1)', borderRadius: '12px', border: '2px solid rgba(234,179,8,0.3)' }}>
                        <span className="text-4xl">🃏</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#eab308', textShadow: '0 0 6px rgba(234,179,8,0.3)' }}>
                          Carta Mayor
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(234,179,8,0.6)' }}>&#x1F0CF; {cartaMayorForm.cardsPerRound} cartas por ronda</div>
                          <div style={{ color: 'rgba(255,165,0,0.6)' }}>&#x1F3C6; Acierto +{cartaMayorForm.pointsCorrect}pts | Racha5 +{cartaMayorForm.pointsStreak5}pts</div>
                          <div style={{ color: 'rgba(255,215,0,0.6)' }}>&#x2B50; Racha10 +{cartaMayorForm.pointsStreak10}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {cartaMayorForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'diana' ? (
                /* ========== DIANA TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura la <b style={{ color: '#ef4444' }}>Diana de Escudos</b>: rondas, puntos centro/medio/borde, velocidad y activación. Tiro al blanco con escudos de la Liga BetPlay.
                    </p>
                  </div>

                  {dianaConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Rondas</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{dianaConfig.roundsPerGame}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,0,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,0,0,0.5)' }}>Centro</div>
                        <div className="text-lg font-black" style={{ color: '#ff0000' }}>+{dianaConfig.pointsCenter}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,165,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,165,0,0.5)' }}>Medio</div>
                        <div className="text-lg font-black" style={{ color: '#ffa500' }}>+{dianaConfig.pointsMiddle}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,215,0,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,215,0,0.5)' }}>Borde</div>
                        <div className="text-lg font-black" style={{ color: '#ffd700' }}>+{dianaConfig.pointsEdge}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,170,255,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,170,255,0.5)' }}>Velocidad</div>
                        <div className="text-lg font-black" style={{ color: '#00aaff' }}>{dianaConfig.speed}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: dianaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: dianaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {dianaConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Rondas por Juego
                        </label>
                        <select
                          value={dianaForm.roundsPerGame}
                          onChange={(e) => setDianaForm({ ...dianaForm, roundsPerGame: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        >
                          <option value={5} style={{ background: '#1a0a2e' }}>5 - Rápido</option>
                          <option value={10} style={{ background: '#1a0a2e' }}>10 - Normal</option>
                          <option value={15} style={{ background: '#1a0a2e' }}>15 - Largo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,0,0,0.6)' }}>
                          Puntos Centro
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={dianaForm.pointsCenter}
                          onChange={(e) => setDianaForm({ ...dianaForm, pointsCenter: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff0000' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,165,0,0.6)' }}>
                          Puntos Medio
                        </label>
                        <input type="number" min={5} max={100} step={5}
                          value={dianaForm.pointsMiddle}
                          onChange={(e) => setDianaForm({ ...dianaForm, pointsMiddle: parseInt(e.target.value) || 30 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,165,0,0.2)', color: '#ffa500' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,215,0,0.6)' }}>
                          Puntos Borde
                        </label>
                        <input type="number" min={1} max={50} step={5}
                          value={dianaForm.pointsEdge}
                          onChange={(e) => setDianaForm({ ...dianaForm, pointsEdge: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.2)', color: '#ffd700' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,170,255,0.6)' }}>
                          Velocidad (1-5)
                        </label>
                        <input type="range" min={1} max={5} step={1}
                          value={dianaForm.speed}
                          onChange={(e) => setDianaForm({ ...dianaForm, speed: parseInt(e.target.value) })}
                          className="w-full"
                          style={{ accentColor: '#00aaff' }}
                        />
                        <div className="flex justify-between text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          <span>Lenta</span>
                          <span>Rápida</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setDianaForm({ ...dianaForm, isActive: !dianaForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: dianaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: dianaForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${dianaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: dianaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {dianaForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveDiana}
                      disabled={savingDiana}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #ff6464)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(239,68,68,0.2)',
                      }}
                    >
                      {savingDiana ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Diana Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(239,68,68,0.4)' }}>
                      Vista Previa de Diana
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '2px solid rgba(239,68,68,0.3)' }}>
                        <span className="text-4xl">🎯</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#ef4444', textShadow: '0 0 6px rgba(239,68,68,0.3)' }}>
                          Diana de Escudos
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x1F3AF; {dianaForm.roundsPerGame} rondas | Vel. {dianaForm.speed}</div>
                          <div style={{ color: 'rgba(255,0,0,0.6)' }}>&#x1F534; Centro +{dianaForm.pointsCenter}pts</div>
                          <div style={{ color: 'rgba(255,165,0,0.6)' }}>&#x1F7E0; Medio +{dianaForm.pointsMiddle}pts | Borde +{dianaForm.pointsEdge}pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'clasificacion' ? (
                /* ========== CLASIFICACION TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura la <b style={{ color: '#06b6d4' }}>Clasificación Histórica</b>: equipos por ronda, puntos perfecto/parcial, tiempo límite, bonus y activación. Ordena los equipos por criterios históricos.
                    </p>
                  </div>

                  {clasificacionConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(6,182,212,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(6,182,212,0.5)' }}>Equipos</div>
                        <div className="text-lg font-black" style={{ color: '#06b6d4' }}>{clasificacionConfig.teamsPerRound}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Perfecto</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>+{clasificacionConfig.pointsPerfect}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Parcial</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{clasificacionConfig.pointsPartial}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{clasificacionConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,170,255,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,170,255,0.5)' }}>Bonus</div>
                        <div className="text-lg font-black" style={{ color: '#00aaff' }}>+{clasificacionConfig.timeBonusMax}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: clasificacionConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: clasificacionConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {clasificacionConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(6,182,212,0.6)' }}>
                          Equipos por Ronda
                        </label>
                        <select
                          value={clasificacionForm.teamsPerRound}
                          onChange={(e) => setClasificacionForm({ ...clasificacionForm, teamsPerRound: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4' }}
                        >
                          <option value={4} style={{ background: '#1a0a2e' }}>4 - Fácil</option>
                          <option value={6} style={{ background: '#1a0a2e' }}>6 - Normal</option>
                          <option value={8} style={{ background: '#1a0a2e' }}>8 - Difícil</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Puntos Perfecto
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={clasificacionForm.pointsPerfect}
                          onChange={(e) => setClasificacionForm({ ...clasificacionForm, pointsPerfect: parseInt(e.target.value) || 150 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos Parcial
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={clasificacionForm.pointsPartial}
                          onChange={(e) => setClasificacionForm({ ...clasificacionForm, pointsPartial: parseInt(e.target.value) || 80 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={300} step={10}
                          value={clasificacionForm.timeLimit}
                          onChange={(e) => setClasificacionForm({ ...clasificacionForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,170,255,0.6)' }}>
                          Bonus Máx. por Tiempo
                        </label>
                        <input type="number" min={0} max={200} step={10}
                          value={clasificacionForm.timeBonusMax}
                          onChange={(e) => setClasificacionForm({ ...clasificacionForm, timeBonusMax: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,170,255,0.2)', color: '#00aaff' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setClasificacionForm({ ...clasificacionForm, isActive: !clasificacionForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: clasificacionForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: clasificacionForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${clasificacionForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: clasificacionForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {clasificacionForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveClasificacion}
                      disabled={savingClasificacion}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #00aaff)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(6,182,212,0.2)',
                      }}
                    >
                      {savingClasificacion ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Clasificacion Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(6,182,212,0.4)' }}>
                      Vista Previa de Clasificación
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(6,182,212,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(6,182,212,0.1)', borderRadius: '12px', border: '2px solid rgba(6,182,212,0.3)' }}>
                        <span className="text-4xl">🏆</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#06b6d4', textShadow: '0 0 6px rgba(6,182,212,0.3)' }}>
                          Clasificación Histórica
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(6,182,212,0.6)' }}>&#x1F3C6; {clasificacionForm.teamsPerRound} equipos por ronda</div>
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x2B50; Perfecto +{clasificacionForm.pointsPerfect}pts | Parcial +{clasificacionForm.pointsPartial}pts</div>
                          <div style={{ color: 'rgba(0,170,255,0.6)' }}>&#x26A1; Bonus máx +{clasificacionForm.timeBonusMax}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {clasificacionForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'numero-camiseta' ? (
                /* ========== NUMERO CAMISETA TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura <b style={{ color: '#8b5cf6' }}>Número Camiseta</b>: preguntas por juego, puntos exacto/cercano, multiplicador sin pista, tiempo límite y activación. Adivina el dorsal de jugadores históricos.
                    </p>
                  </div>

                  {numeroCamisetaConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(139,92,246,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(139,92,246,0.5)' }}>Preguntas</div>
                        <div className="text-lg font-black" style={{ color: '#8b5cf6' }}>{numeroCamisetaConfig.questionsPerGame}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Exacto</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>+{numeroCamisetaConfig.pointsExact}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Cercano</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{numeroCamisetaConfig.pointsClose}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,68,68,0.5)' }}>No Pista</div>
                        <div className="text-lg font-black" style={{ color: '#ff4444' }}>x{numeroCamisetaConfig.noHintMultiplier}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{numeroCamisetaConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: numeroCamisetaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: numeroCamisetaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {numeroCamisetaConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(139,92,246,0.6)' }}>
                          Preguntas por Juego
                        </label>
                        <select
                          value={numeroCamisetaForm.questionsPerGame}
                          onChange={(e) => setNumeroCamisetaForm({ ...numeroCamisetaForm, questionsPerGame: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}
                        >
                          <option value={3} style={{ background: '#1a0a2e' }}>3 - Rápido</option>
                          <option value={5} style={{ background: '#1a0a2e' }}>5 - Normal</option>
                          <option value={8} style={{ background: '#1a0a2e' }}>8 - Largo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Puntos Exacto
                        </label>
                        <input type="number" min={10} max={100} step={5}
                          value={numeroCamisetaForm.pointsExact}
                          onChange={(e) => setNumeroCamisetaForm({ ...numeroCamisetaForm, pointsExact: parseInt(e.target.value) || 40 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos Cercano
                        </label>
                        <input type="number" min={5} max={50} step={5}
                          value={numeroCamisetaForm.pointsClose}
                          onChange={(e) => setNumeroCamisetaForm({ ...numeroCamisetaForm, pointsClose: parseInt(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,68,68,0.6)' }}>
                          Multiplicador Sin Pista
                        </label>
                        <input type="number" min={1} max={5} step={0.5}
                          value={numeroCamisetaForm.noHintMultiplier}
                          onChange={(e) => setNumeroCamisetaForm({ ...numeroCamisetaForm, noHintMultiplier: parseFloat(e.target.value) || 2 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={300} step={10}
                          value={numeroCamisetaForm.timeLimit}
                          onChange={(e) => setNumeroCamisetaForm({ ...numeroCamisetaForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setNumeroCamisetaForm({ ...numeroCamisetaForm, isActive: !numeroCamisetaForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: numeroCamisetaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: numeroCamisetaForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${numeroCamisetaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: numeroCamisetaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {numeroCamisetaForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNumeroCamiseta}
                      disabled={savingNumeroCamiseta}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(139,92,246,0.2)',
                      }}
                    >
                      {savingNumeroCamiseta ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Numero Camiseta Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(139,92,246,0.4)' }}>
                      Vista Previa de Número Camiseta
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(139,92,246,0.1)', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.3)' }}>
                        <span className="text-4xl">🔢</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#8b5cf6', textShadow: '0 0 6px rgba(139,92,246,0.3)' }}>
                          Número Camiseta
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(139,92,246,0.6)' }}>&#x1F522; {numeroCamisetaForm.questionsPerGame} preguntas por juego</div>
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x1F3C6; Exacto +{numeroCamisetaForm.pointsExact}pts | Cercano +{numeroCamisetaForm.pointsClose}pts</div>
                          <div style={{ color: 'rgba(255,68,68,0.6)' }}>&#x2B50; Sin pista x{numeroCamisetaForm.noHintMultiplier}</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {numeroCamisetaForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'mineria' ? (
                /* ========== MINERIA TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura la <b style={{ color: '#22c55e' }}>Minería de Escudos</b>: tamaño de grilla, minas, puntos por celda/completar/sin minas y activación. Buscaminas con escudos rivales de la Liga BetPlay.
                    </p>
                  </div>

                  {mineriaConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(34,197,94,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(34,197,94,0.5)' }}>Grilla</div>
                        <div className="text-lg font-black" style={{ color: '#22c55e' }}>{mineriaConfig.gridSize}x{mineriaConfig.gridSize}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Minas</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{mineriaConfig.mineCount}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Celda</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>+{mineriaConfig.pointsPerCell}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Completo</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{mineriaConfig.pointsComplete}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,170,255,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,170,255,0.5)' }}>0 Minas</div>
                        <div className="text-lg font-black" style={{ color: '#00aaff' }}>+{mineriaConfig.pointsNoMines}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: mineriaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: mineriaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {mineriaConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
                          Tamaño de Grilla
                        </label>
                        <select
                          value={mineriaForm.gridSize}
                          onChange={(e) => setMineriaForm({ ...mineriaForm, gridSize: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}
                        >
                          <option value={6} style={{ background: '#1a0a2e' }}>6x6 - Fácil</option>
                          <option value={8} style={{ background: '#1a0a2e' }}>8x8 - Normal</option>
                          <option value={10} style={{ background: '#1a0a2e' }}>10x10 - Difícil</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Cantidad de Minas
                        </label>
                        <input type="number" min={5} max={30} step={1}
                          value={mineriaForm.mineCount}
                          onChange={(e) => setMineriaForm({ ...mineriaForm, mineCount: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Puntos por Celda
                        </label>
                        <input type="number" min={1} max={20} step={1}
                          value={mineriaForm.pointsPerCell}
                          onChange={(e) => setMineriaForm({ ...mineriaForm, pointsPerCell: parseInt(e.target.value) || 5 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos Completar
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={mineriaForm.pointsComplete}
                          onChange={(e) => setMineriaForm({ ...mineriaForm, pointsComplete: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,170,255,0.6)' }}>
                          Puntos Sin Minas
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={mineriaForm.pointsNoMines}
                          onChange={(e) => setMineriaForm({ ...mineriaForm, pointsNoMines: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,170,255,0.2)', color: '#00aaff' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setMineriaForm({ ...mineriaForm, isActive: !mineriaForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: mineriaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: mineriaForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${mineriaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: mineriaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {mineriaForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveMineria}
                      disabled={savingMineria}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(34,197,94,0.2)',
                      }}
                    >
                      {savingMineria ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Mineria Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(34,197,94,0.4)' }}>
                      Vista Previa de Minería
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', border: '2px solid rgba(34,197,94,0.3)' }}>
                        <span className="text-4xl">💣</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#22c55e', textShadow: '0 0 6px rgba(34,197,94,0.3)' }}>
                          Minería de Escudos
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(34,197,94,0.6)' }}>&#x1F4A3; Grilla {mineriaForm.gridSize}x{mineriaForm.gridSize} | {mineriaForm.mineCount} minas</div>
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x1F3C6; Celda +{mineriaForm.pointsPerCell}pts | Completo +{mineriaForm.pointsComplete}pts</div>
                          <div style={{ color: 'rgba(0,170,255,0.6)' }}>&#x2B50; Sin minas +{mineriaForm.pointsNoMines}pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'apuesta' ? (
                /* ========== APUESTA TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura la <b style={{ color: '#f97316' }}>Apuesta Futbolera</b>: partidos por ronda, puntos exacto/ganador/goles, tiempo límite y activación. Predice resultados de partidos de la Liga BetPlay.
                    </p>
                  </div>

                  {apuestaConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(249,115,22,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(249,115,22,0.5)' }}>Partidos</div>
                        <div className="text-lg font-black" style={{ color: '#f97316' }}>{apuestaConfig.matchesPerRound}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Exacto</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>+{apuestaConfig.pointsExact}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Ganador</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{apuestaConfig.pointsWinner}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,170,255,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,170,255,0.5)' }}>Goles</div>
                        <div className="text-lg font-black" style={{ color: '#00aaff' }}>+{apuestaConfig.pointsGoals}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{apuestaConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: apuestaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: apuestaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {apuestaConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(249,115,22,0.6)' }}>
                          Partidos por Ronda
                        </label>
                        <select
                          value={apuestaForm.matchesPerRound}
                          onChange={(e) => setApuestaForm({ ...apuestaForm, matchesPerRound: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316' }}
                        >
                          <option value={2} style={{ background: '#1a0a2e' }}>2 - Rápido</option>
                          <option value={3} style={{ background: '#1a0a2e' }}>3 - Normal</option>
                          <option value={5} style={{ background: '#1a0a2e' }}>5 - Largo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Puntos Exacto
                        </label>
                        <input type="number" min={10} max={200} step={10}
                          value={apuestaForm.pointsExact}
                          onChange={(e) => setApuestaForm({ ...apuestaForm, pointsExact: parseInt(e.target.value) || 60 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos Ganador
                        </label>
                        <input type="number" min={5} max={100} step={5}
                          value={apuestaForm.pointsWinner}
                          onChange={(e) => setApuestaForm({ ...apuestaForm, pointsWinner: parseInt(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,170,255,0.6)' }}>
                          Puntos Goles
                        </label>
                        <input type="number" min={5} max={100} step={5}
                          value={apuestaForm.pointsGoals}
                          onChange={(e) => setApuestaForm({ ...apuestaForm, pointsGoals: parseInt(e.target.value) || 30 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,170,255,0.2)', color: '#00aaff' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={600} step={30}
                          value={apuestaForm.timeLimit}
                          onChange={(e) => setApuestaForm({ ...apuestaForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setApuestaForm({ ...apuestaForm, isActive: !apuestaForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: apuestaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: apuestaForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${apuestaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: apuestaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {apuestaForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveApuesta}
                      disabled={savingApuesta}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #fdba74)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(249,115,22,0.2)',
                      }}
                    >
                      {savingApuesta ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Apuesta Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(249,115,22,0.4)' }}>
                      Vista Previa de Apuesta
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(249,115,22,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(249,115,22,0.1)', borderRadius: '12px', border: '2px solid rgba(249,115,22,0.3)' }}>
                        <span className="text-4xl">📊</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#f97316', textShadow: '0 0 6px rgba(249,115,22,0.3)' }}>
                          Apuesta Futbolera
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(249,115,22,0.6)' }}>&#x26BD; {apuestaForm.matchesPerRound} partidos por ronda</div>
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x1F3C6; Exacto +{apuestaForm.pointsExact}pts | Ganador +{apuestaForm.pointsWinner}pts</div>
                          <div style={{ color: 'rgba(0,170,255,0.6)' }}>&#x2B50; Goles +{apuestaForm.pointsGoals}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {apuestaForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'sopa' ? (
                /* ========== SOPA TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(20,184,166,0.04)', border: '1px solid rgba(20,184,166,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura la <b style={{ color: '#14b8a6' }}>Sopa de Escudos</b>: tamaño de grilla, palabras por juego, puntos por palabra/completar, tiempo límite y activación. Sopa de letras con nombres de la Liga BetPlay.
                    </p>
                  </div>

                  {sopaConfig && (
                    <div className="grid grid-cols-6 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(20,184,166,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(20,184,166,0.5)' }}>Grilla</div>
                        <div className="text-lg font-black" style={{ color: '#14b8a6' }}>{sopaConfig.gridSize}x{sopaConfig.gridSize}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(20,184,166,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(20,184,166,0.5)' }}>Palabras</div>
                        <div className="text-lg font-black" style={{ color: '#14b8a6' }}>{sopaConfig.wordsPerGame}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,255,200,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(0,255,200,0.5)' }}>Palabra</div>
                        <div className="text-lg font-black" style={{ color: '#00ffc8' }}>+{sopaConfig.pointsPerWord}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(234,179,8,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(234,179,8,0.5)' }}>Completo</div>
                        <div className="text-lg font-black" style={{ color: '#eab308' }}>+{sopaConfig.pointsComplete}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>Límite</div>
                        <div className="text-lg font-black" style={{ color: '#ef4444' }}>{sopaConfig.timeLimit || '∞'}</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: sopaConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: sopaConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {sopaConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(20,184,166,0.6)' }}>
                          Tamaño de Grilla
                        </label>
                        <select
                          value={sopaForm.gridSize}
                          onChange={(e) => setSopaForm({ ...sopaForm, gridSize: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(20,184,166,0.2)', color: '#14b8a6' }}
                        >
                          <option value={10} style={{ background: '#1a0a2e' }}>10x10 - Fácil</option>
                          <option value={12} style={{ background: '#1a0a2e' }}>12x12 - Normal</option>
                          <option value={14} style={{ background: '#1a0a2e' }}>14x14 - Difícil</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(20,184,166,0.6)' }}>
                          Palabras por Juego
                        </label>
                        <input type="number" min={3} max={15} step={1}
                          value={sopaForm.wordsPerGame}
                          onChange={(e) => setSopaForm({ ...sopaForm, wordsPerGame: parseInt(e.target.value) || 8 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(20,184,166,0.2)', color: '#14b8a6' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(0,255,200,0.6)' }}>
                          Puntos por Palabra
                        </label>
                        <input type="number" min={5} max={50} step={5}
                          value={sopaForm.pointsPerWord}
                          onChange={(e) => setSopaForm({ ...sopaForm, pointsPerWord: parseInt(e.target.value) || 15 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8' }}
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(234,179,8,0.6)' }}>
                          Puntos Completar
                        </label>
                        <input type="number" min={50} max={500} step={25}
                          value={sopaForm.pointsComplete}
                          onChange={(e) => setSopaForm({ ...sopaForm, pointsComplete: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          Tiempo Límite (segundos)
                        </label>
                        <input type="number" min={0} max={600} step={30}
                          value={sopaForm.timeLimit}
                          onChange={(e) => setSopaForm({ ...sopaForm, timeLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg text-sm font-bold"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                        />
                        <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>0 = sin límite de tiempo</p>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Estado del Juego
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el juego del sitio
                        </p>
                        <button
                          onClick={() => setSopaForm({ ...sopaForm, isActive: !sopaForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: sopaForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: sopaForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${sopaForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            boxShadow: sopaForm.isActive ? '0 0 8px rgba(34,197,94,0.1)' : '0 0 8px rgba(239,68,68,0.1)',
                          }}
                        >
                          {sopaForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSopa}
                      disabled={savingSopa}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)',
                        color: '#000',
                        boxShadow: '0 0 12px rgba(20,184,166,0.2)',
                      }}
                    >
                      {savingSopa ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Sopa Preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(20,184,166,0.4)' }}>
                      Vista Previa de Sopa de Escudos
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(20,184,166,0.1)' }}>
                      <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'rgba(20,184,166,0.1)', borderRadius: '12px', border: '2px solid rgba(20,184,166,0.3)' }}>
                        <span className="text-4xl">🔤</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase" style={{ color: '#14b8a6', textShadow: '0 0 6px rgba(20,184,166,0.3)' }}>
                          Sopa de Escudos
                        </div>
                        <div className="space-y-1 text-[0.55rem]">
                          <div style={{ color: 'rgba(20,184,166,0.6)' }}>&#x1F524; Grilla {sopaForm.gridSize}x{sopaForm.gridSize} | {sopaForm.wordsPerGame} palabras</div>
                          <div style={{ color: 'rgba(0,255,200,0.6)' }}>&#x1F3C6; Palabra +{sopaForm.pointsPerWord}pts | Completo +{sopaForm.pointsComplete}pts</div>
                          <div style={{ color: 'rgba(239,68,68,0.6)' }}>&#x23F1; Límite {sopaForm.timeLimit || '∞'}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'audio' ? (
                /* ========== AUDIO TAB ========== */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <p className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Configura el <b style={{ color: '#d8b4fe' }}>Reproductor de Audio</b> de TPK PLAY. El audio se reproduce en loop infinito mientras el usuario navega el sitio. Ajusta volumen, nombre y activación.
                    </p>
                  </div>

                  {audioConfig && (
                    <div className="grid grid-cols-5 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(168,85,247,0.5)' }}>Volumen</div>
                        <div className="text-lg font-black" style={{ color: '#a855f7' }}>{audioConfig.volume}%</div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(249,115,22,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(249,115,22,0.5)' }}>AutoPlay</div>
                        <div className="text-lg font-black" style={{ color: audioConfig.autoPlay ? '#4ade80' : '#ef4444' }}>
                          {audioConfig.autoPlay ? 'Sí' : 'No'}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: audioConfig.isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Estado</div>
                        <div className="text-lg font-black" style={{ color: audioConfig.isActive ? '#4ade80' : '#ef4444' }}>
                          {audioConfig.isActive ? '●' : '○'}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg text-center col-span-2" style={{ background: 'rgba(250,204,21,0.06)' }}>
                        <div className="text-[0.5rem] uppercase" style={{ color: 'rgba(250,204,21,0.5)' }}>Nombre</div>
                        <div className="text-sm font-black truncate" style={{ color: '#facc15' }}>{audioConfig.label}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(168,85,247,0.6)' }}>
                        Nombre del Audio
                      </label>
                      <input type="text"
                        value={audioForm.label}
                        onChange={(e) => setAudioForm({ ...audioForm, label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(168,85,247,0.2)', color: '#d8b4fe' }}
                        placeholder="Te Pe Ka Fans Club"
                      />
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(249,115,22,0.6)' }}>
                        URL del Archivo de Audio
                      </label>
                      <input type="text"
                        value={audioForm.audioUrl}
                        onChange={(e) => setAudioForm({ ...audioForm, audioUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(249,115,22,0.2)', color: '#fdba74' }}
                        placeholder="/tpk-anthem.mp3"
                      />
                      <p className="text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Ruta relativa al archivo en /public. Ej: /tpk-anthem.mp3
                      </p>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(168,85,247,0.6)' }}>
                        Volumen Inicial ({audioForm.volume}%)
                      </label>
                      <input type="range" min={0} max={100} step={5}
                        value={audioForm.volume}
                        onChange={(e) => setAudioForm({ ...audioForm, volume: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>Silencio</span>
                        <span className="text-[0.45rem] font-bold" style={{ color: '#a855f7' }}>{audioForm.volume}%</span>
                        <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>Máximo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
                          Auto-Reproducir
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Iniciar audio automáticamente al interactuar con el sitio
                        </p>
                        <button
                          onClick={() => setAudioForm({ ...audioForm, autoPlay: !audioForm.autoPlay })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: audioForm.autoPlay ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: audioForm.autoPlay ? '#4ade80' : '#ef4444',
                            border: `1px solid ${audioForm.autoPlay ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }}
                        >
                          {audioForm.autoPlay ? '● Activado' : '○ Desactivado'}
                        </button>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Audio Activo
                        </label>
                        <p className="text-[0.5rem] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Desactiva para ocultar el reproductor del sitio
                        </p>
                        <button
                          onClick={() => setAudioForm({ ...audioForm, isActive: !audioForm.isActive })}
                          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{
                            background: audioForm.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: audioForm.isActive ? '#4ade80' : '#ef4444',
                            border: `1px solid ${audioForm.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }}
                        >
                          {audioForm.isActive ? '● Activo' : '○ Inactivo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveAudio}
                      disabled={savingAudio}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #f97316)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(168,85,247,0.2)',
                      }}
                    >
                      {savingAudio ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                  </div>

                  {/* Audio preview */}
                  <div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(168,85,247,0.4)' }}>
                      Vista Previa del Reproductor
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(168,85,247,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #a855f7, #f97316)',
                            boxShadow: '0 0 15px rgba(168,85,247,0.3)',
                          }}
                        >
                          <span className="text-xl">🎵</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate" style={{ color: '#d8b4fe' }}>
                            {audioForm.label || 'Te Pe Ka Fans Club'}
                          </div>
                          <div className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            TPK PLAY Soundtrack
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-end gap-[1px] h-3">
                              {[0,1,2,3,4].map(i => (
                                <div key={i} className="w-[2px] rounded-full" style={{
                                  height: `${4 + i * 2}px`,
                                  background: 'linear-gradient(to top, #a855f7, #f97316)',
                                }} />
                              ))}
                            </div>
                            <span className="text-[0.45rem]" style={{ color: 'rgba(168,85,247,0.5)' }}>Loop infinito</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="2">
                            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(168,85,247,0.3)" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                          <span className="text-[0.45rem] font-bold" style={{ color: 'rgba(168,85,247,0.6)' }}>{audioForm.volume}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========== STATS TAB ========== */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                    >
                      <div className="text-2xl font-black" style={{ color: '#d8b4fe', textShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}>
                        {totalParticipants}
                      </div>
                      <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Participantes
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}
                    >
                      <div className="text-2xl font-black" style={{ color: '#fde047', textShadow: '0 0 10px rgba(234, 179, 8, 0.4)' }}>
                        {totalPoints.toLocaleString()}
                      </div>
                      <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Puntos Totales
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                    >
                      <div className="text-2xl font-black" style={{ color: '#4ade80', textShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}>
                        {activeGames}/{totalGames}
                      </div>
                      <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Juegos Activos
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)' }}
                    >
                      <div className="text-2xl font-black" style={{ color: '#fdba74', textShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }}>
                        {totalParticipants > 0 ? Math.round(totalPoints / totalParticipants) : 0}
                      </div>
                      <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Prom. Puntos
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#d8b4fe' }}>
                      Juegos por Tipo
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(GAME_TYPES).map(([typeKey, typeInfo]) => {
                        const typeGames = games.filter(g => g.type === typeKey)
                        const typeParticipants = typeGames.reduce((sum, g) => sum + (g._count?.participants || 0), 0)
                        return (
                          <div
                            key={typeKey}
                            className="p-3 rounded-xl flex items-center justify-between"
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${typeInfo.color}20` }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{typeInfo.icon}</span>
                              <div>
                                <span className="text-sm font-bold" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                                <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{typeInfo.description}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {typeGames.length} juego{typeGames.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs" style={{ color: `${typeInfo.color}80` }}>
                                👥 {typeParticipants}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {participants.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#fde047' }}>
                        Top 5 Participantes
                      </h3>
                      <div className="space-y-2">
                        {[...participants]
                          .sort((a, b) => b.totalPoints - a.totalPoints)
                          .slice(0, 5)
                          .map((p, i) => (
                            <div
                              key={p.id}
                              className="p-3 rounded-xl flex items-center justify-between"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                                  style={{
                                    background: i === 0 ? 'rgba(234, 179, 8, 0.3)' : i === 1 ? 'rgba(192, 192, 192, 0.2)' : i === 2 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: i === 0 ? '#fde047' : i === 1 ? '#d1d5db' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.4)',
                                    border: `1px solid ${i === 0 ? 'rgba(234, 179, 8, 0.4)' : i === 1 ? 'rgba(192, 192, 192, 0.3)' : i === 2 ? 'rgba(205, 127, 50, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <div>
                                  <span className="text-sm font-bold" style={{ color: '#fed7aa' }}>{p.name}</span>
                                  <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.code}</span>
                                </div>
                              </div>
                              <span className="text-sm font-bold" style={{ color: '#fde047' }}>
                                ⭐ {p.totalPoints} pts
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {participants.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#4ade80' }}>
                        Seguimiento Redes Sociales
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Facebook', key: 'followedFb' as const, color: '#3b82f6' },
                          { label: 'Instagram', key: 'followedIg' as const, color: '#ec4899' },
                          { label: 'WhatsApp', key: 'followedWa' as const, color: '#22c55e' },
                        ].map((social) => {
                          const count = participants.filter(p => p[social.key]).length
                          const pct = Math.round((count / totalParticipants) * 100)
                          return (
                            <div
                              key={social.key}
                              className="p-3 rounded-xl text-center"
                              style={{ background: `${social.color}08`, border: `1px solid ${social.color}20` }}
                            >
                              <div className="text-lg font-black" style={{ color: social.color }}>
                                {count}
                              </div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {social.label}
                              </div>
                              <div className="mt-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', height: '4px' }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, background: social.color, boxShadow: `0 0 6px ${social.color}60` }}
                                />
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Form Modal */}
      {showGameForm && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowGameForm(false); setEditingGame(null) } }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
            }}
          >
            {/* Form Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
              <h3 className="text-sm font-bold" style={{ color: '#d8b4fe' }}>
                {editingGame ? 'Editar Juego' : 'Nuevo Juego'}
              </h3>
              <button
                onClick={() => { setShowGameForm(false); setEditingGame(null) }}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#d8b4fe' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={gameForm.name}
                  onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                  placeholder="Nombre del juego"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#fdba74' }}>
                  Tipo de Juego
                </label>
                <select
                  value={gameForm.type}
                  onChange={(e) => setGameForm({ ...gameForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(249, 115, 22, 0.3)' }}
                >
                  {GAME_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: '#1a0a2e' }}>
                      {GAME_TYPES[opt.value].icon} {opt.label}
                    </option>
                  ))}
                </select>
                {gameForm.type && GAME_TYPES[gameForm.type] && (
                  <p className="text-xs mt-1" style={{ color: `${GAME_TYPES[gameForm.type].color}80` }}>
                    {GAME_TYPES[gameForm.type].description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#4ade80' }}>
                  Descripción
                </label>
                <textarea
                  value={gameForm.description}
                  onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                  placeholder="Descripción del juego (opcional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none resize-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#d8b4fe' }}>
                  URL de Imagen
                </label>
                <input
                  type="text"
                  value={gameForm.imageUrl}
                  onChange={(e) => setGameForm({ ...gameForm, imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#fde047' }}>
                    Orden
                  </label>
                  <input
                    type="number"
                    value={gameForm.order}
                    onChange={(e) => setGameForm({ ...gameForm, order: parseInt(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: gameForm.isActive ? '#4ade80' : '#ef4444' }}>
                    Estado
                  </label>
                  <button
                    type="button"
                    onClick={() => setGameForm({ ...gameForm, isActive: !gameForm.isActive })}
                    className="w-full px-3 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all"
                    style={{
                      background: gameForm.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: gameForm.isActive ? '#4ade80' : '#ef4444',
                      border: `1px solid ${gameForm.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}
                  >
                    {gameForm.isActive ? '● Activo' : '○ Inactivo'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#fdba74' }}>
                  Configuración (JSON)
                </label>
                <textarea
                  value={gameForm.config}
                  onChange={(e) => setGameForm({ ...gameForm, config: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono text-white placeholder-gray-500 outline-none resize-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(249, 115, 22, 0.3)' }}
                />
                {gameForm.config && (() => {
                  try {
                    JSON.parse(gameForm.config)
                    return <p className="text-xs mt-1" style={{ color: '#4ade80' }}>✓ JSON válido</p>
                  } catch {
                    return <p className="text-xs mt-1" style={{ color: '#ef4444' }}>✗ JSON inválido</p>
                  }
                })()}
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-4 flex gap-2 border-t" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
              <button
                onClick={handleSaveGame}
                disabled={savingGame || !gameForm.name.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: 'white',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                }}
              >
                {savingGame ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                    Guardando...
                  </span>
                ) : (
                  editingGame ? 'Guardar Cambios' : 'Crear Juego'
                )}
              </button>
              <button
                onClick={() => { setShowGameForm(false); setEditingGame(null) }}
                className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Preview Modal */}
      {previewGame && (
        <GamePreviewModal
          game={previewGame}
          onClose={() => setPreviewGame(null)}
        />
      )}
    </>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
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
  isActive: boolean
  color: string
  size: number
  position: string
  createdAt: string
  updatedAt: string
}

type Tab = 'games' | 'participants' | 'stats' | 'popup'

const SESSION_KEY = 'tpk_admin_token'

const GAME_TYPES: Record<string, { label: string; icon: string; color: string; description: string }> = {
  'trivia-futbolera': { label: 'Trivia Futbolera', icon: '⚽', color: '#a855f7', description: 'Pregunta por hora sobre la Liga BetPlay' },
  'trivia-relampago': { label: 'Trivia Relámpago', icon: '⚡', color: '#eab308', description: '5 preguntas en 60 segundos' },
  'prediccion': { label: 'Predicción', icon: '🎯', color: '#f97316', description: 'Predice resultados de partidos' },
  'encuesta': { label: 'Encuesta', icon: '📊', color: '#3b82f6', description: 'Vota en encuestas futboleras' },
  'personalizado': { label: 'Personalizado', icon: '🎮', color: '#22c55e', description: 'Juego personalizado' },
}

const GAME_TYPE_OPTIONS = Object.entries(GAME_TYPES).map(([value, { label }]) => ({ value, label }))

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
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [games, setGames] = useState<Game[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)

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
  const [popupForm, setPopupForm] = useState({ text: 'TPK NUEVO', linkUrl: '#', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
  const [editingPopup, setEditingPopup] = useState<PopupConfig | null>(null)
  const [savingPopup, setSavingPopup] = useState(false)

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

  useEffect(() => {
    if (isAuthenticated && showPanel) {
      const load = async () => {
        setLoading(true)
        await Promise.all([fetchGames(), fetchParticipants(), fetchPopups()])
        setLoading(false)
      }
      load()
    }
  }, [isAuthenticated, showPanel, fetchGames, fetchParticipants, fetchPopups])

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
        // Update
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
        // Create
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
    const lines = participants.map(p =>
      `${p.code} | ${p.name} | ${p.email} | ${p.phone} | ${p.game?.name || 'N/A'}`
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
      if (editingPopup) {
        await fetch('/api/popup', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPopup.id, ...popupForm }),
        })
      } else {
        await fetch('/api/popup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(popupForm),
        })
      }
      setEditingPopup(null)
      setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
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

  // Stats calculations
  const totalParticipants = participants.length
  const totalPoints = participants.reduce((sum, p) => sum + p.totalPoints, 0)
  const activeGames = games.filter(g => g.isActive).length
  const totalGames = games.length

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <div
          className="w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.2), 0 0 60px rgba(249, 115, 22, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #f97316)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#d8b4fe', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}>
                  TPK PLAY Admin
                </h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
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

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
            {[
              { key: 'games' as Tab, label: 'Juegos', count: games.length, color: '#a855f7' },
              { key: 'participants' as Tab, label: 'Participantes', count: participants.length, color: '#f97316' },
              { key: 'stats' as Tab, label: 'Estadísticas', count: null, color: '#22c55e' },
              { key: 'popup' as Tab, label: 'Popup', count: popups.length, color: '#eab308' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.4)',
                  borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                  textShadow: activeTab === tab.key ? `0 0 10px ${tab.color}80` : 'none',
                }}
              >
                {tab.label} {tab.count !== null ? `(${tab.count})` : ''}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
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
                                {/* Type badge */}
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"
                                  style={{ background: `${gameType.color}20`, color: gameType.color, border: `1px solid ${gameType.color}40` }}
                                >
                                  <span>{gameType.icon}</span>
                                  {gameType.label}
                                </span>
                                {/* Active/Inactive badge */}
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
                              {/* Preview */}
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
                              {/* Edit */}
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
                              {/* Toggle active */}
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
                              {/* Delete */}
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
                {/* Send all to WhatsApp */}
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
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                            >
                              {p.code}
                            </span>
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
                {/* Add popup button */}
                <button
                  onClick={() => {
                    setEditingPopup(null)
                    setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
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

                {/* Popup Form */}
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
                          setPopupForm({ text: 'TPK NUEVO', linkUrl: '#', isActive: true, color: '#f97316', size: 120, position: 'bottom-left' })
                        }}
                        className="text-xs cursor-pointer"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Text */}
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
                      {/* URL */}
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
                      {/* Color */}
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
                      {/* Position */}
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
                      {/* Size */}
                      <div className="sm:col-span-2">
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
                      {/* Active toggle */}
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
                      <div
                        className="rounded-full flex items-center justify-center relative overflow-hidden"
                        style={{
                          width: Math.min(popupForm.size, 100),
                          height: Math.min(popupForm.size, 100),
                          background: `radial-gradient(circle at 35% 35%, ${popupForm.color}40, ${popupForm.color}15 50%, rgba(0,0,0,0.9) 80%)`,
                          border: `2px solid ${popupForm.color}`,
                          boxShadow: `0 0 15px ${popupForm.color}60, 0 0 30px ${popupForm.color}30`,
                          animation: 'pulse-glow 2s ease-in-out infinite',
                        }}
                      >
                        <span className="text-xs font-black uppercase" style={{ color: popupForm.color, textShadow: `0 0 6px ${popupForm.color}80` }}>
                          {popupForm.text.substring(0, 6)}
                        </span>
                      </div>
                    </div>

                    {/* Save button */}
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

                {/* Existing popups list */}
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
                      {/* Mini circle preview */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle, ${popup.color}40, ${popup.color}10)`,
                          border: `1px solid ${popup.color}`,
                          boxShadow: `0 0 8px ${popup.color}40`,
                        }}
                      >
                        <span className="text-[0.5rem] font-black uppercase" style={{ color: popup.color }}>
                          {popup.text.substring(0, 3)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm" style={{ color: popup.isActive ? '#fef3c7' : 'rgba(255,255,255,0.4)' }}>
                          {popup.text}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {popup.linkUrl} | {popup.size}px | {popup.position}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
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

                      {/* Actions */}
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
            ) : (
              /* ========== STATS TAB ========== */
              <div className="space-y-4">
                {/* Stats cards */}
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

                {/* Games breakdown */}
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

                {/* Top participants */}
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

                {/* Social follow stats */}
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
              {/* Name */}
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

              {/* Type */}
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

              {/* Description */}
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

              {/* Image URL */}
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

              {/* Order + Active */}
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

              {/* Config JSON */}
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

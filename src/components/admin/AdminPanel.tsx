'use client'

import { useState, useEffect, useCallback } from 'react'

interface Game {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  _count?: { participants: number }
}

interface Participant {
  id: string
  name: string
  email: string
  phone: string
  code: string
  followedFb: boolean
  followedIg: boolean
  followedWa: boolean
  gameId: string | null
  game: Game | null
  createdAt: string
}

type Tab = 'games' | 'participants'

const SESSION_KEY = 'tpk_admin_token'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [games, setGames] = useState<Game[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddGame, setShowAddGame] = useState(false)
  const [newGame, setNewGame] = useState({ name: '', description: '' })
  const [showPanel, setShowPanel] = useState(false)

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

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/games')
      const data = await res.json()
      setGames(data)
    } catch (err) {
      console.error('Error fetching games:', err)
    }
  }, [])

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/participants')
      const data = await res.json()
      setParticipants(data)
    } catch (err) {
      console.error('Error fetching participants:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && showPanel) {
      const load = async () => {
        setLoading(true)
        await Promise.all([fetchGames(), fetchParticipants()])
        setLoading(false)
      }
      load()
    }
  }, [isAuthenticated, showPanel, fetchGames, fetchParticipants])

  const handleAddGame = async () => {
    if (!newGame.name.trim()) return
    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame),
      })
      setNewGame({ name: '', description: '' })
      setShowAddGame(false)
      fetchGames()
    } catch (err) {
      console.error('Error adding game:', err)
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
    if (!confirm('¿Eliminar este juego y todos sus participantes?')) return
    try {
      await fetch(`/api/games?id=${id}`, { method: 'DELETE' })
      fetchGames()
      fetchParticipants()
    } catch (err) {
      console.error('Error deleting game:', err)
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
          <button
            onClick={() => setActiveTab('games')}
            className="flex-1 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
            style={{
              color: activeTab === 'games' ? '#a855f7' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === 'games' ? '2px solid #a855f7' : '2px solid transparent',
              textShadow: activeTab === 'games' ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none',
            }}
          >
            Juegos ({games.length})
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className="flex-1 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
            style={{
              color: activeTab === 'participants' ? '#f97316' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === 'participants' ? '2px solid #f97316' : '2px solid transparent',
              textShadow: activeTab === 'participants' ? '0 0 10px rgba(249, 115, 22, 0.5)' : 'none',
            }}
          >
            Participantes ({participants.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
            </div>
          ) : activeTab === 'games' ? (
            <div className="space-y-3">
              {/* Add game button */}
              <button
                onClick={() => setShowAddGame(!showAddGame)}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  border: '1px dashed rgba(168, 85, 247, 0.4)',
                  color: '#d8b4fe',
                  background: 'rgba(168, 85, 247, 0.05)',
                }}
              >
                + Agregar Juego
              </button>

              {showAddGame && (
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <input
                    type="text"
                    placeholder="Nombre del juego"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={newGame.description}
                    onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddGame}
                      className="flex-1 py-2 rounded-lg text-sm font-bold cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white' }}
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => setShowAddGame(false)}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {games.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No hay juegos registrados. Agrega el primero.
                </div>
              ) : (
                games.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-xl flex items-center justify-between transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${game.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: game.isActive ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                        {game.name}
                      </div>
                      {game.description && (
                        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{game.description}</div>
                      )}
                      <div className="text-xs mt-1" style={{ color: 'rgba(168, 85, 247, 0.6)' }}>
                        {game._count?.participants || 0} participantes
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleGame(game)}
                        className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                        style={{
                          background: game.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                          color: game.isActive ? '#4ade80' : '#f97316',
                          border: `1px solid ${game.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
                        }}
                      >
                        {game.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="px-2 py-1 rounded-lg text-xs cursor-pointer"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}

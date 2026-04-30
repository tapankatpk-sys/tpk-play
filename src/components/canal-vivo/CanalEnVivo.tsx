'use client'

import { useState, useEffect, useRef } from 'react'

interface CanalVivoConfig {
  id: string
  primarySource: string // 'winplay' | 'youtube'
  winplayEmail: string
  winplayPassword: string
  winplayUrl: string
  youtubeChannelId: string
  youtubeVideoId: string
  streamTitle: string
  streamSubtitle: string
  altStreamUrl: string
  altStreamLabel: string
  showChat: boolean
  showSchedule: boolean
  autoPlay: boolean
  alwaysActive: boolean
  isActive: boolean
}

const UPCOMING_MATCHES = [
  { home: 'millonarios', away: 'atletico-nacional', date: '2026-05-03', time: '18:00', venue: 'El Campín' },
  { home: 'america-de-cali', away: 'deportivo-cali', date: '2026-05-04', time: '20:00', venue: 'Pascual Guerrero' },
  { home: 'independiente-santa-fe', away: 'atletico-junior', date: '2026-05-05', time: '19:00', venue: 'El Campín' },
  { home: 'deportes-tolima', away: 'deportivo-pereira', date: '2026-05-06', time: '18:30', venue: 'Manuel Murillo Toro' },
  { home: 'once-caldas', away: 'independiente-medellin', date: '2026-05-07', time: '20:00', venue: 'Palogrande' },
]

const TEAM_NAMES: Record<string, string> = {
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

const PNG_ONLY = ['internacional-de-bogota']
function getTeamImage(slug: string) {
  const ext = PNG_ONLY.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

export default function CanalEnVivo() {
  const [config, setConfig] = useState<CanalVivoConfig | null>(null)
  const [isLive, setIsLive] = useState(true) // always active by default
  const [activeTab, setActiveTab] = useState<'winplay' | 'youtube' | 'schedule'>('winplay')
  const [pulseDot, setPulseDot] = useState(true)
  const [winplayLoaded, setWinplayLoaded] = useState(false)
  const [showLoginOverlay, setShowLoginOverlay] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/canal-vivo')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
            setLoginEmail(data.winplayEmail || '')
            setLoginPassword(data.winplayPassword || '')
            // Set primary source tab
            if (data.primarySource === 'youtube') {
              setActiveTab('youtube')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching canal vivo config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Pulse animation for live dot
  useEffect(() => {
    const interval = setInterval(() => setPulseDot(p => !p), 1000)
    return () => clearInterval(interval)
  }, [])

  // Always active logic
  useEffect(() => {
    if (config?.alwaysActive) {
      setIsLive(true)
    }
  }, [config?.alwaysActive])

  if (!config) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl p-8 text-center border animate-pulse" style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
          borderColor: 'rgba(239, 68, 68, 0.2)', minHeight: '300px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="text-2xl" style={{ color: 'rgba(239,68,68,0.3)' }}>Cargando Canal en Vivo...</div>
        </div>
      </div>
    )
  }

  // YouTube embed URLs
  const getYoutubeEmbedUrl = () => {
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/embed/${config.youtubeVideoId}?autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
    }
    return `https://www.youtube.com/embed/live_stream?channel=${config.youtubeChannelId}&autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
  }

  const getYoutubeChatUrl = () => {
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/live_chat?v=${config.youtubeVideoId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'tpkplay.vercel.app'}`
    }
    return `https://www.youtube.com/live_chat?channel=${config.youtubeChannelId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'tpkplay.vercel.app'}`
  }

  // Handle Win Play login via postMessage to iframe
  const handleWinPlayLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginMessage('Ingresa email y contraseña de Win Play')
      return
    }
    // Try to inject login into the iframe
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'winplay-login',
          email: loginEmail,
          password: loginPassword,
        }, '*')
        setLoginMessage('Credenciales enviadas. Si Win Play permite el acceso, se iniciará sesión automáticamente.')
      } catch {
        setLoginMessage('No se pudo comunicar con Win Play. Intenta hacer clic en "Ingresar" dentro del reproductor.')
      }
    }
    setShowLoginOverlay(false)
    // Save credentials to backend
    fetch('/api/canal-vivo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: config.id,
        winplayEmail: loginEmail,
        winplayPassword: loginPassword,
      }),
    }).catch(() => {})
  }

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-4">
      {/* Main Container */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(145deg, #0a0015 0%, #1a0020 30%, #0d0a20 60%, #0a0015 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.1), 0 0 80px rgba(168, 85, 247, 0.05), inset 0 1px 0 rgba(239, 68, 68, 0.1)',
      }}>
        {/* Header Bar */}
        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2" style={{
          background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(239,68,68,0.15) 100%)',
          borderBottom: '1px solid rgba(239,68,68,0.15)',
        }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
              background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
              border: `1px solid ${isLive ? 'rgba(239,68,68,0.4)' : 'rgba(107,114,128,0.3)'}`,
            }}>
              <div className="w-2 h-2 rounded-full" style={{
                background: isLive ? '#ef4444' : '#6b7280',
                boxShadow: isLive && pulseDot ? '0 0 8px #ef4444' : 'none',
                transition: 'box-shadow 0.3s',
              }} />
              <span className="text-[0.6rem] font-black uppercase tracking-wider" style={{ color: isLive ? '#ef4444' : '#6b7280' }}>
                {isLive ? 'EN VIVO' : 'OFFLINE'}
              </span>
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black uppercase tracking-wide" style={{
                background: 'linear-gradient(90deg, #ef4444, #f97316, #fbbf24)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {config.streamTitle}
              </h3>
              <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.35)' }}>{config.streamSubtitle}</p>
            </div>
          </div>

          {/* Win Play Login Button */}
          {activeTab === 'winplay' && (
            <button
              onClick={() => setShowLoginOverlay(!showLoginOverlay)}
              className="px-3 py-1.5 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
              style={{
                background: config.winplayEmail ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${config.winplayEmail ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: config.winplayEmail ? '#4ade80' : '#fca5a5',
              }}
            >
              {config.winplayEmail ? '● Suscripción Activa' : '○ Ingresar Suscripción'}
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
          {[
            { id: 'winplay' as const, label: 'Win Play', icon: '📺', color: '#4ade80' },
            { id: 'youtube' as const, label: 'YouTube Live', icon: '🔴', color: '#ff0000' },
            { id: 'schedule' as const, label: 'Programación', icon: '📅', color: '#fbbf24' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-3 py-2 text-center transition-all cursor-pointer"
              style={{
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              }}>
              <span className="text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-wider"
                style={{ color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.3)' }}>
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Win Play Tab - PRIMARY */}
          {activeTab === 'winplay' && (
            <div className="relative">
              {/* Win Play Iframe - Full embed */}
              <div className="relative w-full" style={{ minHeight: '500px' }}>
                <iframe
                  ref={iframeRef}
                  src={config.winplayUrl || 'https://winplay.co'}
                  className="w-full rounded-none"
                  style={{
                    height: '600px',
                    border: 'none',
                    background: '#000',
                  }}
                  onLoad={() => setWinplayLoaded(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                  title="Win Play - Liga BetPlay en Vivo"
                />
              </div>

              {/* Login Overlay */}
              {showLoginOverlay && (
                <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
                  <div className="w-full max-w-sm mx-4 p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    boxShadow: '0 0 40px rgba(34,197,94,0.15)',
                  }}>
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        boxShadow: '0 0 20px rgba(34,197,94,0.3)',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h3 className="text-base font-black" style={{ color: '#4ade80' }}>Suscripción Win Play</h3>
                      <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Ingresa tus credenciales de Win Play para acceder a la señal en vivo
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
                          Email de Win Play
                        </label>
                        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
                          Contraseña
                        </label>
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
                          placeholder="Tu contraseña"
                        />
                      </div>

                      {loginMessage && (
                        <p className="text-[0.55rem] p-2 rounded-lg" style={{
                          background: 'rgba(34,197,94,0.08)', color: 'rgba(34,197,94,0.7)',
                          border: '1px solid rgba(34,197,94,0.15)',
                        }}>
                          {loginMessage}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button onClick={handleWinPlayLogin}
                          className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
                          Guardar y Conectar
                        </button>
                        <button onClick={() => setShowLoginOverlay(false)}
                          className="px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                          Cancelar
                        </button>
                      </div>

                      <div className="text-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          Si no tienes suscripción, puedes usar la pestaña YouTube Live para ver contenido gratuito,
                          o adquirir Win Play en{' '}
                          <a href="https://winplay.co/precios" target="_blank" rel="noopener noreferrer"
                            className="underline" style={{ color: 'rgba(34,197,94,0.4)' }}>
                            winplay.co/precios
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info bar below iframe */}
              <div className="px-4 py-2 flex items-center justify-between" style={{
                background: 'rgba(0,0,0,0.4)',
                borderTop: '1px solid rgba(34,197,94,0.1)',
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.winplayEmail ? '#4ade80' : '#ef4444' }} />
                  <span className="text-[0.5rem]" style={{ color: config.winplayEmail ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)' }}>
                    {config.winplayEmail ? `Conectado: ${config.winplayEmail}` : 'Sin suscripción - Usando vista gratuita'}
                  </span>
                </div>
                <a href="https://winplay.co" target="_blank" rel="noopener noreferrer"
                  className="text-[0.45rem] underline" style={{ color: 'rgba(34,197,94,0.3)' }}>
                  Abrir Win Play en nueva pestaña
                </a>
              </div>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-3 p-3 md:p-4">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={getYoutubeEmbedUrl()}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  style={{ border: '1px solid rgba(239,68,68,0.15)', background: '#000' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="Win Sports YouTube Live"
                />
              </div>

              {/* YouTube Chat */}
              {config.showChat && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                          background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 0 12px rgba(239,68,68,0.3)',
                        }}>
                          <span className="text-sm">📺</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>Win Sports YouTube</div>
                          <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Señal alternativa gratuita</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.1)', height: '250px' }}>
                      <iframe src={getYoutubeChatUrl()} className="w-full h-full" style={{ background: '#0a0a0a' }} title="Chat YouTube" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && config.showSchedule && (
            <div className="space-y-3 p-3 md:p-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Próximos partidos de la <b style={{ color: '#fca5a5' }}>Liga BetPlay Dimayor 2026-1</b>. La señal se activa 15 minutos antes de cada partido.
                </p>
              </div>

              {UPCOMING_MATCHES.map((match, idx) => (
                <div key={idx} className="p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.08)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <img src={getTeamImage(match.home)} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <div>
                        <div className="text-[0.65rem] md:text-xs font-bold" style={{ color: '#fca5a5' }}>
                          {TEAM_NAMES[match.home] || match.home}
                        </div>
                        <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Local</div>
                      </div>
                    </div>
                    <div className="text-center px-2 md:px-4">
                      <div className="text-[0.45rem] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(239,68,68,0.5)' }}>{match.date}</div>
                      <div className="text-sm md:text-lg font-black px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fbbf24' }}>VS</div>
                      <div className="text-[0.45rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{match.time} | {match.venue}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-[0.65rem] md:text-xs font-bold" style={{ color: '#93c5fd' }}>
                          {TEAM_NAMES[match.away] || match.away}
                        </div>
                        <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Visitante</div>
                      </div>
                      <img src={getTeamImage(match.away)} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-2">
                <a href="https://www.winsports.co/programacion" target="_blank" rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg text-[0.6rem] font-bold transition-all hover:scale-105"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  Ver programación completa en Win Sports
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between" style={{
          background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(239,68,68,0.08)',
        }}>
          <div className="flex items-center gap-2">
            <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Powered by Win Play + Win Sports
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://winplay.co" target="_blank" rel="noopener noreferrer"
              className="text-[0.45rem] underline" style={{ color: 'rgba(34,197,94,0.4)' }}>WinPlay.co</a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="https://www.winsports.co" target="_blank" rel="noopener noreferrer"
              className="text-[0.45rem] underline" style={{ color: 'rgba(239,68,68,0.4)' }}>WinSports.co</a>
          </div>
        </div>
      </div>
    </div>
  )
}

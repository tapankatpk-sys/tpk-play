'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CanalVivoConfig {
  id: string
  primarySource: string // 'winplay' | 'winplus' | 'youtube'
  // Win Play
  winplayEmail: string
  winplayPassword: string
  winplayUrl: string
  // WIN+
  winplusEmail: string
  winplusPassword: string
  winplusUrl: string
  // YouTube
  youtubeChannelId: string
  youtubeVideoId: string
  // General
  streamTitle: string
  streamSubtitle: string
  altStreamUrl: string
  altStreamLabel: string
  // Protection
  stealthMode: boolean
  embedProtection: boolean
  // Features
  showChat: boolean
  showSchedule: boolean
  autoPlay: boolean
  alwaysActive: boolean
  isActive: boolean
}

type SourceTab = 'winplay' | 'winplus' | 'youtube' | 'schedule'

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

// Source configuration
const SOURCE_CONFIG = {
  winplay: {
    label: 'Win Play',
    icon: '📺',
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    bgColor: 'rgba(34,197,94,0.06)',
    borderColor: 'rgba(34,197,94,0.2)',
    desc: 'Plataforma de streaming Win Play',
  },
  winplus: {
    label: 'WIN+',
    icon: '⭐',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    bgColor: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(139,92,246,0.2)',
    desc: 'Canal premium por suscripción',
  },
  youtube: {
    label: 'YouTube Live',
    icon: '🔴',
    color: '#ff4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    bgColor: 'rgba(255,0,0,0.06)',
    borderColor: 'rgba(255,0,0,0.2)',
    desc: 'Señal alternativa gratuita',
  },
}

export default function CanalEnVivo() {
  const [config, setConfig] = useState<CanalVivoConfig | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [activeTab, setActiveTab] = useState<SourceTab>('winplay')
  const [pulseDot, setPulseDot] = useState(true)
  const [showLoginOverlay, setShowLoginOverlay] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [useProxy, setUseProxy] = useState(false)
  const [showSourceMenu, setShowSourceMenu] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sourceMenuRef = useRef<HTMLDivElement>(null)

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/canal-vivo')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
            setActiveTab(data.primarySource || 'winplay')
          }
        }
      } catch (err) {
        console.error('Error fetching canal vivo config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => setPulseDot(p => !p), 1000)
    return () => clearInterval(interval)
  }, [])

  // Always active
  useEffect(() => {
    if (config?.alwaysActive) setIsLive(true)
  }, [config?.alwaysActive])

  // Close source menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setShowSourceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Get current source info
  const getCurrentSource = useCallback(() => {
    if (activeTab === 'youtube') return SOURCE_CONFIG.youtube
    if (activeTab === 'winplus') return SOURCE_CONFIG.winplus
    return SOURCE_CONFIG.winplay
  }, [activeTab])

  // Get iframe URL - uses proxy if stealth mode enabled
  const getEmbedUrl = useCallback((source: 'winplay' | 'winplus') => {
    if (!config) return ''
    const url = source === 'winplay' 
      ? (config.winplayUrl || 'https://winplay.co')
      : (config.winplusUrl || 'https://winsports.co/win-mas')
    
    if (useProxy && config.stealthMode) {
      return `/api/canal-vivo/proxy?url=${encodeURIComponent(url)}`
    }
    return url
  }, [config, useProxy])

  // YouTube embed URLs
  const getYoutubeEmbedUrl = useCallback(() => {
    if (!config) return ''
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/embed/${config.youtubeVideoId}?autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
    }
    return `https://www.youtube.com/embed/live_stream?channel=${config.youtubeChannelId}&autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
  }, [config])

  const getYoutubeChatUrl = useCallback(() => {
    if (!config) return ''
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'tpkplay.vercel.app'
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/live_chat?v=${config.youtubeVideoId}&embed_domain=${domain}`
    }
    return `https://www.youtube.com/live_chat?channel=${config.youtubeChannelId}&embed_domain=${domain}`
  }, [config])

  // Handle login for subscription sources
  const handleLogin = useCallback(() => {
    if (!loginEmail || !loginPassword) {
      setLoginMessage('Ingresa email y contraseña')
      return
    }

    const source = activeTab
    const sourceConfig = SOURCE_CONFIG[source]

    // Try postMessage to iframe
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: `${source}-login`,
          email: loginEmail,
          password: loginPassword,
        }, '*')
        setLoginMessage(`Credenciales enviadas a ${sourceConfig.label}. Si la plataforma permite el acceso, se iniciará sesión automáticamente.`)
      } catch {
        setLoginMessage('No se pudo comunicar con la plataforma. Intenta hacer clic en "Ingresar" dentro del reproductor.')
      }
    }

    setShowLoginOverlay(false)

    // Save credentials to backend
    if (config) {
      const updateData: Record<string, string> = { id: config.id }
      if (source === 'winplay') {
        updateData.winplayEmail = loginEmail
        updateData.winplayPassword = loginPassword
      } else if (source === 'winplus') {
        updateData.winplusEmail = loginEmail
        updateData.winplusPassword = loginPassword
      }
      fetch('/api/canal-vivo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }).catch(() => {})
    }
  }, [loginEmail, loginPassword, activeTab, config])

  // Switch source and load credentials
  const switchSource = useCallback((source: SourceTab) => {
    setActiveTab(source)
    setShowSourceMenu(false)
    setIframeLoaded(false)
    setIframeError(false)

    if (config) {
      if (source === 'winplay') {
        setLoginEmail(config.winplayEmail || '')
        setLoginPassword(config.winplayPassword || '')
      } else if (source === 'winplus') {
        setLoginEmail(config.winplusEmail || '')
        setLoginPassword(config.winplusPassword || '')
      }
    }
  }, [config])

  // Load credentials when config changes
  useEffect(() => {
    if (config) {
      if (activeTab === 'winplay') {
        setLoginEmail(config.winplayEmail || '')
        setLoginPassword(config.winplayPassword || '')
      } else if (activeTab === 'winplus') {
        setLoginEmail(config.winplusEmail || '')
        setLoginPassword(config.winplusPassword || '')
      }
    }
  }, [config, activeTab])

  // Get sandbox attribute based on embed protection setting
  const getSandboxAttr = useCallback(() => {
    if (!config?.embedProtection) {
      return 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-presentation'
    }
    // Restrictive sandbox - allows login forms but prevents top-level navigation and detection
    return 'allow-same-origin allow-scripts allow-forms allow-presentation allow-popups'
  }, [config?.embedProtection])

  // Loading state
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

  const currentSource = getCurrentSource()
  const hasCredentials = activeTab === 'winplay' 
    ? !!config.winplayEmail 
    : activeTab === 'winplus' 
    ? !!config.winplusEmail 
    : true

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
            {/* Live Indicator */}
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

          {/* Source Selector + Login Button */}
          <div className="flex items-center gap-2">
            {/* Source Selector Dropdown */}
            <div className="relative" ref={sourceMenuRef}>
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="px-3 py-1.5 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
                style={{
                  background: currentSource.bgColor,
                  border: `1px solid ${currentSource.borderColor}`,
                  color: currentSource.color,
                }}
              >
                <span>{currentSource.icon}</span>
                <span>{currentSource.label}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.5 }}>
                  <path d="M5 7L1 3h8z"/>
                </svg>
              </button>

              {showSourceMenu && (
                <div className="absolute right-0 top-full mt-1 z-30 rounded-xl overflow-hidden min-w-[180px]" style={{
                  background: 'rgba(10,10,20,0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                }}>
                  {Object.entries(SOURCE_CONFIG).map(([key, src]) => (
                    <button
                      key={key}
                      onClick={() => switchSource(key as SourceTab)}
                      className="w-full px-4 py-2.5 text-left transition-all cursor-pointer flex items-center gap-2"
                      style={{
                        background: activeTab === key ? src.bgColor : 'transparent',
                        borderLeft: activeTab === key ? `3px solid ${src.color}` : '3px solid transparent',
                      }}
                    >
                      <span className="text-sm">{src.icon}</span>
                      <div>
                        <div className="text-[0.6rem] font-bold" style={{ color: activeTab === key ? src.color : 'rgba(255,255,255,0.5)' }}>
                          {src.label}
                        </div>
                        <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>{src.desc}</div>
                      </div>
                      {activeTab === key && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: src.color }} />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => switchSource('schedule')}
                    className="w-full px-4 py-2.5 text-left transition-all cursor-pointer flex items-center gap-2"
                    style={{
                      background: activeTab === 'schedule' ? 'rgba(251,191,36,0.1)' : 'transparent',
                      borderLeft: activeTab === 'schedule' ? '3px solid #fbbf24' : '3px solid transparent',
                    }}
                  >
                    <span className="text-sm">📅</span>
                    <div>
                      <div className="text-[0.6rem] font-bold" style={{ color: activeTab === 'schedule' ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>
                        Programación
                      </div>
                      <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Próximos partidos</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Login Button - only for subscription sources */}
            {(activeTab === 'winplay' || activeTab === 'winplus') && (
              <button
                onClick={() => setShowLoginOverlay(!showLoginOverlay)}
                className="px-3 py-1.5 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: hasCredentials ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${hasCredentials ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: hasCredentials ? '#4ade80' : '#fca5a5',
                }}
              >
                {hasCredentials ? '● Suscripción Activa' : '○ Ingresar Suscripción'}
              </button>
            )}

            {/* Proxy Toggle */}
            {(activeTab === 'winplay' || activeTab === 'winplus') && config.stealthMode && (
              <button
                onClick={() => { setUseProxy(!useProxy); setIframeLoaded(false); setIframeError(false) }}
                className="px-2 py-1 rounded text-[0.5rem] font-bold cursor-pointer transition-all"
                style={{
                  background: useProxy ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${useProxy ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: useProxy ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                }}
                title={useProxy ? 'Proxy activado - Protección anti-bloqueo' : 'Activar proxy para evitar bloqueos'}
              >
                {useProxy ? '🛡️ Proxy ON' : '🛡️ Proxy'}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Win Play Tab */}
          {activeTab === 'winplay' && (
            <div className="relative">
              <div className="relative w-full" style={{ minHeight: '500px' }}>
                {/* Loading overlay */}
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full animate-spin" style={{
                        border: '3px solid rgba(34,197,94,0.2)', borderTopColor: '#4ade80',
                      }} />
                      <p className="text-[0.65rem] font-bold" style={{ color: '#4ade80' }}>Cargando Win Play...</p>
                      <p className="text-[0.45rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {useProxy ? 'Conectando vía proxy protegido' : 'Conectando directamente'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
                    <div className="text-center max-w-sm px-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      }}>
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <p className="text-sm font-bold mb-2" style={{ color: '#fca5a5' }}>No se pudo cargar Win Play</p>
                      <p className="text-[0.55rem] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        La plataforma puede estar bloqueando la reproducción embebida.
                        Intenta activar el modo Proxy o usar la señal de YouTube.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { setUseProxy(true); setIframeError(false); setIframeLoaded(false) }}
                          className="px-3 py-1.5 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
                        >
                          🛡️ Activar Proxy
                        </button>
                        <button
                          onClick={() => switchSource('youtube')}
                          className="px-3 py-1.5 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6666' }}
                        >
                          🔴 Ver en YouTube
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <iframe
                  ref={iframeRef}
                  key={`winplay-${useProxy}`}
                  src={getEmbedUrl('winplay')}
                  className="w-full"
                  style={{
                    height: '600px',
                    border: 'none',
                    background: '#000',
                  }}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  sandbox={getSandboxAttr()}
                  referrerPolicy={config.stealthMode ? 'no-referrer' : 'origin'}
                  title="Streaming en Vivo"
                />
              </div>

              {/* Login Overlay */}
              {showLoginOverlay && (
                <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
                  <div className="w-full max-w-sm mx-4 p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
                    border: `1px solid ${currentSource.borderColor}`,
                    boxShadow: `0 0 40px ${currentSource.bgColor}`,
                  }}>
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{
                        background: currentSource.gradient,
                        boxShadow: `0 0 20px ${currentSource.bgColor}`,
                      }}>
                        <span className="text-2xl">{currentSource.icon}</span>
                      </div>
                      <h3 className="text-base font-black" style={{ color: currentSource.color }}>
                        Suscripción {currentSource.label}
                      </h3>
                      <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Ingresa tus credenciales de {currentSource.label} para acceder a la señal en vivo
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: `${currentSource.color}99` }}>
                          Email de {currentSource.label}
                        </label>
                        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${currentSource.borderColor}`, color: currentSource.color }}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: `${currentSource.color}99` }}>
                          Contraseña
                        </label>
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${currentSource.borderColor}`, color: currentSource.color }}
                          placeholder="Tu contraseña"
                        />
                      </div>

                      {loginMessage && (
                        <p className="text-[0.55rem] p-2 rounded-lg" style={{
                          background: `${currentSource.bgColor}`, color: `${currentSource.color}bb`,
                          border: `1px solid ${currentSource.borderColor}`,
                        }}>
                          {loginMessage}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button onClick={handleLogin}
                          className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: currentSource.gradient, color: '#fff' }}>
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
                          Si no tienes suscripción, usa la señal de YouTube Live para contenido gratuito
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info bar below iframe */}
              <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-1" style={{
                background: 'rgba(0,0,0,0.4)',
                borderTop: `1px solid ${currentSource.borderColor}`,
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: hasCredentials ? '#4ade80' : '#ef4444' }} />
                  <span className="text-[0.5rem]" style={{ color: hasCredentials ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)' }}>
                    {hasCredentials ? `Conectado: ${config.winplayEmail}` : 'Sin suscripción - Vista gratuita'}
                  </span>
                  {config.stealthMode && useProxy && (
                    <span className="text-[0.4rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: 'rgba(59,130,246,0.5)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      🛡️ Proxy Protegido
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WIN+ Tab */}
          {activeTab === 'winplus' && (
            <div className="relative">
              <div className="relative w-full" style={{ minHeight: '500px' }}>
                {/* Loading overlay */}
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full animate-spin" style={{
                        border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#a78bfa',
                      }} />
                      <p className="text-[0.65rem] font-bold" style={{ color: '#a78bfa' }}>Cargando WIN+...</p>
                      <p className="text-[0.45rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {useProxy ? 'Conectando vía proxy protegido' : 'Conectando directamente'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
                    <div className="text-center max-w-sm px-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{
                        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                      }}>
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <p className="text-sm font-bold mb-2" style={{ color: '#c4b5fd' }}>No se pudo cargar WIN+</p>
                      <p className="text-[0.55rem] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        La plataforma puede estar bloqueando la reproducción embebida.
                        Intenta activar el modo Proxy o usar la señal de YouTube.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { setUseProxy(true); setIframeError(false); setIframeLoaded(false) }}
                          className="px-3 py-1.5 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
                        >
                          🛡️ Activar Proxy
                        </button>
                        <button
                          onClick={() => switchSource('youtube')}
                          className="px-3 py-1.5 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6666' }}
                        >
                          🔴 Ver en YouTube
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <iframe
                  ref={iframeRef}
                  key={`winplus-${useProxy}`}
                  src={getEmbedUrl('winplus')}
                  className="w-full"
                  style={{
                    height: '600px',
                    border: 'none',
                    background: '#000',
                  }}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  sandbox={getSandboxAttr()}
                  referrerPolicy={config.stealthMode ? 'no-referrer' : 'origin'}
                  title="Streaming Premium en Vivo"
                />
              </div>

              {/* Login Overlay for WIN+ */}
              {showLoginOverlay && (
                <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
                  <div className="w-full max-w-sm mx-4 p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
                    border: `1px solid ${currentSource.borderColor}`,
                    boxShadow: `0 0 40px ${currentSource.bgColor}`,
                  }}>
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{
                        background: currentSource.gradient,
                        boxShadow: `0 0 20px ${currentSource.bgColor}`,
                      }}>
                        <span className="text-2xl">⭐</span>
                      </div>
                      <h3 className="text-base font-black" style={{ color: '#a78bfa' }}>Suscripción WIN+</h3>
                      <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Ingresa tus credenciales de WIN+ para acceder al canal premium
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(139,92,246,0.6)' }}>
                          Email de WIN+
                        </label>
                        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(139,92,246,0.6)' }}>
                          Contraseña
                        </label>
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
                          placeholder="Tu contraseña"
                        />
                      </div>

                      {loginMessage && (
                        <p className="text-[0.55rem] p-2 rounded-lg" style={{
                          background: 'rgba(139,92,246,0.08)', color: 'rgba(139,92,246,0.7)',
                          border: '1px solid rgba(139,92,246,0.15)',
                        }}>
                          {loginMessage}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button onClick={handleLogin}
                          className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff' }}>
                          Guardar y Conectar
                        </button>
                        <button onClick={() => setShowLoginOverlay(false)}
                          className="px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info bar */}
              <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-1" style={{
                background: 'rgba(0,0,0,0.4)',
                borderTop: '1px solid rgba(139,92,246,0.15)',
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.winplusEmail ? '#a78bfa' : '#ef4444' }} />
                  <span className="text-[0.5rem]" style={{ color: config.winplusEmail ? 'rgba(139,92,246,0.6)' : 'rgba(239,68,68,0.6)' }}>
                    {config.winplusEmail ? `Conectado: ${config.winplusEmail}` : 'Sin suscripción WIN+'}
                  </span>
                  {config.stealthMode && useProxy && (
                    <span className="text-[0.4rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: 'rgba(59,130,246,0.5)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      🛡️ Proxy
                    </span>
                  )}
                </div>
                <span className="text-[0.45rem] px-2 py-0.5 rounded-full font-bold" style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#a78bfa',
                }}>
                  ⭐ CANAL PREMIUM
                </span>
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
                  referrerPolicy="no-referrer"
                  title="YouTube Live"
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
                          <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>YouTube Live</div>
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
                  Ver programación completa
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-1" style={{
          background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(239,68,68,0.08)',
        }}>
          <div className="flex items-center gap-2">
            <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Señal en vivo TPK PLAY
            </span>
            {config.stealthMode && (
              <span className="text-[0.35rem] px-1 py-0.5 rounded" style={{
                background: 'rgba(59,130,246,0.08)', color: 'rgba(59,130,246,0.4)',
                border: '1px solid rgba(59,130,246,0.1)',
              }}>
                🛡️ Protegido
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => switchSource('winplay')} className="text-[0.45rem] cursor-pointer transition-all hover:underline"
              style={{ color: activeTab === 'winplay' ? '#4ade80' : 'rgba(34,197,94,0.3)' }}>
              Win Play
            </button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <button onClick={() => switchSource('winplus')} className="text-[0.45rem] cursor-pointer transition-all hover:underline"
              style={{ color: activeTab === 'winplus' ? '#a78bfa' : 'rgba(139,92,246,0.3)' }}>
              WIN+
            </button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <button onClick={() => switchSource('youtube')} className="text-[0.45rem] cursor-pointer transition-all hover:underline"
              style={{ color: activeTab === 'youtube' ? '#ff6666' : 'rgba(255,0,0,0.3)' }}>
              YouTube
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

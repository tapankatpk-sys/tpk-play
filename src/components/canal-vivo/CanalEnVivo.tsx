'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CanalVivoConfig {
  id: string
  primarySource: string
  winplayEmail: string
  winplayPassword: string
  winplayUrl: string
  winplusEmail: string
  winplusPassword: string
  winplusUrl: string
  youtubeChannelId: string
  youtubeVideoId: string
  streamTitle: string
  streamSubtitle: string
  altStreamUrl: string
  altStreamLabel: string
  stealthMode: boolean
  embedProtection: boolean
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

const SOURCE_CONFIG = {
  winplay: { label: 'Win Play', icon: '📺', color: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', bgColor: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)', desc: 'Streaming Win Play' },
  winplus: { label: 'WIN+', icon: '⭐', color: '#a78bfa', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', bgColor: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)', desc: 'Canal premium' },
  youtube: { label: 'YouTube', icon: '🔴', color: '#ff4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', bgColor: 'rgba(255,0,0,0.06)', borderColor: 'rgba(255,0,0,0.2)', desc: 'Señal gratuita' },
}

// ============ SVG ICONS ============
const Icons = {
  fullscreen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>,
  exitFullscreen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/></svg>,
  pip: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="11" y="9" width="9" height="6" rx="1" fill="currentColor" opacity="0.3"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  login: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  signal: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4"/></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>,
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [signalQuality, setSignalQuality] = useState<'HD' | 'SD' | 'LD'>('HD')

  // PLAY code verification state
  const [playCodeVerified, setPlayCodeVerified] = useState(false)
  const [playCodeInput, setPlayCodeInput] = useState('')
  const [playCodeError, setPlayCodeError] = useState('')
  const [playCodeVerifying, setPlayCodeVerifying] = useState(false)
  const [playCodePulse, setPlayCodePulse] = useState(true)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sourceMenuRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Check PLAY code from localStorage on mount
  useEffect(() => {
    try {
      const savedPlayCode = localStorage.getItem('tpk_play_code')
      const savedPlayTime = localStorage.getItem('tpk_play_time')
      // Allow session within 24 hours
      if (savedPlayCode && savedPlayTime) {
        const elapsed = Date.now() - parseInt(savedPlayTime)
        if (elapsed < 24 * 60 * 60 * 1000) {
          setPlayCodeVerified(true)
        } else {
          localStorage.removeItem('tpk_play_code')
          localStorage.removeItem('tpk_play_time')
        }
      }
    } catch {
      // localStorage not available
    }
  }, [])

  // PLAY code pulse animation
  useEffect(() => {
    const interval = setInterval(() => setPlayCodePulse(p => !p), 1200)
    return () => clearInterval(interval)
  }, [])

  const handleVerifyPlayCode = async () => {
    setPlayCodeError('')
    if (!playCodeInput.trim()) {
      setPlayCodeError('Ingresa tu código PLAY')
      return
    }
    setPlayCodeVerifying(true)
    try {
      const res = await fetch('/api/canal-vivo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: playCodeInput.trim().toUpperCase(), userName: 'viewer' }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        try {
          localStorage.setItem('tpk_play_code', data.code)
          localStorage.setItem('tpk_play_time', Date.now().toString())
        } catch {
          // localStorage not available
        }
        setPlayCodeVerified(true)
      } else {
        setPlayCodeError(data.error || 'Código PLAY no válido')
      }
    } catch {
      setPlayCodeError('Error de conexión. Intenta de nuevo.')
    }
    setPlayCodeVerifying(false)
  }

  const handlePlayCodeLogout = () => {
    try {
      localStorage.removeItem('tpk_play_code')
      localStorage.removeItem('tpk_play_time')
    } catch {
      // localStorage not available
    }
    setPlayCodeVerified(false)
    setPlayCodeInput('')
  }

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

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Signal quality simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities: ('HD' | 'SD' | 'LD')[] = ['HD', 'HD', 'HD', 'HD', 'SD']
      setSignalQuality(qualities[Math.floor(Math.random() * qualities.length)])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Always active
  useEffect(() => {
    if (config?.alwaysActive) setIsLive(true)
  }, [config?.alwaysActive])

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showLoginOverlay && !showSettings && !showSourceMenu) {
        setShowControls(false)
      }
    }, 4000)
  }, [showLoginOverlay, showSettings, showSourceMenu])

  useEffect(() => {
    if (isFullscreen) resetControlsTimeout()
  }, [isFullscreen, resetControlsTimeout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key.toLowerCase()) {
        case 'f':
          toggleFullscreen()
          break
        case 'escape':
          if (isFullscreen) exitFullscreen()
          break
        case 'm':
          // mute toggle would need player API
          break
        case 'p':
          togglePiP()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setShowSourceMenu(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  const exitFullscreen = useCallback(() => {
    document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
  }, [])

  // PiP
  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiP(false)
      } else if (iframeRef.current) {
        // PiP via the iframe's video element isn't directly accessible
        // We'll use the document PiP API for the whole player
        const pipWindow = await (window as any).documentPictureInPicture?.requestWindow({
          width: 480, height: 270
        })
        if (pipWindow) setIsPiP(true)
      }
    } catch {
      // PiP not supported
    }
  }, [])

  // Helpers
  const getCurrentSource = useCallback(() => {
    if (activeTab === 'youtube') return SOURCE_CONFIG.youtube
    if (activeTab === 'winplus') return SOURCE_CONFIG.winplus
    return SOURCE_CONFIG.winplay
  }, [activeTab])

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

  const getSandboxAttr = useCallback(() => {
    if (!config?.embedProtection) return 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-presentation'
    return 'allow-same-origin allow-scripts allow-forms allow-presentation allow-popups'
  }, [config?.embedProtection])

  const handleLogin = useCallback(() => {
    if (!loginEmail || !loginPassword) { setLoginMessage('Ingresa email y contraseña'); return }
    const source = activeTab
    const sourceConf = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG]
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: `${source}-login`, email: loginEmail, password: loginPassword }, '*')
        setLoginMessage(`Credenciales enviadas a ${sourceConf?.label}. Se iniciará sesión si la plataforma lo permite.`)
      } catch { setLoginMessage('No se pudo comunicar con la plataforma.') }
    }
    setShowLoginOverlay(false)
    if (config) {
      const updateData: Record<string, string> = { id: config.id }
      if (source === 'winplay') { updateData.winplayEmail = loginEmail; updateData.winplayPassword = loginPassword }
      else if (source === 'winplus') { updateData.winplusEmail = loginEmail; updateData.winplusPassword = loginPassword }
      fetch('/api/canal-vivo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) }).catch(() => {})
    }
  }, [loginEmail, loginPassword, activeTab, config])

  const switchSource = useCallback((source: SourceTab) => {
    setActiveTab(source)
    setShowSourceMenu(false)
    setShowSettings(false)
    setIframeLoaded(false)
    setIframeError(false)
    if (config) {
      if (source === 'winplay') { setLoginEmail(config.winplayEmail || ''); setLoginPassword(config.winplayPassword || '') }
      else if (source === 'winplus') { setLoginEmail(config.winplusEmail || ''); setLoginPassword(config.winplusPassword || '') }
    }
    resetControlsTimeout()
  }, [config, resetControlsTimeout])

  const refreshStream = useCallback(() => {
    setIframeLoaded(false)
    setIframeError(false)
  }, [])

  // Load credentials
  useEffect(() => {
    if (config) {
      if (activeTab === 'winplay') { setLoginEmail(config.winplayEmail || ''); setLoginPassword(config.winplayPassword || '') }
      else if (activeTab === 'winplus') { setLoginEmail(config.winplusEmail || ''); setLoginPassword(config.winplusPassword || '') }
    }
  }, [config, activeTab])

  // Format elapsed time
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  // PLAY code gate - show code input if not verified
  if (!playCodeVerified) {
    return (
      <div className="max-w-5xl mx-auto px-3 md:px-4">
        <div className="rounded-2xl overflow-hidden relative" style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 30%, #0d0a20 60%, #0a0015 100%)',
          border: '1px solid rgba(249,115,22,0.25)',
          boxShadow: '0 0 40px rgba(249,115,22,0.1), 0 0 80px rgba(168,85,247,0.05)',
          minHeight: '400px',
        }}>
          {/* Background animated elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-10" style={{
              background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
            }} />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full opacity-10" style={{
              background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
              animation: 'pulse 3s ease-in-out infinite 1s',
            }} />
          </div>

          {/* PLAY code lock screen */}
          <div className="relative z-10 flex items-center justify-center min-h-[400px] p-4">
            <div className="max-w-sm w-full text-center space-y-4">
              {/* Lock icon with animation */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,179,8,0.1))',
                  border: '2px solid rgba(249,115,22,0.3)',
                  boxShadow: playCodePulse ? '0 0 25px rgba(249,115,22,0.3), 0 0 50px rgba(249,115,22,0.1)' : '0 0 10px rgba(249,115,22,0.1)',
                  transition: 'box-shadow 0.4s ease',
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">🔑</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider" style={{
                  background: 'linear-gradient(90deg, #f97316, #fbbf24, #f97316)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  animation: 'gradient-shift 3s linear infinite',
                }}>Canal en Vivo</h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Liga BetPlay en directo
                </p>
              </div>

              {/* Info badges */}
              <div className="flex justify-center gap-2 flex-wrap">
                <div className="px-2.5 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <span className="text-[0.5rem] font-bold" style={{ color: 'rgba(249,115,22,0.7)' }}>🔑 Código PLAY requerido</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-[0.5rem] font-bold" style={{ color: 'rgba(239,68,68,0.7)' }}>🔴 Señal en vivo</span>
                </div>
              </div>

              {/* Code input */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={playCodeInput}
                  onChange={(e) => setPlayCodeInput(e.target.value.toUpperCase())}
                  placeholder="PLAYXXXXXXXX"
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-xl text-center text-base font-mono font-bold uppercase tracking-widest"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '2px solid rgba(249,115,22,0.25)',
                    color: '#f97316',
                    outline: 'none',
                    letterSpacing: '0.15em',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPlayCode()}
                  autoFocus
                />

                {playCodeError && (
                  <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-[0.6rem] font-bold" style={{ color: '#fca5a5' }}>{playCodeError}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyPlayCode}
                  disabled={playCodeVerifying}
                  className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #eab308)',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                  }}
                >
                  {playCodeVerifying ? 'Verificando...' : '🔑 Ingresar al Canal'}
                </button>

                <p className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Solicita tu código PLAY al administrador de TPK PLAY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
  const hasCredentials = activeTab === 'winplay' ? !!config.winplayEmail : activeTab === 'winplus' ? !!config.winplusEmail : true
  const isStreamView = activeTab !== 'schedule'

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-4">
      {/* ===== PLAYER CONTAINER ===== */}
      <div
        ref={playerRef}
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: '#000',
          border: isFullscreen ? 'none' : '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: isFullscreen ? 'none' : '0 0 40px rgba(239, 68, 68, 0.1), 0 0 80px rgba(168, 85, 247, 0.05)',
        }}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
      >
        {/* PLAY code verified bar */}
        {!isFullscreen && playCodeVerified && (
          <div className="flex items-center justify-between px-3 py-1.5" style={{
            background: 'rgba(249,115,22,0.06)',
            borderBottom: '1px solid rgba(249,115,22,0.12)',
          }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
              <span className="text-[0.45rem] font-bold uppercase tracking-wider" style={{ color: 'rgba(249,115,22,0.6)' }}>
                🔑 Código PLAY activo
              </span>
              <span className="text-[0.4rem] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {typeof window !== 'undefined' ? localStorage.getItem('tpk_play_code') || '' : ''}
              </span>
            </div>
            <button onClick={handlePlayCodeLogout}
              className="text-[0.4rem] uppercase tracking-wider cursor-pointer px-2 py-0.5 rounded transition-all hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Salir
            </button>
          </div>
        )}
        {/* ===== IFRAME PLAYER ===== */}
        {isStreamView && (
          <div className="relative" style={{ 
            width: '100%', 
            height: isFullscreen ? '100vh' : '0',
            paddingBottom: isFullscreen ? '0' : '56.25%',
          }}>
            {/* Loading Screen */}
            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#000' }}>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full animate-spin" style={{
                      border: '3px solid rgba(255,255,255,0.05)', borderTopColor: currentSource.color,
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{currentSource.icon}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: currentSource.color }}>
                    {activeTab === 'winplay' ? 'Win Play' : activeTab === 'winplus' ? 'WIN+' : 'YouTube Live'}
                  </p>
                  <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {useProxy ? 'Conectando vía proxy protegido...' : 'Conectando señal en vivo...'}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSource.color, animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSource.color, animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSource.color, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error Screen */}
            {iframeError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#000' }}>
                <div className="text-center max-w-sm px-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    background: `${currentSource.bgColor}`, border: `1px solid ${currentSource.borderColor}`,
                  }}>
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Señal no disponible</p>
                  <p className="text-[0.6rem] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    La plataforma puede estar bloqueando la reproducción. Intenta activar el Proxy o cambiar de fuente.
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <button onClick={refreshStream}
                      className="px-4 py-2 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                      {Icons.refresh} Reintentar
                    </button>
                    {(activeTab === 'winplay' || activeTab === 'winplus') && (
                      <button onClick={() => { setUseProxy(true); refreshStream() }}
                        className="px-4 py-2 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                        {Icons.shield} Activar Proxy
                      </button>
                    )}
                    <button onClick={() => switchSource('youtube')}
                      className="px-4 py-2 rounded-lg text-[0.6rem] font-bold cursor-pointer transition-all hover:scale-105"
                      style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6666' }}>
                      🔴 Ver en YouTube
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Iframe */}
            {activeTab === 'youtube' ? (
              <iframe
                ref={iframeRef}
                key="youtube-player"
                src={getYoutubeEmbedUrl()}
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none', background: '#000' }}
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                title="YouTube Live"
              />
            ) : (
              <iframe
                ref={iframeRef}
                key={`${activeTab}-${useProxy}`}
                src={getEmbedUrl(activeTab as 'winplay' | 'winplus')}
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none', background: '#000' }}
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                sandbox={getSandboxAttr()}
                referrerPolicy={config.stealthMode ? 'no-referrer' : 'origin'}
                title="Streaming en Vivo"
              />
            )}

            {/* ===== OVERLAY CONTROLS (fullscreen mode) ===== */}
            {isFullscreen && isStreamView && (
              <>
                {/* Gradient top bar */}
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none" style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  height: '120px',
                  opacity: showControls ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}>
                  <div className="pointer-events-auto p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Live Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                        background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)',
                      }}>
                        <div className="w-2 h-2 rounded-full" style={{
                          background: '#ef4444',
                          boxShadow: pulseDot ? '0 0 8px #ef4444' : 'none',
                          transition: 'box-shadow 0.3s',
                        }} />
                        <span className="text-[0.65rem] font-black uppercase tracking-wider text-red-400">EN VIVO</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase" style={{
                          background: 'linear-gradient(90deg, #ef4444, #f97316, #fbbf24)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>{config.streamTitle}</h3>
                        <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>{config.streamSubtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.55rem] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTime(elapsedTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Gradient bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                  height: '140px',
                  opacity: showControls ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}>
                  <div className="pointer-events-auto absolute bottom-0 left-0 right-0 p-4">
                    {/* Source pills */}
                    <div className="flex items-center gap-2 mb-3">
                      {Object.entries(SOURCE_CONFIG).map(([key, src]) => (
                        <button key={key} onClick={() => switchSource(key as SourceTab)}
                          className="px-3 py-1.5 rounded-full text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                          style={{
                            background: activeTab === key ? `${src.color}25` : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${activeTab === key ? `${src.color}50` : 'rgba(255,255,255,0.1)'}`,
                            color: activeTab === key ? src.color : 'rgba(255,255,255,0.4)',
                          }}>
                          <span className="text-[0.5rem]">{src.icon}</span> {src.label}
                        </button>
                      ))}
                      <button onClick={() => switchSource('schedule')}
                        className="px-3 py-1.5 rounded-full text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                        style={{
                          background: activeTab === 'schedule' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${activeTab === 'schedule' ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          color: activeTab === 'schedule' ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                        }}>
                        📅 Programación
                      </button>
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Signal quality */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                          background: signalQuality === 'HD' ? 'rgba(34,197,94,0.1)' : signalQuality === 'SD' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${signalQuality === 'HD' ? 'rgba(34,197,94,0.2)' : signalQuality === 'SD' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                          {Icons.signal}
                          <span className="text-[0.5rem] font-bold" style={{
                            color: signalQuality === 'HD' ? '#4ade80' : signalQuality === 'SD' ? '#fbbf24' : '#fca5a5',
                          }}>{signalQuality}</span>
                        </div>

                        {/* Proxy badge */}
                        {config.stealthMode && useProxy && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                          }}>
                            {Icons.shield}
                            <span className="text-[0.5rem] font-bold" style={{ color: '#60a5fa' }}>Proxy</span>
                          </div>
                        )}

                        {/* Credentials badge */}
                        {(activeTab === 'winplay' || activeTab === 'winplus') && (
                          <button onClick={() => setShowLoginOverlay(true)}
                            className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all hover:scale-105"
                            style={{
                              background: hasCredentials ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              border: `1px solid ${hasCredentials ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            }}>
                            {Icons.login}
                            <span className="text-[0.5rem] font-bold" style={{ color: hasCredentials ? '#4ade80' : '#fca5a5' }}>
                              {hasCredentials ? 'Suscrito' : 'Suscribir'}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <button onClick={refreshStream} className="p-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                          style={{ color: 'rgba(255,255,255,0.5)' }} title="Refrescar señal">
                          {Icons.refresh}
                        </button>
                        {/* PiP */}
                        <button onClick={togglePiP} className="p-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                          style={{ color: isPiP ? currentSource.color : 'rgba(255,255,255,0.5)' }} title="Picture in Picture (P)">
                          {Icons.pip}
                        </button>
                        {/* Settings */}
                        <div className="relative" ref={settingsRef}>
                          <button onClick={() => { setShowSettings(!showSettings); resetControlsTimeout() }}
                            className="p-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                            style={{ color: showSettings ? '#fff' : 'rgba(255,255,255,0.5)' }} title="Configuración">
                            {Icons.settings}
                          </button>
                          {showSettings && (
                            <div className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden min-w-[200px]" style={{
                              background: 'rgba(15,15,25,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                            }}>
                              <div className="p-2 space-y-1">
                                <div className="text-[0.5rem] font-bold uppercase tracking-wider px-3 py-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Configuración</div>
                                {(activeTab === 'winplay' || activeTab === 'winplus') && config.stealthMode && (
                                  <button onClick={() => { setUseProxy(!useProxy); refreshStream(); setShowSettings(false) }}
                                    className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center justify-between rounded-lg"
                                    style={{ color: useProxy ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                                    <span className="text-[0.55rem] font-bold flex items-center gap-1.5">{Icons.shield} Proxy Anti-Bloqueo</span>
                                    <span className="text-[0.5rem] font-bold">{useProxy ? 'ON' : 'OFF'}</span>
                                  </button>
                                )}
                                <button onClick={() => { switchSource('youtube'); setShowSettings(false) }}
                                  className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center justify-between rounded-lg hover:bg-white/5"
                                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                                  <span className="text-[0.55rem] font-bold">🔴 Cambiar a YouTube</span>
                                </button>
                                <button onClick={() => { switchSource('winplay'); setShowSettings(false) }}
                                  className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center justify-between rounded-lg hover:bg-white/5"
                                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                                  <span className="text-[0.55rem] font-bold">📺 Cambiar a Win Play</span>
                                </button>
                                <button onClick={() => { switchSource('winplus'); setShowSettings(false) }}
                                  className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center justify-between rounded-lg hover:bg-white/5"
                                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                                  <span className="text-[0.55rem] font-bold">⭐ Cambiar a WIN+</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="p-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                          style={{ color: '#fff' }} title="Pantalla completa (F)">
                          {Icons.exitFullscreen}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===== EMBEDDED (non-fullscreen) CONTROLS ===== */}
            {!isFullscreen && isStreamView && (
              <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                height: '80px',
                opacity: showControls ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <div className="pointer-events-auto absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{
                      background: signalQuality === 'HD' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                      border: `1px solid ${signalQuality === 'HD' ? 'rgba(34,197,94,0.25)' : 'rgba(251,191,36,0.25)'}`,
                    }}>
                      {Icons.signal}
                      <span className="text-[0.45rem] font-bold" style={{ color: signalQuality === 'HD' ? '#4ade80' : '#fbbf24' }}>{signalQuality}</span>
                    </div>
                    <span className="text-[0.45rem] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatTime(elapsedTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={refreshStream} className="p-1.5 rounded cursor-pointer transition-all hover:scale-110" style={{ color: 'rgba(255,255,255,0.5)' }} title="Refrescar">
                      {Icons.refresh}
                    </button>
                    <button onClick={toggleFullscreen} className="p-1.5 rounded cursor-pointer transition-all hover:scale-110" style={{ color: '#fff' }} title="Pantalla completa (F)">
                      {Icons.fullscreen}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SCHEDULE VIEW ===== */}
        {activeTab === 'schedule' && (
          <div className="space-y-3 p-3 md:p-4" style={{ background: 'linear-gradient(145deg, #0a0015 0%, #1a0020 30%, #0d0a20 60%, #0a0015 100%)', minHeight: isFullscreen ? '100vh' : 'auto' }}>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Próximos partidos de la <b style={{ color: '#fca5a5' }}>Liga BetPlay Dimayor 2026-1</b>
              </p>
            </div>
            {UPCOMING_MATCHES.map((match, idx) => (
              <div key={idx} className="p-3 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <img src={getTeamImage(match.home)} alt="" className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div className="text-[0.65rem] font-bold" style={{ color: '#fca5a5' }}>{TEAM_NAMES[match.home] || match.home}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-[0.4rem] uppercase" style={{ color: 'rgba(239,68,68,0.5)' }}>{match.date}</div>
                    <div className="text-sm font-black px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fbbf24' }}>VS</div>
                    <div className="text-[0.4rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{match.time}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="text-[0.65rem] font-bold" style={{ color: '#93c5fd' }}>{TEAM_NAMES[match.away] || match.away}</div>
                    <img src={getTeamImage(match.away)} alt="" className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                </div>
              </div>
            ))}
            {/* Back to live button in fullscreen */}
            {isFullscreen && (
              <div className="text-center pt-2">
                <button onClick={() => switchSource(config.primarySource as SourceTab)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff' }}>
                  ▶ Volver a la Señal en Vivo
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== LOGIN OVERLAY ===== */}
        {showLoginOverlay && (
          <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
            <div className="w-full max-w-sm mx-4 p-6 rounded-2xl" style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
              border: `1px solid ${currentSource.borderColor}`,
              boxShadow: `0 0 60px ${currentSource.bgColor}`,
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: currentSource.gradient }}>
                    <span className="text-lg">{currentSource.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black" style={{ color: currentSource.color }}>Suscripción {currentSource.label}</h3>
                    <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Ingresa tus credenciales</p>
                  </div>
                </div>
                <button onClick={() => setShowLoginOverlay(false)} className="p-1 rounded cursor-pointer" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {Icons.close}
                </button>
              </div>

              <div className="space-y-3">
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${currentSource.borderColor}`, color: currentSource.color }}
                  placeholder="Email" />
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${currentSource.borderColor}`, color: currentSource.color }}
                  placeholder="Contraseña" />
                {loginMessage && (
                  <p className="text-[0.5rem] p-2 rounded-lg" style={{ background: currentSource.bgColor, color: `${currentSource.color}bb`, border: `1px solid ${currentSource.borderColor}` }}>
                    {loginMessage}
                  </p>
                )}
                <button onClick={handleLogin}
                  className="w-full px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: currentSource.gradient, color: '#fff' }}>
                  Guardar y Conectar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== INFO BAR (non-fullscreen only) ===== */}
      {!isFullscreen && (
        <div className="mt-1 px-3 py-2 flex items-center justify-between flex-wrap gap-2" style={{
          background: 'linear-gradient(145deg, #0a0015, #1a0020)',
          border: '1px solid rgba(239,68,68,0.1)',
          borderRadius: '0 0 0.75rem 0.75rem',
          borderTop: 'none',
        }}>
          <div className="flex items-center gap-2">
            {/* Live dot */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{
                background: isLive ? '#ef4444' : '#6b7280',
                boxShadow: isLive && pulseDot ? '0 0 6px #ef4444' : 'none',
              }} />
              <span className="text-[0.55rem] font-black uppercase tracking-wider" style={{ color: isLive ? '#ef4444' : '#6b7280' }}>
                {isLive ? 'EN VIVO' : 'OFFLINE'}
              </span>
            </div>

            {/* Source selector */}
            <div className="relative" ref={sourceMenuRef}>
              <button onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="px-2.5 py-1 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all flex items-center gap-1"
                style={{ background: currentSource.bgColor, border: `1px solid ${currentSource.borderColor}`, color: currentSource.color }}>
                {currentSource.icon} {currentSource.label} {Icons.chevronDown}
              </button>
              {showSourceMenu && (
                <div className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden min-w-[180px]" style={{
                  background: 'rgba(10,10,20,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                }}>
                  {Object.entries(SOURCE_CONFIG).map(([key, src]) => (
                    <button key={key} onClick={() => switchSource(key as SourceTab)}
                      className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center gap-2"
                      style={{ background: activeTab === key ? src.bgColor : 'transparent', borderLeft: activeTab === key ? `2px solid ${src.color}` : '2px solid transparent' }}>
                      <span className="text-xs">{src.icon}</span>
                      <span className="text-[0.55rem] font-bold" style={{ color: activeTab === key ? src.color : 'rgba(255,255,255,0.5)' }}>{src.label}</span>
                      {activeTab === key && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: src.color }} />}
                    </button>
                  ))}
                  <button onClick={() => switchSource('schedule')}
                    className="w-full px-3 py-2 text-left transition-all cursor-pointer flex items-center gap-2"
                    style={{ background: activeTab === 'schedule' ? 'rgba(251,191,36,0.1)' : 'transparent', borderLeft: activeTab === 'schedule' ? '2px solid #fbbf24' : '2px solid transparent' }}>
                    <span className="text-xs">📅</span>
                    <span className="text-[0.55rem] font-bold" style={{ color: activeTab === 'schedule' ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>Programación</span>
                  </button>
                </div>
              )}
            </div>

            {/* Subscription button */}
            {(activeTab === 'winplay' || activeTab === 'winplus') && (
              <button onClick={() => setShowLoginOverlay(true)}
                className="px-2.5 py-1 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                style={{
                  background: hasCredentials ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${hasCredentials ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: hasCredentials ? '#4ade80' : '#fca5a5',
                }}>
                {Icons.login} {hasCredentials ? 'Suscrito' : 'Suscribir'}
              </button>
            )}

            {/* Proxy toggle */}
            {(activeTab === 'winplay' || activeTab === 'winplus') && config.stealthMode && (
              <button onClick={() => { setUseProxy(!useProxy); refreshStream() }}
                className="px-2 py-1 rounded text-[0.5rem] font-bold cursor-pointer transition-all flex items-center gap-1"
                style={{
                  background: useProxy ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${useProxy ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  color: useProxy ? '#60a5fa' : 'rgba(255,255,255,0.25)',
                }}>
                {Icons.shield} {useProxy ? 'Proxy ON' : 'Proxy'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {config.stealthMode && (
              <span className="text-[0.35rem] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{
                background: 'rgba(59,130,246,0.05)', color: 'rgba(59,130,246,0.35)', border: '1px solid rgba(59,130,246,0.08)',
              }}>
                {Icons.shield} Protegido
              </span>
            )}
            <button onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg text-[0.55rem] font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {Icons.fullscreen} Pantalla Completa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

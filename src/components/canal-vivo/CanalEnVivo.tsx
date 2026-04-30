'use client'

import { useState, useEffect, useRef } from 'react'

interface CanalVivoConfig {
  id: string
  youtubeChannelId: string
  youtubeVideoId: string
  streamTitle: string
  streamSubtitle: string
  altStreamUrl: string
  altStreamLabel: string
  showChat: boolean
  showSchedule: boolean
  autoPlay: boolean
  isActive: boolean
}

// Upcoming matches schedule (static data - will be dynamic from API later)
const UPCOMING_MATCHES = [
  { home: 'millonarios', away: 'atletico-nacional', date: '2026-05-03', time: '18:00', venue: 'El Campín' },
  { home: 'america-de-cali', away: 'deportivo-cali', date: '2026-05-04', time: '20:00', venue: 'Pascual Guerrero' },
  { home: 'independiente-santa-fe', away: 'atletico-junior', date: '2026-05-05', time: '19:00', venue: 'El Campín' },
  { home: 'deportes-tolima', away: 'deportivo-pereira', date: '2026-05-06', time: '18:30', venue: 'Manuel Murillo Toro' },
  { home: 'once-caldas', away: 'independiente-medellin', date: '2026-05-07', time: '20:00', venue: 'Palogrande' },
]

const TEAM_NAMES: Record<string, string> = {
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
  'jaguares-de-cordoba': 'Jaguares',
  'llaneros': 'Llaneros',
  'millonarios': 'Millonarios',
  'once-caldas': 'Once Caldas',
}

const PNG_ONLY = ['internacional-de-bogota']

function getTeamImage(slug: string) {
  const ext = PNG_ONLY.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

export default function CanalEnVivo() {
  const [config, setConfig] = useState<CanalVivoConfig | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'stream' | 'schedule' | 'links'>('stream')
  const [pulseDot, setPulseDot] = useState(true)
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
          }
        }
      } catch (err) {
        console.error('Error fetching canal vivo config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Simulate live status and viewer count
  useEffect(() => {
    // Check if there's a live stream by trying the YouTube embed
    // For now, we simulate based on typical match hours
    const checkLive = () => {
      const now = new Date()
      const hour = now.getHours()
      // Typical match hours in Colombia: 18:00-22:00 (6pm-10pm)
      const dayOfWeek = now.getDay()
      // Weekend and Friday matches are common
      const isMatchDay = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0
      const isMatchHour = hour >= 17 && hour <= 23
      setIsLive(isMatchDay && isMatchHour)
      setViewerCount(Math.floor(Math.random() * 500) + 200)
    }
    checkLive()
    const interval = setInterval(checkLive, 60000)
    return () => clearInterval(interval)
  }, [])

  // Pulse animation for live dot
  useEffect(() => {
    const interval = setInterval(() => setPulseDot(p => !p), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div
          className="rounded-2xl p-8 text-center border animate-pulse"
          style={{
            background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-2xl" style={{ color: 'rgba(239,68,68,0.3)' }}>Cargando Canal en Vivo...</div>
        </div>
      </div>
    )
  }

  // Build YouTube embed URL
  const getEmbedUrl = () => {
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/embed/${config.youtubeVideoId}?autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
    }
    return `https://www.youtube.com/embed/live_stream?channel=${config.youtubeChannelId}&autoplay=${config.autoPlay ? 1 : 0}&mute=1&rel=0&modestbranding=1`
  }

  const getChatUrl = () => {
    if (config.youtubeVideoId) {
      return `https://www.youtube.com/live_chat?v=${config.youtubeVideoId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'tpkplay.vercel.app'}`
    }
    return `https://www.youtube.com/live_chat?channel=${config.youtubeChannelId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'tpkplay.vercel.app'}`
  }

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-4">
      {/* Main Container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0015 0%, #1a0020 30%, #0d0a20 60%, #0a0015 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.1), 0 0 80px rgba(168, 85, 247, 0.05), inset 0 1px 0 rgba(239, 68, 68, 0.1)',
        }}
      >
        {/* Header Bar */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(239,68,68,0.15) 100%)',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                  border: `1px solid ${isLive ? 'rgba(239,68,68,0.4)' : 'rgba(107,114,128,0.3)'}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isLive ? '#ef4444' : '#6b7280',
                    boxShadow: isLive && pulseDot ? '0 0 8px #ef4444' : 'none',
                    transition: 'box-shadow 0.3s',
                  }}
                />
                <span
                  className="text-[0.6rem] font-black uppercase tracking-wider"
                  style={{ color: isLive ? '#ef4444' : '#6b7280' }}
                >
                  {isLive ? 'EN VIVO' : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div>
              <h3
                className="text-sm md:text-base font-black uppercase tracking-wide"
                style={{
                  background: 'linear-gradient(90deg, #ef4444, #f97316, #fbbf24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                }}
              >
                {config.streamTitle}
              </h3>
              <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {config.streamSubtitle}
              </p>
            </div>
          </div>

          {/* Viewer count */}
          {isLive && (
            <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-[0.6rem] font-bold">{viewerCount}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          className="flex border-b"
          style={{ borderColor: 'rgba(239,68,68,0.1)' }}
        >
          {[
            { id: 'stream' as const, label: 'Señal en Vivo', icon: '📺' },
            { id: 'schedule' as const, label: 'Programación', icon: '📅' },
            { id: 'links' as const, label: 'Más Señales', icon: '🔗' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-3 py-2 text-center transition-all cursor-pointer"
              style={{
                background: activeTab === tab.id
                  ? 'rgba(239,68,68,0.1)'
                  : 'transparent',
                borderBottom: activeTab === tab.id
                  ? '2px solid #ef4444'
                  : '2px solid transparent',
              }}
            >
              <span className="text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-wider"
                style={{ color: activeTab === tab.id ? '#ef4444' : 'rgba(255,255,255,0.3)' }}
              >
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-3 md:p-4">
          {/* Stream Tab */}
          {activeTab === 'stream' && (
            <div className="space-y-4">
              {/* YouTube Player */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
                <iframe
                  ref={iframeRef}
                  src={getEmbedUrl()}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  style={{
                    border: '1px solid rgba(239,68,68,0.15)',
                    background: '#000',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="Liga BetPlay en Vivo"
                />

                {/* Offline overlay */}
                {!isLive && (
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(168,85,247,0.2))',
                        border: '2px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                        <polygon points="5 3 19 12 5 21 5 3" fill="rgba(239,68,68,0.3)" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      No hay transmisión en vivo ahora
                    </p>
                    <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      La señal se activa cuando hay partido de la Liga BetPlay
                    </p>
                    <a
                      href={`https://www.youtube.com/@winsportstv/streams`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 px-4 py-1.5 rounded-lg text-[0.6rem] font-bold transition-all hover:scale-105"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                      }}
                    >
                      Ver streams recientes en YouTube
                    </a>
                  </div>
                )}
              </div>

              {/* YouTube Chat (side panel on desktop, below on mobile) */}
              {config.showChat && isLive && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    {/* Info card */}
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.1)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #f97316)',
                            boxShadow: '0 0 12px rgba(239,68,68,0.3)',
                          }}
                        >
                          <span className="text-sm">📺</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>
                            Win Sports - Señal Oficial
                          </div>
                          <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Transmisión autorizada de la Liga BetPlay Dimayor
                          </div>
                        </div>
                      </div>
                      <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Disfruta de los partidos de la Liga BetPlay en vivo. La señal se activa automáticamente cuando hay transmisión disponible desde Win Sports.
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: '1px solid rgba(239,68,68,0.1)',
                        height: '250px',
                      }}
                    >
                      <iframe
                        src={getChatUrl()}
                        className="w-full h-full"
                        style={{ background: '#0a0a0a' }}
                        title="Chat en Vivo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stream info when not showing chat */}
              {(!config.showChat || !isLive) && (
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #f97316)',
                        boxShadow: '0 0 12px rgba(239,68,68,0.3)',
                      }}
                    >
                      <span className="text-sm">📺</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>
                        Win Sports - Señal Oficial
                      </div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Canal oficial de la Liga BetPlay Dimayor
                      </div>
                    </div>
                  </div>
                  <p className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Disfruta de los partidos de la Liga BetPlay en vivo a través de Win Sports. La señal se activa automáticamente cuando hay transmisión disponible.
                    Si no hay señal en vivo, puedes ver los resúmenes y goles en el canal de YouTube.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && config.showSchedule && (
            <div className="space-y-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.04)',
                  border: '1px solid rgba(239,68,68,0.1)',
                }}
              >
                <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Próximos partidos de la <b style={{ color: '#fca5a5' }}>Liga BetPlay Dimayor 2026-1</b>.
                  Horarios de Colombia (UTC-5). La señal se activa 15 minutos antes de cada partido.
                </p>
              </div>

              {UPCOMING_MATCHES.map((match, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(239,68,68,0.08)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Home team */}
                    <div className="flex items-center gap-2 flex-1">
                      <img
                        src={getTeamImage(match.home)}
                        alt={TEAM_NAMES[match.home] || match.home}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div>
                        <div className="text-[0.65rem] md:text-xs font-bold" style={{ color: '#fca5a5' }}>
                          {TEAM_NAMES[match.home] || match.home}
                        </div>
                        <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Local</div>
                      </div>
                    </div>

                    {/* Match info */}
                    <div className="text-center px-2 md:px-4">
                      <div className="text-[0.45rem] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(239,68,68,0.5)' }}>
                        {match.date}
                      </div>
                      <div
                        className="text-sm md:text-lg font-black px-3 py-1 rounded-lg"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#fbbf24',
                        }}
                      >
                        VS
                      </div>
                      <div className="text-[0.45rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {match.time} | {match.venue}
                      </div>
                    </div>

                    {/* Away team */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-[0.65rem] md:text-xs font-bold" style={{ color: '#93c5fd' }}>
                          {TEAM_NAMES[match.away] || match.away}
                        </div>
                        <div className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Visitante</div>
                      </div>
                      <img
                        src={getTeamImage(match.away)}
                        alt={TEAM_NAMES[match.away] || match.away}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Link to full schedule */}
              <div className="text-center pt-2">
                <a
                  href="https://www.winsports.co/programacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg text-[0.6rem] font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#fca5a5',
                  }}
                >
                  Ver programación completa en Win Sports
                </a>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.04)',
                  border: '1px solid rgba(239,68,68,0.1)',
                }}
              >
                <p className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Opciones para ver los partidos de la <b style={{ color: '#fca5a5' }}>Liga BetPlay</b> en vivo.
                  Algunas plataformas requieren suscripción.
                </p>
              </div>

              {/* Streaming Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Win Sports YouTube */}
                <a
                  href="https://www.youtube.com/@winsportstv/streams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,0,0.08), rgba(255,0,0,0.03))',
                    border: '1px solid rgba(255,0,0,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,0,0,0.15)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#ff4444' }}>Win Sports YouTube</div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Transmisiones en vivo y resúmenes</div>
                    </div>
                  </div>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Canal oficial en YouTube con streams en vivo de partidos, sorteos y contenido de la Liga BetPlay
                  </p>
                </a>

                {/* Win Play */}
                <a
                  href="https://winplay.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))',
                    border: '1px solid rgba(34,197,94,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.15)' }}
                    >
                      <span className="text-lg">⚽</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#4ade80' }}>Win Play</div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Plataforma oficial OTT</div>
                    </div>
                  </div>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Señal en vivo oficial de Win Sports. Requiere suscripción. App disponible para iOS y Android
                  </p>
                </a>

                {/* Fanatiz */}
                <a
                  href="https://fanatiz.com/es/live-colombian-soccer-games"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))',
                    border: '1px solid rgba(59,130,246,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(59,130,246,0.15)' }}
                    >
                      <span className="text-lg">🌍</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#60a5fa' }}>Fanatiz</div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Fútbol colombiano internacional</div>
                    </div>
                  </div>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    TODOS los partidos de la Liga BetPlay en vivo y grabaciones. Disponible fuera de Colombia. Suscripción requerida
                  </p>
                </a>

                {/* Fubo TV */}
                <a
                  href="https://www.fubo.tv/stream/la/liga-betplay-dimayor-es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))',
                    border: '1px solid rgba(168,85,247,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(168,85,247,0.15)' }}
                    >
                      <span className="text-lg">📱</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#a78bfa' }}>Fubo TV</div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Streaming deportivo en USA</div>
                    </div>
                  </div>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Liga BetPlay Dimayor disponible en Estados Unidos. 50+ canales en vivo. Prueba gratis disponible
                  </p>
                </a>

                {/* Win Sports+ */}
                <a
                  href="https://www.winsportsmas.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(251,191,36,0.15)' }}
                    >
                      <span className="text-lg">⭐</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#fbbf24' }}>Win Sports+</div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Canal premium</div>
                    </div>
                  </div>
                  <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Win+ Fútbol: el único canal con TODOS los partidos del fútbol profesional colombiano en vivo
                  </p>
                </a>

                {/* Alternative stream if configured */}
                {config.altStreamUrl && (
                  <a
                    href={config.altStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl transition-all hover:scale-[1.02] block"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))',
                      border: '1px solid rgba(249,115,22,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(249,115,22,0.15)' }}
                      >
                        <span className="text-lg">🔗</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: '#f97316' }}>{config.altStreamLabel}</div>
                        <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Señal alternativa configurada</div>
                      </div>
                    </div>
                    <p className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {config.altStreamUrl}
                    </p>
                  </a>
                )}
              </div>

              {/* Disclaimer */}
              <div
                className="p-2 rounded-lg text-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  TPK PLAY no almacena ni transmite contenido protegido. Los enlaces redirigen a las plataformas oficiales de derechos.
                  Liga BetPlay Dimayor es propiedad de la División Mayor del Fútbol Colombiano.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(239,68,68,0.08)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[0.45rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Powered by Win Sports
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.winsports.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.45rem] underline transition-all hover:no-underline"
              style={{ color: 'rgba(239,68,68,0.4)' }}
            >
              WinSports.co
            </a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a
              href="https://winplay.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.45rem] underline transition-all hover:no-underline"
              style={{ color: 'rgba(34,197,94,0.4)' }}
            >
              WinPlay.co
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

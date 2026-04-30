'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface MatchPrediction {
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
}

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
  'jaguares-de-cordoba': 'Jaguares de Córdoba',
  'llaneros': 'Llaneros',
  'millonarios': 'Millonarios',
  'once-caldas': 'Once Caldas',
}

const PNG_ONLY_TEAMS = ['internacional-de-bogota']

// Deadline: 1 hour before match kickoff
const DEADLINE_HOURS_BEFORE = 1

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

function getTeamName(slug: string): string {
  return TEAM_NAMES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Get the deadline timestamp (1 hour before match)
function getDeadline(matchDate: string): Date {
  const match = new Date(matchDate)
  return new Date(match.getTime() - DEADLINE_HOURS_BEFORE * 60 * 60 * 1000)
}

// Format remaining time for countdown display
function formatCountdown(ms: number): { text: string; isUrgent: boolean; isExpired: boolean } {
  if (ms <= 0) {
    return { text: 'CERRADO', isUrgent: false, isExpired: true }
  }

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const isUrgent = ms < 3600000 // Less than 1 hour = urgent (red)

  let text = ''
  if (days > 0) {
    text = `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`
  } else {
    text = `${seconds}s`
  }

  return { text, isUrgent, isExpired: false }
}

export default function MatchPredictions() {
  const [predictions, setPredictions] = useState<MatchPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch('/api/predictions')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setPredictions(data.filter((p: MatchPrediction) => p.isActive))
          }
        }
      } catch (err) {
        console.error('Error fetching predictions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPredictions()
  }, [])

  if (loading) return null
  if (predictions.length === 0) return null

  // Find the earliest upcoming match deadline for global countdown header
  const now = new Date()
  const upcomingMatches = predictions.filter(p => p.status === 'upcoming')
  const earliestDeadline = upcomingMatches.length > 0
    ? upcomingMatches.reduce((earliest, m) => {
        const dl = getDeadline(m.matchDate)
        return dl < earliest ? dl : earliest
      }, getDeadline(upcomingMatches[0].matchDate))
    : null

  const hasActiveDeadline = earliestDeadline && earliestDeadline > now

  return (
    <section className="relative py-10">
      {/* Section divider top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(to right, transparent, rgba(0,255,128,0.5), rgba(255,200,0,0.5), rgba(0,200,255,0.5), transparent)',
      }} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(0,255,128,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 70%, rgba(255,200,0,0.04) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-6">
          <h2
            className="text-xl md:text-2xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #00ff80, #ffc800, #00c8ff, #00ff80)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s linear infinite',
              filter: 'drop-shadow(0 0 12px rgba(0,255,128,0.4))',
            }}
          >
            PREDICCIONES LIGA BETPLAY
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] mt-2" style={{ color: 'rgba(0,255,128,0.4)' }}>
            Resultados en vivo
          </p>
        </div>

        {/* Global Countdown Timer */}
        {earliestDeadline && (
          <GlobalCountdown deadline={earliestDeadline} />
        )}

        {/* Match cards */}
        <div className="space-y-4">
          {predictions.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes led-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes score-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,200,0,0.8), 0 0 16px rgba(255,200,0,0.4), 0 0 30px rgba(255,200,0,0.2); }
          50% { text-shadow: 0 0 12px rgba(255,200,0,1), 0 0 24px rgba(255,200,0,0.6), 0 0 40px rgba(255,200,0,0.3); }
        }
        @keyframes live-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #ff3333, 0 0 8px #ff3333; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #ff3333, 0 0 4px #ff3333; }
        }
        @keyframes border-chase {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes timer-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,200,0,0.6), 0 0 16px rgba(255,200,0,0.3); }
          50% { text-shadow: 0 0 12px rgba(255,200,0,0.8), 0 0 24px rgba(255,200,0,0.5), 0 0 40px rgba(255,200,0,0.2); }
        }
        @keyframes timer-urgent {
          0%, 100% { text-shadow: 0 0 8px rgba(255,51,51,0.6), 0 0 16px rgba(255,51,51,0.3); }
          50% { text-shadow: 0 0 12px rgba(255,51,51,0.8), 0 0 24px rgba(255,51,51,0.5), 0 0 40px rgba(255,51,51,0.2); }
        }
      `}</style>
    </section>
  )
}

// ============================================
// GLOBAL COUNTDOWN COMPONENT
// ============================================
function GlobalCountdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState(deadline.getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(deadline.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const { text, isUrgent, isExpired } = formatCountdown(timeLeft)

  if (isExpired) {
    return (
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.4)',
            boxShadow: '0 0 15px rgba(239,68,68,0.15), 0 0 30px rgba(239,68,68,0.08)',
          }}
        >
          <span className="text-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }}>&#x1F6D1;</span>
          <div>
            <div className="text-sm font-black uppercase tracking-wider" style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
              Predicciones Cerradas
            </div>
            <div className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(239,68,68,0.5)' }}>
              El plazo para participar ha terminado
            </div>
          </div>
        </div>
      </div>
    )
  }

  const timerColor = isUrgent ? '#ff3333' : '#ffc800'
  const timerGlow = isUrgent ? 'rgba(255,51,51,' : 'rgba(255,200,0,'
  const timerAnim = isUrgent ? 'timer-urgent' : 'timer-glow'

  return (
    <div className="text-center mb-6">
      <div
        className="inline-flex items-center gap-4 px-6 py-3 rounded-xl"
        style={{
          background: `${timerGlow}0.06)`,
          border: `2px solid ${timerGlow}0.35)`,
          boxShadow: `0 0 15px ${timerGlow}0.12), 0 0 30px ${timerGlow}0.06)`,
        }}
      >
        <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${timerGlow}0.6))` }}>&#x23F1;&#xFE0F;</span>
        <div>
          <div className="text-[0.55rem] uppercase tracking-[0.15em] font-bold mb-0.5" style={{ color: `${timerGlow}0.6)` }}>
            Tiempo restante para participar
          </div>
          <div
            className="text-xl md:text-2xl font-black tracking-wider"
            style={{
              color: timerColor,
              animation: `${timerAnim} 2s ease-in-out infinite`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {text}
          </div>
        </div>
        <div className="flex flex-col items-center ml-1">
          <div className="text-[0.5rem] uppercase tracking-wider font-bold" style={{ color: `${timerGlow}0.5)` }}>
            Cierra
          </div>
          <div className="text-[0.65rem] font-black" style={{ color: timerColor }}>
            {formatTime(deadline.toISOString())}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MATCH CARD COMPONENT
// ============================================
function MatchCard({ match, index }: { match: MatchPrediction; index: number }) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const isUpcoming = match.status === 'upcoming'

  // Countdown state for this specific match
  const [matchTimeLeft, setMatchTimeLeft] = useState(() => {
    const deadline = getDeadline(match.matchDate)
    return deadline.getTime() - Date.now()
  })

  useEffect(() => {
    if (!isUpcoming) return
    const deadline = getDeadline(match.matchDate)
    const interval = setInterval(() => {
      setMatchTimeLeft(deadline.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [match.matchDate, isUpcoming])

  const countdown = isUpcoming ? formatCountdown(matchTimeLeft) : null
  const isPredictionClosed = isUpcoming && countdown?.isExpired
  const isMatchUrgent = isUpcoming && countdown?.isUrgent && !countdown?.isExpired

  // Color scheme based on match status
  const accentColor = isLive ? '#ff3333' : isFinished ? '#00ff80' : isPredictionClosed ? '#ef4444' : isMatchUrgent ? '#ff6b35' : '#ffc800'
  const accentGlow = isLive ? 'rgba(255,51,51,' : isFinished ? 'rgba(0,255,128,' : isPredictionClosed ? 'rgba(239,68,68,' : isMatchUrgent ? 'rgba(255,107,53,' : 'rgba(255,200,0,'
  const statusLabel = isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : isPredictionClosed ? 'CERRADO' : 'PRÓXIMO'
  const statusIcon = isLive ? '&#x1F534;' : isFinished ? '&#x2705;' : isPredictionClosed ? '&#x1F6D1;' : '&#x23F0;'

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: `2px solid ${accentColor}`,
          boxShadow: `
            0 0 8px ${accentGlow}0.6),
            0 0 16px ${accentGlow}0.3),
            0 0 30px ${accentGlow}0.15),
            inset 0 0 8px ${accentGlow}0.08),
            inset 0 0 16px ${accentGlow}0.04)
          `,
        }}
      />

      {/* LED chase lights - top */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-3 py-0 pointer-events-none z-20">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={`top-${i}`}
            className="w-1 h-1 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 3px ${accentColor}, 0 0 6px ${accentColor}`,
              animation: `led-pulse 1.2s ease-in-out ${i * 0.08}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* LED chase lights - bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around px-3 py-0 pointer-events-none z-20">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={`bottom-${i}`}
            className="w-1 h-1 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 3px ${accentColor}, 0 0 6px ${accentColor}`,
              animation: `led-pulse 1.2s ease-in-out ${(14 - i) * 0.08}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Match content */}
      <div
        className="relative z-10 p-4 md:p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(5,15,10,0.95) 50%, rgba(0,0,0,0.9) 100%)',
        }}
      >
        {/* Status badge + date/venue row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLive && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ animation: 'live-dot 1s ease-in-out infinite' }}
              />
            )}
            <span
              className="px-2 py-0.5 rounded text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-wider"
              style={{
                background: `${accentGlow}0.15)`,
                color: accentColor,
                border: `1px solid ${accentGlow}0.4)`,
                boxShadow: `0 0 6px ${accentGlow}0.15)`,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-bold" style={{ color: accentColor, textShadow: `0 0 6px ${accentGlow}0.4)` }}>
              {formatDate(match.matchDate)}
            </span>
            <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
            <span className="text-[0.65rem] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {formatTime(match.matchDate)}
            </span>
          </div>
        </div>

        {/* Teams + Score row */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex-1 flex items-center gap-2 md:gap-3 justify-end">
            <span
              className="text-xs md:text-sm font-black uppercase tracking-wide text-right"
              style={{
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 0 6px rgba(255,255,255,0.15)',
              }}
            >
              {getTeamName(match.homeTeam)}
            </span>
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${accentGlow}0.3)`,
                boxShadow: `0 0 8px ${accentGlow}0.1)`,
              }}
            >
              <Image
                src={getTeamShield(match.homeTeam)}
                alt={getTeamName(match.homeTeam)}
                width={36}
                height={36}
                className="w-7 h-7 md:w-9 md:h-9 object-contain"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 flex-shrink-0">
            <span
              className="text-2xl md:text-3xl font-black"
              style={{
                color: '#ffc800',
                animation: (isLive || isFinished) && match.homeScore !== null ? 'score-glow 2s ease-in-out infinite' : 'none',
                textShadow: match.homeScore !== null
                  ? '0 0 8px rgba(255,200,0,0.8), 0 0 16px rgba(255,200,0,0.4)'
                  : '0 0 6px rgba(255,255,255,0.2)',
                minWidth: '1.5em',
                textAlign: 'center',
              }}
            >
              {match.homeScore !== null ? match.homeScore : '-'}
            </span>
            <span
              className="text-lg md:text-xl font-bold"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              :
            </span>
            <span
              className="text-2xl md:text-3xl font-black"
              style={{
                color: '#ffc800',
                animation: (isLive || isFinished) && match.awayScore !== null ? 'score-glow 2s ease-in-out infinite' : 'none',
                textShadow: match.awayScore !== null
                  ? '0 0 8px rgba(255,200,0,0.8), 0 0 16px rgba(255,200,0,0.4)'
                  : '0 0 6px rgba(255,255,255,0.2)',
                minWidth: '1.5em',
                textAlign: 'center',
              }}
            >
              {match.awayScore !== null ? match.awayScore : '-'}
            </span>
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-2 md:gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${accentGlow}0.3)`,
                boxShadow: `0 0 8px ${accentGlow}0.1)`,
              }}
            >
              <Image
                src={getTeamShield(match.awayTeam)}
                alt={getTeamName(match.awayTeam)}
                width={36}
                height={36}
                className="w-7 h-7 md:w-9 md:h-9 object-contain"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}
              />
            </div>
            <span
              className="text-xs md:text-sm font-black uppercase tracking-wide text-left"
              style={{
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 0 6px rgba(255,255,255,0.15)',
              }}
            >
              {getTeamName(match.awayTeam)}
            </span>
          </div>
        </div>

        {/* Per-match countdown timer for upcoming matches */}
        {isUpcoming && !isPredictionClosed && countdown && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-[0.55rem] uppercase tracking-wider font-bold" style={{ color: `${accentGlow}0.5)` }}>
              Cierra en:
            </span>
            <span
              className="text-xs md:text-sm font-black tracking-wider"
              style={{
                color: accentColor,
                textShadow: `0 0 6px ${accentGlow}0.4)`,
                animation: isMatchUrgent ? 'timer-urgent 1.5s ease-in-out infinite' : 'none',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {countdown.text}
            </span>
          </div>
        )}

        {/* Prediction closed message */}
        {isUpcoming && isPredictionClosed && (
          <div className="mt-3 text-center">
            <span
              className="inline-block px-3 py-1 rounded-lg text-[0.6rem] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              Predicciones cerradas para este partido
            </span>
          </div>
        )}

        {/* Venue */}
        {match.venue && (
          <div className="text-center mt-2">
            <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {match.venue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

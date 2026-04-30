'use client'

import { useState, useEffect } from 'react'
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
  'envigado': 'Envigado FC',
  'fortaleza-ceif': 'Fortaleza CEIF',
  'independiente-medellin': 'Ind. Medellín',
  'independiente-santa-fe': 'Ind. Santa Fe',
  'internacional-de-bogota': 'Internacional',
  'jaguares-de-cordoba': 'Jaguares de Córdoba',
  'la-equidad': 'La Equidad',
  'llaneros': 'Llaneros',
  'millonarios': 'Millonarios',
  'once-caldas': 'Once Caldas',
}

const PNG_ONLY_TEAMS = ['internacional-de-bogota']

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
        <div className="text-center mb-8">
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
      `}</style>
    </section>
  )
}

function MatchCard({ match, index }: { match: MatchPrediction; index: number }) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const isUpcoming = match.status === 'upcoming'

  // Color scheme based on match status
  const accentColor = isLive ? '#ff3333' : isFinished ? '#00ff80' : '#ffc800'
  const accentGlow = isLive ? 'rgba(255,51,51,' : isFinished ? 'rgba(0,255,128,' : 'rgba(255,200,0,'
  const statusLabel = isLive ? 'EN VIVO' : isFinished ? 'FINALIZADO' : 'PRÓXIMO'
  const statusIcon = isLive ? '🔴' : isFinished ? '✅' : '⏰'

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
              {statusIcon} {formatDate(match.matchDate)}
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

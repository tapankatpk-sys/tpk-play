'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

// ============================================
// TEAM DATA - 22 Liga BetPlay teams with regions
// ============================================
const TEAMS = [
  { slug: 'aguilas-doradas', name: 'Águilas Doradas', region: 'antioquia' },
  { slug: 'alianza-valledupar', name: 'Alianza Valledupar', region: 'cesar' },
  { slug: 'america-de-cali', name: 'América de Cali', region: 'valle' },
  { slug: 'atletico-bucaramanga', name: 'Atl. Bucaramanga', region: 'santander' },
  { slug: 'atletico-junior', name: 'Atl. Junior', region: 'atlantico' },
  { slug: 'atletico-nacional', name: 'Atl. Nacional', region: 'antioquia' },
  { slug: 'boyaca-chico', name: 'Boyacá Chicó', region: 'boyaca' },
  { slug: 'cucuta-deportivo', name: 'Cúcuta Deportivo', region: 'nortedesantander' },
  { slug: 'deportes-tolima', name: 'Deportes Tolima', region: 'tolima' },
  { slug: 'deportivo-cali', name: 'Deportivo Cali', region: 'valle' },
  { slug: 'deportivo-pasto', name: 'Deportivo Pasto', region: 'narino' },
  { slug: 'deportivo-pereira', name: 'Deportivo Pereira', region: 'risaralda' },
  { slug: 'envigado', name: 'Envigado FC', region: 'antioquia' },
  { slug: 'fortaleza-ceif', name: 'Fortaleza CEIF', region: 'cundinamarca' },
  { slug: 'independiente-medellin', name: 'Ind. Medellín', region: 'antioquia' },
  { slug: 'independiente-santa-fe', name: 'Ind. Santa Fe', region: 'cundinamarca' },
  { slug: 'internacional-de-bogota', name: 'Internacional', region: 'cundinamarca' },
  { slug: 'jaguares-de-cordoba', name: 'Jaguares', region: 'cordoba' },
  { slug: 'la-equidad', name: 'La Equidad', region: 'cundinamarca' },
  { slug: 'llaneros', name: 'Llaneros', region: 'meta' },
  { slug: 'millonarios', name: 'Millonarios', region: 'cundinamarca' },
  { slug: 'once-caldas', name: 'Once Caldas', region: 'caldas' },
]

const PNG_ONLY_TEAMS = ['internacional-de-bogota']

function getTeamShield(slug: string): string {
  const ext = PNG_ONLY_TEAMS.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

function getHourKey(): string {
  const now = new Date()
  const colombiaOffset = -5
  const colombiaTime = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset() / 60) * 3600000)
  return `${colombiaTime.getFullYear()}-${String(colombiaTime.getMonth() + 1).padStart(2, '0')}-${String(colombiaTime.getDate()).padStart(2, '0')}-${String(colombiaTime.getHours()).padStart(2, '0')}`
}

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  let state = Math.abs(hash) || 1
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// ============================================
// GAME CONFIG FROM API
// ============================================
interface RuletaConfigData {
  pointsExact: number
  pointsRegion: number
  spinDuration: number
  isActive: boolean
}

const DEFAULT_CONFIG: RuletaConfigData = {
  pointsExact: 50,
  pointsRegion: 10,
  spinDuration: 4,
  isActive: true,
}

type GamePhase = 'intro' | 'selecting' | 'spinning' | 'result' | 'disabled'

// ============================================
// MAIN COMPONENT
// ============================================
export default function RuletaEquipos() {
  const [config, setConfig] = useState<RuletaConfigData>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [selectedTeam, setSelectedTeam] = useState<typeof TEAMS[0] | null>(null)
  const [winningTeam, setWinningTeam] = useState<typeof TEAMS[0] | null>(null)
  const [rotation, setRotation] = useState(0)
  const [canPlay, setCanPlay] = useState(true)
  const [resultType, setResultType] = useState<'exact' | 'region' | 'miss' | null>(null)
  const [points, setPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [ledIndex, setLedIndex] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const ledIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch config from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/ruleta')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig({
              pointsExact: data.pointsExact || 50,
              pointsRegion: data.pointsRegion || 10,
              spinDuration: data.spinDuration || 4,
              isActive: data.isActive !== false,
            })
          }
        }
      } catch { /* use defaults */ }
      setConfigLoaded(true)
    }
    fetchConfig()
  }, [])

  // Check hourly play limit
  useEffect(() => {
    if (!configLoaded) return
    if (!config.isActive) {
      setPhase('disabled')
      return
    }
    const hourKey = getHourKey()
    const played = localStorage.getItem(`tpk_ruleta_played_${hourKey}`)
    if (played) {
      setCanPlay(false)
    }
  }, [configLoaded, config.isActive])

  // LED chase animation
  useEffect(() => {
    ledIntervalRef.current = setInterval(() => {
      setLedIndex(prev => (prev + 1) % 24)
    }, 150)
    return () => {
      if (ledIntervalRef.current) clearInterval(ledIntervalRef.current)
    }
  }, [])

  // Determine winning team from hourly seed
  const getWinningTeam = useCallback((): typeof TEAMS[0] => {
    const hourKey = getHourKey()
    const rng = seededRandom(`ruleta-${hourKey}`)
    const index = Math.floor(rng() * TEAMS.length)
    return TEAMS[index]
  }, [])

  // Start game - go to selection phase
  const startGame = () => {
    setPhase('selecting')
    setSelectedTeam(null)
    setWinningTeam(null)
    setResultType(null)
    setPoints(0)
    setShowConfetti(false)
  }

  // Spin the wheel
  const spinWheel = useCallback(() => {
    if (!selectedTeam) return

    const winner = getWinningTeam()
    setWinningTeam(winner)
    setPhase('spinning')

    // Calculate target rotation
    const winIndex = TEAMS.findIndex(t => t.slug === winner.slug)
    const segmentAngle = 360 / TEAMS.length
    // Target angle: multiple full rotations + position of winning team
    // The pointer is at the top (0°/360°), so we need the winning segment to end up at the top
    const targetSegmentAngle = 360 - (winIndex * segmentAngle + segmentAngle / 2)
    const fullRotations = 4 + Math.floor(Math.random() * 3) // 4-6 full rotations
    const targetRotation = fullRotations * 360 + targetSegmentAngle

    // Animate using CSS transition
    setRotation(prev => prev + targetRotation)

    // Wait for spin to complete
    const spinTime = config.spinDuration * 1000
    setTimeout(() => {
      // Determine result
      const isExact = winner.slug === selectedTeam.slug
      const isRegion = !isExact && winner.region === selectedTeam.region

      if (isExact) {
        setResultType('exact')
        setPoints(config.pointsExact)
        setShowConfetti(true)
      } else if (isRegion) {
        setResultType('region')
        setPoints(config.pointsRegion)
      } else {
        setResultType('miss')
        setPoints(0)
      }

      setPhase('result')
      const hourKey = getHourKey()
      localStorage.setItem(`tpk_ruleta_played_${hourKey}`, JSON.stringify({
        points: isExact ? config.pointsExact : isRegion ? config.pointsRegion : 0,
        result: isExact ? 'exact' : isRegion ? 'region' : 'miss'
      }))

      // Hide confetti after 3s
      if (isExact) {
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }, spinTime + 300)
  }, [selectedTeam, getWinningTeam, config])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (ledIntervalRef.current) clearInterval(ledIntervalRef.current)
    }
  }, [])

  const segmentAngle = 360 / TEAMS.length

  // ============================================
  // RENDER
  // ============================================
  if (!configLoaded) {
    return (
      <div className="relative">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider" style={{ color: '#ffc800' }}>
            RULETA DE EQUIPOS
          </h3>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,200,0,0.2)' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ffc800', borderTopColor: 'transparent' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #ffc800)' }} />
          <h3
            className="text-lg md:text-xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #ffc800, #ff00ff, #00ffff, #ffc800)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(255,200,0,0.4))',
            }}
          >
            RULETA DE EQUIPOS
          </h3>
          <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #ffc800)' }} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,200,0,0.4)' }}>
          Apuesta por tu equipo y gira la ruleta
        </p>
      </div>

      {/* Game Container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(30,10,0,0.9) 50%, rgba(0,0,0,0.85) 100%)',
          border: '2px solid rgba(255,200,0,0.3)',
          boxShadow: '0 0 25px rgba(255,200,0,0.15), 0 0 50px rgba(255,0,255,0.08)',
        }}
      >
        <div className="relative z-10 p-4 md:p-6">
          {/* ====== DISABLED PHASE ====== */}
          {phase === 'disabled' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl mb-2" style={{ filter: 'grayscale(1)' }}>🎰</div>
              <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Ruleta No Disponible
              </h4>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                El juego está desactivado temporalmente
              </p>
            </div>
          )}

          {/* ====== INTRO PHASE ====== */}
          {phase === 'intro' && (
            <div className="text-center py-8 space-y-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                  boxShadow: '0 0 25px rgba(255,200,0,0.4), 0 0 50px rgba(255,0,255,0.2)',
                }}
              >
                <span className="text-4xl">🎰</span>
              </div>
              <div>
                <h4 className="text-xl font-black uppercase" style={{ color: '#ffc800', textShadow: '0 0 10px rgba(255,200,0,0.5)' }}>
                  Ruleta de Equipos
                </h4>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Selecciona un escudo, gira la ruleta y gana puntos
                </p>
              </div>

              {/* Prizes info */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#ffc800' }}>Escudo Exacto</div>
                  <div className="text-sm font-black" style={{ color: '#ffc800' }}>+{config.pointsExact} pts</div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}>
                  <div className="text-xs font-bold" style={{ color: '#00ffff' }}>Misma Región</div>
                  <div className="text-sm font-black" style={{ color: '#00ffff' }}>+{config.pointsRegion} pts</div>
                </div>
              </div>

              {!canPlay ? (
                <div>
                  <div className="px-4 py-3 rounded-xl inline-block" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                    <p className="text-xs font-bold" style={{ color: '#ffc800' }}>
                      Ya jugaste esta hora. Vuelve la próxima hora.
                    </p>
                  </div>
                  <p className="text-[0.6rem] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Cambia cada hora · Una oportunidad por jugador
                  </p>
                </div>
              ) : (
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                    color: '#000',
                    boxShadow: '0 0 15px rgba(255,200,0,0.4), 0 0 30px rgba(255,0,255,0.2)',
                  }}
                >
                  Jugar Ruleta
                </button>
              )}
            </div>
          )}

          {/* ====== SELECTING PHASE ====== */}
          {phase === 'selecting' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-black uppercase" style={{ color: '#ffc800', textShadow: '0 0 8px rgba(255,200,0,0.5)' }}>
                  Selecciona tu Escudo
                </h4>
                <p className="text-[0.6rem] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Elige el equipo que crees que saldrá en la ruleta
                </p>
              </div>

              {/* Team Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-w-lg mx-auto">
                {TEAMS.map((team) => {
                  const isSelected = selectedTeam?.slug === team.slug
                  return (
                    <button
                      key={team.slug}
                      onClick={() => setSelectedTeam(team)}
                      className="relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                      style={{
                        background: isSelected ? 'rgba(255,200,0,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '2px solid #ffc800' : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected ? '0 0 12px rgba(255,200,0,0.4), inset 0 0 8px rgba(255,200,0,0.1)' : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <Image
                        src={getTeamShield(team.slug)}
                        alt={team.name}
                        width={32}
                        height={32}
                        className="w-7 h-7 md:w-8 md:h-8 object-contain"
                        style={{
                          filter: isSelected ? 'drop-shadow(0 0 6px rgba(255,200,0,0.6)) brightness(1.2)' : 'brightness(0.7)',
                        }}
                      />
                      <span
                        className="text-[0.4rem] font-bold uppercase mt-0.5 leading-tight text-center truncate w-full px-0.5"
                        style={{ color: isSelected ? '#ffc800' : 'rgba(255,255,255,0.3)' }}
                      >
                        {team.name.split(' ').pop()}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                          background: 'radial-gradient(circle, rgba(255,200,0,0.1) 0%, transparent 70%)',
                        }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Spin button */}
              <div className="text-center pt-2">
                <button
                  onClick={spinWheel}
                  disabled={!selectedTeam}
                  className="px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedTeam ? 'linear-gradient(135deg, #ffc800, #ff00ff)' : 'rgba(255,255,255,0.1)',
                    color: '#000',
                    boxShadow: selectedTeam ? '0 0 20px rgba(255,200,0,0.4), 0 0 40px rgba(255,0,255,0.2)' : 'none',
                  }}
                >
                  🎰 ¡GIRAR LA RULETA!
                </button>
              </div>
            </div>
          )}

          {/* ====== SPINNING PHASE ====== */}
          {phase === 'spinning' && (
            <div className="space-y-4">
              {/* Roulette Wheel */}
              <div className="relative flex items-center justify-center py-4">
                {/* Pointer / Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '12px solid transparent',
                      borderRight: '12px solid transparent',
                      borderTop: '20px solid #ffc800',
                      filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.8))',
                    }}
                  />
                </div>

                {/* LED ring */}
                <div className="absolute" style={{ width: '340px', height: '340px' }}>
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * 360
                    const isActive = i === ledIndex || i === (ledIndex + 1) % 24
                    const colors = ['#ffc800', '#ff00ff', '#00ffff', '#ff00ff']
                    const color = colors[i % colors.length]
                    return (
                      <div
                        key={`led-${i}`}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${50 + 48.5 * Math.cos((angle - 90) * Math.PI / 180)}%`,
                          top: `${50 + 48.5 * Math.sin((angle - 90) * Math.PI / 180)}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                          boxShadow: isActive ? `0 0 6px ${color}, 0 0 12px ${color}` : 'none',
                          transition: 'all 0.15s',
                        }}
                      />
                    )
                  })}
                </div>

                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: '300px',
                    height: '300px',
                    transform: `rotate(${rotation}deg)`,
                    transition: `transform ${config.spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
                    boxShadow: '0 0 30px rgba(255,200,0,0.3), 0 0 60px rgba(255,0,255,0.15), inset 0 0 20px rgba(0,0,0,0.5)',
                    border: '3px solid rgba(255,200,0,0.4)',
                  }}
                >
                  {/* Segments */}
                  {TEAMS.map((team, i) => {
                    const startAngle = i * segmentAngle
                    const isEven = i % 2 === 0
                    return (
                      <div
                        key={team.slug}
                        className="absolute"
                        style={{
                          width: '100%',
                          height: '100%',
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + segmentAngle - 90) * Math.PI / 180)}%)`,
                          background: isEven
                            ? 'linear-gradient(135deg, rgba(255,200,0,0.15), rgba(30,10,0,0.9))'
                            : 'linear-gradient(135deg, rgba(255,0,255,0.12), rgba(20,0,30,0.9))',
                        }}
                      >
                        {/* Team shield in segment */}
                        <div
                          className="absolute"
                          style={{
                            left: `${50 + 32 * Math.cos((startAngle + segmentAngle / 2 - 90) * Math.PI / 180)}%`,
                            top: `${50 + 32 * Math.sin((startAngle + segmentAngle / 2 - 90) * Math.PI / 180)}%`,
                            transform: 'translate(-50%, -50%) rotate(' + (startAngle + segmentAngle / 2) + 'deg)',
                          }}
                        >
                          <Image
                            src={getTeamShield(team.slug)}
                            alt={team.name}
                            width={24}
                            height={24}
                            className="w-5 h-5 object-contain"
                            style={{ filter: 'drop-shadow(0 0 3px rgba(255,200,0,0.5))' }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {/* Center hub */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ zIndex: 10 }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #ffc800, #ff00ff)',
                        boxShadow: '0 0 15px rgba(255,200,0,0.5), 0 0 30px rgba(255,0,255,0.3)',
                        border: '2px solid rgba(255,200,0,0.6)',
                      }}
                    >
                      <span className="text-xl font-black" style={{ color: '#000' }}>TPK</span>
                    </div>
                  </div>

                  {/* Segment borders */}
                  {TEAMS.map((_, i) => {
                    const angle = i * segmentAngle
                    return (
                      <div
                        key={`border-${i}`}
                        className="absolute top-1/2 left-1/2"
                        style={{
                          width: '1px',
                          height: '50%',
                          background: 'rgba(255,200,0,0.2)',
                          transformOrigin: '0 0',
                          transform: `rotate(${angle}deg)`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Selected team indicator */}
              {selectedTeam && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                    <span className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,200,0,0.6)' }}>Tu apuesta:</span>
                    <Image src={getTeamShield(selectedTeam.slug)} alt={selectedTeam.name} width={16} height={16} className="w-4 h-4 object-contain" />
                    <span className="text-xs font-bold" style={{ color: '#ffc800' }}>{selectedTeam.name}</span>
                  </div>
                </div>
              )}

              {/* Spinning text */}
              <div className="text-center">
                <p className="text-sm font-bold animate-pulse" style={{ color: '#ffc800', textShadow: '0 0 10px rgba(255,200,0,0.5)' }}>
                  🎰 Girando...
                </p>
              </div>
            </div>
          )}

          {/* ====== RESULT PHASE ====== */}
          {phase === 'result' && winningTeam && (
            <div className="space-y-4">
              {/* Winning team display */}
              <div className="text-center py-4">
                <div className="text-[0.6rem] uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  La ruleta cayó en:
                </div>
                <div
                  className="inline-flex flex-col items-center"
                  style={{
                    animation: resultType === 'exact' ? 'pulse-glow-gold 1s ease-in-out infinite' : 'none',
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: resultType === 'exact'
                        ? 'linear-gradient(135deg, rgba(255,200,0,0.2), rgba(255,0,255,0.2))'
                        : resultType === 'region'
                        ? 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,200,0,0.15))'
                        : 'rgba(255,255,255,0.05)',
                      border: resultType === 'exact'
                        ? '3px solid #ffc800'
                        : resultType === 'region'
                        ? '2px solid #00ffff'
                        : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: resultType === 'exact'
                        ? '0 0 20px rgba(255,200,0,0.5), 0 0 40px rgba(255,0,255,0.3)'
                        : resultType === 'region'
                        ? '0 0 10px rgba(0,255,255,0.3)'
                        : 'none',
                    }}
                  >
                    <Image
                      src={getTeamShield(winningTeam.slug)}
                      alt={winningTeam.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                      style={{
                        filter: resultType === 'exact'
                          ? 'drop-shadow(0 0 8px rgba(255,200,0,0.6)) brightness(1.2)'
                          : 'brightness(0.9)',
                      }}
                    />
                  </div>
                  <span
                    className="mt-2 text-sm font-black uppercase"
                    style={{
                      color: resultType === 'exact' ? '#ffc800' : resultType === 'region' ? '#00ffff' : 'rgba(255,255,255,0.5)',
                      textShadow: resultType === 'exact' ? '0 0 10px rgba(255,200,0,0.5)' : 'none',
                    }}
                  >
                    {winningTeam.name}
                  </span>
                </div>
              </div>

              {/* Result message */}
              <div className="text-center space-y-3">
                {resultType === 'exact' && (
                  <>
                    <div className="text-4xl" style={{ filter: 'drop-shadow(0 0 15px rgba(255,200,0,0.6))' }}>🎉🏆🎉</div>
                    <h4 className="text-xl font-black uppercase" style={{ color: '#ffc800', textShadow: '0 0 10px rgba(255,200,0,0.6)' }}>
                      ¡ESCUDO EXACTO!
                    </h4>
                    <div
                      className="inline-block px-5 py-2 rounded-xl"
                      style={{ background: 'rgba(255,200,0,0.1)', border: '2px solid rgba(255,200,0,0.4)', boxShadow: '0 0 15px rgba(255,200,0,0.2)' }}
                    >
                      <span className="text-2xl font-black" style={{ color: '#ffc800', textShadow: '0 0 12px rgba(255,200,0,0.6)' }}>
                        +{points} pts
                      </span>
                    </div>
                  </>
                )}
                {resultType === 'region' && (
                  <>
                    <div className="text-3xl">🎯</div>
                    <h4 className="text-lg font-bold" style={{ color: '#00ffff', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
                      ¡Misma Región!
                    </h4>
                    <p className="text-xs" style={{ color: 'rgba(0,255,255,0.6)' }}>
                      {selectedTeam?.name} y {winningTeam.name} son de la misma región
                    </p>
                    <div
                      className="inline-block px-4 py-2 rounded-lg"
                      style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}
                    >
                      <span className="text-xl font-black" style={{ color: '#00ffff' }}>
                        +{points} pts
                      </span>
                    </div>
                  </>
                )}
                {resultType === 'miss' && (
                  <>
                    <div className="text-3xl">😔</div>
                    <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      No acertaste
                    </h4>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Tu equipo: <b style={{ color: '#ffc800' }}>{selectedTeam?.name}</b> · Resultado: <b style={{ color: '#ff00ff' }}>{winningTeam.name}</b>
                    </p>
                  </>
                )}
              </div>

              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Vuelve la próxima hora para una nueva partida
              </p>
            </div>
          )}
        </div>

        {/* Confetti overlay */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => {
              const colors = ['#ffc800', '#ff00ff', '#00ffff', '#4ade80', '#f97316']
              const color = colors[i % colors.length]
              const left = Math.random() * 100
              const delay = Math.random() * 1
              const duration = 2 + Math.random() * 2
              const size = 4 + Math.random() * 6
              return (
                <div
                  key={`conf-${i}`}
                  className="absolute rounded-sm"
                  style={{
                    left: `${left}%`,
                    top: '-10px',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`,
                    animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-glow-gold {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(255,200,0,0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(255,200,0,0.6)); }
        }
      `}</style>
    </div>
  )
}

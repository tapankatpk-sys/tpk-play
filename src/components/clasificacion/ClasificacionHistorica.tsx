'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 20 Liga BetPlay teams
const TEAMS = [
  { slug: 'aguilas-doradas', name: 'Águilas Doradas' },
  { slug: 'alianza-valledupar', name: 'Alianza Valledupar' },
  { slug: 'america-de-cali', name: 'América de Cali' },
  { slug: 'atletico-bucaramanga', name: 'Atl. Bucaramanga' },
  { slug: 'atletico-junior', name: 'Atl. Junior' },
  { slug: 'atletico-nacional', name: 'Atl. Nacional' },
  { slug: 'boyaca-chico', name: 'Boyacá Chicó' },
  { slug: 'cucuta-deportivo', name: 'Cúcuta Deportivo' },
  { slug: 'deportes-tolima', name: 'Deportes Tolima' },
  { slug: 'deportivo-cali', name: 'Deportivo Cali' },
  { slug: 'deportivo-pasto', name: 'Deportivo Pasto' },
  { slug: 'deportivo-pereira', name: 'Deportivo Pereira' },
  { slug: 'fortaleza-ceif', name: 'Fortaleza CEIF' },
  { slug: 'independiente-medellin', name: 'Ind. Medellín' },
  { slug: 'independiente-santa-fe', name: 'Ind. Santa Fe' },
  { slug: 'internacional-de-bogota', name: 'Internacional' },
  { slug: 'jaguares-de-cordoba', name: 'Jaguares de Córdoba' },
  { slug: 'llaneros', name: 'Llaneros' },
  { slug: 'millonarios', name: 'Millonarios' },
  { slug: 'once-caldas', name: 'Once Caldas' },
]

const PNG_ONLY = ['internacional-de-bogota']

function getTeamImage(slug: string): string {
  const ext = PNG_ONLY.includes(slug) ? 'png' : 'svg'
  return `/images/teams/${slug}.${ext}`
}

// Deterministic team selection based on current hour
function getHourlyTeam(): { slug: string; name: string } {
  const now = new Date()
  const hourKey = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  const index = hourKey % TEAMS.length
  return TEAMS[index]
}

// Ordering criteria - hardcoded reasonable values
const CRITERIA_LIST = [
  {
    id: 'titulos',
    label: 'Más títulos',
    icon: '🏆',
    // Ordered from most to least titles (liga+copa)
    order: [
      'atletico-nacional',   // 34
      'millonarios',         // 24
      'america-de-cali',     // 22
      'deportivo-cali',      // 14
      'once-caldas',         // 8
      'independiente-santa-fe', // 7
      'atletico-junior',     // 7
      'deportes-tolima',     // 5
      'independiente-medellin', // 5
      'atletico-bucaramanga', // 3
      'deportivo-pereira',   // 2
      'boyaca-chico',        // 2
      'deportivo-pasto',     // 1
      'cucuta-deportivo',    // 1
      'aguilas-doradas',     // 1
      'jaguares-de-cordoba', // 0
      'fortaleza-ceif',      // 0
      'alianza-valledupar',  // 0
      'llaneros',            // 0
      'internacional-de-bogota', // 0
    ],
  },
  {
    id: 'antiguo',
    label: 'Más antiguo',
    icon: '📅',
    // Ordered from oldest to newest
    order: [
      'atletico-junior',       // 1924
      'deportivo-cali',        // 1912
      'america-de-cali',       // 1927
      'atletico-nacional',     // 1947
      'millonarios',           // 1946
      'independiente-santa-fe', // 1941
      'independiente-medellin', // 1913
      'once-caldas',           // 1949
      'deportes-tolima',       // 1954
      'atletico-bucaramanga',  // 1949
      'deportivo-pasto',       // 1949
      'cucuta-deportivo',      // 1924
      'boyaca-chico',          // 2003
      'aguilas-doradas',       // 2011
      'jaguares-de-cordoba',   // 2013
      'fortaleza-ceif',        // 2000
      'deportivo-pereira',     // 1944
      'alianza-valledupar',    // 2004
      'llaneros',              // 2012
      'internacional-de-bogota', // 2023
    ],
  },
  {
    id: 'ciudad',
    label: 'Ciudad A-Z',
    icon: '🏙️',
    // Ordered by city name alphabetically
    order: [
      'atletico-bucaramanga',  // Bucaramanga
      'boyaca-chico',          // Tunja (Boyacá)
      'cucuta-deportivo',      // Cúcuta
      'deportivo-cali',        // Cali
      'america-de-cali',       // Cali
      'fortaleza-ceif',        // Bogotá
      'independiente-santa-fe', // Bogotá
      'millonarios',           // Bogotá
      'internacional-de-bogota', // Bogotá
      'independiente-medellin', // Medellín
      'atletico-nacional',     // Medellín
      'aguilas-doradas',       // Rionegro
      'deportivo-pasto',       // Pasto
      'deportivo-pereira',     // Pereira
      'jaguares-de-cordoba',   // Montería
      'atletico-junior',       // Barranquilla
      'deportes-tolima',       // Ibagué
      'once-caldas',           // Manizales
      'alianza-valledupar',    // Valledupar
      'llaneros',              // Villavicencio
    ],
  },
  {
    id: 'hinchas',
    label: 'Más hinchas',
    icon: '👥',
    // Ordered from most to least fans (estimated)
    order: [
      'atletico-nacional',
      'america-de-cali',
      'millonarios',
      'deportivo-cali',
      'atletico-junior',
      'independiente-santa-fe',
      'independiente-medellin',
      'deportes-tolima',
      'once-caldas',
      'deportivo-pereira',
      'deportivo-pasto',
      'atletico-bucaramanga',
      'cucuta-deportivo',
      'boyaca-chico',
      'aguilas-doradas',
      'jaguares-de-cordoba',
      'fortaleza-ceif',
      'alianza-valledupar',
      'llaneros',
      'internacional-de-bogota',
    ],
  },
  {
    id: 'goles',
    label: 'Más goles históricos',
    icon: '⚽',
    // Ordered from most to least historical goals
    order: [
      'atletico-nacional',
      'millonarios',
      'america-de-cali',
      'deportivo-cali',
      'atletico-junior',
      'independiente-santa-fe',
      'independiente-medellin',
      'deportes-tolima',
      'once-caldas',
      'atletico-bucaramanga',
      'deportivo-pereira',
      'deportivo-pasto',
      'boyaca-chico',
      'cucuta-deportivo',
      'aguilas-doradas',
      'jaguares-de-cordoba',
      'fortaleza-ceif',
      'alianza-valledupar',
      'llaneros',
      'internacional-de-bogota',
    ],
  },
]

// Get current criteria based on hour
function getCurrentCriteria() {
  const now = new Date()
  const hourKey = now.getHours()
  return CRITERIA_LIST[hourKey % CRITERIA_LIST.length]
}

interface SortableItemProps {
  id: string
  team: { slug: string; name: string }
  rank: number
  isCorrect: boolean | null
  isChecked: boolean
}

function SortableItem({ id, team, rank, isCorrect, isChecked }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const borderColor = isChecked
    ? isCorrect
      ? 'rgba(0,255,100,0.5)'
      : 'rgba(255,50,50,0.5)'
    : 'rgba(6,182,212,0.3)'

  const bgColor = isChecked
    ? isCorrect
      ? 'rgba(0,255,100,0.08)'
      : 'rgba(255,50,50,0.08)'
    : 'rgba(6,182,212,0.05)'

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '0.75rem',
        boxShadow: isCorrect ? '0 0 8px rgba(0,255,100,0.3)' : 'none',
      }}
      className="flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing touch-none"
      {...attributes}
      {...listeners}
    >
      {/* Rank number */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0" style={{
        background: 'rgba(6,182,212,0.15)',
        border: '1px solid rgba(6,182,212,0.3)',
        color: '#06b6d4',
      }}>
        {rank + 1}
      </div>

      {/* Escudo */}
      <img
        src={getTeamImage(team.slug)}
        alt={team.name}
        className="w-8 h-8 object-contain flex-shrink-0"
        style={{ filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.5))' }}
      />

      {/* Team name */}
      <span className="flex-1 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {team.name}
      </span>

      {/* Drag handle */}
      <span className="text-lg" style={{ color: 'rgba(255,255,255,0.3)' }}>&#x2630;</span>

      {/* Correct/Incorrect indicator */}
      {isChecked && (
        <span className="text-sm" style={{ color: isCorrect ? '#00ff64' : '#ff5050' }}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </div>
  )
}

interface Config {
  teamsPerRound: number
  pointsPerfect: number
  pointsPartial: number
  timeLimit: number
  timeBonusMax: number
  isActive: boolean
}

type GamePhase = 'intro' | 'playing' | 'won' | 'timeout' | 'played'

const ACCENT = '#06b6d4'
const ACCENT_LIGHT = 'rgba(6,182,212,0.3)'
const ACCENT_GLOW = 'rgba(6,182,212,0.5)'

export default function ClasificacionHistorica() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [team, setTeam] = useState(getHourlyTeam())
  const [criteria, setCriteria] = useState(getCurrentCriteria())
  const [teamOrder, setTeamOrder] = useState<string[]>([])
  const [correctOrder, setCorrectOrder] = useState<string[]>([])
  const [timer, setTimer] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [errors, setErrors] = useState(0)
  const [isChecked, setIsChecked] = useState(false)
  const [checkedResults, setCheckedResults] = useState<(boolean | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Hourly play check
  const getHourKey = useCallback(() => {
    const now = new Date()
    return `tpk_clasificacion_played_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`
  }, [])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/clasificacion')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setConfig(data)
          }
        }
      } catch (err) {
        console.error('Error fetching clasificacion config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Update team every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTeam = getHourlyTeam()
      if (newTeam.slug !== team.slug) {
        setTeam(newTeam)
      }
      const newCriteria = getCurrentCriteria()
      if (newCriteria.id !== criteria.id) {
        setCriteria(newCriteria)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [team.slug, criteria.id])

  // Check if already played this hour
  useEffect(() => {
    const played = localStorage.getItem(getHourKey())
    if (played) {
      setPhase('played')
    }
  }, [getHourKey])

  // Timer management
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const next = prev + 1
          if (config?.timeLimit && config.timeLimit > 0 && next >= config.timeLimit) {
            setPhase('timeout')
            return config.timeLimit
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase, config?.timeLimit])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleStart = useCallback(() => {
    if (!config) return
    const currentCriteria = getCurrentCriteria()
    setCriteria(currentCriteria)

    // Select N teams from the criteria's order
    const numTeams = config.teamsPerRound
    const selectedSlugs = currentCriteria.order.slice(0, numTeams)

    // Shuffle for player's starting order
    const shuffled = [...selectedSlugs].sort(() => Math.random() - 0.5)

    setTeamOrder(shuffled)
    setCorrectOrder(selectedSlugs)
    setTimer(0)
    setTotalPoints(0)
    setErrors(0)
    setIsChecked(false)
    setCheckedResults(new Array(numTeams).fill(null))
    setPhase('playing')
  }, [config])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || phase !== 'playing') return

    setTeamOrder(prev => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [phase])

  const handleCheck = useCallback(() => {
    if (!config || isChecked || phase !== 'playing') return

    const results = teamOrder.map((slug, index) => slug === correctOrder[index])
    const errorCount = results.filter(r => !r).length
    let points = 0

    if (errorCount === 0) {
      points = config.pointsPerfect
      // Time bonus
      if (config.timeBonusMax > 0 && timer > 0) {
        points += Math.max(0, config.timeBonusMax - timer)
      }
    } else {
      points = Math.max(0, config.pointsPartial - (errorCount * 10))
    }

    setCheckedResults(results)
    setErrors(errorCount)
    setTotalPoints(points)
    setIsChecked(true)

    // Delay to show results before winning
    setTimeout(() => {
      setPhase('won')
    }, 1500)
  }, [config, isChecked, phase, teamOrder, correctOrder, timer])

  // Save played state & points on win
  useEffect(() => {
    if (phase === 'won') {
      localStorage.setItem(getHourKey(), JSON.stringify({ errors, points: totalPoints }))
      const userCode = localStorage.getItem('tpk_user_code')
      if (userCode) {
        fetch('/api/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: userCode, addPoints: totalPoints }),
        }).catch(() => {})
      }
    }
  }, [phase, getHourKey, errors, totalPoints])

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Get next hour change time
  const getNextHourInfo = () => {
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
    const diff = nextHour.getTime() - now.getTime()
    const mins = Math.floor(diff / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const teamImage = team ? getTeamImage(team.slug) : ''
  const numTeams = config?.teamsPerRound ?? 6

  // =================== RENDER ===================

  // Already played this hour
  if (phase === 'played') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a2e 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(6,182,212,0.05)`,
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})` }}>&#x1F3C6;</div>
          <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ¡Ya jugaste esta hora!
          </h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            El criterio de clasificación cambia cada hora
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(6,182,212,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo criterio en: {getNextHourInfo()}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <img src={teamImage} alt={team.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }} />
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Criterio: {criteria.icon} {criteria.label}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a2e 50%, #0a0a0a 100%)',
        border: `2px solid ${ACCENT_LIGHT}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(6,182,212,0.05)`,
      }}>
        {/* LED Chase border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{
          background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(6,182,212,0.1) 8px, rgba(6,182,212,0.1) 10px)`,
          animation: 'chase-lights 2s linear infinite',
        }} />

        <div className="text-center py-8 relative">
          {/* Neon title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2" style={{
              background: `linear-gradient(90deg, ${ACCENT}, #22d3ee, ${ACCENT})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
            }}>
              &#x1F3C6; CLASIFICACIÓN HISTÓRICA
            </h2>
            <div className="h-0.5 mx-auto max-w-xs" style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }} />
          </div>

          {/* Current criteria */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center p-4" style={{
                background: 'rgba(6,182,212,0.05)',
                border: `2px solid ${ACCENT_LIGHT}`,
                boxShadow: `0 0 30px ${ACCENT_LIGHT}`,
              }}>
                <div className="text-3xl mb-1">{criteria.icon}</div>
                <p className="text-xs font-black text-center" style={{ color: ACCENT }}>{criteria.label}</p>
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[0.6rem] font-black" style={{
                background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
                color: '#000',
                boxShadow: `0 0 10px ${ACCENT_GLOW}`,
              }}>
                ESTA HORA
              </div>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El criterio cambia cada hora
              </p>
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{numTeams}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Equipos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.timeLimit || '∞'}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Segundos</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.08)',
              border: `1px solid ${ACCENT_LIGHT}`,
            }}>
              <div className="text-2xl font-black" style={{ color: ACCENT }}>{config?.pointsPerfect || 150}</div>
              <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos Max</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 rounded-xl text-left max-w-sm mx-auto" style={{
            background: 'rgba(34,211,238,0.08)',
            border: '1px solid rgba(34,211,238,0.2)',
          }}>
            <h4 className="text-sm font-black uppercase mb-2" style={{ color: '#22d3ee' }}>&#x1F4CB; Cómo jugar</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <li>&#x2022; Se muestran {numTeams} escudos de equipos</li>
              <li>&#x2022; Arrastra para ordenarlos según el criterio</li>
              <li>&#x2022; El criterio cambia cada hora</li>
              <li>&#x2022; Orden perfecto = puntos máximos</li>
              <li>&#x2022; Cada error reduce los puntos</li>
              <li>&#x2022; Más rápido = más bonus de tiempo</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
              color: '#000',
              boxShadow: `0 0 30px ${ACCENT_GLOW}, 0 0 60px rgba(34,211,238,0.2)`,
              border: 'none',
            }}
          >
            &#x1F3C6; ¡ORDENAR EQUIPOS!
          </button>
        </div>

        <style jsx>{`
          @keyframes gradient-shift {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes chase-lights {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
        `}</style>
      </div>
    )
  }

  // Timeout screen
  if (phase === 'timeout') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        border: '2px solid rgba(255,50,50,0.4)',
        borderRadius: '1.5rem',
        boxShadow: '0 0 30px rgba(255,50,50,0.2)',
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">&#x23F0;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-3" style={{ color: '#ff5050' }}>
            ¡Tiempo agotado!
          </h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            El criterio cambia cada hora. ¡Intenta de nuevo la próxima hora!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255,50,50,0.1)',
            border: '1px solid rgba(255,50,50,0.3)',
          }}>
            <span style={{ color: '#ff5050' }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: '#ff5050' }}>
              Próximo criterio en: {getNextHourInfo()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Win / Results screen
  if (phase === 'won') {
    const isPerfect = errors === 0
    return (
      <div className="w-full max-w-2xl mx-auto p-4" style={{
        background: `linear-gradient(135deg, #0a0a0a 0%, ${isPerfect ? '#0a2e1a' : '#2e0a0a'} 50%, #0a0a0a 100%)`,
        border: `2px solid ${isPerfect ? 'rgba(0,255,100,0.4)' : 'rgba(6,182,212,0.4)'}`,
        borderRadius: '1.5rem',
        boxShadow: `0 0 40px ${isPerfect ? 'rgba(0,255,100,0.3)' : 'rgba(6,182,212,0.3)'}`,
      }}>
        <div className="text-center py-12">
          <div className="text-7xl mb-4" style={{
            animation: 'pulse 1s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px ${ACCENT_GLOW})`,
          }}>&#x1F3C6;</div>
          <h3 className="text-2xl font-black uppercase tracking-wider mb-2" style={{
            background: `linear-gradient(90deg, ${ACCENT}, #22d3ee, ${ACCENT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {isPerfect ? '¡ORDEN PERFECTO!' : '¡CLASIFICACIÓN COMPLETADA!'}
          </h3>
          <p className="text-lg font-bold mb-2" style={{ color: ACCENT }}>
            {criteria.icon} {criteria.label}
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: ACCENT }}>{formatTime(timer)}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Tiempo</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: isPerfect ? '#00ff64' : '#ff8844' }}>{errors}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Errores</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
              <div className="text-xl font-black" style={{ color: '#00ff64' }}>+{totalPoints}</div>
              <div className="text-[0.6rem] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Puntos</div>
            </div>
          </div>

          {/* Show correct order */}
          <div className="mb-6 p-3 rounded-xl max-w-sm mx-auto" style={{
            background: 'rgba(6,182,212,0.08)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <p className="text-xs font-black uppercase mb-2" style={{ color: ACCENT }}>Orden Correcto:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {correctOrder.map((slug, i) => {
                const teamData = TEAMS.find(t => t.slug === slug)
                return (
                  <div key={slug} className="flex items-center gap-1 px-2 py-1 rounded" style={{
                    background: 'rgba(6,182,212,0.1)',
                  }}>
                    <span className="text-[0.6rem] font-bold" style={{ color: ACCENT }}>{i + 1}.</span>
                    <img src={getTeamImage(slug)} alt="" className="w-4 h-4 object-contain" />
                    <span className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.7)' }}>{teamData?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(6,182,212,0.1)',
            border: `1px solid ${ACCENT_LIGHT}`,
          }}>
            <span style={{ color: ACCENT }}>&#x23F3;</span>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>
              Próximo criterio en: {getNextHourInfo()}
            </span>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  // =================== PLAYING PHASE ===================
  return (
    <div className="w-full max-w-2xl mx-auto p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a2e 50%, #0a0a0a 100%)',
      border: `2px solid ${ACCENT_LIGHT}`,
      borderRadius: '1.5rem',
      boxShadow: `0 0 30px ${ACCENT_LIGHT}, inset 0 0 30px rgba(6,182,212,0.03)`,
    }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${ACCENT_GLOW})` }}>&#x1F3C6;</span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: ACCENT }}>
              Clasificación Histórica
            </h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {criteria.icon} {criteria.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-black" style={{
              color: config?.timeLimit && timer > config.timeLimit * 0.8 ? '#ff5050' : ACCENT,
              textShadow: `0 0 10px ${config?.timeLimit && timer > config.timeLimit * 0.8 ? 'rgba(255,50,50,0.5)' : ACCENT_GLOW}`,
            }}>
              {formatTime(timer)}
            </div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black" style={{ color: '#22d3ee' }}>{numTeams}</div>
            <div className="text-[0.55rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Equipos</div>
          </div>
        </div>
      </div>

      {/* Criteria banner */}
      <div className="mb-4 p-3 rounded-xl text-center" style={{
        background: 'rgba(6,182,212,0.08)',
        border: `1px solid ${ACCENT_LIGHT}`,
      }}>
        <span className="text-lg">{criteria.icon}</span>
        <span className="text-sm font-black uppercase ml-2" style={{ color: ACCENT }}>
          Ordena por: {criteria.label}
        </span>
      </div>

      {/* Drag and drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={teamOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-1" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${ACCENT} transparent`,
          }}>
            {teamOrder.map((slug, index) => {
              const teamData = TEAMS.find(t => t.slug === slug)
              if (!teamData) return null
              return (
                <SortableItem
                  key={slug}
                  id={slug}
                  team={teamData}
                  rank={index}
                  isCorrect={checkedResults[index] ?? null}
                  isChecked={isChecked}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Check order button */}
      {!isChecked && (
        <div className="flex justify-center">
          <button
            onClick={handleCheck}
            className="px-8 py-3 rounded-xl font-black uppercase tracking-wider text-lg cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
              color: '#000',
              boxShadow: `0 0 20px ${ACCENT_GLOW}`,
              border: 'none',
            }}
          >
            &#x2713; VERIFICAR ORDEN
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4 px-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
          <span className="text-[0.65rem] font-black" style={{ color: ACCENT }}>
            {isChecked ? 'Verificado' : 'Ordenando...'}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: isChecked ? '100%' : '50%',
              background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`,
              boxShadow: `0 0 10px ${ACCENT_GLOW}`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes chase-lights {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  )
}

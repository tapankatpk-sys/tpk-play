'use client'

import { useState, useEffect } from 'react'

interface Game {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  type: string
  config: string | null
  isActive: boolean
  order: number
  _count?: { participants: number }
}

interface GamePreviewModalProps {
  game: Game
  onClose: () => void
}

const GAME_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  'trivia-futbolera': { label: 'Trivia Futbolera', icon: '⚽', color: '#a855f7' },
  'trivia-relampago': { label: 'Trivia Relámpago', icon: '⚡', color: '#eab308' },
  'memoria-futbolera': { label: 'Memoria Futbolera', icon: '🧠', color: '#ec4899' },
  'prediccion': { label: 'Predicción', icon: '🎯', color: '#f97316' },
  'encuesta': { label: 'Encuesta', icon: '📊', color: '#3b82f6' },
  'personalizado': { label: 'Personalizado', icon: '🎮', color: '#22c55e' },
}

// Teams data for Memoria Futbolera preview
const MEMORY_TEAMS = [
  { id: 'atletico-nacional', name: 'Atlético Nacional', color: '#00953b', city: 'Medellín' },
  { id: 'millonarios', name: 'Millonarios', color: '#0033a0', city: 'Bogotá' },
  { id: 'america-de-cali', name: 'América de Cali', color: '#e31937', city: 'Cali' },
  { id: 'deportivo-cali', name: 'Deportivo Cali', color: '#007a33', city: 'Cali' },
  { id: 'atletico-junior', name: 'Junior FC', color: '#c8102e', city: 'Barranquilla' },
  { id: 'independiente-santa-fe', name: 'Santa Fe', color: '#c8102e', city: 'Bogotá' },
  { id: 'independiente-medellin', name: 'Independiente Medellín', color: '#e31937', city: 'Medellín' },
  { id: 'once-caldas', name: 'Once Caldas', color: '#0033a0', city: 'Manizales' },
  { id: 'deportes-tolima', name: 'Deportes Tolima', color: '#fdd835', city: 'Ibagué' },
  { id: 'atletico-bucaramanga', name: 'Atlético Bucaramanga', color: '#fdd835', city: 'Bucaramanga' },
  { id: 'fortaleza-ceif', name: 'Fortaleza CEIF', color: '#e31937', city: 'Bogotá' },
  { id: 'deportivo-pereira', name: 'Deportivo Pereira', color: '#c8102e', city: 'Pereira' },
  { id: 'deportivo-pasto', name: 'Deportivo Pasto', color: '#1a237e', city: 'Pasto' },
  { id: 'la-equidad', name: 'La Equidad', color: '#2e7d32', city: 'Bogotá' },
  { id: 'jaguares-de-cordoba', name: 'Jaguares de Córdoba', color: '#f57f17', city: 'Montería' },
  { id: 'cucuta-deportivo', name: 'Cúcuta Deportivo', color: '#b71c1c', city: 'Cúcuta' },
  { id: 'internacional-de-bogota', name: 'Internacional de Bogotá', color: '#1565c0', city: 'Bogotá' },
  { id: 'alianza-valledupar', name: 'Alianza Valledupar', color: '#00838f', city: 'Valledupar' },
  { id: 'boyaca-chico', name: 'Boyacá Chicó', color: '#e65100', city: 'Tunja' },
  { id: 'llaneros', name: 'Llaneros', color: '#4e342e', city: 'Villavicencio' },
]

// Preview component for Trivia Futbolera
function TriviaFutboleraPreview() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    round: { roundId: string; startedAt: string; endsAt: string }
    question: {
      id: string
      question: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
      correctAnswer: string
      category: string | null
      teamSlug: string | null
      difficulty: string
    }
    totalQuestions: number
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrivia = async () => {
      try {
        const res = await fetch('/api/trivia?preview=true')
        if (!res.ok) throw new Error('Error al cargar trivia')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError('No se pudo cargar la vista previa de la trivia')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrivia()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8" style={{ color: '#ef4444' }}>
        {error || 'Error desconocido'}
      </div>
    )
  }

  const q = data.question
  const options = [
    { key: 'A', text: q.optionA },
    { key: 'B', text: q.optionB },
    { key: 'C', text: q.optionC },
    { key: 'D', text: q.optionD },
  ]

  const difficultyColors: Record<string, string> = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#ef4444',
  }

  return (
    <div className="space-y-4">
      {/* Round info */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-1 rounded text-xs font-bold uppercase"
          style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)' }}
        >
          Ronda: {data.round.roundId}
        </span>
        {q.category && (
          <span
            className="px-2 py-1 rounded text-xs font-bold uppercase"
            style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' }}
          >
            {q.category}
          </span>
        )}
        <span
          className="px-2 py-1 rounded text-xs font-bold uppercase"
          style={{ background: `${difficultyColors[q.difficulty] || '#eab308'}20`, color: difficultyColors[q.difficulty] || '#eab308', border: `1px solid ${difficultyColors[q.difficulty] || '#eab308'}40` }}
        >
          {q.difficulty}
        </span>
      </div>

      {/* Question */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <p className="text-base font-bold" style={{ color: '#e9d5ff' }}>
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <div
            key={opt.key}
            className="p-3 rounded-xl flex items-center gap-3 transition-all"
            style={{
              background: opt.key === q.correctAnswer
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(255,255,255,0.03)',
              border: opt.key === q.correctAnswer
                ? '1px solid rgba(34, 197, 94, 0.5)'
                : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{
                background: opt.key === q.correctAnswer
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(168, 85, 247, 0.2)',
                color: opt.key === q.correctAnswer ? '#4ade80' : '#d8b4fe',
                border: `1px solid ${opt.key === q.correctAnswer ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 85, 247, 0.3)'}`,
              }}
            >
              {opt.key}
            </span>
            <span className="text-sm" style={{ color: opt.key === q.correctAnswer ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>
              {opt.text}
            </span>
            {opt.key === q.correctAnswer && (
              <span className="ml-auto text-xs font-bold" style={{ color: '#4ade80' }}>
                ✓ Correcta
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Total questions info */}
      <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Banco de {data.totalQuestions} preguntas disponibles
      </div>
    </div>
  )
}

// Preview component for Trivia Relámpago
function TriviaRelampagoPreview() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    round: { roundId: string; startedAt: string; endsAt: string }
    questions: Array<{
      index: number
      question: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
      category: string | null
      correctAnswer: string
    }>
    totalQuestions: number
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLightning = async () => {
      try {
        const res = await fetch('/api/lightning?preview=true')
        if (!res.ok) throw new Error('Error al cargar trivia relámpago')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError('No se pudo cargar la vista previa de la trivia relámpago')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLightning()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#eab308', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8" style={{ color: '#ef4444' }}>
        {error || 'Error desconocido'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Round info */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-1 rounded text-xs font-bold uppercase"
          style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          Ronda: {data.round.roundId}
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          ⏱ 60 segundos
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          {data.questions.length} preguntas
        </span>
      </div>

      {/* Questions */}
      {data.questions.map((q, i) => {
        const options = [
          { key: 'A', text: q.optionA },
          { key: 'B', text: q.optionB },
          { key: 'C', text: q.optionC },
          { key: 'D', text: q.optionD },
        ]

        return (
          <div
            key={i}
            className="p-3 rounded-xl"
            style={{
              background: 'rgba(234, 179, 8, 0.05)',
              border: '1px solid rgba(234, 179, 8, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.4)' }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-bold" style={{ color: '#fef3c7' }}>
                {q.question}
              </span>
              {q.category && (
                <span className="text-xs ml-auto" style={{ color: 'rgba(234, 179, 8, 0.5)' }}>
                  {q.category}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 ml-8">
              {options.map((opt) => (
                <div
                  key={opt.key}
                  className="px-2 py-1.5 rounded text-xs flex items-center gap-1.5"
                  style={{
                    background: opt.key === q.correctAnswer
                      ? 'rgba(34, 197, 94, 0.12)'
                      : 'rgba(255,255,255,0.03)',
                    border: opt.key === q.correctAnswer
                      ? '1px solid rgba(34, 197, 94, 0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                    color: opt.key === q.correctAnswer ? '#4ade80' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <span className="font-bold">{opt.key}.</span> {opt.text}
                  {opt.key === q.correctAnswer && <span className="ml-auto">✓</span>}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Total questions info */}
      <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Banco de {data.totalQuestions} preguntas relámpago disponibles
      </div>
    </div>
  )
}

// Preview component for Memoria Futbolera
function MemoriaFutboleraPreview() {
  const difficultyConfig = [
    { key: 'easy', label: 'Fácil', emoji: '🟢', pairs: 4, cols: 4 },
    { key: 'medium', label: 'Medio', emoji: '🟡', pairs: 6, cols: 4 },
    { key: 'hard', label: 'Difícil', emoji: '🔴', pairs: 10, cols: 5 },
  ]

  return (
    <div className="space-y-4">
      {/* Game info card */}
      <div
        className="p-4 rounded-xl text-center"
        style={{
          background: 'rgba(236, 72, 153, 0.08)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
        }}
      >
        <div className="text-4xl mb-2">🧠</div>
        <h3 className="text-lg font-bold" style={{ color: '#ec4899' }}>Memoria Futbolera</h3>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Encuentra los pares de escudos de la Liga BetPlay
        </p>
      </div>

      {/* Difficulty levels */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Niveles de dificultad
        </div>
        <div className="grid grid-cols-3 gap-2">
          {difficultyConfig.map((d) => (
            <div
              key={d.key}
              className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(236, 72, 153, 0.06)', border: '1px solid rgba(236, 72, 153, 0.2)' }}
            >
              <div className="text-xl mb-1">{d.emoji}</div>
              <div className="text-xs font-bold" style={{ color: '#f9a8d4' }}>{d.label}</div>
              <div className="text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.pairs} pares</div>
              <div className="text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.cols} columnas</div>
            </div>
          ))}
        </div>
      </div>

      {/* How to play */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Cómo jugar
        </div>
        <div className="space-y-1.5">
          {[
            { icon: '🃏', text: 'Voltea 2 cartas por turno' },
            { icon: '⚽', text: 'Encuentra los escudos iguales' },
            { icon: '🏆', text: 'Menos movimientos = más estrellas' },
            { icon: '⏱', text: 'Cronómetro y contador de movimientos' },
            { icon: '💾', text: 'Mejores puntuaciones guardadas' },
          ].map((item, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team shields gallery */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Equipos disponibles ({MEMORY_TEAMS.length})
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {MEMORY_TEAMS.map((team) => (
            <div
              key={team.id}
              className="p-2 rounded-lg text-center"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${team.color}30`,
              }}
            >
              <div
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1"
                style={{
                  background: `linear-gradient(135deg, ${team.color}15, ${team.color}30)`,
                  border: `1px solid ${team.color}40`,
                  boxShadow: `0 0 6px ${team.color}20`,
                }}
              >
                <img
                  src={`/images/teams/${team.id}.svg`}
                  alt={team.name}
                  className="w-7 h-7 object-contain"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.2))' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (!target.src.endsWith('.png')) {
                      target.src = `/images/teams/${team.id}.png`
                    }
                  }}
                />
              </div>
              <div
                className="text-[0.5rem] font-bold truncate"
                style={{ color: team.color, textShadow: `0 0 4px ${team.color}40` }}
              >
                {team.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring system */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Sistema de estrellas
        </div>
        <div className="space-y-1.5">
          {[
            { stars: 3, condition: 'Hasta 1.5x el número de pares en movimientos', color: '#fbbf24' },
            { stars: 2, condition: 'Hasta 2x el número de pares en movimientos', color: '#a855f7' },
            { stars: 1, condition: 'Más de 2x el número de pares', color: '#f97316' },
          ].map((level, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-lg flex items-center gap-3 text-xs"
              style={{ background: `${level.color}08`, border: `1px solid ${level.color}20` }}
            >
              <span className="text-sm">{'⭐'.repeat(level.stars)}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{level.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Generic placeholder preview for other game types
function GenericGamePreview({ game }: { game: Game }) {
  const gameType = GAME_TYPES[game.type] || GAME_TYPES['personalizado']
  let configData: Record<string, unknown> | null = null
  if (game.config) {
    try {
      configData = JSON.parse(game.config)
    } catch {
      configData = null
    }
  }

  return (
    <div className="space-y-4">
      {/* Game info card */}
      <div
        className="p-4 rounded-xl text-center"
        style={{
          background: `${gameType.color}10`,
          border: `1px solid ${gameType.color}30`,
        }}
      >
        <div className="text-4xl mb-2">{gameType.icon}</div>
        <h3 className="text-lg font-bold" style={{ color: gameType.color }}>
          {game.name}
        </h3>
        {game.description && (
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {game.description}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{ background: `${gameType.color}20`, color: gameType.color, border: `1px solid ${gameType.color}40` }}
          >
            {gameType.label}
          </span>
          <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{
              background: game.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: game.isActive ? '#4ade80' : '#ef4444',
              border: `1px solid ${game.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {game.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Game details */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="p-3 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Orden</div>
          <div className="text-lg font-bold" style={{ color: '#d8b4fe' }}>#{game.order}</div>
        </div>
        <div
          className="p-3 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Participantes</div>
          <div className="text-lg font-bold" style={{ color: '#fdba74' }}>{game._count?.participants || 0}</div>
        </div>
      </div>

      {/* Config */}
      {configData && (
        <div>
          <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Configuración
          </div>
          <div
            className="p-3 rounded-xl text-xs font-mono overflow-x-auto"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <pre>{JSON.stringify(configData, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Preview notice */}
      <div
        className="p-3 rounded-xl text-center text-xs"
        style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', color: '#fdba74' }}
      >
        Este tipo de juego aún no tiene vista previa interactiva. Se muestra la información del juego.
      </div>
    </div>
  )
}

export default function GamePreviewModal({ game, onClose }: GamePreviewModalProps) {
  const gameType = GAME_TYPES[game.type] || GAME_TYPES['personalizado']

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
          border: `1px solid ${gameType.color}40`,
          boxShadow: `0 0 30px ${gameType.color}20, 0 0 60px ${gameType.color}10`,
        }}
      >
        {/* Admin Preview Banner */}
        <div
          className="px-4 py-2 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(90deg, rgba(239,68,68,0.15), rgba(249,115,22,0.15), rgba(239,68,68,0.15))`,
            borderBottom: `1px solid rgba(239, 68, 68, 0.3)`,
          }}
        >
          <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>🔒</span>
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: '#ef4444', textShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}
          >
            Modo Vista Previa - Administrador
          </span>
          <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>🔒</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `${gameType.color}20` }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `${gameType.color}20`,
                border: `1px solid ${gameType.color}40`,
                boxShadow: `0 0 10px ${gameType.color}30`,
              }}
            >
              {gameType.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: gameType.color, textShadow: `0 0 8px ${gameType.color}40` }}>
                {game.name}
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{gameType.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarColor: `${gameType.color}30 transparent` }}>
          {game.type === 'trivia-futbolera' && <TriviaFutboleraPreview />}
          {game.type === 'trivia-relampago' && <TriviaRelampagoPreview />}
          {game.type === 'memoria-futbolera' && <MemoriaFutboleraPreview />}
          {!['trivia-futbolera', 'trivia-relampago', 'memoria-futbolera'].includes(game.type) && <GenericGamePreview game={game} />}
        </div>

        {/* Footer */}
        <div
          className="p-3 flex items-center justify-center"
          style={{ borderTop: `1px solid ${gameType.color}15`, background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Vista previa como administrador — No se requiere código TPK
          </span>
        </div>
      </div>
    </div>
  )
}

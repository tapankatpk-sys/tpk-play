'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import of MemoryGame to avoid SSR issues and reduce initial load
const MemoryGame = dynamic(() => import('@/components/memory/MemoryGame'), { ssr: false })
const CrosswordGame = dynamic(() => import('@/components/crossword/CrosswordGame'), { ssr: false })

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
  'crucigrama-futbolero': { label: 'Crucigrama Futbolero', icon: '🎯', color: '#a855f7' },
  'prediccion': { label: 'Predicción', icon: '🎯', color: '#f97316' },
  'encuesta': { label: 'Encuesta', icon: '📊', color: '#3b82f6' },
  'personalizado': { label: 'Personalizado', icon: '🎮', color: '#22c55e' },
}

// ============================================
// INTERACTIVE Trivia Futbolera Preview
// ============================================
function TriviaFutboleraInteractive() {
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const fetchTrivia = async () => {
      try {
        const res = await fetch('/api/trivia?preview=true')
        if (!res.ok) throw new Error('Error al cargar trivia')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError('No se pudo cargar la trivia')
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

  const handleAnswer = (key: string) => {
    if (showResult) return
    setSelectedAnswer(key)
    setShowResult(true)
  }

  return (
    <div className="space-y-4">
      {/* Admin notice */}
      <div
        className="p-3 rounded-xl text-center text-xs"
        style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}
      >
        👁 Vista previa interactiva — Puedes responder sin código TPK
      </div>

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

      {/* Options - Interactive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isCorrect = opt.key === q.correctAnswer
          const isSelected = opt.key === selectedAnswer
          let bg = 'rgba(255,255,255,0.03)'
          let borderColor = 'rgba(255,255,255,0.1)'
          let textColor = 'rgba(255,255,255,0.7)'
          let letterBg = 'rgba(168, 85, 247, 0.2)'
          let letterColor = '#d8b4fe'
          let letterBorder = 'rgba(168, 85, 247, 0.3)'

          if (showResult) {
            if (isCorrect) {
              bg = 'rgba(34, 197, 94, 0.15)'
              borderColor = 'rgba(34, 197, 94, 0.5)'
              textColor = '#4ade80'
              letterBg = 'rgba(34, 197, 94, 0.3)'
              letterColor = '#4ade80'
              letterBorder = 'rgba(34, 197, 94, 0.4)'
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(239, 68, 68, 0.15)'
              borderColor = 'rgba(239, 68, 68, 0.5)'
              textColor = '#f87171'
              letterBg = 'rgba(239, 68, 68, 0.3)'
              letterColor = '#f87171'
              letterBorder = 'rgba(239, 68, 68, 0.4)'
            }
          } else if (isSelected) {
            bg = 'rgba(168, 85, 247, 0.15)'
            borderColor = 'rgba(168, 85, 247, 0.5)'
          }

          return (
            <button
              key={opt.key}
              onClick={() => handleAnswer(opt.key)}
              className="p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: bg, border: `1px solid ${borderColor}` }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: letterBg, color: letterColor, border: `1px solid ${letterBorder}` }}
              >
                {opt.key}
              </span>
              <span className="text-sm text-left" style={{ color: textColor }}>
                {opt.text}
              </span>
              {showResult && isCorrect && (
                <span className="ml-auto text-xs font-bold" style={{ color: '#4ade80' }}>
                  ✓ Correcta
                </span>
              )}
              {showResult && isSelected && !isCorrect && (
                <span className="ml-auto text-xs font-bold" style={{ color: '#f87171' }}>
                  ✗ Incorrecta
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Result message */}
      {showResult && (
        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: selectedAnswer === q.correctAnswer
              ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
            border: `1px solid ${selectedAnswer === q.correctAnswer ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          <div className="text-3xl mb-2">{selectedAnswer === q.correctAnswer ? '🎉' : '😔'}</div>
          <p className="font-black text-sm" style={{ color: selectedAnswer === q.correctAnswer ? '#4ade80' : '#f87171' }}>
            {selectedAnswer === q.correctAnswer ? '¡CORRECTO! +10 puntos' : '¡INCORRECTO!'}
          </p>
          {selectedAnswer !== q.correctAnswer && (
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              La respuesta correcta es la opción {q.correctAnswer}
            </p>
          )}
          <p className="text-[0.6rem] mt-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Vista previa admin — No se registran puntos
          </p>
        </div>
      )}

      {/* Total questions info */}
      <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Banco de {data.totalQuestions} preguntas disponibles
      </div>
    </div>
  )
}

// ============================================
// INTERACTIVE Trivia Relámpago Preview
// ============================================
function TriviaRelampagoInteractive() {
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
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [results, setResults] = useState<Array<{ isCorrect: boolean; selected: string }>>([])
  const [gameFinished, setGameFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    const fetchLightning = async () => {
      try {
        const res = await fetch('/api/lightning?preview=true')
        if (!res.ok) throw new Error('Error al cargar trivia relámpago')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError('No se pudo cargar la trivia relámpago')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLightning()
  }, [])

  // Timer
  useEffect(() => {
    if (!data || gameFinished || selectedAnswer !== null) return
    if (timeLeft <= 0) {
      setGameFinished(true)
      return
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [data, gameFinished, selectedAnswer, timeLeft])

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

  // Finished state
  if (gameFinished || (results.length === data.questions.length)) {
    const correctCount = results.filter(r => r.isCorrect).length
    return (
      <div className="space-y-4">
        <div
          className="p-5 rounded-xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(168,85,247,0.05))',
            border: '1px solid rgba(234,179,8,0.3)',
          }}
        >
          <div className="text-4xl mb-2">{correctCount >= 4 ? '🏆' : correctCount >= 2 ? '⚡' : '💪'}</div>
          <p className="text-2xl font-black" style={{ color: '#fde047' }}>
            {correctCount}/{data.questions.length}
          </p>
          <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Respuestas correctas
          </p>
          <p className="text-[0.6rem] mt-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Vista previa admin — No se registran puntos
          </p>
        </div>

        {/* Review answers */}
        <div className="space-y-2">
          {data.questions.map((q, i) => {
            const r = results[i]
            return (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{
                  background: r?.isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${r?.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: r?.isCorrect ? '#4ade80' : '#f87171' }}>
                    {r?.isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Pregunta {i + 1}: {q.question}
                  </span>
                </div>
                {!r?.isCorrect && (
                  <p className="text-[0.65rem] ml-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Correcta: {q.correctAnswer} | Tu respuesta: {r?.selected || 'Sin respuesta'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const q = data.questions[currentQ]
  const options = [
    { key: 'A', text: q.optionA },
    { key: 'B', text: q.optionB },
    { key: 'C', text: q.optionC },
    { key: 'D', text: q.optionD },
  ]

  const handleAnswer = (key: string) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(key)
    const isCorrect = key === q.correctAnswer
    const newResults = [...results, { isCorrect, selected: key }]
    setResults(newResults)

    setTimeout(() => {
      if (newResults.length === data.questions.length) {
        setGameFinished(true)
      } else {
        setCurrentQ(currentQ + 1)
        setSelectedAnswer(null)
      }
    }, 1200)
  }

  return (
    <div className="space-y-3">
      {/* Admin notice */}
      <div
        className="p-2 rounded-xl text-center text-xs"
        style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#fde047' }}
      >
        ⚡ Vista previa interactiva — Juega sin código TPK
      </div>

      {/* Round + timer + progress */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-1 rounded text-xs font-bold uppercase"
          style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          Ronda: {data.round.roundId}
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{
            background: timeLeft <= 10 ? 'rgba(239,68,68,0.2)' : 'rgba(234, 179, 8, 0.15)',
            color: timeLeft <= 10 ? '#ef4444' : '#fde047',
            border: `1px solid ${timeLeft <= 10 ? 'rgba(239,68,68,0.4)' : 'rgba(234, 179, 8, 0.3)'}`,
          }}
        >
          ⏱ {timeLeft}s
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          {currentQ + 1}/{data.questions.length}
        </span>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          ✓ {results.filter(r => r.isCorrect).length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {data.questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              flex: 1,
              background: i < currentQ
                ? results[i]?.isCorrect ? '#22c55e' : '#ef4444'
                : i === currentQ ? '#eab308' : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div
        className="p-4 rounded-xl"
        style={{ background: 'rgba(234, 179, 8, 0.06)', border: '1px solid rgba(234, 179, 8, 0.2)' }}
      >
        <p className="text-sm font-bold" style={{ color: '#fef3c7' }}>{q.question}</p>
        {q.category && (
          <span className="text-[0.6rem] uppercase mt-1 inline-block" style={{ color: 'rgba(234,179,8,0.5)' }}>
            {q.category}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isCorrect = opt.key === q.correctAnswer
          const isSelected = opt.key === selectedAnswer
          let bg = 'rgba(255,255,255,0.03)'
          let border = '1px solid rgba(255,255,255,0.08)'
          let color = 'rgba(255,255,255,0.7)'

          if (selectedAnswer !== null) {
            if (isCorrect) {
              bg = 'rgba(34, 197, 94, 0.15)'
              border = '1px solid rgba(34, 197, 94, 0.5)'
              color = '#4ade80'
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(239, 68, 68, 0.15)'
              border = '1px solid rgba(239, 68, 68, 0.5)'
              color = '#f87171'
            }
          }

          return (
            <button
              key={opt.key}
              onClick={() => handleAnswer(opt.key)}
              className="p-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-left"
              style={{ background: bg, border, color }}
              disabled={selectedAnswer !== null}
            >
              <span className="font-bold">{opt.key}.</span> {opt.text}
              {selectedAnswer !== null && isCorrect && <span className="ml-auto">✓</span>}
              {selectedAnswer !== null && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
            </button>
          )
        })}
      </div>

      <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Banco de {data.totalQuestions} preguntas relámpago disponibles
      </div>
    </div>
  )
}

// ============================================
// GENERIC Preview for other game types
// ============================================
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
      <div
        className="p-4 rounded-xl text-center"
        style={{ background: `${gameType.color}10`, border: `1px solid ${gameType.color}30` }}
      >
        <div className="text-4xl mb-2">{gameType.icon}</div>
        <h3 className="text-lg font-bold" style={{ color: gameType.color }}>{game.name}</h3>
        {game.description && (
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{game.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Orden</div>
          <div className="text-lg font-bold" style={{ color: '#d8b4fe' }}>#{game.order}</div>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Participantes</div>
          <div className="text-lg font-bold" style={{ color: '#fdba74' }}>{game._count?.participants || 0}</div>
        </div>
      </div>

      {configData && (
        <div>
          <div className="text-xs font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Configuración</div>
          <div
            className="p-3 rounded-xl text-xs font-mono overflow-x-auto"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <pre>{JSON.stringify(configData, null, 2)}</pre>
          </div>
        </div>
      )}

      <div
        className="p-3 rounded-xl text-center text-xs"
        style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', color: '#fdba74' }}
      >
        Este tipo de juego aún no tiene vista previa interactiva. Se muestra la información del juego.
      </div>
    </div>
  )
}

// ============================================
// MAIN MODAL COMPONENT
// ============================================
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

  // Memoria Futbolera gets a full-screen embedded game experience
  if (game.type === 'memoria-futbolera') {
    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      >
        {/* Admin Preview Banner */}
        <div
          className="px-4 py-2 flex items-center justify-between flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(236,72,153,0.15), rgba(249,115,22,0.15), rgba(236,72,153,0.15))',
            borderBottom: '1px solid rgba(236, 72, 153, 0.3)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: '#ec4899', fontSize: '0.7rem' }}>🧠</span>
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: '#ec4899', textShadow: '0 0 8px rgba(236, 72, 153, 0.4)' }}
            >
              Vista Previa — Memoria Futbolera — Juega sin código TPK
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Embedded Game - full area */}
        <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarColor: 'rgba(236,72,153,0.3) transparent' }}>
          <MemoryGame />
        </div>
      </div>
    )
  }

  // Crucigrama Futbolero gets a full-screen embedded game experience
  if (game.type === 'crucigrama-futbolero') {
    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      >
        {/* Admin Preview Banner */}
        <div
          className="px-4 py-2 flex items-center justify-between flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(168,85,247,0.15), rgba(249,115,22,0.15), rgba(168,85,247,0.15))',
            borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: '#a855f7', fontSize: '0.7rem' }}>🎯</span>
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.4)' }}
            >
              Vista Previa — Crucigrama Futbolero — Juega sin código TPK
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Embedded Game - full area */}
        <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
          <CrosswordGame />
        </div>
      </div>
    )
  }

  // Trivia games get the standard modal with interactive preview
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
            Vista Previa Interactiva — Juega sin código TPK
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
          {game.type === 'trivia-futbolera' && <TriviaFutboleraInteractive />}
          {game.type === 'trivia-relampago' && <TriviaRelampagoInteractive />}
          {!['trivia-futbolera', 'trivia-relampago', 'memoria-futbolera', 'crucigrama-futbolero'].includes(game.type) && <GenericGamePreview game={game} />}
        </div>

        {/* Footer */}
        <div
          className="p-3 flex items-center justify-center"
          style={{ borderTop: `1px solid ${gameType.color}15`, background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Vista previa interactiva — No se requiere código TPK — No se registran puntos
          </span>
        </div>
      </div>
    </div>
  )
}

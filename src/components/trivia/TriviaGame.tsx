'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface TriviaQuestionData {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  category: string | null
  teamSlug: string | null
  difficulty: string
}

interface TriviaRoundData {
  roundId: string
  startedAt: string
  endsAt: string
}

type GameState = 'loading' | 'enter' | 'playing' | 'answered' | 'already_played' | 'result'

const TEAM_SHIELDS: Record<string, string> = {
  'aguilas-doradas': '/images/teams/aguilas-doradas.svg',
  'alianza-fc': '/images/teams/alianza-fc.svg',
  'america-de-cali': '/images/teams/america-de-cali.svg',
  'atletico-nacional': '/images/teams/atletico-nacional.svg',
  'atletico-bucaramanga': '/images/teams/atletico-bucaramanga.svg',
  'boyaca-chico': '/images/teams/boyaca-chico.svg',
  'deportes-tolima': '/images/teams/deportes-tolima.svg',
  'deportivo-cali': '/images/teams/deportivo-cali.png',
  'deportivo-pasto': '/images/teams/deportivo-pasto.svg',
  'deportivo-pereira': '/images/teams/deportivo-pereira.svg',
  'envigado': '/images/teams/envigado.svg',
  'fortaleza-ceif': '/images/teams/fortaleza-ceif.svg',
  'independiente-medellin': '/images/teams/independiente-medellin.svg',
  'independiente-santa-fe': '/images/teams/independiente-santa-fe.svg',
  'internacional-de-bogota': '/images/teams/internacional-de-bogota.png',
  'jaguares-de-cordoba': '/images/teams/jaguares-de-cordoba.png',
  'junior-fc': '/images/teams/junior-fc.svg',
  'la-equidad': '/images/teams/la-equidad.svg',
  'millonarios': '/images/teams/millonarios.svg',
  'once-caldas': '/images/teams/once-caldas.svg',
  'patriotas': '/images/teams/patriotas.png',
  'internacional-palmira': '/images/teams/internacional-palmira.png',
}

const CATEGORY_LABELS: Record<string, string> = {
  'estadios': 'ESTADIOS',
  'fundacion': 'FUNDACIÓN',
  'apodos': 'APODOS',
  'colores': 'COLORES',
  'ciudades': 'CIUDADES',
  'historia': 'HISTORIA',
  'clasicos': 'CLÁSICOS',
  'departamentos': 'DEPARTAMENTOS',
  'general': 'LIGA BETPLAY',
}

const CATEGORY_COLORS: Record<string, string> = {
  'estadios': '#22c55e',
  'fundacion': '#f97316',
  'apodos': '#a855f7',
  'colores': '#ec4899',
  'ciudades': '#3b82f6',
  'historia': '#eab308',
  'clasicos': '#ef4444',
  'departamentos': '#06b6d4',
  'general': '#8b5cf6',
}

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>('loading')
  const [question, setQuestion] = useState<TriviaQuestionData | null>(null)
  const [round, setRound] = useState<TriviaRoundData | null>(null)
  const [tpkCode, setTpkCode] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [result, setResult] = useState<{ isCorrect: boolean; correctAnswer: string; pointsEarned: number; totalPoints: number } | null>(null)
  const [alreadyPlayed, setAlreadyPlayed] = useState<{ wasCorrect: boolean; correctAnswer: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load saved TPK code
  useEffect(() => {
    const saved = localStorage.getItem('tpk_code')
    if (saved) setTpkCode(saved)
  }, [])

  // Fetch current question
  const fetchQuestion = useCallback(async () => {
    try {
      const res = await fetch('/api/trivia')
      const data = await res.json()
      if (res.ok) {
        setQuestion(data.question)
        setRound(data.round)
        setGameState('enter')
      }
    } catch (err) {
      console.error('Error fetching trivia:', err)
    }
  }, [])

  useEffect(() => { fetchQuestion() }, [fetchQuestion])

  // Countdown timer
  useEffect(() => {
    if (!round) return
    const interval = setInterval(() => {
      const ends = new Date(round.endsAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, Math.floor((ends - now) / 1000))
      setTimeLeft(diff)
    }, 1000)
    return () => clearInterval(interval)
  }, [round])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!tpkCode.trim()) {
      setError('Ingresa tu código TPK para participar')
      return
    }
    setError('')
    setGameState('playing')
  }

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !round || submitting) return
    setSelectedAnswer(answer)
    setSubmitting(true)

    try {
      const res = await fetch('/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCode: tpkCode,
          selectedAnswer: answer,
          roundId: round.roundId,
        }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setAlreadyPlayed({ wasCorrect: data.wasCorrect, correctAnswer: data.correctAnswer })
        setGameState('already_played')
        return
      }

      if (!res.ok) {
        setError(data.error || 'Error al enviar respuesta')
        setSelectedAnswer(null)
        return
      }

      setResult(data)
      localStorage.setItem('tpk_code', tpkCode)

      if (data.isCorrect) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }

      setGameState('result')
    } catch {
      setError('Error de conexión')
      setSelectedAnswer(null)
    } finally {
      setSubmitting(false)
    }
  }

  const getOptionStyle = (option: string) => {
    if (gameState === 'result' || gameState === 'already_played') {
      const correctAns = result?.correctAnswer || alreadyPlayed?.correctAnswer
      const isThisCorrect = option === correctAns
      const isSelected = option === selectedAnswer

      if (isThisCorrect) {
        return {
          background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))',
          border: '2px solid #22c55e',
          boxShadow: '0 0 15px rgba(34,197,94,0.4), 0 0 30px rgba(34,197,94,0.2)',
          color: '#4ade80',
        }
      }
      if (isSelected && !isThisCorrect) {
        return {
          background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))',
          border: '2px solid #ef4444',
          boxShadow: '0 0 15px rgba(239,68,68,0.4)',
          color: '#f87171',
        }
      }
    }

    if (selectedAnswer === option) {
      return {
        background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(249,115,22,0.2))',
        border: '2px solid #a855f7',
        boxShadow: '0 0 15px rgba(168,85,247,0.4), 0 0 30px rgba(249,115,22,0.2)',
        color: '#d8b4fe',
      }
    }

    return {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(168,85,247,0.2)',
      color: 'rgba(255,255,255,0.7)',
    }
  }

  const getOptionLetter = (option: string) => {
    const letters: Record<string, string> = { A: 'A', B: 'B', C: 'C', D: 'D' }
    return letters[option]
  }

  const getOptionText = (option: string) => {
    if (!question) return ''
    const map: Record<string, string> = {
      A: question.optionA,
      B: question.optionB,
      C: question.optionC,
      D: question.optionD,
    }
    return map[option]
  }

  const teamShield = question?.teamSlug ? TEAM_SHIELDS[question.teamSlug] : null
  const categoryColor = question?.category ? CATEGORY_COLORS[question.category] || '#a855f7' : '#a855f7'

  // === LOADING STATE ===
  if (gameState === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
        <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando trivia...</p>
      </div>
    )
  }

  if (!question || !round) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 relative">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#3b82f6'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `trivia-confetti ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* === TRIVIA CARD - LAS VEGAS STYLE === */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0015 0%, #0d0020 30%, #100a25 60%, #0a0015 100%)',
          border: '1px solid rgba(168,85,247,0.3)',
          boxShadow: '0 0 40px rgba(168,85,247,0.15), 0 0 80px rgba(249,115,22,0.08), inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative light strip top */}
        <div className="h-1 w-full" style={{
          background: 'linear-gradient(90deg, #a855f7, #f97316, #22c55e, #eab308, #ec4899, #a855f7)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 3s linear infinite',
        }} />

        {/* Header */}
        <div className="p-4 md:p-6 text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center top, rgba(168,85,247,0.15) 0%, transparent 60%)',
          }} />

          {/* Title with neon effect */}
          <div className="relative">
            <h2
              className="text-2xl md:text-3xl font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #f97316, #fbbf24, #a855f7)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 4s linear infinite',
                filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.5))',
              }}
            >
              TRIVIA FUTBOLERA
            </h2>
            <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Liga BetPlay Colombia
            </p>
          </div>

          {/* Timer and category bar */}
          <div className="flex items-center justify-between mt-4 gap-3">
            {/* Category badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: `${categoryColor}15`,
                border: `1px solid ${categoryColor}40`,
                color: categoryColor,
                textShadow: `0 0 8px ${categoryColor}80`,
              }}
            >
              {question.category ? CATEGORY_LABELS[question.category] || question.category : 'LIGA'}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: timeLeft < 300 ? '#ef4444' : '#f87171',
                  textShadow: timeLeft < 300 ? '0 0 8px rgba(239,68,68,0.6)' : 'none',
                  animation: timeLeft < 60 ? 'neon-flicker 1s ease-in-out infinite' : 'none',
                }}
              >
                <span style={{ fontSize: '0.7rem' }}>⏱</span>
                {formatTime(timeLeft)}
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                }}
              >
                +10 pts
              </div>
            </div>
          </div>
        </div>

        {/* Team shield display (if applicable) */}
        {teamShield && (
          <div className="flex justify-center mb-2">
            <div
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center p-2"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(168,85,247,0.2)',
                boxShadow: `0 0 20px ${categoryColor}20`,
              }}
            >
              <Image
                src={teamShield}
                alt="Escudo del equipo"
                width={56}
                height={56}
                className="object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.3))' }}
              />
            </div>
          </div>
        )}

        {/* ENTER CODE STATE */}
        {gameState === 'enter' && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Question preview */}
            <div
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              <p className="text-sm md:text-base font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {question.question}
              </p>
            </div>

            {/* TPK Code input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#d8b4fe' }}>
                Ingresa tu código TPK para participar
              </label>
              <input
                type="text"
                value={tpkCode}
                onChange={(e) => setTpkCode(e.target.value.toUpperCase())}
                placeholder="TPKXXXXXX"
                className="w-full px-4 py-3 rounded-xl text-center text-sm font-bold tracking-wider text-white placeholder-gray-600 outline-none"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
              />
              {error && (
                <p className="text-center text-xs font-bold" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
                color: 'white',
                boxShadow: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(249,115,22,0.2)',
              }}
            >
              JUGAR TRIVIA
            </button>
          </div>
        )}

        {/* PLAYING / ANSWERED / RESULT STATE */}
        {(gameState === 'playing' || gameState === 'result' || gameState === 'already_played') && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Question */}
            <div
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              <p className="text-sm md:text-base font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => gameState === 'playing' ? handleAnswer(option) : undefined}
                  disabled={gameState !== 'playing' || submitting}
                  className="w-full p-3 md:p-4 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.01] disabled:cursor-default"
                  style={{
                    ...getOptionStyle(option),
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Letter circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      background: gameState === 'result' || gameState === 'already_played'
                        ? option === (result?.correctAnswer || alreadyPlayed?.correctAnswer) ? '#22c55e' : option === selectedAnswer ? '#ef4444' : 'rgba(255,255,255,0.1)'
                        : selectedAnswer === option ? 'linear-gradient(135deg, #a855f7, #f97316)' : 'rgba(255,255,255,0.08)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {getOptionLetter(option)}
                  </div>
                  <span className="text-sm font-medium">{getOptionText(option)}</span>
                  {/* Correct/Incorrect icon */}
                  {(gameState === 'result' || gameState === 'already_played') && (
                    option === (result?.correctAnswer || alreadyPlayed?.correctAnswer) ? (
                      <span className="ml-auto text-lg">✓</span>
                    ) : option === selectedAnswer && option !== (result?.correctAnswer || alreadyPlayed?.correctAnswer) ? (
                      <span className="ml-auto text-lg">✗</span>
                    ) : null
                  )}
                </button>
              ))}
            </div>

            {/* Result message */}
            {gameState === 'result' && result && (
              <div
                className="p-4 rounded-2xl text-center space-y-2"
                style={{
                  background: result.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${result.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div className="text-3xl">{result.isCorrect ? '🎉' : '😔'}</div>
                <p className="font-black text-lg" style={{ color: result.isCorrect ? '#4ade80' : '#f87171' }}>
                  {result.isCorrect ? '¡CORRECTO! +10 PUNTOS' : '¡INCORRECTO!'}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Tu acumulado total: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{result.totalPoints} pts</span>
                </p>
              </div>
            )}

            {/* Already played message */}
            {gameState === 'already_played' && alreadyPlayed && (
              <div
                className="p-4 rounded-2xl text-center space-y-2"
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.3)',
                }}
              >
                <div className="text-3xl">⏰</div>
                <p className="font-black text-sm" style={{ color: '#fdba74' }}>
                  YA PARTICIPASTE EN ESTA RONDA
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {alreadyPlayed.wasCorrect ? 'Acertaste la respuesta anterior. ¡Bien hecho!' : 'No acertaste la respuesta anterior.'}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Espera la próxima ronda para participar de nuevo
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom decorative light strip */}
        <div className="h-1 w-full" style={{
          background: 'linear-gradient(90deg, #22c55e, #f97316, #a855f7, #ec4899, #22c55e)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 3s linear infinite reverse',
        }} />
      </div>
    </div>
  )
}

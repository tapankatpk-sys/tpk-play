'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface LightningQuestionData {
  index: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  category: string | null
  teamSlug: string | null
}

interface SessionResultData {
  totalCorrect: number
  totalPoints: number
  totalBonus: number
  totalTimeMs: number
  answers?: {
    questionIndex: number
    selectedAnswer: string
    isCorrect: boolean
    correctAnswer: string
    pointsEarned: number
    speedBonus: number
  }[]
  totalEarned?: number
  newTotalPoints?: number
}

type GameState = 'loading' | 'enter' | 'countdown' | 'playing' | 'feedback' | 'result' | 'already_played'

const TEAM_SHIELDS: Record<string, string> = {
  'aguilas-doradas': '/images/teams/aguilas-doradas.svg',
  'alianza-fc': '/images/teams/alianza-fc.svg',
  'america-de-cali': '/images/teams/america-de-cali.svg',
  'atletico-nacional': '/images/teams/atletico-nacional.svg',
  'atletico-bucaramanga': '/images/teams/atletico-bucaramanga.svg',
  'boyaca-chico': '/images/teams/boyaca-chico.svg',
  'cucuta-deportivo': '/images/teams/cucuta-deportivo.png',
  'deportes-tolima': '/images/teams/deportes-tolima.svg',
  'deportivo-cali': '/images/teams/deportivo-cali.png',
  'deportivo-pasto': '/images/teams/deportivo-pasto.svg',
  'deportivo-pereira': '/images/teams/deportivo-pereira.svg',
  'fortaleza-ceif': '/images/teams/fortaleza-ceif.svg',
  'independiente-medellin': '/images/teams/independiente-medellin.svg',
  'independiente-santa-fe': '/images/teams/independiente-santa-fe.svg',
  'internacional-de-bogota': '/images/teams/internacional-de-bogota.png',
  'jaguares-de-cordoba': '/images/teams/jaguares-de-cordoba.png',
  'junior-fc': '/images/teams/junior-fc.svg',
  'millonarios': '/images/teams/millonarios.svg',
  'once-caldas': '/images/teams/once-caldas.svg',
  'llaneros-fc': '/images/teams/llaneros-fc.png',
  'envigado': '/images/teams/envigado.svg',
  'la-equidad': '/images/teams/la-equidad.svg',
  'patriotas': '/images/teams/patriotas.png',
  'internacional-palmira': '/images/teams/internacional-palmira.png',
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

const TOTAL_QUESTIONS = 5
const GAME_TIME = 60 // seconds

export default function LightningTriviaGame() {
  const [gameState, setGameState] = useState<GameState>('loading')
  const [questions, setQuestions] = useState<LightningQuestionData[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [roundId, setRoundId] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [tpkCode, setTpkCode] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animateCard, setAnimateCard] = useState(false)

  // Timer
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const questionStartTime = useRef<number>(0)
  const gameStartTime = useRef<number>(0)

  // Points tracking per question
  const [questionResults, setQuestionResults] = useState<{
    isCorrect: boolean
    correctAnswer: string
    pointsEarned: number
    speedBonus: number
  }[]>([])

  // Session result
  const [sessionResult, setSessionResult] = useState<SessionResultData | null>(null)

  // Load saved TPK code
  useEffect(() => {
    const saved = localStorage.getItem('tpk_code')
    if (saved) setTpkCode(saved)
  }, [])

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      const saved = localStorage.getItem('tpk_code')
      const code = saved || ''
      const res = await fetch(`/api/lightning${code ? `?code=${code}` : ''}`)
      const data = await res.json()
      if (res.ok) {
        setQuestions(data.questions)
        setRoundId(data.round.roundId)
        setEndsAt(data.round.endsAt)

        if (data.alreadyPlayed && data.sessionResult) {
          setSessionResult(data.sessionResult)
          setGameState('already_played')
          setTimeout(() => setAnimateCard(true), 100)
        } else {
          setGameState('enter')
          setTimeout(() => setAnimateCard(true), 100)
        }
      }
    } catch (err) {
      console.error('Error fetching lightning trivia:', err)
    }
  }, [])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const handleTimeUp = useCallback(() => {
    if (gameState !== 'playing') return
    // If there's no answer selected, submit empty/wrong
    if (!selectedAnswer) {
      // Force end the game
      setGameState('result')
    }
  }, [gameState, selectedAnswer])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'feedback') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit as wrong
          clearInterval(interval)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState, handleTimeUp])

  const handleStart = () => {
    if (!tpkCode.trim()) {
      setError('Ingresa tu código TPK para participar')
      return
    }
    setError('')
    setGameState('countdown')
  }

  const handleCountdownComplete = () => {
    setCurrentQ(0)
    setQuestionResults([])
    setTimeLeft(GAME_TIME)
    gameStartTime.current = Date.now()
    questionStartTime.current = Date.now()
    setGameState('playing')
    localStorage.setItem('tpk_code', tpkCode)
  }

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || submitting || gameState !== 'playing') return
    setSelectedAnswer(answer)
    setSubmitting(true)

    const timeToAnswer = Date.now() - questionStartTime.current

    try {
      const res = await fetch('/api/lightning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCode: tpkCode,
          roundId,
          questionIndex: currentQ,
          selectedAnswer: answer,
          timeToAnswer,
        }),
      })
      const data = await res.json()

      if (res.status === 409 && data.alreadyCompleted) {
        setGameState('already_played')
        fetchQuestions()
        return
      }

      if (!res.ok) {
        setError(data.error || 'Error al enviar respuesta')
        setSelectedAnswer(null)
        setSubmitting(false)
        return
      }

      const result = {
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        pointsEarned: data.pointsEarned,
        speedBonus: data.speedBonus,
      }

      setQuestionResults(prev => [...prev, result])

      if (data.isCorrect) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }

      setGameState('feedback')

      // If session complete (5th question answered)
      if (data.sessionComplete) {
        setTimeout(() => {
          setSessionResult(data.sessionResult)
          setGameState('result')
          setSubmitting(false)
        }, 1200)
      } else {
        // Move to next question after brief feedback
        setTimeout(() => {
          setCurrentQ(prev => prev + 1)
          setSelectedAnswer(null)
          questionStartTime.current = Date.now()
          setGameState('playing')
          setSubmitting(false)
        }, 1200)
      }
    } catch {
      setError('Error de conexión')
      setSelectedAnswer(null)
      setSubmitting(false)
    }
  }

  const getOptionStyle = (option: string) => {
    const currentResult = questionResults[currentQ]
    const isFeedback = gameState === 'feedback' || (gameState === 'result' && sessionResult?.answers)

    if (isFeedback && currentResult) {
      const isCorrect = option === currentResult.correctAnswer
      const isSelected = option === selectedAnswer

      if (isCorrect) {
        return {
          background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))',
          border: '2px solid #22c55e',
          boxShadow: '0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.2)',
          color: '#4ade80',
        }
      }
      if (isSelected && !isCorrect) {
        return {
          background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))',
          border: '2px solid #ef4444',
          boxShadow: '0 0 20px rgba(239,68,68,0.5)',
          color: '#f87171',
        }
      }
    }

    if (selectedAnswer === option) {
      return {
        background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(168,85,247,0.2))',
        border: '2px solid #eab308',
        boxShadow: '0 0 15px rgba(234,179,8,0.4), 0 0 30px rgba(168,85,247,0.2)',
        color: '#fde047',
      }
    }

    return {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(234,179,8,0.2)',
      color: 'rgba(255,255,255,0.7)',
    }
  }

  const getOptionText = (option: string) => {
    if (!questions[currentQ]) return ''
    const map: Record<string, string> = {
      A: questions[currentQ].optionA,
      B: questions[currentQ].optionB,
      C: questions[currentQ].optionC,
      D: questions[currentQ].optionD,
    }
    return map[option]
  }

  const currentQuestion = questions[currentQ]
  const teamShield = currentQuestion?.teamSlug ? TEAM_SHIELDS[currentQuestion.teamSlug] : null
  const categoryColor = currentQuestion?.category ? CATEGORY_COLORS[currentQuestion.category] || '#eab308' : '#eab308'

  // Calculate running total
  const runningPoints = questionResults.reduce((sum, r) => sum + r.pointsEarned + r.speedBonus, 0)

  // === LOADING STATE ===
  if (gameState === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#eab308', borderRightColor: '#a855f7' }} />
          <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%)' }} />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando trivia relámpago...</p>
      </div>
    )
  }

  if (questions.length === 0) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 relative">
      {/* === CONFETTI EFFECT === */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                background: ['#eab308', '#a855f7', '#22c55e', '#f97316', '#ec4899', '#3b82f6', '#fde047', '#06b6d4'][i % 8],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `trivia-confetti ${1.5 + Math.random() * 2.5}s ease-out ${Math.random() * 0.8}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* === LIGHTNING TRIVIA CARD - ELECTRIC VEGAS STYLE === */}
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-700"
        style={{
          background: 'linear-gradient(135deg, #0a0015 0%, #0d0a20 30%, #151025 60%, #0a0015 100%)',
          border: '1px solid rgba(234,179,8,0.3)',
          boxShadow: '0 0 40px rgba(234,179,8,0.15), 0 0 80px rgba(168,85,247,0.08), inset 0 0 60px rgba(0,0,0,0.5)',
          transform: animateCard ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: animateCard ? 1 : 0,
        }}
      >
        {/* === ELECTRIC LIGHT BORDER TOP === */}
        <div className="relative h-2 w-full overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #eab308, #a855f7, #fde047, #22c55e, #ec4899, #f97316, #eab308)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 2s linear infinite',
          }} />
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: ['#eab308', '#a855f7', '#fde047', '#22c55e', '#ec4899'][i % 5],
                  boxShadow: `0 0 4px ${['#eab308', '#a855f7', '#fde047', '#22c55e', '#ec4899'][i % 5]}`,
                  animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.08}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        {/* === HEADER === */}
        <div className="p-4 md:p-6 text-center relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center top, rgba(234,179,8,0.15) 0%, transparent 60%)',
          }} />

          <div className="relative">
            {/* Lightning bolt decorations */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span style={{ color: '#eab308', textShadow: '0 0 10px rgba(234,179,8,0.8)', fontSize: '1rem' }}>⚡</span>
              <div className="w-2 h-2 rotate-45" style={{ background: '#eab308', boxShadow: '0 0 8px #eab308' }} />
              <div className="w-3 h-3 rotate-45" style={{ background: '#fde047', boxShadow: '0 0 12px #fde047' }} />
              <div className="w-2 h-2 rotate-45" style={{ background: '#eab308', boxShadow: '0 0 8px #eab308' }} />
              <span style={{ color: '#eab308', textShadow: '0 0 10px rgba(234,179,8,0.8)', fontSize: '1rem' }}>⚡</span>
            </div>

            <h2
              className="text-2xl md:text-4xl font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #fde047, #eab308, #a855f7, #fde047, #eab308)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s linear infinite',
                filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.5))',
              }}
            >
              TRIVIA RELÁMPAGO
            </h2>
            <p className="text-xs mt-1 uppercase tracking-[0.3em] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
              5 preguntas en 60 segundos
            </p>
          </div>

          {/* Info bar: Timer, Progress, Points */}
          {(gameState === 'playing' || gameState === 'feedback') && (
            <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
              {/* Question progress */}
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  color: '#d8b4fe',
                }}
              >
                {currentQ + 1}/{TOTAL_QUESTIONS}
              </div>

              {/* Timer */}
              <div
                className="px-4 py-2 rounded-full text-sm font-black flex items-center gap-2"
                style={{
                  background: timeLeft <= 10 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.1)',
                  border: `1px solid ${timeLeft <= 10 ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.3)'}`,
                  color: timeLeft <= 10 ? '#ef4444' : '#fde047',
                  textShadow: timeLeft <= 10 ? '0 0 10px rgba(239,68,68,0.8)' : '0 0 8px rgba(234,179,8,0.5)',
                  animation: timeLeft <= 10 ? 'neon-flicker 0.5s ease-in-out infinite' : 'none',
                }}
              >
                <span style={{ fontSize: '1rem' }}>⚡</span>
                {timeLeft}s
              </div>

              {/* Running points */}
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  textShadow: '0 0 6px rgba(34,197,94,0.4)',
                }}
              >
                {runningPoints} pts
              </div>
            </div>
          )}

          {/* Progress bar for questions */}
          {(gameState === 'playing' || gameState === 'feedback') && (
            <div className="mt-3 flex gap-1.5 justify-center">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentQ ? '2rem' : '1.5rem',
                    background: i < currentQ
                      ? questionResults[i]?.isCorrect
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)'
                      : i === currentQ
                        ? 'linear-gradient(90deg, #eab308, #fde047)'
                        : 'rgba(255,255,255,0.1)',
                    boxShadow: i === currentQ ? '0 0 8px rgba(234,179,8,0.5)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* === ENTER CODE STATE === */}
        {gameState === 'enter' && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Game description */}
            <div
              className="p-4 rounded-2xl text-center space-y-2"
              style={{
                background: 'rgba(234,179,8,0.06)',
                border: '1px solid rgba(234,179,8,0.15)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#fde047', textShadow: '0 0 8px rgba(234,179,8,0.5)' }}>
                Responde rápido para ganar puntos extra
              </p>
              <div className="flex items-center justify-center gap-3 text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="flex items-center gap-1">
                  <span style={{ color: '#22c55e' }}>0-5s</span> +5 bonus
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: '#f97316' }}>5-10s</span> +3 bonus
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: '#ef4444' }}>10-15s</span> +1 bonus
                </span>
              </div>
            </div>

            {/* TPK Code input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#fde047' }}>
                Ingresa tu código TPK para participar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tpkCode}
                  onChange={(e) => { setTpkCode(e.target.value.toUpperCase()); setError('') }}
                  placeholder="TPKXXXXXX"
                  className="w-full px-4 py-3.5 rounded-xl text-center text-sm font-bold tracking-wider text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#eab308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234,179,8,0.3)'}
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  boxShadow: '0 0 15px rgba(234,179,8,0.1)',
                }} />
              </div>
              {error && (
                <p className="text-center text-xs font-bold animate-bounce" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #eab308 0%, #a855f7 100%)',
                color: 'white',
                boxShadow: '0 0 25px rgba(234,179,8,0.4), 0 0 50px rgba(168,85,247,0.2)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'option-shimmer 3s ease-in-out infinite',
              }} />
              <span className="relative flex items-center justify-center gap-2">
                <span>⚡</span> JUGAR RELÁMPAGO <span>⚡</span>
              </span>
            </button>
          </div>
        )}

        {/* === COUNTDOWN STATE === */}
        {gameState === 'countdown' && <CountdownAnimation onComplete={handleCountdownComplete} />}

        {/* === PLAYING / FEEDBACK STATE === */}
        {(gameState === 'playing' || gameState === 'feedback') && currentQuestion && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Category badge */}
            <div className="flex items-center justify-center gap-2">
              <div
                className="px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider"
                style={{
                  background: `${categoryColor}15`,
                  border: `1px solid ${categoryColor}40`,
                  color: categoryColor,
                  textShadow: `0 0 8px ${categoryColor}80`,
                }}
              >
                {currentQuestion.category?.toUpperCase() || 'LIGA'}
              </div>
            </div>

            {/* Team shield */}
            {teamShield && (
              <div className="flex justify-center mb-1">
                <div
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center p-2"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${categoryColor}30`,
                    boxShadow: `0 0 20px ${categoryColor}15, inset 0 0 10px rgba(0,0,0,0.3)`,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}
                >
                  <Image
                    src={teamShield}
                    alt="Escudo del equipo"
                    width={48}
                    height={48}
                    className="object-contain"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(234,179,8,0.4))' }}
                  />
                </div>
              </div>
            )}

            {/* Question */}
            <div
              className="p-4 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: 'rgba(234,179,8,0.06)',
                border: '1px solid rgba(234,179,8,0.15)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(234,179,8,0.04) 45%, rgba(168,85,247,0.04) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'option-shimmer 3s ease-in-out infinite',
              }} />
              <p className="text-sm md:text-base font-bold relative" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {currentQuestion.question}
              </p>
            </div>

            {/* Options - 2x2 grid for speed */}
            <div className="grid grid-cols-2 gap-2.5">
              {['A', 'B', 'C', 'D'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => gameState === 'playing' ? handleAnswer(option) : undefined}
                  disabled={gameState !== 'playing' || submitting}
                  className="p-3 md:p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default relative overflow-hidden"
                  style={{
                    ...getOptionStyle(option),
                    transition: 'all 0.3s ease',
                    animation: gameState === 'playing' ? `score-pop 0.3s ease-out ${index * 0.05}s both` : 'none',
                  }}
                >
                  {/* Letter circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-black mx-auto mb-1.5 transition-all"
                    style={{
                      background: gameState === 'feedback'
                        ? option === questionResults[currentQ]?.correctAnswer
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : option === selectedAnswer && option !== questionResults[currentQ]?.correctAnswer
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'rgba(255,255,255,0.08)'
                        : selectedAnswer === option
                          ? 'linear-gradient(135deg, #eab308, #a855f7)'
                          : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {option}
                  </div>
                  <span className="text-[0.7rem] md:text-xs font-medium leading-tight block">{getOptionText(option)}</span>

                  {/* Correct/Incorrect icon */}
                  {gameState === 'feedback' && questionResults[currentQ] && (
                    option === questionResults[currentQ]?.correctAnswer ? (
                      <span className="absolute top-1 right-1.5 text-sm font-bold" style={{ color: '#4ade80' }}>✓</span>
                    ) : option === selectedAnswer && option !== questionResults[currentQ]?.correctAnswer ? (
                      <span className="absolute top-1 right-1.5 text-sm font-bold" style={{ color: '#f87171' }}>✗</span>
                    ) : null
                  )}
                </button>
              ))}
            </div>

            {/* Feedback message per question */}
            {gameState === 'feedback' && questionResults[currentQ] && (
              <div
                className="p-3 rounded-xl text-center relative overflow-hidden"
                style={{
                  background: questionResults[currentQ].isCorrect
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
                  border: `1px solid ${questionResults[currentQ].isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  animation: 'celebrate 0.4s ease-out',
                }}
              >
                <p className="text-sm font-black" style={{
                  color: questionResults[currentQ].isCorrect ? '#4ade80' : '#f87171',
                  textShadow: questionResults[currentQ].isCorrect ? '0 0 10px rgba(34,197,94,0.5)' : '0 0 10px rgba(239,68,68,0.5)',
                }}>
                  {questionResults[currentQ].isCorrect
                    ? `¡CORRECTO! +${questionResults[currentQ].pointsEarned}${questionResults[currentQ].speedBonus > 0 ? ` +${questionResults[currentQ].speedBonus} velocidad` : ''}`
                    : '¡INCORRECTO!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* === RESULT STATE === */}
        {gameState === 'result' && sessionResult && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            <div
              className="p-6 rounded-2xl text-center space-y-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(168,85,247,0.05))',
                border: '1px solid rgba(234,179,8,0.3)',
                animation: 'celebrate 0.6s ease-out',
              }}
            >
              {/* Big score display */}
              <div className="text-5xl" style={{ animation: 'score-pop 0.6s ease-out' }}>
                {sessionResult.totalCorrect >= 4 ? '🏆' : sessionResult.totalCorrect >= 2 ? '⚡' : '💪'}
              </div>

              <div>
                <p className="text-4xl md:text-5xl font-black" style={{
                  background: 'linear-gradient(90deg, #fde047, #eab308, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.5))',
                  animation: 'score-pop 0.5s ease-out 0.2s both',
                }}>
                  {sessionResult.totalCorrect}/{TOTAL_QUESTIONS}
                </p>
                <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Respuestas correctas
                </p>
              </div>

              {/* Points breakdown */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: '#4ade80', textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>
                    +{(sessionResult.totalEarned ?? sessionResult.totalPoints)}
                  </p>
                  <p className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Puntos ganados</p>
                </div>
                {sessionResult.totalBonus > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black" style={{ color: '#fde047', textShadow: '0 0 10px rgba(234,179,8,0.5)' }}>
                      +{sessionResult.totalBonus}
                    </p>
                    <p className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Bonus velocidad</p>
                  </div>
                )}
              </div>

              {/* Total accumulated */}
              {sessionResult.newTotalPoints !== undefined && (
                <div
                  className="px-4 py-2 rounded-full inline-flex items-center gap-2"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Acumulado total:</span>
                  <span className="text-lg font-black" style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>
                    {sessionResult.newTotalPoints} pts
                  </span>
                </div>
              )}

              {/* Time taken */}
              <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Tiempo: {Math.round(sessionResult.totalTimeMs / 1000)}s de {GAME_TIME}s
              </p>

              <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Próxima ronda en la siguiente hora
              </p>
            </div>
          </div>
        )}

        {/* === ALREADY PLAYED STATE === */}
        {gameState === 'already_played' && sessionResult && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            <div
              className="p-5 rounded-2xl text-center space-y-3"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.05))',
                border: '1px solid rgba(249,115,22,0.3)',
              }}
            >
              <div className="text-4xl">⏰</div>
              <p className="font-black text-sm" style={{ color: '#fdba74', textShadow: '0 0 10px rgba(249,115,22,0.4)' }}>
                YA PARTICIPASTE EN ESTA RONDA
              </p>

              {/* Show their previous results */}
              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Tu resultado: {sessionResult.totalCorrect}/{TOTAL_QUESTIONS} correctas
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Puntos ganados: +{(sessionResult.totalEarned ?? sessionResult.totalPoints)} pts
                </p>
              </div>

              {/* Show answer review */}
              {sessionResult.answers && (
                <div className="space-y-1 mt-3">
                  {sessionResult.answers.map((ans, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 text-[0.65rem]">
                      <span style={{ color: ans.isCorrect ? '#4ade80' : '#f87171' }}>
                        {ans.isCorrect ? '✓' : '✗'}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Pregunta {i + 1}:
                      </span>
                      <span style={{ color: ans.isCorrect ? '#4ade80' : '#f87171' }}>
                        +{ans.pointsEarned + ans.speedBonus} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[0.65rem] uppercase tracking-wider mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Espera la próxima ronda para participar de nuevo
              </p>
            </div>
          </div>
        )}

        {/* === BOTTOM ELECTRIC LIGHT BORDER === */}
        <div className="relative h-2 w-full overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #22c55e, #eab308, #a855f7, #fde047, #ec4899, #22c55e)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 2s linear infinite reverse',
          }} />
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: ['#22c55e', '#eab308', '#a855f7', '#fde047', '#ec4899'][i % 5],
                  boxShadow: `0 0 4px ${['#22c55e', '#eab308', '#a855f7', '#fde047', '#ec4899'][i % 5]}`,
                  animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.08}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* === ELECTRIC SIDE LIGHTS === */}
      <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none hidden md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1.5 rounded-full mb-4"
            style={{
              background: ['#eab308', '#fde047', '#a855f7', '#22c55e'][i % 4],
              boxShadow: `0 0 4px ${['#eab308', '#fde047', '#a855f7', '#22c55e'][i % 4]}`,
              animation: `vegas-lights ${0.5 + Math.random() * 1}s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1 pointer-events-none hidden md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1.5 rounded-full mb-4 ml-auto"
            style={{
              background: ['#ec4899', '#3b82f6', '#fde047', '#06b6d4'][i % 4],
              boxShadow: `0 0 4px ${['#ec4899', '#3b82f6', '#fde047', '#06b6d4'][i % 4]}`,
              animation: `vegas-lights ${0.5 + Math.random() * 1}s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// === COUNTDOWN ANIMATION COMPONENT ===
function CountdownAnimation({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCount(prev => prev - 1), 800)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="px-4 md:px-6 pb-6 flex items-center justify-center py-12">
      <div className="relative">
        {/* Electric ring */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.05) 50%, transparent 70%)',
            border: '3px solid rgba(234,179,8,0.4)',
            boxShadow: '0 0 40px rgba(234,179,8,0.3), 0 0 80px rgba(234,179,8,0.1), inset 0 0 30px rgba(234,179,8,0.1)',
            animation: 'lightning-pulse 0.8s ease-in-out infinite',
          }}
        >
          {/* Lightning bolts around ring */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 rounded-full"
              style={{
                background: '#eab308',
                boxShadow: '0 0 6px #eab308',
                transform: `rotate(${i * 45}deg) translateY(-60px)`,
                animation: `vegas-lights ${0.3 + Math.random() * 0.5}s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}

          <span
            className="text-6xl font-black relative"
            style={{
              background: 'linear-gradient(135deg, #fde047, #eab308)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.8))',
              animation: 'score-pop 0.8s ease-out',
            }}
          >
            {count > 0 ? count : '⚡'}
          </span>
        </div>
      </div>
    </div>
  )
}

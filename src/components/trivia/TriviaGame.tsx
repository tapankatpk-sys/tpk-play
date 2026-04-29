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

// Updated team shields - 20 teams in Liga BetPlay 2026
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
  'llaneros-fc': '/images/teams/llaneros-fc.png',
  'millonarios': '/images/teams/millonarios.svg',
  'once-caldas': '/images/teams/once-caldas.svg',
  // Teams not in Liga 2026 (kept for reference)
  'envigado': '/images/teams/envigado.svg',
  'la-equidad': '/images/teams/la-equidad.svg',
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

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  'easy': { label: 'FÁCIL', color: '#22c55e' },
  'medium': { label: 'MEDIO', color: '#f97316' },
  'hard': { label: 'DIFÍCIL', color: '#ef4444' },
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
  const [animateCard, setAnimateCard] = useState(false)

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
        // Trigger card entrance animation
        setTimeout(() => setAnimateCard(true), 100)
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
        setTimeout(() => setShowConfetti(false), 4000)
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
          boxShadow: '0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.2)',
          color: '#4ade80',
        }
      }
      if (isSelected && !isThisCorrect) {
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
  const difficultyInfo = question?.difficulty ? DIFFICULTY_LABELS[question.difficulty] || DIFFICULTY_LABELS['medium'] : DIFFICULTY_LABELS['medium']

  // === LOADING STATE ===
  if (gameState === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="relative w-16 h-16 mx-auto">
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#a855f7', borderRightColor: '#f97316' }} />
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }} />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando trivia...</p>
      </div>
    )
  }

  if (!question || !round) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 relative">
      {/* === CONFETTI EFFECT === */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#3b82f6', '#fbbf24', '#06b6d4'][i % 8],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `trivia-confetti ${1.5 + Math.random() * 2.5}s ease-out ${Math.random() * 0.8}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* === TRIVIA CARD - LAS VEGAS STYLE === */}
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-700"
        style={{
          background: 'linear-gradient(135deg, #0a0015 0%, #0d0020 30%, #100a25 60%, #0a0015 100%)',
          border: '1px solid rgba(168,85,247,0.3)',
          boxShadow: '0 0 40px rgba(168,85,247,0.15), 0 0 80px rgba(249,115,22,0.08), inset 0 0 60px rgba(0,0,0,0.5)',
          transform: animateCard ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: animateCard ? 1 : 0,
        }}
      >
        {/* === DECORATIVE VEGAS LIGHT BORDER TOP === */}
        <div className="relative h-2 w-full overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #a855f7, #f97316, #22c55e, #eab308, #ec4899, #3b82f6, #a855f7)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s linear infinite',
          }} />
          {/* Vegas light dots */}
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899'][i % 5],
                  boxShadow: `0 0 4px ${['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899'][i % 5]}`,
                  animation: `vegas-lights ${0.5 + Math.random() * 1.5}s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        {/* === HEADER === */}
        <div className="p-4 md:p-6 text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center top, rgba(168,85,247,0.15) 0%, transparent 60%)',
          }} />

          {/* Title with neon effect */}
          <div className="relative">
            {/* Vegas-style diamond separator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 rotate-45" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#a855f7', boxShadow: '0 0 4px #a855f7' }} />
              <div className="w-3 h-3 rotate-45" style={{ background: '#eab308', boxShadow: '0 0 8px #eab308' }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#a855f7', boxShadow: '0 0 4px #a855f7' }} />
              <div className="w-2 h-2 rotate-45" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }} />
            </div>

            <h2
              className="text-2xl md:text-4xl font-black uppercase tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #f97316, #fbbf24, #a855f7)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 4s linear infinite',
                filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.5))',
              }}
            >
              TRIVIA FUTBOLERA
            </h2>
            <p className="text-xs mt-1 uppercase tracking-[0.3em] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Liga BetPlay Colombia 2026
            </p>
          </div>

          {/* Timer, category and difficulty bar */}
          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            {/* Category badge */}
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: `${categoryColor}15`,
                border: `1px solid ${categoryColor}40`,
                color: categoryColor,
                textShadow: `0 0 8px ${categoryColor}80`,
              }}
            >
              {question.category ? CATEGORY_LABELS[question.category] || question.category : 'LIGA'}
            </div>

            {/* Difficulty badge */}
            <div
              className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider"
              style={{
                background: `${difficultyInfo.color}10`,
                border: `1px solid ${difficultyInfo.color}30`,
                color: difficultyInfo.color,
              }}
            >
              {difficultyInfo.label}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{
                  background: timeLeft < 300 ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${timeLeft < 300 ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.25)'}`,
                  color: timeLeft < 300 ? '#ef4444' : '#f87171',
                  textShadow: timeLeft < 60 ? '0 0 10px rgba(239,68,68,0.8)' : 'none',
                  animation: timeLeft < 60 ? 'neon-flicker 1s ease-in-out infinite' : 'none',
                }}
              >
                <span className="text-[0.7rem]">⏱</span>
                {formatTime(timeLeft)}
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  textShadow: '0 0 6px rgba(34,197,94,0.4)',
                }}
              >
                +10 pts
              </div>
            </div>
          </div>
        </div>

        {/* === TEAM SHIELD DISPLAY === */}
        {teamShield && (
          <div className="flex justify-center mb-2">
            <div
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center p-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${categoryColor}30`,
                boxShadow: `0 0 25px ${categoryColor}15, inset 0 0 15px rgba(0,0,0,0.3)`,
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}
            >
              <Image
                src={teamShield}
                alt="Escudo del equipo"
                width={64}
                height={64}
                className="object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.4))' }}
              />
            </div>
          </div>
        )}

        {/* === ENTER CODE STATE === */}
        {gameState === 'enter' && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Question preview */}
            <div
              className="p-5 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(168,85,247,0.05) 45%, rgba(249,115,22,0.05) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'option-shimmer 4s ease-in-out infinite',
              }} />
              <p className="text-sm md:text-base font-medium relative" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {question.question}
              </p>
            </div>

            {/* TPK Code input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-center" style={{ color: '#d8b4fe' }}>
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
                    border: '1px solid rgba(168,85,247,0.3)',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(168,85,247,0.3)'}
                />
                {/* Input glow */}
                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  boxShadow: '0 0 15px rgba(168,85,247,0.1)',
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
                background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
                color: 'white',
                boxShadow: '0 0 25px rgba(168,85,247,0.4), 0 0 50px rgba(249,115,22,0.2)',
              }}
            >
              {/* Button shimmer */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'option-shimmer 3s ease-in-out infinite',
              }} />
              <span className="relative">JUGAR TRIVIA</span>
            </button>
          </div>
        )}

        {/* === PLAYING / ANSWERED / RESULT STATE === */}
        {(gameState === 'playing' || gameState === 'result' || gameState === 'already_played') && (
          <div className="px-4 md:px-6 pb-6 space-y-4">
            {/* Question */}
            <div
              className="p-5 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(168,85,247,0.04) 45%, rgba(249,115,22,0.04) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'option-shimmer 4s ease-in-out infinite',
              }} />
              <p className="text-sm md:text-base font-medium relative" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => gameState === 'playing' ? handleAnswer(option) : undefined}
                  disabled={gameState !== 'playing' || submitting}
                  className="w-full p-3.5 md:p-4 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:cursor-default group relative overflow-hidden"
                  style={{
                    ...getOptionStyle(option),
                    transition: 'all 0.3s ease',
                    animation: gameState === 'playing' ? `score-pop 0.4s ease-out ${index * 0.1}s both` : 'none',
                  }}
                >
                  {/* Hover shimmer */}
                  {gameState === 'playing' && (
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(168,85,247,0.06) 50%, transparent 60%)',
                      backgroundSize: '200% 100%',
                      animation: 'option-shimmer 2s ease-in-out infinite',
                    }} />
                  )}

                  {/* Letter circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all"
                    style={{
                      background: gameState === 'result' || gameState === 'already_played'
                        ? option === (result?.correctAnswer || alreadyPlayed?.correctAnswer)
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : option === selectedAnswer
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'rgba(255,255,255,0.08)'
                        : selectedAnswer === option
                          ? 'linear-gradient(135deg, #a855f7, #f97316)'
                          : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: gameState === 'result' && option === (result?.correctAnswer || alreadyPlayed?.correctAnswer)
                        ? '0 0 10px rgba(34,197,94,0.5)'
                        : 'none',
                    }}
                  >
                    {option}
                  </div>
                  <span className="text-sm font-medium relative">{getOptionText(option)}</span>

                  {/* Correct/Incorrect icon */}
                  {(gameState === 'result' || gameState === 'already_played') && (
                    option === (result?.correctAnswer || alreadyPlayed?.correctAnswer) ? (
                      <span className="ml-auto text-lg font-bold" style={{ color: '#4ade80' }}>✓</span>
                    ) : option === selectedAnswer && option !== (result?.correctAnswer || alreadyPlayed?.correctAnswer) ? (
                      <span className="ml-auto text-lg font-bold" style={{ color: '#f87171' }}>✗</span>
                    ) : null
                  )}
                </button>
              ))}
            </div>

            {/* === RESULT MESSAGE === */}
            {gameState === 'result' && result && (
              <div
                className="p-5 rounded-2xl text-center space-y-3 relative overflow-hidden"
                style={{
                  background: result.isCorrect
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
                  border: `1px solid ${result.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  animation: 'celebrate 0.5s ease-out',
                }}
              >
                <div className="text-4xl" style={{ animation: result.isCorrect ? 'score-pop 0.6s ease-out' : 'shake 0.5s ease-out' }}>
                  {result.isCorrect ? '🎉' : '😔'}
                </div>
                <p className="font-black text-xl" style={{
                  color: result.isCorrect ? '#4ade80' : '#f87171',
                  textShadow: result.isCorrect ? '0 0 15px rgba(34,197,94,0.5)' : '0 0 15px rgba(239,68,68,0.5)',
                }}>
                  {result.isCorrect ? '¡CORRECTO! +10 PUNTOS' : '¡INCORRECTO!'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Tu acumulado total:
                  </p>
                  <span
                    className="text-lg font-black"
                    style={{
                      color: '#fbbf24',
                      textShadow: '0 0 10px rgba(251,191,36,0.5)',
                      animation: result.isCorrect ? 'score-pop 0.5s ease-out 0.2s both' : 'none',
                    }}
                  >
                    {result.totalPoints} pts
                  </span>
                </div>
                <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Próxima pregunta en la siguiente hora
                </p>
              </div>
            )}

            {/* === ALREADY PLAYED MESSAGE === */}
            {gameState === 'already_played' && alreadyPlayed && (
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
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {alreadyPlayed.wasCorrect ? 'Acertaste la respuesta anterior. ¡Bien hecho!' : 'No acertaste la respuesta anterior.'}
                </p>
                <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Espera la próxima ronda para participar de nuevo
                </p>
              </div>
            )}
          </div>
        )}

        {/* === BOTTOM DECORATIVE LIGHT BORDER === */}
        <div className="relative h-2 w-full overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #22c55e, #f97316, #a855f7, #ec4899, #3b82f6, #22c55e)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s linear infinite reverse',
          }} />
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: ['#22c55e', '#f97316', '#a855f7', '#ec4899', '#3b82f6'][i % 5],
                  boxShadow: `0 0 4px ${['#22c55e', '#f97316', '#a855f7', '#ec4899', '#3b82f6'][i % 5]}`,
                  animation: `vegas-lights ${0.5 + Math.random() * 1.5}s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* === LAS VEGAS SIDE LIGHTS === */}
      <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none hidden md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1.5 rounded-full mb-4"
            style={{
              background: ['#a855f7', '#f97316', '#22c55e', '#eab308'][i % 4],
              boxShadow: `0 0 4px ${['#a855f7', '#f97316', '#22c55e', '#eab308'][i % 4]}`,
              animation: `vegas-lights ${0.8 + Math.random() * 1.2}s ease-in-out ${i * 0.15}s infinite alternate`,
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
              background: ['#ec4899', '#3b82f6', '#fbbf24', '#06b6d4'][i % 4],
              boxShadow: `0 0 4px ${['#ec4899', '#3b82f6', '#fbbf24', '#06b6d4'][i % 4]}`,
              animation: `vegas-lights ${0.8 + Math.random() * 1.2}s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

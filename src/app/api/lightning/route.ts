import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { lightningQuestions } from '@/lib/lightning-questions'

// Helper: generate roundId based on current hour (America/Bogota timezone)
function getCurrentRoundId(): string {
  const now = new Date()
  const colombiaOffset = -5 * 60
  const colombiaTime = new Date(now.getTime() + (colombiaOffset * 60000) + (now.getTimezoneOffset() * 60000))
  const year = colombiaTime.getFullYear()
  const month = String(colombiaTime.getMonth() + 1).padStart(2, '0')
  const day = String(colombiaTime.getDate()).padStart(2, '0')
  const hour = String(colombiaTime.getHours()).padStart(2, '0')
  return `L-${year}-${month}-${day}-${hour}`
}

function getNextRoundTime(): Date {
  const now = new Date()
  const colombiaOffset = -5 * 60
  const colombiaTime = new Date(now.getTime() + (colombiaOffset * 60000) + (now.getTimezoneOffset() * 60000))
  const nextHour = new Date(colombiaTime)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  return new Date(nextHour.getTime() - (colombiaOffset * 60000) - (now.getTimezoneOffset() * 60000))
}

// Deterministic shuffle based on roundId seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// GET current lightning round questions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantCode = searchParams.get('code')
    const isPreview = searchParams.get('preview') === 'true'

    const roundId = getCurrentRoundId()

    let round = await db.lightningRound.findUnique({
      where: { roundId },
      include: { answers: true },
    })

    if (!round) {
      // Generate 5 questions deterministically from the seed
      const seed = roundId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const shuffled = seededShuffle(lightningQuestions, seed)
      const selected = shuffled.slice(0, 5)
      const questionIndices = selected.map(q => lightningQuestions.indexOf(q))

      const now = new Date()
      const nextHour = getNextRoundTime()

      round = await db.lightningRound.create({
        data: {
          roundId,
          questionIds: JSON.stringify(questionIndices),
          startedAt: now,
          endsAt: nextHour,
        },
        include: { answers: true },
      })
    }

    // Parse question data
    const questionIndices: number[] = JSON.parse(round.questionIds)
    const questions = questionIndices.map((idx, i) => {
      const q = lightningQuestions[idx]
      return {
        index: i,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        category: q.category,
        teamSlug: q.teamSlug || null,
        // Include correct answer for admin preview
        ...(isPreview ? { correctAnswer: q.correctAnswer } : {}),
      }
    })

    // For admin preview mode, return simplified response without user data
    if (isPreview) {
      return NextResponse.json({
        preview: true,
        round: {
          roundId: round.roundId,
          startedAt: round.startedAt,
          endsAt: round.endsAt,
        },
        questions,
        totalQuestions: lightningQuestions.length,
      })
    }

    // Check if user already played this round
    let alreadyPlayed = false
    let sessionResult: Record<string, unknown> | null = null
    if (participantCode) {
      const session = await db.lightningSession.findUnique({
        where: { roundId_participantCode: { roundId, participantCode } },
      })
      if (session) {
        alreadyPlayed = true

        // Get the answers for this user
        const userAnswers = await db.lightningAnswer.findMany({
          where: { roundId, participantCode },
          orderBy: { questionIndex: 'asc' },
        })

        sessionResult = {
          totalCorrect: session.totalCorrect,
          totalPoints: session.totalPoints,
          totalBonus: session.totalBonus,
          totalTimeMs: session.totalTimeMs,
          answers: userAnswers.map(a => ({
            questionIndex: a.questionIndex,
            selectedAnswer: a.selectedAnswer,
            isCorrect: a.isCorrect,
            correctAnswer: lightningQuestions[questionIndices[a.questionIndex]].correctAnswer,
            pointsEarned: a.pointsEarned,
            speedBonus: a.speedBonus,
          })),
        }
      }
    }

    return NextResponse.json({
      round: {
        roundId: round.roundId,
        startedAt: round.startedAt,
        endsAt: round.endsAt,
      },
      questions,
      alreadyPlayed,
      sessionResult,
      totalQuestions: lightningQuestions.length,
    })
  } catch (error) {
    console.error('Error fetching lightning trivia:', error)
    return NextResponse.json({ error: 'Error al obtener trivia relámpago' }, { status: 500 })
  }
}

// POST submit an answer for one question
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantCode, roundId, questionIndex, selectedAnswer, timeToAnswer } = body

    if (!participantCode || !roundId || questionIndex === undefined || !selectedAnswer || timeToAnswer === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return NextResponse.json({ error: 'Respuesta inválida' }, { status: 400 })
    }

    if (questionIndex < 0 || questionIndex > 4) {
      return NextResponse.json({ error: 'Índice de pregunta inválido' }, { status: 400 })
    }

    const participant = await db.participant.findUnique({
      where: { code: participantCode },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Código TPK no válido. Debes registrarte primero.' }, { status: 404 })
    }

    const round = await db.lightningRound.findUnique({
      where: { roundId },
    })

    if (!round) {
      return NextResponse.json({ error: 'Ronda no encontrada' }, { status: 404 })
    }

    // Check if round expired
    const now = new Date()
    if (now > new Date(round.endsAt)) {
      return NextResponse.json({ error: 'Esta ronda ya terminó' }, { status: 410 })
    }

    // Check if user already answered this question
    const existingAnswer = await db.lightningAnswer.findUnique({
      where: {
        roundId_participantCode_questionIndex: {
          roundId,
          participantCode,
          questionIndex,
        },
      },
    })

    if (existingAnswer) {
      return NextResponse.json({ error: 'Ya respondiste esta pregunta' }, { status: 409 })
    }

    // Check if user already completed this round
    const existingSession = await db.lightningSession.findUnique({
      where: { roundId_participantCode: { roundId, participantCode } },
    })

    if (existingSession) {
      return NextResponse.json({
        error: 'Ya completaste esta ronda',
        alreadyCompleted: true,
      }, { status: 409 })
    }

    // Get the correct answer
    const questionIndices: number[] = JSON.parse(round.questionIds)
    const question = lightningQuestions[questionIndices[questionIndex]]
    const isCorrect = selectedAnswer === question.correctAnswer

    // Calculate points and speed bonus
    const pointsEarned = isCorrect ? 10 : 0
    let speedBonus = 0
    if (isCorrect) {
      if (timeToAnswer <= 5000) speedBonus = 5       // 0-5s: +5 bonus
      else if (timeToAnswer <= 10000) speedBonus = 3  // 5-10s: +3 bonus
      else if (timeToAnswer <= 15000) speedBonus = 1  // 10-15s: +1 bonus
    }

    await db.lightningAnswer.create({
      data: {
        roundId,
        participantCode,
        questionIndex,
        selectedAnswer,
        isCorrect,
        pointsEarned,
        speedBonus,
        timeToAnswer,
      },
    })

    // If this is the 5th question (index 4), complete the session
    if (questionIndex === 4) {
      const allAnswers = await db.lightningAnswer.findMany({
        where: { roundId, participantCode },
        orderBy: { questionIndex: 'asc' },
      })

      const totalCorrect = allAnswers.filter(a => a.isCorrect).length
      const totalPoints = allAnswers.reduce((sum, a) => sum + a.pointsEarned, 0)
      const totalBonus = allAnswers.reduce((sum, a) => sum + a.speedBonus, 0)
      const totalTimeMs = allAnswers.reduce((sum, a) => sum + a.timeToAnswer, 0)

      await db.lightningSession.create({
        data: {
          roundId,
          participantCode,
          totalCorrect,
          totalPoints,
          totalBonus,
          totalTimeMs,
        },
      })

      // Add total points + bonus to participant's accumulated score
      const totalEarned = totalPoints + totalBonus
      if (totalEarned > 0) {
        await db.participant.update({
          where: { code: participantCode },
          data: { totalPoints: { increment: totalEarned } },
        })
      }

      return NextResponse.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        pointsEarned,
        speedBonus,
        sessionComplete: true,
        sessionResult: {
          totalCorrect,
          totalPoints,
          totalBonus,
          totalTimeMs,
          totalEarned,
          newTotalPoints: participant.totalPoints + totalEarned,
        },
      })
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      pointsEarned,
      speedBonus,
      sessionComplete: false,
    })
  } catch (error) {
    console.error('Error submitting lightning answer:', error)
    return NextResponse.json({ error: 'Error al enviar respuesta' }, { status: 500 })
  }
}

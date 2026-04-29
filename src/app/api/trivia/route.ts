import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { triviaQuestions } from '@/lib/trivia-questions'

// Helper: generate roundId based on current hour (America/Bogota timezone)
function getCurrentRoundId(): string {
  const now = new Date()
  // Convert to Colombia timezone (UTC-5)
  const colombiaOffset = -5 * 60
  const colombiaTime = new Date(now.getTime() + (colombiaOffset * 60000) + (now.getTimezoneOffset() * 60000))
  const year = colombiaTime.getFullYear()
  const month = String(colombiaTime.getMonth() + 1).padStart(2, '0')
  const day = String(colombiaTime.getDate()).padStart(2, '0')
  const hour = String(colombiaTime.getHours()).padStart(2, '0')
  return `${year}-${month}-${day}-${hour}`
}

function getNextRoundTime(): Date {
  const now = new Date()
  const colombiaOffset = -5 * 60
  const colombiaTime = new Date(now.getTime() + (colombiaOffset * 60000) + (now.getTimezoneOffset() * 60000))
  const nextHour = new Date(colombiaTime)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  return new Date(nextHour.getTime() - (colombiaOffset * 60000) - (now.getTimezoneOffset() * 60000))
}

// GET current trivia question
export async function GET() {
  try {
    const roundId = getCurrentRoundId()

    let round = await db.triviaRound.findUnique({
      where: { roundId },
      include: { question: true }
    })

    if (!round) {
      const seed = roundId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const questionIndex = seed % triviaQuestions.length
      const qData = triviaQuestions[questionIndex]

      let question = await db.triviaQuestion.findFirst({
        where: { question: qData.question }
      })

      if (!question) {
        question = await db.triviaQuestion.create({
          data: {
            question: qData.question,
            optionA: qData.optionA,
            optionB: qData.optionB,
            optionC: qData.optionC,
            optionD: qData.optionD,
            correctAnswer: qData.correctAnswer,
            category: qData.category,
            teamSlug: qData.teamSlug || null,
            difficulty: qData.difficulty,
          }
        })
      }

      const now = new Date()
      const nextHour = getNextRoundTime()

      round = await db.triviaRound.create({
        data: {
          roundId,
          questionId: question.id,
          startedAt: now,
          endsAt: nextHour,
        },
        include: { question: true }
      })
    }

    const { correctAnswer, ...questionData } = round.question

    return NextResponse.json({
      round: {
        roundId: round.roundId,
        startedAt: round.startedAt,
        endsAt: round.endsAt,
      },
      question: questionData,
      totalQuestions: triviaQuestions.length,
    })
  } catch (error) {
    console.error('Error fetching trivia:', error)
    return NextResponse.json({ error: 'Error al obtener la trivia' }, { status: 500 })
  }
}

// POST submit an answer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantCode, selectedAnswer, roundId } = body

    if (!participantCode || !selectedAnswer || !roundId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return NextResponse.json({ error: 'Respuesta inválida' }, { status: 400 })
    }

    const participant = await db.participant.findUnique({
      where: { code: participantCode }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Código TPK no válido. Debes registrarte primero.' }, { status: 404 })
    }

    const round = await db.triviaRound.findUnique({
      where: { roundId },
      include: { question: true }
    })

    if (!round) {
      return NextResponse.json({ error: 'Ronda no encontrada' }, { status: 404 })
    }

    const existingAnswer = await db.triviaAnswer.findUnique({
      where: {
        questionId_participantCode_roundId: {
          questionId: round.questionId,
          participantCode,
          roundId,
        }
      }
    })

    if (existingAnswer) {
      return NextResponse.json({
        error: 'Ya participaste en esta ronda',
        alreadyAnswered: true,
        wasCorrect: existingAnswer.isCorrect,
        correctAnswer: round.question.correctAnswer,
      }, { status: 409 })
    }

    const now = new Date()
    if (now > new Date(round.endsAt)) {
      return NextResponse.json({ error: 'Esta ronda ya terminó' }, { status: 410 })
    }

    const isCorrect = selectedAnswer === round.question.correctAnswer
    const pointsEarned = isCorrect ? 10 : 0

    await db.triviaAnswer.create({
      data: {
        questionId: round.questionId,
        participantCode,
        selectedAnswer,
        isCorrect,
        pointsEarned,
        roundId,
      }
    })

    if (isCorrect) {
      await db.participant.update({
        where: { code: participantCode },
        data: { totalPoints: { increment: 10 } }
      })
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: round.question.correctAnswer,
      pointsEarned,
      totalPoints: participant.totalPoints + pointsEarned,
    })
  } catch (error) {
    console.error('Error submitting trivia answer:', error)
    return NextResponse.json({ error: 'Error al enviar respuesta' }, { status: 500 })
  }
}

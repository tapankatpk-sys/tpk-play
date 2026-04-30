import { NextRequest, NextResponse } from 'next/server'
import { generateCrossword, getCurrentCrosswordTeam } from '@/lib/crossword-generator'
import { getTeamData, getAllTeamIds, LIGA_BETPLAY_GENERAL } from '@/lib/crossword-questions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview') === 'true'
    const difficulty = (searchParams.get('difficulty') as 'bajo' | 'medio' | 'dificil') || 'bajo'
    const special = searchParams.get('special') === 'true'
    const teamOverride = searchParams.get('team')

    if (special) {
      const now = new Date()
      const colombiaOffset = -5
      const colombiaTime = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset() / 60) * 3600000)
      const seed = colombiaTime.getFullYear() * 1000000 +
        (colombiaTime.getMonth() + 1) * 10000 +
        colombiaTime.getDate() * 100 +
        colombiaTime.getHours()

      const puzzle = generateCrossword(
        LIGA_BETPLAY_GENERAL,
        difficulty,
        seed + 999,
        'liga-betplay',
        'LIGA BETPLAY'
      )

      const safePuzzle = {
        ...puzzle,
        grid: puzzle.grid.map(row =>
          row.map(cell => cell ? { ...cell, letter: '' } : null)
        ),
      }

      if (preview) {
        return NextResponse.json({
          puzzle,
          difficulty,
          isSpecial: true,
          teamId: 'liga-betplay',
          teamName: 'LIGA BETPLAY',
          timeLimit: 25 * 60,
          totalPoints: 50,
        })
      }

      return NextResponse.json({
        puzzle: safePuzzle,
        difficulty,
        isSpecial: true,
        teamId: 'liga-betplay',
        teamName: 'LIGA BETPLAY',
        timeLimit: 25 * 60,
        totalPoints: 50,
      })
    }

    const teamIds = getAllTeamIds()
    let teamIndex: number
    let teamId: string

    if (teamOverride && teamIds.includes(teamOverride)) {
      teamId = teamOverride
      teamIndex = teamIds.indexOf(teamId)
    } else {
      teamIndex = getCurrentCrosswordTeam(teamIds)
      teamId = teamIds[teamIndex]
    }

    const teamData = getTeamData(teamId)
    if (!teamData) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }

    const now = new Date()
    const colombiaOffset = -5
    const colombiaTime = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset() / 60) * 3600000)
    const seed = colombiaTime.getFullYear() * 1000000 +
      (colombiaTime.getMonth() + 1) * 10000 +
      colombiaTime.getDate() * 100 +
      colombiaTime.getHours() +
      teamIndex

    const puzzle = generateCrossword(
      teamData.words,
      difficulty,
      seed,
      teamData.id,
      teamData.name
    )

    const safePuzzle = {
      ...puzzle,
      grid: puzzle.grid.map(row =>
        row.map(cell => cell ? { ...cell, letter: '' } : null)
      ),
    }

    const timeLimits = { bajo: 10 * 60, medio: 15 * 60, dificil: 20 * 60 }

    if (preview) {
      return NextResponse.json({
        puzzle,
        difficulty,
        isSpecial: false,
        teamId: teamData.id,
        teamName: teamData.name,
        teamColor: teamData.color,
        teamCity: teamData.city,
        timeLimit: timeLimits[difficulty],
        totalPoints: 30,
      })
    }

    return NextResponse.json({
      puzzle: safePuzzle,
      difficulty,
      isSpecial: false,
      teamId: teamData.id,
      teamName: teamData.name,
      teamColor: teamData.color,
      teamCity: teamData.city,
      timeLimit: timeLimits[difficulty],
      totalPoints: 30,
    })
  } catch (error) {
    console.error('Error generating crossword:', error)
    return NextResponse.json({ error: 'Error al generar crucigrama' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantCode, puzzle, answers, difficulty, isSpecial } = body

    if (!puzzle || !answers) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const { validateCrossword } = await import('@/lib/crossword-generator')
    const result = validateCrossword(puzzle, answers)

    if (!result.isComplete) {
      return NextResponse.json({
        success: false,
        message: 'Crucigrama incompleto o con errores',
        ...result,
      })
    }

    const pointsEarned = isSpecial ? 50 : 30

    return NextResponse.json({
      success: true,
      message: `Crucigrama completado! +${pointsEarned} puntos`,
      pointsEarned,
      ...result,
    })
  } catch (error) {
    console.error('Error validating crossword:', error)
    return NextResponse.json({ error: 'Error al validar crucigrama' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/penales — Get current penales config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.penalesConfig.findFirst()
    if (!config) {
      config = await prisma.penalesConfig.create({
        data: {
          roundsPerGame: 5,
          pointsGoal: 20,
          pointsHatTrick: 50,
          pointsPerfect: 100,
          timeLimit: 60,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching penales config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/penales — Create penales config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.penalesConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.penalesConfig.create({
      data: {
        roundsPerGame: body.roundsPerGame ?? 5,
        pointsGoal: body.pointsGoal ?? 20,
        pointsHatTrick: body.pointsHatTrick ?? 50,
        pointsPerfect: body.pointsPerfect ?? 100,
        timeLimit: body.timeLimit ?? 60,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating penales config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/penales — Update penales config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.roundsPerGame !== undefined) updateData.roundsPerGame = data.roundsPerGame
    if (data.pointsGoal !== undefined) updateData.pointsGoal = data.pointsGoal
    if (data.pointsHatTrick !== undefined) updateData.pointsHatTrick = data.pointsHatTrick
    if (data.pointsPerfect !== undefined) updateData.pointsPerfect = data.pointsPerfect
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.penalesConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating penales config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

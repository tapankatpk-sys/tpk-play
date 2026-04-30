import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/carta-mayor — Get current carta-mayor config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.cartaMayorConfig.findFirst()
    if (!config) {
      config = await prisma.cartaMayorConfig.create({
        data: {
          cardsPerRound: 10,
          pointsCorrect: 10,
          pointsStreak5: 50,
          pointsStreak10: 200,
          timeLimit: 120,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching carta-mayor config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/carta-mayor — Create carta-mayor config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.cartaMayorConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.cartaMayorConfig.create({
      data: {
        cardsPerRound: body.cardsPerRound ?? 10,
        pointsCorrect: body.pointsCorrect ?? 10,
        pointsStreak5: body.pointsStreak5 ?? 50,
        pointsStreak10: body.pointsStreak10 ?? 200,
        timeLimit: body.timeLimit ?? 120,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating carta-mayor config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/carta-mayor — Update carta-mayor config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.cardsPerRound !== undefined) updateData.cardsPerRound = data.cardsPerRound
    if (data.pointsCorrect !== undefined) updateData.pointsCorrect = data.pointsCorrect
    if (data.pointsStreak5 !== undefined) updateData.pointsStreak5 = data.pointsStreak5
    if (data.pointsStreak10 !== undefined) updateData.pointsStreak10 = data.pointsStreak10
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.cartaMayorConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating carta-mayor config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

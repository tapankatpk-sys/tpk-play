import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/parques — Get current parqués config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.parquesConfig.findFirst()
    if (!config) {
      config = await prisma.parquesConfig.create({
        data: {
          tokensPerPlayer: 2,
          pointsCapture: 50,
          pointsFinish: 100,
          pointsWin: 500,
          diceSpeed: 3,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching parqués config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/parques — Create parqués config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.parquesConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.parquesConfig.create({
      data: {
        tokensPerPlayer: body.tokensPerPlayer ?? 2,
        pointsCapture: body.pointsCapture ?? 50,
        pointsFinish: body.pointsFinish ?? 100,
        pointsWin: body.pointsWin ?? 500,
        diceSpeed: body.diceSpeed ?? 3,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating parqués config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/parques — Update parqués config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.tokensPerPlayer !== undefined) updateData.tokensPerPlayer = data.tokensPerPlayer
    if (data.pointsCapture !== undefined) updateData.pointsCapture = data.pointsCapture
    if (data.pointsFinish !== undefined) updateData.pointsFinish = data.pointsFinish
    if (data.pointsWin !== undefined) updateData.pointsWin = data.pointsWin
    if (data.diceSpeed !== undefined) updateData.diceSpeed = data.diceSpeed
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.parquesConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating parqués config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

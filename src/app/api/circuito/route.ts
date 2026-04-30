import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/circuito — Get current circuito config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.circuitoConfig.findFirst()
    if (!config) {
      config = await prisma.circuitoConfig.create({
        data: {
          pointsDot: 10,
          pointsGhost: 200,
          gameSpeed: 3,
          lives: 3,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching circuito config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/circuito — Create circuito config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.circuitoConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.circuitoConfig.create({
      data: {
        pointsDot: body.pointsDot ?? 10,
        pointsGhost: body.pointsGhost ?? 200,
        gameSpeed: body.gameSpeed ?? 3,
        lives: body.lives ?? 3,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating circuito config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/circuito — Update circuito config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.pointsDot !== undefined) updateData.pointsDot = data.pointsDot
    if (data.pointsGhost !== undefined) updateData.pointsGhost = data.pointsGhost
    if (data.gameSpeed !== undefined) updateData.gameSpeed = data.gameSpeed
    if (data.lives !== undefined) updateData.lives = data.lives
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.circuitoConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating circuito config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

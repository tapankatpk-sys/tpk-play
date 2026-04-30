import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/diana — Get current diana config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.dianaConfig.findFirst()
    if (!config) {
      config = await prisma.dianaConfig.create({
        data: {
          roundsPerGame: 10,
          pointsCenter: 50,
          pointsMiddle: 30,
          pointsEdge: 10,
          speed: 3,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching diana config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/diana — Create diana config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.dianaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.dianaConfig.create({
      data: {
        roundsPerGame: body.roundsPerGame ?? 10,
        pointsCenter: body.pointsCenter ?? 50,
        pointsMiddle: body.pointsMiddle ?? 30,
        pointsEdge: body.pointsEdge ?? 10,
        speed: body.speed ?? 3,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating diana config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/diana — Update diana config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.roundsPerGame !== undefined) updateData.roundsPerGame = data.roundsPerGame
    if (data.pointsCenter !== undefined) updateData.pointsCenter = data.pointsCenter
    if (data.pointsMiddle !== undefined) updateData.pointsMiddle = data.pointsMiddle
    if (data.pointsEdge !== undefined) updateData.pointsEdge = data.pointsEdge
    if (data.speed !== undefined) updateData.speed = data.speed
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.dianaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating diana config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

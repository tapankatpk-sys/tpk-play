import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/loteria — Get current loteria config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.loteriaConfig.findFirst()
    if (!config) {
      // Create default config if none exists
      config = await prisma.loteriaConfig.create({
        data: {
          boardSize: 4,
          pointsLine: 30,
          pointsDiag: 50,
          pointsFull: 100,
          drawSpeed: 5,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching loteria config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/loteria — Create loteria config (if not exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if config already exists
    const existing = await prisma.loteriaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }

    const config = await prisma.loteriaConfig.create({
      data: {
        boardSize: body.boardSize ?? 4,
        pointsLine: body.pointsLine ?? 30,
        pointsDiag: body.pointsDiag ?? 50,
        pointsFull: body.pointsFull ?? 100,
        drawSpeed: body.drawSpeed ?? 5,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating loteria config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/loteria — Update loteria config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.boardSize !== undefined) updateData.boardSize = data.boardSize
    if (data.pointsLine !== undefined) updateData.pointsLine = data.pointsLine
    if (data.pointsDiag !== undefined) updateData.pointsDiag = data.pointsDiag
    if (data.pointsFull !== undefined) updateData.pointsFull = data.pointsFull
    if (data.drawSpeed !== undefined) updateData.drawSpeed = data.drawSpeed
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const config = await prisma.loteriaConfig.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating loteria config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
